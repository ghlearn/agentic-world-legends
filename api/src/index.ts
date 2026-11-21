import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { TableClient, odata, type TableEntity } from "@azure/data-tables";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { calculateScore, rankScores, type RankedScore } from "./ranking.js";

interface EventEntity extends TableEntity {
  etag?: string;
  status: "open" | "closed";
  createdAt: string;
  closedAt?: string;
}

interface BoothEntity extends TableEntity {
  pairingCodeHash: string;
  tokenHash?: string;
  pairedAt?: string;
}

interface ScoreEntity extends TableEntity, RankedScore {}

const connection = process.env.AzureWebJobsStorage;
if (!connection) throw new Error("AzureWebJobsStorage is required");

const leaderboardTable = TableClient.fromConnectionString(connection, "Leaderboard");
const booths = TableClient.fromConnectionString(connection, "LeaderboardBooths");

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sameHash(left: string | undefined, right: string): boolean {
  if (!left) return false;
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": process.env.ALLOWED_ORIGIN ?? "*",
    "access-control-allow-headers": "authorization, content-type, x-admin-key",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "cache-control": "no-store",
  };
}

function json(status: number, body: unknown): HttpResponseInit {
  return { status, jsonBody: body, headers: corsHeaders() };
}

function adminAuthorized(request: HttpRequest): boolean {
  const configured = process.env.LEADERBOARD_ADMIN_KEY;
  const supplied = request.headers.get("x-admin-key");
  return Boolean(configured && supplied && sameHash(hash(configured), hash(supplied)));
}

function validId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

async function ensureTables(): Promise<void> {
  await Promise.all([leaderboardTable, booths].map(async (client) => {
    try {
      await client.createTable();
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode !== 409) throw error;
    }
  }));
}

async function readEvent(eventId: string): Promise<EventEntity | undefined> {
  try {
    return await leaderboardTable.getEntity<EventEntity>(`event:${eventId}`, "event");
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) return undefined;
    throw error;
  }
}

async function leaderboard(eventId: string): Promise<Array<RankedScore & { rank: number }>> {
  const rows: RankedScore[] = [];
  const filter = odata`PartitionKey eq ${`event:${eventId}`}`;
  for await (const row of leaderboardTable.listEntities<ScoreEntity>({ queryOptions: { filter } })) {
    if (!row.runId) continue;
    rows.push({
      runId: row.runId,
      nickname: row.nickname,
      eventId: row.eventId,
      boothId: row.boothId,
      credentialsCompleted: row.credentialsCompleted,
      wrongAnswers: row.wrongAnswers,
      elapsedMs: row.elapsedMs,
      score: row.score,
      acceptedAt: row.acceptedAt,
    });
  }
  return rankScores(rows);
}

app.http("cors", {
  route: "{*path}",
  methods: ["OPTIONS"],
  authLevel: "anonymous",
  handler: async () => ({ status: 204, headers: corsHeaders() }),
});

app.http("createEvent", {
  route: "admin/events",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    if (!adminAuthorized(request)) return json(401, { error: "Unauthorized" });
    const body = await request.json() as { eventId?: string; booths?: string[] };
    const eventId = body.eventId?.trim();
    const boothIds = [...new Set(body.booths?.map((value) => value.trim()).filter(Boolean) ?? [])];
    if (!eventId || !validId(eventId) || boothIds.length === 0 || boothIds.some((value) => !validId(value))) {
      return json(400, { error: "eventId and booths must use 1-64 letters, numbers, underscores, or hyphens" });
    }

    await ensureTables();
    if (await readEvent(eventId)) return json(409, { error: "Event already exists" });
    const createdAt = new Date().toISOString();
    await leaderboardTable.createEntity<EventEntity>({
      partitionKey: `event:${eventId}`,
      rowKey: "event",
      status: "open",
      createdAt,
    });

    const pairingCodes: Record<string, string> = {};
    for (const boothId of boothIds) {
      const code = randomBytes(4).toString("hex").toUpperCase();
      pairingCodes[boothId] = code;
      await booths.createEntity<BoothEntity>({
        partitionKey: `event:${eventId}`,
        rowKey: `booth:${boothId}`,
        pairingCodeHash: hash(code),
      });
    }
    return json(201, { eventId, status: "open", pairingCodes });
  },
});

app.http("pairBooth", {
  route: "events/{eventId}/booths/{boothId}/pair",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const eventId = request.params.eventId;
    const boothId = request.params.boothId;
    const body = await request.json() as { code?: string };
    if ((await readEvent(eventId))?.status !== "open") return json(409, { error: "Event is not open" });
    try {
      const booth = await booths.getEntity<BoothEntity>(`event:${eventId}`, `booth:${boothId}`);
      if (!sameHash(booth.pairingCodeHash, hash(body.code?.trim().toUpperCase() ?? ""))) {
        return json(401, { error: "Invalid pairing code" });
      }
      const token = randomBytes(32).toString("base64url");
      booth.tokenHash = hash(token);
      booth.pairedAt = new Date().toISOString();
      booth.pairingCodeHash = hash(randomBytes(16).toString("hex"));
      try {
        await booths.updateEntity(booth, "Replace", { etag: booth.etag });
      } catch (error) {
        if ((error as { statusCode?: number }).statusCode === 412) {
          return json(409, { error: "Pairing code was already used" });
        }
        throw error;
      }
      return json(200, { token });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return json(404, { error: "Booth not found" });
      throw error;
    }
  },
});

app.http("submitScore", {
  route: "events/{eventId}/scores",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    const eventId = request.params.eventId;
    const event = await readEvent(eventId);
    if (!event) return json(404, { error: "Event not found" });
    if (event.status !== "open") return json(409, { error: "Event is closed" });

    const body = await request.json() as Partial<RankedScore>;
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!body.boothId || !token) return json(401, { error: "Booth authorization is required" });
    try {
      const booth = await booths.getEntity<BoothEntity>(`event:${eventId}`, `booth:${body.boothId}`);
      if (!sameHash(booth.tokenHash, hash(token))) return json(401, { error: "Invalid booth token" });
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) return json(401, { error: "Invalid booth token" });
      throw error;
    }

    const runId = body.runId?.trim();
    const nickname = body.nickname?.trim().slice(0, 32);
    const credentialsCompleted = Number(body.credentialsCompleted);
    const wrongAnswers = Number(body.wrongAnswers);
    const elapsedMs = Number(body.elapsedMs);
    if (
      !runId || !nickname ||
      !Number.isInteger(credentialsCompleted) || credentialsCompleted !== 6 ||
      !Number.isInteger(wrongAnswers) || wrongAnswers < 0 ||
      !Number.isFinite(elapsedMs) || elapsedMs < 1_000
    ) return json(400, { error: "Invalid completed run" });

    const entity: ScoreEntity = {
      partitionKey: `event:${eventId}`,
      rowKey: `score:${runId}`,
      runId,
      nickname,
      eventId,
      boothId: body.boothId,
      credentialsCompleted,
      wrongAnswers,
      elapsedMs,
      score: calculateScore(credentialsCompleted, wrongAnswers, elapsedMs),
      acceptedAt: new Date().toISOString(),
    };
    try {
      await leaderboardTable.submitTransaction([
        ["update", event, "Merge", { etag: event.etag }],
        ["create", entity],
      ]);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 412) return json(409, { error: "Event closed while score was submitting" });
      if (statusCode !== 409) throw error;
    }
    return json(200, { entries: await leaderboard(eventId) });
  },
});

app.http("getScores", {
  route: "events/{eventId}/scores",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request) => {
    if (!(await readEvent(request.params.eventId))) return json(404, { error: "Event not found" });
    return json(200, { entries: await leaderboard(request.params.eventId) });
  },
});

app.http("closeEvent", {
  route: "admin/events/{eventId}/close",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request) => {
    if (!adminAuthorized(request)) return json(401, { error: "Unauthorized" });
    const event = await readEvent(request.params.eventId);
    if (!event) return json(404, { error: "Event not found" });
    event.status = "closed";
    event.closedAt = new Date().toISOString();
    await leaderboardTable.updateEntity(event, "Merge", { etag: event.etag });
    return json(200, { eventId: request.params.eventId, status: "closed" });
  },
});

app.http("exportScores", {
  route: "admin/events/{eventId}/scores.csv",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request: HttpRequest, _context: InvocationContext) => {
    if (!adminAuthorized(request)) return json(401, { error: "Unauthorized" });
    const entries = await leaderboard(request.params.eventId);
    const escape = (value: string | number) => `"${String(value).replaceAll("\"", "\"\"")}"`;
    const rows = [
      ["rank", "nickname", "score", "credentialsCompleted", "wrongAnswers", "elapsedMs", "boothId", "runId"],
      ...entries.map((entry) => [
        entry.rank, entry.nickname, entry.score, entry.credentialsCompleted,
        entry.wrongAnswers, entry.elapsedMs, entry.boothId, entry.runId,
      ]),
    ];
    return {
      status: 200,
      body: rows.map((row) => row.map(escape).join(",")).join("\n"),
      headers: { ...corsHeaders(), "content-type": "text/csv; charset=utf-8" },
    };
  },
});

# Event leaderboard service

The browser client in `src/systems/EventLeaderboard.ts` uses the Azure
Functions app in `api/`, backed by Azure Table Storage. The game stays on
GitHub Pages; all booths use the same API URL and event ID.

## Deploy the API

Create an Azure Function App using Node.js 22 and configure:

- `AzureWebJobsStorage`: the Function App storage connection string.
- `LEADERBOARD_ADMIN_KEY`: a long random organizer secret.
- `ALLOWED_ORIGIN`: the exact GitHub Pages origin, for example
  `https://ghlearn.github.io`.

Build with `pnpm build`. Deploy the contents of `api/` using the Azure
Functions deployment method used by your organization. The app creates its
Table Storage table when the first event is created.

The GitHub Pages build also includes `organizer.html`. Open it with the public
API URL, for example `organizer.html?api=https%3A%2F%2Fexample.azurewebsites.net%2Fapi`,
then enter the admin key to create, close, or export an event.

## Routes

### `POST /admin/events`

Send `x-admin-key` and a body such as:

```json
{ "eventId": "demo", "booths": ["A", "B", "C"] }
```

The response contains one single-use pairing code per booth. Share each code
only with the staff member setting up that booth.

### `POST /events/{eventId}/booths/{boothId}/pair`

Send `{ "code": "..." }`. The booth stores the returned bearer token in that
browser only; the pairing code cannot be reused.

### `POST /events/{eventId}/scores`

Send the booth bearer token and this request body:

```json
{
  "runId": "uuid",
  "nickname": "Player",
  "eventId": "demo",
  "boothId": "A",
  "credentialsCompleted": 6,
  "wrongAnswers": 1,
  "elapsedMs": 183000
}
```

The service validates a complete six-credential run, computes the score
server-side, rejects submissions after an event is closed, and makes `runId`
idempotent. It returns the ranked entries after storing the score:

```json
{ "entries": [{ "rank": 1, "score": 5899, "...": "..." }] }
```

### `GET /events/{eventId}/scores`

Return the same `{ "entries": [...] }` shape, sorted by score descending,
then fewer wrong answers, then shorter elapsed time, then earliest accepted
submission. The public display polls this route every five seconds.

### `POST /admin/events/{eventId}/close`

Send `x-admin-key` to freeze the event and reject all later submissions.

### `GET /admin/events/{eventId}/scores.csv`

Send `x-admin-key` to download the final results.

## Booth lifecycle

1. Create an event with the admin API and record the returned pairing codes.
2. Build the game with `VITE_LEADERBOARD_API_URL`, or pass the public API URL
   as `api` in each booth URL.
3. Open one URL per booth, changing only `booth`, and enter its single-use
   pairing code. The browser stays paired between players.
4. Use `leaderboard.html?event=<id>&booth=display` on a shared screen.
5. Close and export the event after prizes are awarded. Create a new event ID
   for the next event so late requests cannot cross event boundaries.

## Competition integrity

The API authenticates booths, calculates scores server-side, makes run IDs
idempotent, and atomically coordinates score acceptance with event closure.
It cannot prove that browser-reported quiz and progression data came from
unaltered game code. Use staff-supervised, locked-down booth browsers for
prize events; do not treat public attendee devices as cheat-proof.

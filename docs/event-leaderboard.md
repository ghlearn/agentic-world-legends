# Event leaderboard service

The browser client in `src/systems/EventLeaderboard.ts` is designed for a
small Azure Functions API backed by Azure Table Storage. The game can stay on
GitHub Pages; all booths use the same API URL and event ID.

## Routes

### `POST /events/{eventId}/scores`

Request body:

```json
{
  "runId": "uuid",
  "nickname": "Player",
  "eventId": "demo",
  "boothId": "A",
  "credentialsCompleted": 6,
  "wrongAnswers": 1,
  "elapsedMs": 183000,
  "score": 5899
}
```

The service must validate the event ID, reject submissions after an event is
closed, cap credentials at six, and make `runId` idempotent. Return the ranked
entries after storing the score:

```json
{ "entries": [{ "rank": 1, "score": 5899, "...": "..." }] }
```

### `GET /events/{eventId}/scores`

Return the same `{ "entries": [...] }` shape, sorted by score descending,
then fewer wrong answers, then shorter elapsed time, then earliest accepted
submission. The public display polls this route every five seconds.

## Booth lifecycle

1. Create an event and keep its ID private to the event organizers.
2. Build the game with `VITE_LEADERBOARD_API_URL`, or pass the public API URL
   as `api` in each booth URL, and open one URL per booth, changing only
   `booth`.
3. Use `leaderboard.html?event=<id>&booth=display` on a shared screen.
4. Close the event server-side after prizes are awarded. Create a new event
   ID for the next event so queued requests cannot cross event boundaries.

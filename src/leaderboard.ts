import { eventConfigFromLocation, fetchLeaderboard } from "./systems/EventLeaderboard";
import "./leaderboard.css";

const status = document.querySelector<HTMLParagraphElement>("#status");
const table = document.querySelector<HTMLTableElement>("#scores");
const body = table?.querySelector("tbody");
const config = eventConfigFromLocation();

if (!config || !status || !table || !body) {
  status?.replaceChildren("Open this page with an event URL, for example ?event=demo&booth=display.");
} else {
  const refresh = async () => {
    try {
      const entries = await fetchLeaderboard(config);
      body.replaceChildren(...entries.slice(0, 20).map((entry) => {
        const row = document.createElement("tr");
        const values = [
          `#${entry.rank}`,
          entry.nickname,
          entry.score.toLocaleString(),
          `${entry.credentialsCompleted}/6`,
          String(entry.wrongAnswers),
          `${Math.round(entry.elapsedMs / 1_000)}s`,
        ];
        row.append(...values.map((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          return cell;
        }));
        return row;
      }));
      table.hidden = entries.length === 0;
      status.textContent = entries.length ? `Event: ${config.eventId}` : "No scores yet.";
    } catch {
      status.textContent = "Leaderboard unavailable. Check the display connection.";
    }
  };
  void refresh();
  window.setInterval(() => void refresh(), 5_000);
}

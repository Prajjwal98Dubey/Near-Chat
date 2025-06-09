export function formatMilisecondToDate(time) {
  const date = new Date(time);
  const formatted = date.toLocaleString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return formatted;
}

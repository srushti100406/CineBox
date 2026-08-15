export function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatReleaseDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatVotes(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export const inr = (n: number): string => `₹${n.toLocaleString("en-IN")}`;

export function dateLabel(index: number, iso?: string): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  if (iso) {
    const d = new Date(`${iso}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  }
  return `Day ${index + 1}`;
}

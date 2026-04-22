/**
 * Small presentation helpers shared across screens.
 */

export function paperTitle(p: { nickname: string; title: string }): string {
  const nickname = p.nickname?.trim();
  const raw = nickname && nickname.length > 0 ? nickname : p.title;
  return raw.replace(/\s+/g, " ").trim();
}

export function authorsLine(authors: string[], year?: number | null): string {
  const head = authors.slice(0, 3).join(", ");
  if (authors.length > 3) {
    return year ? `${head} et al. · ${year}` : `${head} et al.`;
  }
  if (year) {
    return head.length > 0 ? `${head} · ${year}` : String(year);
  }
  return head;
}

export function relativeFromISO(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return null;
  const diffMs = Date.now() - then.getTime();
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.round(day / 365);
  return `${yr}y ago`;
}

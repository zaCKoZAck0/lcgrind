// User-facing formatting for aggregate interview metrics. Coarse YYYY-MM dates
// become relative recency, and repeated / recent questions get actionable
// signals instead of raw counts.

const MONTH_RE = /^(\d{4})-(\d{2})$/;

function monthsBetween(yyyyMm: string, nowYyyyMm: string): number | null {
  const a = MONTH_RE.exec(yyyyMm);
  const b = MONTH_RE.exec(nowYyyyMm);
  if (!a || !b) return null;
  return (Number(b[1]) - Number(a[1])) * 12 + (Number(b[2]) - Number(a[2]));
}

/** "Jan 2025" for a coarse YYYY-MM month; null when malformed. */
function formatMonth(yyyyMm: string): string | null {
  const m = MONTH_RE.exec(yyyyMm);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Relative label for a coarse YYYY-MM month. Recent months read as distance
 * ("3 months ago"); older than a year falls back to "Jan 2025".
 */
export function formatRecency(
  yyyyMm: string,
  nowYyyyMm: string = currentMonth(),
): string | null {
  const diff = monthsBetween(yyyyMm, nowYyyyMm);
  if (diff === null || diff < 0) return null;
  if (diff === 0) return "This month";
  if (diff === 1) return "Last month";
  if (diff <= 12) return `${diff} months ago`;
  return formatMonth(yyyyMm);
}

export function currentMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Internal ranking weight blending frequency with recency. Server-side only:
 * the number must never be stored or serialized to the client.
 */
const RECENCY_BONUS = 10;
const RECENCY_DECAY = 0.85;

export function computeWeight(
  q: { askCount: number; lastAsked: string | null },
  nowYyyyMm: string = currentMonth(),
): number {
  if (!q.lastAsked) return q.askCount;
  const monthsAgo = monthsBetween(q.lastAsked, nowYyyyMm);
  if (monthsAgo === null || monthsAgo < 0) return q.askCount;
  return q.askCount + RECENCY_BONUS * RECENCY_DECAY ** monthsAgo;
}

// Flair thresholds — all window checks are in calendar months.
const HOT_WINDOW_MONTHS = 2;
const HOT_MIN_ASKS = 2;
const TRENDING_WINDOW_MONTHS = 6;
const TRENDING_MIN_ASKS = 3;
const FREQUENTLY_ASKED_MIN_ASKS = 5;
const RECENTLY_ASKED_WINDOW_MONTHS = 6;
const CLASSIC_MIN_ASKS = 10;

/** Lowercases the leading "This/Last month" so it reads mid-sentence. */
function recencyPhrase(
  lastAsked: string | null,
  nowYyyyMm: string,
): string | null {
  let recency = lastAsked ? formatRecency(lastAsked, nowYyyyMm) : null;
  if (recency === "This month" || recency === "Last month") {
    recency = recency.toLowerCase();
  }
  return recency;
}

export type QuestionFlair = "hot" | "trending" | "frequent" | "recent" | "classic";

/**
 * All applicable flairs for a question — up to two: one recency flair
 * (strongest wins: hot > trending > recent) and one count flair (classic > frequent).
 * classic requires lastAsked=null so it never coexists with recency flairs.
 */
export function questionFlairs(
  q: { askCount: number; lastAsked: string | null },
  nowYyyyMm: string = currentMonth(),
): QuestionFlair[] {
  const diff = q.lastAsked ? monthsBetween(q.lastAsked, nowYyyyMm) : null;
  const withinWindow = (months: number) =>
    diff !== null && diff >= 0 && diff <= months;

  const flairs: QuestionFlair[] = [];

  if (withinWindow(HOT_WINDOW_MONTHS) && q.askCount >= HOT_MIN_ASKS) flairs.push("hot");
  else if (withinWindow(TRENDING_WINDOW_MONTHS) && q.askCount >= TRENDING_MIN_ASKS) flairs.push("trending");
  else if (withinWindow(RECENTLY_ASKED_WINDOW_MONTHS)) flairs.push("recent");

  if (q.askCount >= CLASSIC_MIN_ASKS && q.lastAsked === null) flairs.push("classic");
  else if (q.askCount >= FREQUENTLY_ASKED_MIN_ASKS) flairs.push("frequent");

  return flairs;
}

/** Qualitative tooltip for a flair — raw counts never reach the frontend. */
export function flairTooltip(
  flair: QuestionFlair,
  q: { lastAsked: string | null },
  companyName?: string,
  nowYyyyMm: string = currentMonth(),
): string {
  const recency = recencyPhrase(q.lastAsked, nowYyyyMm);
  const at = companyName ? ` at ${companyName}` : "";
  const company = companyName ? ` ${companyName}` : "";
  switch (flair) {
    case "hot":      return `Asked multiple times very recently${company ? ` at${company}` : ""} — hot right now.`;
    case "trending": return `Asked repeatedly${at}, most recently ${recency}.`;
    case "frequent": return company ? `Asked frequently at${company} — a must do.` : "Asked frequently — a must do.";
    case "recent": {
      if (recency && companyName) {
        const article = /^[aeiou]/i.test(companyName) ? "an" : "a";
        return `Reported in ${article} ${companyName} interview ${recency}.`;
      }
      if (recency) return `Reported in an interview ${recency}.`;
      return "Reported recently.";
    }
    case "classic":  return company ? `A long-standing staple from${company}'s interview history.` : "A long-standing staple from this company's interview history.";
  }
}

// Provenance invariant: nothing finer than month granularity is ever serialized
// to the client. Exact timestamps stay server-side (Hot ranking only). UTC keeps
// the coarsening deterministic regardless of server timezone.
export function toMonth(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

// Matches a well-formed YYYY-MM string; used by tests and any guard that must
// reject day-level dates leaking into a public payload.
export const MONTH_RE = /^\d{4}-\d{2}$/;

// Renders a coarse "Mar 2026" label from a YYYY-MM string. Never resolves finer
// than a month — exact dates stay server-side (provenance constraint).
export function formatMonth(month: string): string {
    const [y, m] = month.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

// Compact display for count-like stats (comments, votes/score, exp, reputation).
// Below 1000 renders as-is; from 1000 up it abbreviates: 1k, 10k, 100k, 1M, 1B.
// Not for streaks or other values meant to read as exact.
const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

export function formatCount(n: number): string {
    // Intl emits an uppercase "K"; the platform uses a lowercase "k".
    return compact.format(n).replace("K", "k");
}

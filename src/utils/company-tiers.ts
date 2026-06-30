// Relative tier markers: each qualifying company is quintile-ranked against
// every other qualifying company, so "5 dollars / 5 stars" means top ~20% of
// the observed data, never a hard-coded cutoff.

export type TierLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Hide the pay marker when the best-sampled rollup has fewer reports. */
export const PAY_MIN_N = 5;
/** A pay baseline needs at least this many rollups sharing the grouping key. */
export const PAY_MIN_PEERS = 3;
/**
 * Hide the pay marker unless the company has at least this many reported salaries
 * in total (summed across every rollup, any sample size). The ratio still stands
 * on the best rollup; this only governs show/hide — "can't rate pay on less data".
 */
export const PAY_MIN_TOTAL_SALARIES = 10;

export function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type PayRollup = {
    companyId: number;
    expBand: string;
    currency: string;
    tcMedian: number;
    n: number;
};

/**
 * Pay metric per company: n-weighted average of (rollup TC / global market
 * baseline) ratios across all qualifying rollups.
 *
 * Global baseline per (expBand, currency) = n-weighted mean of tcMedian across
 * ALL rollups — treats every reported salary equally regardless of company.
 * "Unknown" expBand excluded (can't normalize against unknown experience level).
 *
 * Fixes two biases vs the old approach:
 *   - Self-contamination: baseline is global, not a peer group containing the
 *     company itself.
 *   - Exp-band selection: every band contributes to the company score (weighted
 *     by n), not just the band with the most reports.
 */
export function payRatiosFromRollups(rollups: PayRollup[]): Map<number, number> {
    const baselineKey = (r: PayRollup) => `${r.expBand}|${r.currency}`;

    // Build global market baseline: n-weighted mean per (expBand, currency).
    // Exclude "Unknown" expBand — meaningless anchor for normalization.
    const baselineSum = new Map<string, { weightedTC: number; totalN: number; count: number }>();
    for (const r of rollups) {
        if (r.expBand === "Unknown") continue;
        const k = baselineKey(r);
        const b = baselineSum.get(k) ?? { weightedTC: 0, totalN: 0, count: 0 };
        b.weightedTC += r.tcMedian * r.n;
        b.totalN += r.n;
        b.count += 1;
        baselineSum.set(k, b);
    }
    // Only trust baselines backed by enough distinct rollups.
    const baseline = new Map<string, number>();
    for (const [k, b] of baselineSum) {
        if (b.count >= PAY_MIN_PEERS) baseline.set(k, b.weightedTC / b.totalN);
    }

    // Per company: n-weighted average ratio across all rollups with n ≥ PAY_MIN_N.
    const companyWeightedRatio = new Map<number, { sum: number; totalN: number }>();
    for (const r of rollups) {
        if (r.expBand === "Unknown") continue;
        if (r.n < PAY_MIN_N) continue;
        const base = baseline.get(baselineKey(r));
        if (base === undefined || base === 0) continue;
        const acc = companyWeightedRatio.get(r.companyId) ?? { sum: 0, totalN: 0 };
        acc.sum += (r.tcMedian / base) * r.n;
        acc.totalN += r.n;
        companyWeightedRatio.set(r.companyId, acc);
    }

    const ratios = new Map<number, number>();
    for (const [companyId, acc] of companyWeightedRatio) {
        if (acc.totalN > 0) ratios.set(companyId, acc.sum / acc.totalN);
    }
    return ratios;
}

/**
 * Quintile rank: percentile of each metric (ties share the count of strictly
 * smaller values, so equal metrics always land in the same tier) mapped onto
 * 1..5. A lone qualifying company has no peers to beat and reads as tier 1.
 */
export function quintileTiers<K>(metrics: Map<K, number>): Map<K, TierLevel> {
    const sorted = [...metrics.values()].sort((a, b) => a - b);
    const tiers = new Map<K, TierLevel>();
    for (const [key, value] of metrics) {
        if (sorted.length <= 1) {
            tiers.set(key, 1);
            continue;
        }
        let below = 0;
        while (below < sorted.length && sorted[below] < value) below++;
        const percentile = below / (sorted.length - 1);
        tiers.set(key, (Math.min(4, Math.floor(percentile * 5)) + 1) as TierLevel);
    }
    return tiers;
}

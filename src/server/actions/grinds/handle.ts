import { type PrismaClient } from "@prisma/client";

// Deterministic handle generation from a seed string (typically the user's
// Google display name, or email local-part as fallback). Algorithm:
//   1. Lowercase, strip to [a-z0-9_], collapse repeated underscores.
//   2. Ensure it starts with a letter (prefix "u" if needed).
//   3. Clamp to 16 chars (leaves room for up to 4-digit numeric suffix in the
//      20-char limit, so handle is always ≤ 20 chars even after dedup).
//   4. If the candidate is already taken, append incrementing numeric suffix
//      (handle2, handle3…) until a unique slot is found.
// Always returns a HANDLE_RE-valid, DB-unique handle.
export async function generateHandle(
    db: PrismaClient,
    seed: string,
): Promise<string> {
    const base = slugifySeed(seed);

    // Walk numeric suffixes until we land a unique slot.
    let candidate = base;
    for (let i = 2; i < 10_000; i++) {
        const taken = await db.user.findUnique({
            where: { handle: candidate },
            select: { id: true },
        });
        if (!taken) break;
        const suffix = String(i);
        candidate = base.slice(0, 20 - suffix.length) + suffix;
    }

    return candidate;
}

// ---------------------------------------------------------------------------
// Pure helper — exported only for unit-testing the slug logic in isolation.
// ---------------------------------------------------------------------------
export function slugifySeed(seed: string): string {
    let s = seed
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "") // strip combining diacritics
        .replace(/[^a-z0-9]+/g, "_") // non-alphanum → underscore
        .replace(/_+/g, "_") // collapse runs
        .replace(/^_+|_+$/g, ""); // trim leading/trailing underscores

    // Guarantee a leading letter.
    if (!s || !/^[a-z]/.test(s)) s = "u" + s;

    // Clamp base to 16 (leaves 4 chars for "9999" dedupe suffix).
    s = s.slice(0, 16);

    // After clamp may end with underscores — strip them.
    s = s.replace(/_+$/, "");

    // Must be at least 3 chars total; pad with "r" if too short.
    while (s.length < 3) s += "r";

    return s;
}

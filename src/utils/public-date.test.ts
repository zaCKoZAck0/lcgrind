import { describe, expect, it } from "vitest";

import { toMonth, MONTH_RE } from "./public-date";

describe("toMonth", () => {
    it("formats a date as zero-padded YYYY-MM", () => {
        expect(toMonth(new Date("2026-03-09T12:00:00Z"))).toBe("2026-03");
        expect(toMonth(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
    });

    it("coarsens by UTC so a timezone never shifts the month", () => {
        // Just before UTC midnight on the last day of March.
        expect(toMonth(new Date("2026-03-31T23:30:00Z"))).toBe("2026-03");
        // Just after UTC midnight rolls into April.
        expect(toMonth(new Date("2026-04-01T00:30:00Z"))).toBe("2026-04");
    });

    it("always produces a string matching MONTH_RE", () => {
        expect(MONTH_RE.test(toMonth(new Date()))).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import { computeViewerKey } from "./viewer-key";

describe("computeViewerKey", () => {
    it("returns the same key for the same inputs on the same day", () => {
        const a = computeViewerKey("secret", "user-123", "2026-07-06");
        const b = computeViewerKey("secret", "user-123", "2026-07-06");
        expect(a).toBe(b);
    });

    it("returns different keys for the same message on different days", () => {
        const a = computeViewerKey("secret", "user-123", "2026-07-06");
        const b = computeViewerKey("secret", "user-123", "2026-07-07");
        expect(a).not.toBe(b);
    });

    it("returns different keys for different messages on the same day", () => {
        const a = computeViewerKey("secret", "user-123", "2026-07-06");
        const b = computeViewerKey("secret", "user-456", "2026-07-06");
        expect(a).not.toBe(b);
    });

    it("produces a 64-character hex digest", () => {
        const key = computeViewerKey("secret", "any-message", "2026-07-06");
        expect(key).toMatch(/^[0-9a-f]{64}$/);
    });
});

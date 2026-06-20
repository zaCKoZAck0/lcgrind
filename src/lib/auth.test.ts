import { afterEach, describe, expect, it } from "vitest";
import { isAdminEmail } from "./auth";

const ORIGINAL = process.env.ADMIN_EMAILS;

afterEach(() => {
    process.env.ADMIN_EMAILS = ORIGINAL;
});

describe("isAdminEmail (admin gate predicate)", () => {
    it("admits an allowlisted email case-insensitively", () => {
        process.env.ADMIN_EMAILS = "boss@example.com, Owner@Example.com";
        expect(isAdminEmail("boss@example.com")).toBe(true);
        expect(isAdminEmail("OWNER@example.com")).toBe(true);
    });

    it("rejects a non-allowlisted email", () => {
        process.env.ADMIN_EMAILS = "boss@example.com";
        expect(isAdminEmail("intruder@example.com")).toBe(false);
    });

    it("rejects null/undefined/empty", () => {
        process.env.ADMIN_EMAILS = "boss@example.com";
        expect(isAdminEmail(null)).toBe(false);
        expect(isAdminEmail(undefined)).toBe(false);
        expect(isAdminEmail("")).toBe(false);
    });

    it("rejects everyone when the allowlist is unset", () => {
        delete process.env.ADMIN_EMAILS;
        expect(isAdminEmail("anyone@example.com")).toBe(false);
    });
});

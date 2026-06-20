import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createPostCore, editPostCore } from "./core";
import { EXPERIENCE_WEEKLY_CAP } from "~/config/discuss";

const db = new PrismaClient({
    datasourceUrl:
        process.env.DATABASE_URL ??
        "postgresql://myuser:mypassword@localhost:5432/mydb",
});

const RUN = Date.now().toString(36);
const U_MAIN = `vitest-post-main-${RUN}`;
const U_DUP = `vitest-post-dup-${RUN}`;
const U_ANON = `vitest-post-anon-${RUN}`;
const U_RATE = `vitest-post-rate-${RUN}`;
const U_GATE = `vitest-post-gate-${RUN}`;
const ALL_USERS = [U_MAIN, U_DUP, U_ANON, U_RATE, U_GATE];
const HANDLE_MAIN = `h${RUN}a`;
const HANDLE_DUP = `h${RUN}b`;
const HANDLE_RATE = `h${RUN}d`;
const HANDLE_GATE = `h${RUN}e`;

let companyId: number;
let companyName: string;

const story =
    "I interviewed for SDE2 over five rounds across two days: an online assessment, " +
    "two coding rounds on graphs and dynamic programming, a system design round on a " +
    "rate limiter, and a behavioral loop with the hiring manager.";

// Per-user rawText must be unique (the fork inherits createSubmissionCore's
// exact-duplicate guard), so vary each experience body by a tag.
const storyFor = (tag: string) => `${story} Reference: ${tag}.`;

beforeAll(async () => {
    const company = await db.company.create({
        data: {
            slug: `vitest-post-co-${RUN}`,
            name: `Post Co ${RUN}`,
            reportCount: 1,
        },
    });
    companyId = company.id;
    companyName = company.name;
    await db.user.createMany({
        data: ALL_USERS.map((id) => ({
            id,
            name: "Vitest",
            email: `${id}@example.test`,
        })),
    });
});

afterAll(async () => {
    await db.communityQuestionAsk.deleteMany({ where: { companyId } });
    await db.communityCompPoint.deleteMany({ where: { companyId } });
    await db.pointsLedger.deleteMany({ where: { userId: { in: ALL_USERS } } });
    await db.userBadge.deleteMany({ where: { userId: { in: ALL_USERS } } });
    await db.submission.deleteMany({ where: { userId: { in: ALL_USERS } } });
    await db.post.deleteMany({ where: { authorId: { in: ALL_USERS } } });
    await db.user.deleteMany({ where: { id: { in: ALL_USERS } } });
    await db.company.delete({ where: { id: companyId } });
    await db.$disconnect();
});

describe("createPostCore — Experience forks the admin copy", () => {
    it("creates a public Post and a linked Submission copy in one go", async () => {
        const body = storyFor("main-onsite");
        const res = await createPostCore(db, U_MAIN, {
            isExperience: true,
            title: "My Amazon SDE2 onsite loop",
            body,
            companyName,
            handle: HANDLE_MAIN,
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        expect(res.param).toBe(`${res.id}-my-amazon-sde2-onsite-loop`);

        const post = await db.post.findUniqueOrThrow({
            where: { id: res.id },
            include: { submission: true },
        });
        expect(post.type).toBe("EXPERIENCE");
        expect(post.companyId).toBe(companyId);
        expect(post.status).toBe("PUBLISHED");

        // The fork: a private Submission linked back to the post.
        expect(post.submission).not.toBeNull();
        expect(post.submission?.postId).toBe(res.id);
        expect(post.submission?.version).toBe(1);
        expect(post.submission?.status).toBe("PENDING");
        expect(post.submission?.rawText).toBe(body);

        // Handle was claimed on first post.
        const user = await db.user.findUniqueOrThrow({ where: { id: U_MAIN } });
        expect(user.handle).toBe(HANDLE_MAIN);
    });

    it("forks a FORM submission when the experience carries structured details", async () => {
        const res = await createPostCore(db, U_MAIN, {
            isExperience: true,
            title: "Structured Amazon SDE2 writeup",
            body: storyFor("form-mode"),
            companyName,
            mode: "FORM",
            structured: {
                role: "SDE2",
                level: "L5",
                expYears: 5,
                rounds: [
                    {
                        type: "Coding",
                        questions: [{ text: "Course schedule", type: "DSA" }],
                    },
                ],
            },
        });
        expect(res.ok).toBe(true);
        if (res.ok === false) return;

        const post = await db.post.findUniqueOrThrow({
            where: { id: res.id },
            include: { submission: true },
        });
        // Public post still carries the body; the admin copy is FORM-shaped.
        expect(post.body).toBe(storyFor("form-mode"));
        expect(post.submission?.mode).toBe("FORM");
        expect(post.submission?.rawText).toBeNull();
        const structured = post.submission?.structured as { role?: string };
        expect(structured?.role).toBe("SDE2");
    });

    it("does NOT fork a Submission for a Discussion post", async () => {
        const res = await createPostCore(db, U_MAIN, {
            title: "How to think about staff-level scope",
            body: "Curious how folks frame impact at staff level.",
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        const post = await db.post.findUniqueOrThrow({
            where: { id: res.id },
            include: { submission: true },
        });
        expect(post.type).toBeNull();
        expect(post.submission).toBeNull();
    });
});

describe("createPostCore — handle claiming", () => {
    it("rejects a handle already taken by another user", async () => {
        const ok = await createPostCore(db, U_DUP, {
            title: "Claiming my handle first",
            body: "Reserving a name here.",
            handle: HANDLE_DUP,
        });
        expect(ok.ok).toBe(true);

        // U_ANON tries to grab the same handle on their first post.
        const clash = await createPostCore(db, U_ANON, {
            title: "Trying the same handle",
            body: "Should be rejected.",
            handle: HANDLE_DUP,
        });
        expect(clash.ok).toBe(false);
        if (clash.ok === true) return;
        expect(clash.error.toLowerCase()).toContain("taken");
    });

    it("rejects a first post with no/invalid handle", async () => {
        const res = await createPostCore(db, U_ANON, {
            title: "No handle provided here",
            body: "Should ask for a handle.",
            handle: "X", // too short + uppercase
        });
        expect(res.ok).toBe(false);
        if (res.ok === true) return;
        expect(res.error.toLowerCase()).toContain("handle");
    });
});

describe("createPostCore — anonymous Experience still forks with attribution", () => {
    it("forks the submission under the real author even when posted anonymously", async () => {
        // Give U_ANON a handle via a normal post first.
        await createPostCore(db, U_ANON, {
            title: "Setting up my handle now",
            body: "First post to claim a handle.",
            handle: `h${RUN}c`,
        });
        const res = await createPostCore(db, U_ANON, {
            isExperience: true,
            title: "Anonymous report about a tough loop",
            body: storyFor("anon"),
            companyName,
            isAnonymous: true,
        });
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        const post = await db.post.findUniqueOrThrow({
            where: { id: res.id },
            include: { submission: true },
        });
        expect(post.isAnonymous).toBe(true);
        // Admin copy keeps full attribution to the real user.
        expect(post.submission?.userId).toBe(U_ANON);
    });
});

describe("editPostCore — re-queue before merge, freeze after", () => {
    it("re-queues the admin copy with a bumped version while pre-merge", async () => {
        const created = await createPostCore(db, U_MAIN, {
            isExperience: true,
            title: "Editable experience pre-merge",
            body: storyFor("editable"),
            companyName,
        });
        expect(created.ok).toBe(true);
        if (!created.ok) return;

        const newBody =
            storyFor("editable") + " Update: also asked about consistent hashing.";
        const edit = await editPostCore(db, U_MAIN, created.id, {
            title: "Editable experience pre-merge (edited)",
            body: newBody,
        });
        expect(edit.ok).toBe(true);

        const post = await db.post.findUniqueOrThrow({
            where: { id: created.id },
            include: { submission: true },
        });
        expect(post.editedAt).not.toBeNull();
        expect(post.parseFrozen).toBe(false);
        expect(post.submission?.version).toBe(2);
        expect(post.submission?.status).toBe("PENDING");
        expect(post.submission?.rawText).toBe(newBody);
    });

    it("freezes aggregates and stops versioning after the copy is merged", async () => {
        const mergedBody = storyFor("merged");
        const created = await createPostCore(db, U_MAIN, {
            isExperience: true,
            title: "Experience that gets merged",
            body: mergedBody,
            companyName,
        });
        expect(created.ok).toBe(true);
        if (!created.ok) return;

        // Simulate the admin merge: the forked copy reaches its terminal state.
        const sub = await db.submission.findFirstOrThrow({
            where: { postId: created.id },
        });
        await db.submission.update({
            where: { id: sub.id },
            data: { status: "APPROVED" },
        });

        const edit = await editPostCore(db, U_MAIN, created.id, {
            title: "Experience that gets merged (edited later)",
            body: mergedBody + " A late edit that must not touch aggregates.",
        });
        expect(edit.ok).toBe(true);

        const post = await db.post.findUniqueOrThrow({
            where: { id: created.id },
            include: { submission: true },
        });
        expect(post.parseFrozen).toBe(true);
        // Submission untouched: still APPROVED, version unchanged, body unchanged.
        expect(post.submission?.status).toBe("APPROVED");
        expect(post.submission?.version).toBe(1);
        expect(post.submission?.rawText).toBe(mergedBody);
    });

    it("rejects an edit from a non-author", async () => {
        const created = await createPostCore(db, U_MAIN, {
            title: "Only the author may edit this",
            body: "Original body here.",
        });
        expect(created.ok).toBe(true);
        if (!created.ok) return;
        const res = await editPostCore(db, U_DUP, created.id, {
            title: "Trying to hijack the post",
            body: "Malicious edit.",
        });
        expect(res.ok).toBe(false);
    });
});

describe("publish gate — rate limits", () => {
    it("rejects the over-cap experience post but not a discussion", async () => {
        // Fill the rolling-week experience cap with unique-bodied posts.
        for (let i = 0; i < EXPERIENCE_WEEKLY_CAP; i++) {
            const res = await createPostCore(db, U_RATE, {
                isExperience: true,
                title: `Rate-limit experience number ${i}`,
                body: storyFor(`rate-${i}`),
                companyName,
                handle: i === 0 ? HANDLE_RATE : undefined,
            });
            expect(res.ok).toBe(true);
        }

        // The next experience is over cap.
        const over = await createPostCore(db, U_RATE, {
            isExperience: true,
            title: "One experience too many this week",
            body: storyFor("rate-over"),
            companyName,
        });
        expect(over.ok).toBe(false);
        if (over.ok === true) return;
        expect(over.error.toLowerCase()).toContain("limit");

        // A discussion is a different, lighter rate class — not throttled here.
        const discussion = await createPostCore(db, U_RATE, {
            title: "Still allowed to ask a question",
            body: "Experience cap should not block discussions.",
        });
        expect(discussion.ok).toBe(true);
    });
});

describe("publish gate — content checks", () => {
    it("rejects provenance links, profanity, and exact duplicates", async () => {
        // Claim a handle with one clean post first.
        const seed = await createPostCore(db, U_GATE, {
            title: "Clean opening post to claim a handle",
            body: "Nothing wrong with this one at all.",
            handle: HANDLE_GATE,
        });
        expect(seed.ok).toBe(true);

        const provenance = await createPostCore(db, U_GATE, {
            title: "Sharing where I found this",
            body: "Found it here https://leetcode.com/discuss/interview/999 enjoy.",
        });
        expect(provenance.ok).toBe(false);
        if (provenance.ok === true) return;
        expect(provenance.error.toLowerCase()).toContain("discuss");

        const profane = await createPostCore(db, U_GATE, {
            title: "A post with bad language inside",
            body: "this whole loop was sh1t honestly",
        });
        expect(profane.ok).toBe(false);

        const original = await createPostCore(db, U_GATE, {
            title: "An original post to duplicate later",
            body: "Curious how people frame impact at the staff level here.",
        });
        expect(original.ok).toBe(true);

        // Same body reformatted (case + whitespace) must still be caught.
        const dup = await createPostCore(db, U_GATE, {
            title: "Reposting the same thing reformatted",
            body: "CURIOUS how people frame impact\n\nat the staff level here.",
        });
        expect(dup.ok).toBe(false);
        if (dup.ok === true) return;
        expect(dup.error.toLowerCase()).toContain("already");
    });
});

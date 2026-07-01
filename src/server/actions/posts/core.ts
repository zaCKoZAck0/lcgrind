import { Prisma, type PrismaClient } from "@prisma/client";

import {
    POST_TITLE_MIN,
    POST_TITLE_MAX,
    POST_BODY_MAX,
    EXPERIENCE_BODY_MIN,
    EXPERIENCE_WEEKLY_CAP,
    TEXT_POST_WEEKLY_CAP,
    RATE_WINDOW_MS,
    HANDLE_RE,
    POST_TAG_MAX,
} from "~/config/grinds";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { toMonth } from "~/utils/public-date";
import { createSubmissionCore, type DbClient } from "../submissions/core";
import { attachPostTags, type PublicPostTag } from "../grinds/tags";
import {
    hasProfanity,
    normalizeBody,
    quotaRemaining,
} from "./publish-gate";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

// Slug component of the public URL /discuss/[id]-[title-slug]. Lowercased,
// punctuation dropped, whitespace and runs of hyphens collapsed, trimmed, and
// bounded. The post id (a cuid, no hyphens) remains the source of truth for
// routing — the slug is cosmetic, so a degenerate title still yields "post".
export function slugifyTitle(title: string): string {
    const slug = title
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/g, "");
    return slug.length > 0 ? slug : "post";
}

// Splits the [id]-[slug] route segment back into the routing id. cuid() ids
// contain no hyphens, so everything up to the first hyphen is the id.
export function postIdFromParam(idSlug: string): string {
    const dash = idSlug.indexOf("-");
    return dash === -1 ? idSlug : idSlug.slice(0, dash);
}

// Canonical [id]-[slug] segment for links.
export function postParam(id: string, title: string): string {
    return `${id}-${slugifyTitle(title)}`;
}

// ---------------------------------------------------------------------------
// Public serialization (the leak boundary)
// ---------------------------------------------------------------------------

// Minimal Post shape this serializer reads — narrower than the Prisma row so the
// serializer can never accidentally forward a field that isn't in this list.
export type PostRowForPublic = {
    id: string;
    type: string | null;
    title: string;
    slug: string;
    body: string;
    isAnonymous: boolean;
    score: number;
    upCount: number;
    downCount: number;
    commentCount: number;
    status: string;
    createdAt: Date;
    editedAt: Date | null;
    pinnedAt: Date | null;
    author: { handle: string | null; avatar: string | null; image?: string | null };
    company: { slug: string; name: string } | null;
    // Curated flair join rows; absent when a read path doesn't select them.
    tags?: { tag: { slug: string; name: string } }[];
};

export type PublicPost = {
    id: string;
    type: string | null;
    title: string;
    slug: string;
    body: string;
    author: { handle: string; avatar: string | null } | null;
    company: { slug: string; name: string } | null;
    tags: PublicPostTag[];
    createdMonth: string;
    editedMonth: string | null;
    score: number;
    upCount: number;
    downCount: number;
    commentCount: number;
    status: string;
    isPinned: boolean;
    // The viewer's own vote on this post (+1 / -1 / 0). Their vote only; never
    // anyone else's. 0 for signed-out viewers.
    myVote: number;
};

// The ONLY shape that crosses to the client. Drops authorId/email/exact dates by
// construction and nulls out identity for anonymous posts. A provenance test
// asserts no day-level date, raw id/url, or PII survives this boundary.
export function serializePostPublic(
    row: PostRowForPublic,
    myVote = 0,
): PublicPost {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        slug: row.slug,
        body: row.body,
        author:
            row.isAnonymous || row.author.handle === null
                ? null
                : { handle: row.author.handle, avatar: (row.author.image ?? row.author.avatar) ?? null },
        company: row.company,
        tags: row.tags?.map((t) => t.tag) ?? [],
        createdMonth: toMonth(row.createdAt),
        editedMonth: row.editedAt ? toMonth(row.editedAt) : null,
        score: row.score,
        upCount: row.upCount,
        downCount: row.downCount,
        commentCount: row.commentCount,
        status: row.status,
        isPinned: row.pinnedAt !== null,
        myVote,
    };
}

// ---------------------------------------------------------------------------
// Create / edit
// ---------------------------------------------------------------------------

export type CreatePostInput = {
    // When true: EXPERIENCE post (forks a Submission, requires companyName).
    // When false/absent: plain text post (type stored as null in DB).
    isExperience?: boolean;
    title: string;
    body: string;
    companyName?: string;
    isAnonymous?: boolean;
    // Unused since handle is auto-generated at login; kept for tests that set it.
    handle?: string;
    // EXPERIENCE only: FORM carries structured interview details; TEXT uses body.
    mode?: "TEXT" | "FORM";
    structured?: unknown;
    tagSlugs?: string[];
};

export type CreatePostResult =
    | { ok: true; id: string; slug: string; param: string }
    | { ok: false; error: string; remaining?: number };

export type EditPostResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

export type DeletePostResult =
    | { ok: true; id: string }
    | { ok: false; error: string };

function validateTitleBody(title: string, body: string): string | null {
    if (title.length < POST_TITLE_MIN) {
        return `Title must be at least ${POST_TITLE_MIN} characters`;
    }
    if (title.length > POST_TITLE_MAX) {
        return `Title must be under ${POST_TITLE_MAX} characters`;
    }
    if (body.length > POST_BODY_MAX) {
        return `Please keep your post under ${POST_BODY_MAX} characters`;
    }
    return null;
}

// Resolves the author's public handle inside the transaction: returns the
// existing one, or claims the requested handle (validated + uniqueness enforced
// by the DB). Throws a tagged error string the caller maps to a result.
async function ensureHandle(
    tx: PrismaClient,
    userId: string,
    requested: string | undefined,
): Promise<void> {
    const user = await tx.user.findUnique({
        where: { id: userId },
        select: { handle: true },
    });
    if (user?.handle) return;

    const handle = (requested ?? "").trim().toLowerCase();
    if (!HANDLE_RE.test(handle)) {
        throw new Error(
            "Pick a handle: 3-20 chars, lowercase letters/digits/underscore, starting with a letter",
        );
    }
    try {
        await tx.user.update({ where: { id: userId }, data: { handle } });
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            throw new Error("That handle is already taken");
        }
        throw e;
    }
}

// Remaining posts the author may publish in the rolling window.
// Experience posts use the submission cap; text posts use the lighter cap.
export async function postQuotaRemaining(
    db: DbClient,
    userId: string,
    isExperience: boolean,
): Promise<number> {
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    if (isExperience) {
        const recent = await db.post.count({
            where: { authorId: userId, type: "EXPERIENCE", createdAt: { gt: since } },
        });
        return quotaRemaining(EXPERIENCE_WEEKLY_CAP, recent);
    } else {
        const recent = await db.post.count({
            where: { authorId: userId, type: null, createdAt: { gt: since } },
        });
        return quotaRemaining(TEXT_POST_WEEKLY_CAP, recent);
    }
}

export type PublishGateResult =
    | { ok: true }
    | { ok: false; error: string; remaining?: number };

// Synchronous, AI-free publish gate. Runs before the post is created: harmful
// words, per-class rate limit, and exact-duplicate body. Returns accept or
// reject-with-reason (and remaining quota for the cap).
export async function runPublishGate(
    db: DbClient,
    userId: string,
    input: { isExperience: boolean; title: string; body: string },
): Promise<PublishGateResult> {
    if (hasProfanity(`${input.title}\n${input.body}`)) {
        return {
            ok: false,
            error: "Please remove offensive language before posting",
        };
    }

    const remaining = await postQuotaRemaining(db, userId, input.isExperience);
    if (remaining <= 0) {
        const cap = input.isExperience ? EXPERIENCE_WEEKLY_CAP : TEXT_POST_WEEKLY_CAP;
        return {
            ok: false,
            error: `You've reached the limit of ${cap} posts this week. Please try again later.`,
            remaining: 0,
        };
    }

    // Exact-duplicate body by the same author, normalized so reformatting can't
    // bypass it. Scoped to the author's recent posts to keep the check cheap.
    const since = new Date(Date.now() - RATE_WINDOW_MS);
    const recentPosts = await db.post.findMany({
        where: { authorId: userId, createdAt: { gt: since } },
        select: { body: true },
    });
    const normalized = normalizeBody(input.body);
    if (input.body && recentPosts.some((p) => normalizeBody(p.body) === normalized)) {
        return { ok: false, error: "You've already posted this" };
    }

    return { ok: true };
}

type ExperienceEntry = {
    company: string;
    role?: string;
    expYears?: number;
    rounds?: { type: string; questions: { text: string }[] }[];
    comp?: { currency: string; tc: number; components?: { label: string; amount: number }[] };
};

type LegacyStructured = { role?: string; rounds?: { type: string; questions: { text: string }[] }[]; comp?: { currency: string; tc: number; components?: { label: string; amount: number }[] } };

function getExperienceEntries(structured: unknown, fallbackCompany: string): ExperienceEntry[] {
    if (!structured || typeof structured !== "object") return [];
    if ("experiences" in structured && Array.isArray((structured as { experiences: unknown }).experiences)) {
        return (structured as { experiences: ExperienceEntry[] }).experiences;
    }
    const s = structured as LegacyStructured;
    return [{ company: fallbackCompany, role: s.role, rounds: s.rounds, comp: s.comp }];
}

function buildExperienceSection(exp: ExperienceEntry, roundOffset = 0): string[] {
    const lines: string[] = [];
    const role = exp.role?.trim();
    const yoe = exp.expYears != null ? ` (${exp.expYears} YOE)` : "";
    lines.push(role ? `## ${exp.company} — ${role}${yoe}` : `## ${exp.company}${yoe}`);
    lines.push("");
    for (let i = 0; i < (exp.rounds?.length ?? 0); i++) {
        const r = exp.rounds![i];
        lines.push(`### Round ${roundOffset + i + 1} — ${r.type}`);
        lines.push("");
        for (const q of r.questions.filter((q) => q.text.trim())) {
            lines.push(`- ${q.text.trim()}`);
        }
        lines.push("");
    }
    if (exp.comp) {
        const { currency, tc, components } = exp.comp;
        const filled = components?.filter((c) => c.label && c.amount);
        if (filled?.length) {
            lines.push("**Compensation**");
            lines.push("");
            for (const c of filled) {
                lines.push(`- **${c.label}:** ${currency} ${c.amount.toLocaleString()}`);
            }
            lines.push(`- **Total:** ${currency} ${tc.toLocaleString()}/year`);
        } else {
            lines.push(`**Compensation:** ${currency} ${tc.toLocaleString()}/year`);
        }
        lines.push("");
    }
    return lines;
}

function buildExperienceBody(companyName: string, structured: unknown): string {
    const entries = getExperienceEntries(structured, companyName);
    const parts: string[] = [];
    for (let i = 0; i < entries.length; i++) {
        if (i > 0) { parts.push("---"); parts.push(""); }
        parts.push(...buildExperienceSection(entries[i]));
    }
    return parts.join("\n").trim();
}

// Marker separating the author's free text from the generated interview section
// in a combined FORM body. The post renderer splits on it to draw the experience
// inside its own boxed "special element". It is an HTML comment so any other
// consumer (excerpts, fallback render) silently drops it.
export const EXPERIENCE_DIVIDER = "<!-- grind:experience -->";

// Final body for a FORM experience post. When the author also wrote free text it
// leads, followed by the divider and the generated interview section. Text-only
// or experience-only inputs render on their own with no divider (no box).
function composeExperienceBody(
    companyName: string,
    structured: unknown,
    userText: string,
): string {
    const experience = buildExperienceBody(companyName, structured);
    const text = userText.trim();
    if (!text) return experience;
    if (!experience) return text;
    return `${text}\n\n${EXPERIENCE_DIVIDER}\n\n${experience}`;
}

// Auto-compute flair slugs from round types across all experiences.
function autoFlairsForExperience(structured: unknown): string[] {
    const entries = getExperienceEntries(structured, "");
    const rounds = entries.flatMap((e) => e.rounds ?? []);
    if (!rounds.length) return [];
    const rtypes = new Set(rounds.map((r) => r.type));
    const slugs: string[] = [];
    if (rtypes.has("Coding") || rtypes.has("Phone Screen")) slugs.push("dsa");
    if (FEATURE_FLAGS.SYSTEM_DESIGN && rtypes.has("System Design")) slugs.push("system-design");
    if (rtypes.has("Behavioral")) slugs.push("behavioral");
    return slugs.slice(0, POST_TAG_MAX);
}

// The spine: one transaction creates the public Post and, for structured
// experiences, forks a private Submission copy into the admin pipeline, linked
// by Submission.postId. Plain text posts are pure social with no fork.
// Author identity is resolved server-side regardless of the anonymous flag.
export async function createPostCore(
    db: PrismaClient,
    userId: string,
    input: CreatePostInput,
): Promise<CreatePostResult> {
    // Ban gate — checked before any other work so the error is unambiguous.
    const poster = await db.user.findUnique({ where: { id: userId }, select: { bannedAt: true } });
    if (poster?.bannedAt) return { ok: false, error: "Your account has been banned" };

    const isExperience = input.isExperience === true;
    const title = input.title?.trim() ?? "";
    let body = input.body?.trim() ?? "";
    const companyName = input.companyName?.trim() ?? "";
    const isAnonymous = input.isAnonymous ?? false;

    if (isExperience) {
        if (companyName.length === 0 || companyName.length > 80) {
            return { ok: false, error: "Please provide a company name" };
        }
        // FORM mode: body is auto-generated; TEXT mode: body must clear the minimum.
        if (input.mode !== "FORM" && body.length < EXPERIENCE_BODY_MIN) {
            return {
                ok: false,
                error: `Please write at least ${EXPERIENCE_BODY_MIN} characters about your experience`,
            };
        }
        // For FORM mode build the body from the interview data, keeping any free
        // text the author wrote above a boxed interview section.
        if (input.mode === "FORM") {
            body = composeExperienceBody(companyName, input.structured, body);
        }
    }

    const lenError = validateTitleBody(title, body);
    if (lenError) return { ok: false, error: lenError };

    const gate = await runPublishGate(db, userId, { isExperience, title, body });
    if (gate.ok === false) {
        return { ok: false, error: gate.error, remaining: gate.remaining };
    }

    const slug = slugifyTitle(title);

    // For FORM-mode experiences use auto-computed flairs; otherwise use what the
    // client sent. Both paths are capped and deduped inside attachPostTags.
    const tagSlugs =
        isExperience && input.mode === "FORM"
            ? autoFlairsForExperience(input.structured)
            : (input.tagSlugs ?? []);

    try {
        const post = await db.$transaction(async (tx) => {
            await ensureHandle(tx as PrismaClient, userId, input.handle);

            const company =
                companyName.length > 0
                    ? await tx.company.findFirst({
                          where: {
                              name: { equals: companyName, mode: "insensitive" },
                          },
                          select: { id: true },
                      })
                    : null;

            const created = await tx.post.create({
                data: {
                    // Experiences carry "EXPERIENCE"; text posts have null type.
                    type: isExperience ? "EXPERIENCE" : null,
                    authorId: userId,
                    companyId: company?.id ?? null,
                    title,
                    slug,
                    body,
                    isAnonymous,
                },
                select: { id: true },
            });

            await attachPostTags(tx as PrismaClient, created.id, tagSlugs);

            if (isExperience) {
                const fork = await createSubmissionCore(
                    tx as PrismaClient,
                    userId,
                    input.mode === "FORM"
                        ? {
                              companyName,
                              mode: "FORM",
                              structured: input.structured,
                          }
                        : { companyName, mode: "TEXT", rawText: body },
                );
                if (fork.ok === false) {
                    // Roll the whole post back: a rejected fork (quota, dup) must
                    // not leave a public post without its data copy.
                    throw new Error(fork.error);
                }
                await tx.submission.update({
                    where: { id: fork.id },
                    data: { postId: created.id },
                });
            }

            return created;
        });

        return { ok: true, id: post.id, slug, param: postParam(post.id, title) };
    } catch (e) {
        return {
            ok: false,
            error: e instanceof Error ? e.message : "Could not publish your post",
        };
    }
}

// Author edit. Updates the public post and stamps editedAt. If the post has a
// forked Submission that is NOT yet merged (status !== APPROVED), the copy is
// re-queued for review with a bumped version and the new body — invisibly to the
// author. Once merged, parseFrozen latches true and the aggregates are never
// touched again (point-in-time, anti-gaming).
export async function editPostCore(
    db: PrismaClient,
    userId: string,
    postId: string,
    input: { title: string; body?: string; structured?: unknown },
): Promise<EditPostResult> {
    const title = input.title?.trim() ?? "";
    const body = (input.structured
        ? composeExperienceBody("", input.structured, input.body ?? "")
        : input.body ?? ""
    ).trim();
    const lenError = validateTitleBody(title, body);
    if (lenError) return { ok: false, error: lenError };

    const post = await db.post.findUnique({
        where: { id: postId },
        select: {
            id: true,
            authorId: true,
            type: true,
            parseFrozen: true,
            submission: { select: { id: true, version: true, status: true } },
        },
    });
    if (!post) return { ok: false, error: "Post not found" };
    if (post.authorId !== userId) {
        return { ok: false, error: "You can only edit your own posts" };
    }
    if (post.type === "EXPERIENCE" && body.length < EXPERIENCE_BODY_MIN) {
        return {
            ok: false,
            error: `Please write at least ${EXPERIENCE_BODY_MIN} characters about your experience`,
        };
    }

    const sub = post.submission;
    const merged = sub?.status === "APPROVED" || post.parseFrozen;

    await db.$transaction(async (tx) => {
        await tx.post.update({
            where: { id: postId },
            data: {
                title,
                slug: slugifyTitle(title),
                body,
                editedAt: new Date(),
                // Latch the freeze the first time we observe a merged copy.
                ...(merged ? { parseFrozen: true } : {}),
            },
        });

        // Re-queue the admin copy only while it is still pre-merge.
        if (sub && !merged) {
            await tx.submission.update({
                where: { id: sub.id },
                data: {
                    rawText: body,
                    version: sub.version + 1,
                    status: "PENDING",
                    parsed: Prisma.JsonNull,
                    adminNote: null,
                    ...(input.structured ? { structured: input.structured as Prisma.InputJsonValue } : {}),
                },
            });
        } else if (sub && merged && input.structured) {
            await tx.submission.update({
                where: { id: sub.id },
                data: { structured: input.structured as Prisma.InputJsonValue },
            });
        }
    });

    return { ok: true, id: postId };
}

// Author delete. The post tombstones (status TOMBSTONED) rather than vanishing
// so the discussion others built on it survives — its comments are untouched.
// Author-only; the admin copy and aggregates are deliberately left as-is.
export async function deletePostCore(
    db: PrismaClient,
    userId: string,
    postId: string,
): Promise<DeletePostResult> {
    const post = await db.post.findUnique({
        where: { id: postId },
        select: { authorId: true, status: true },
    });
    if (!post) return { ok: false, error: "Post not found" };
    if (post.authorId !== userId) {
        return { ok: false, error: "You can only delete your own posts" };
    }

    await db.post.update({
        where: { id: postId },
        data: { status: "TOMBSTONED" },
    });
    return { ok: true, id: postId };
}

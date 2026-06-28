"use server";

import "server-only";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

export type PostEditData =
    | {
          ok: true;
          mode: "FORM" | "TEXT" | null;
          companyName: string | null;
          // Present for FORM-mode EXPERIENCE posts; null otherwise
          structured: {
              role: string;
              rounds: { type: string; questions: string[] }[];
          } | null;
      }
    | { ok: false; error: string };

// Fetches the editable structured data for the post's submission. Auth-gated;
// only the post author can call this.
export async function getPostForEdit(postId: string): Promise<PostEditData> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Sign in to edit" };

    const post = await db.post.findUnique({
        where: { id: postId },
        select: {
            authorId: true,
            company: { select: { name: true } },
            submission: {
                select: {
                    mode: true,
                    companyName: true,
                    structured: true,
                },
            },
        },
    });

    if (!post) return { ok: false, error: "Post not found" };
    if (post.authorId !== session.user.id) return { ok: false, error: "Not your post" };

    const sub = post.submission;
    if (!sub || sub.mode !== "FORM" || !sub.structured) {
        return {
            ok: true,
            mode: (sub?.mode ?? null) as "FORM" | "TEXT" | null,
            companyName: post.company?.name ?? sub?.companyName ?? null,
            structured: null,
        };
    }

    // Map the stored structured data to the simple form shape (questions as strings).
    const raw = sub.structured as {
        role?: string;
        rounds?: { type?: string; questions?: { text?: string }[] }[];
    } | null;

    return {
        ok: true,
        mode: "FORM",
        companyName: post.company?.name ?? sub.companyName,
        structured: {
            role: raw?.role ?? "",
            rounds: (raw?.rounds ?? []).map((r) => ({
                type: r.type ?? "Coding",
                questions: (r.questions ?? []).map((q) => q.text ?? "").filter(Boolean),
            })),
        },
    };
}

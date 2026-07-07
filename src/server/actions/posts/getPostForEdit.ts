"use server";

import "server-only";

import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";

export type ExperienceFormEntry = {
    company: string;
    role: string;
    expYears: string;
    rounds: { type: string; questions: string[] }[];
    compEnabled: boolean;
    comp: { currency: string; components: { label: string; amount: string }[] };
};

export type PostEditData =
    | {
          ok: true;
          title: string;
          mode: "FORM" | "TEXT" | null;
          experiences: ExperienceFormEntry[] | null;
          body: string | null;
      }
    | { ok: false; error: string };

function mapComp(
    comp: { currency?: string; tc?: number; components?: { label: string; amount: number }[] } | null | undefined,
): { currency: string; components: { label: string; amount: string }[] } {
    if (!comp) return { currency: "INR", components: [{ label: "", amount: "" }] };
    const currency = comp.currency ?? "INR";
    if (comp.components?.length) {
        return { currency, components: comp.components.map((c) => ({ label: c.label, amount: String(c.amount) })) };
    }
    if (comp.tc) {
        return { currency, components: [{ label: "", amount: String(comp.tc) }] };
    }
    return { currency, components: [{ label: "", amount: "" }] };
}

export async function getPostForEdit(postId: string): Promise<PostEditData> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { ok: false, error: "Sign in to edit" };

    const post = await db.post.findUnique({
        where: { id: postId },
        select: {
            title: true,
            body: true,
            authorId: true,
            company: { select: { name: true } },
            submission: {
                select: { mode: true, companyName: true, structured: true },
            },
        },
    });

    if (!post) return { ok: false, error: "Post not found" };
    if (post.authorId !== session.user.id) return { ok: false, error: "Not your post" };

    const sub = post.submission;
    const mode = (sub?.mode ?? null) as "FORM" | "TEXT" | null;

    if (!sub || mode !== "FORM" || !sub.structured) {
        return { ok: true, title: post.title, mode, experiences: null, body: post.body };
    }

    const raw = sub.structured as {
        experiences?: {
            company?: string;
            role?: string;
            expYears?: number;
            rounds?: { type?: string; questions?: { text?: string }[] }[];
            comp?: { currency?: string; tc?: number; components?: { label: string; amount: number }[] };
        }[];
        role?: string;
        rounds?: { type?: string; questions?: { text?: string }[] }[];
        comp?: { currency?: string; tc?: number; components?: { label: string; amount: number }[] };
    } | null;

    const fallbackCompany = post.company?.name ?? sub.companyName ?? "";

    let rawExperiences: typeof raw extends null | undefined ? never : NonNullable<typeof raw>["experiences"];
    if (raw?.experiences?.length) {
        rawExperiences = raw.experiences;
    } else {
        rawExperiences = [{ company: fallbackCompany, role: raw?.role, rounds: raw?.rounds, comp: raw?.comp }];
    }

    const experiences: ExperienceFormEntry[] = (rawExperiences ?? []).map((e) => ({
        company: e?.company ?? "",
        role: e?.role ?? "",
        expYears: e?.expYears != null ? String(e.expYears) : "",
        rounds:
            (e?.rounds ?? []).map((r) => ({
                type: r.type ?? "Coding",
                questions: (r.questions ?? []).map((q) => q.text ?? "").filter(Boolean),
            })),
        compEnabled: !!e?.comp,
        comp: mapComp(e?.comp),
    }));

    // Ensure each experience has at least one round with one question
    for (const exp of experiences) {
        if (!exp.rounds.length) exp.rounds = [{ type: "Coding", questions: [""] }];
        for (const r of exp.rounds) {
            if (!r.questions.length) r.questions = [""];
        }
        if (!exp.comp.components.length) exp.comp.components = [{ label: "", amount: "" }];
    }

    return { ok: true, title: post.title, mode: "FORM", experiences, body: null };
}

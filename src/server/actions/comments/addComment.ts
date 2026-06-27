"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { addCommentCore, type AddCommentResult } from "./core";
import { syncSocialBadges } from "../gamification/core";

// Session-gated comment create. The post permalink is revalidated so the new
// comment shows on the server-rendered thread without a client refetch.
export async function addComment(input: {
    postId: string;
    parentId?: string;
    body: string;
    isAnonymous?: boolean;
    postParam: string;
}): Promise<AddCommentResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Sign in to comment" };
    }

    const res = await addCommentCore(db, session.user.id, {
        postId: input.postId,
        parentId: input.parentId,
        body: input.body,
        isAnonymous: input.isAnonymous,
    });

    if (res.ok === true) {
        revalidatePath(`/grinds/${input.postParam}`);
        void syncSocialBadges(db, session.user.id);
    }
    return res;
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    addCommentCore,
    editCommentCore,
    deleteCommentCore,
    type AddCommentResult,
    type EditCommentResult,
    type DeleteCommentResult,
} from "./core";
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

export async function editComment(
    commentId: string,
    input: { body: string; postParam: string },
): Promise<EditCommentResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Sign in to edit" };
    }
    const res = await editCommentCore(db, session.user.id, commentId, { body: input.body });
    if (res.ok) {
        revalidatePath(`/grinds/${input.postParam}`);
    }
    return res;
}

export async function deleteComment(
    commentId: string,
    postParam: string,
): Promise<DeleteCommentResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Sign in to delete" };
    }
    const res = await deleteCommentCore(db, session.user.id, commentId);
    if (res.ok) {
        revalidatePath(`/grinds/${postParam}`);
    }
    return res;
}

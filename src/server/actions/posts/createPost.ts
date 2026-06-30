"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import {
    createPostCore,
    editPostCore,
    deletePostCore,
    type CreatePostInput,
    type CreatePostResult,
    type EditPostResult,
    type DeletePostResult,
} from "./core";
import { syncSocialBadges } from "../gamification/core";

export async function createPost(
    input: CreatePostInput,
): Promise<CreatePostResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Please sign in to post" };
    }
    const result = await createPostCore(db, session.user.id, input);
    if (result.ok) {
        void syncSocialBadges(db, session.user.id);
    }
    return result;
}

export async function editPost(
    postId: string,
    input: { title: string; body?: string; structured?: unknown },
): Promise<EditPostResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Please sign in to edit" };
    }
    return editPostCore(db, session.user.id, postId, input);
}

export async function deletePost(
    postId: string,
    postParam: string,
): Promise<DeletePostResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { ok: false, error: "Please sign in to delete" };
    }
    const res = await deletePostCore(db, session.user.id, postId);
    if (res.ok) {
        revalidatePath(`/grinds/${postParam}`);
    }
    return res;
}

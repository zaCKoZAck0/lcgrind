"use server";

import { db } from "~/lib/db";
import { findSimilarPosts, type SimilarPost } from "./search";

// Compose-time typeahead. Returns near-duplicate published titles (id + title +
// permalink param only) so the client can nudge the author toward an existing
// thread. No body/date/count crosses, so nothing leaks.
export async function findSimilarPostsAction(
    title: string,
): Promise<SimilarPost[]> {
    return findSimilarPosts(db, title, 5);
}

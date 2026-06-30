"use server";

import { db } from "~/lib/db";
import { getFeed, type FeedOptions, type FeedPage } from "./feed";

export async function getFeedPage(opts: FeedOptions): Promise<FeedPage> {
    return getFeed(db, opts);
}

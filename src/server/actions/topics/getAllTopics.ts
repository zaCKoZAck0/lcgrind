"use server";

import { db } from "~/lib/db";

export interface TopicWithCount {
    id: number;
    slug: string;
    name: string;
    problemCount: number;
}

export async function getAllTopics(): Promise<TopicWithCount[]> {
    try {
        const topics = await db.topicTag.findMany({
            select: {
                id: true,
                slug: true,
                name: true,
                _count: {
                    select: { problems: true },
                },
            },
            orderBy: { name: "asc" },
        });

        return topics.map((topic) => ({
            id: topic.id,
            slug: topic.slug,
            name: topic.name,
            problemCount: topic._count.problems,
        }));
    } catch (e) {
        console.error("Error fetching all topics:", e);
        return [];
    }
}

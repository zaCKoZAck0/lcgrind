import Link from "next/link";
import {
    ArrowBigUp,
    MessageSquare,
    Building2,
    Briefcase,
    MessagesSquare,
    Tag,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { formatMonth } from "~/utils/public-date";
import { postParam } from "~/server/actions/posts/core";
import type { PublicPost } from "~/server/actions/posts/core";

// "EXPERIENCE" is the only named type; null = plain text post.
const TYPE_META: Record<string, { label: string; icon: typeof Briefcase }> = {
    EXPERIENCE: { label: "Experience", icon: Briefcase },
};
const TEXT_META = { label: "Post", icon: MessagesSquare };

// One feed row. Server-rendered; links to the canonical post permalink. Shows
// the coarsened month only — never an exact date.
export function PostCard({ post }: { post: PublicPost }) {
    const who = post.author?.handle ? `@${post.author.handle}` : "Anonymous";
    const meta = post.type ? (TYPE_META[post.type] ?? TEXT_META) : TEXT_META;
    const Icon = meta.icon;
    const param = postParam(post.id, post.title);

    return (
        <article className="rounded-base border-2 border-border bg-card shadow-shadow">
            <div className="flex">
                <div className="flex flex-col items-center justify-start gap-0.5 border-r-2 border-border px-3 py-4 text-muted-foreground">
                    <ArrowBigUp className="size-5" />
                    <span className="text-sm font-bold tabular-nums text-foreground">
                        {post.score}
                    </span>
                </div>

                <div className="flex-1 p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="neutral" className="inline-flex items-center gap-1 text-xs">
                            <Icon className="size-3.5" />
                            {meta.label}
                        </Badge>
                        {post.company && (
                            <Badge variant="neutral" className="inline-flex items-center gap-1 text-xs">
                                <Building2 className="size-3.5" />
                                {post.company.name}
                            </Badge>
                        )}
                        {post.tags.map((t) => (
                            <Badge key={t.slug} asChild>
                                <Link
                                    href={`/discuss/tag/${t.slug}`}
                                    className="inline-flex items-center gap-1 text-xs hover:underline"
                                >
                                    <Tag className="size-3.5" />
                                    {t.name}
                                </Link>
                            </Badge>
                        ))}
                    </div>

                    <h2 className="font-bold text-lg leading-tight">
                        <Link
                            href={`/discuss/${param}`}
                            className="hover:underline underline-offset-2"
                        >
                            {post.title}
                        </Link>
                    </h2>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        {post.author ? (
                            <Link
                                href={`/u/${post.author.handle}`}
                                className="font-semibold text-foreground hover:underline underline-offset-2"
                            >
                                {who}
                            </Link>
                        ) : (
                            <span className="font-semibold text-foreground">
                                {who}
                            </span>
                        )}
                        <span>·</span>
                        <span>{formatMonth(post.createdMonth)}</span>
                        <span className="inline-flex items-center gap-1">
                            <MessageSquare className="size-3.5" />
                            {post.commentCount}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

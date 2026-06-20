import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, MessageSquare, AtSign, Trophy } from "lucide-react";
import { Card } from "~/components/ui/card";
import {
    getNotifications,
    markAllRead,
    type NotifRow,
} from "~/server/actions/notifications/getNotifications";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export const metadata: Metadata = {
    title: "Notifications | LC Grind",
    robots: { index: false, follow: false },
};

const TYPE_META: Record<string, { label: string; Icon: React.ElementType }> = {
    REPLY_POST: { label: "replied to your post", Icon: MessageSquare },
    REPLY_COMMENT: { label: "replied to your comment", Icon: MessageSquare },
    MENTION: { label: "mentioned you", Icon: AtSign },
    BADGE: { label: "You earned a badge", Icon: Trophy },
};

function NotifItem({ n }: { n: NotifRow }) {
    const meta = TYPE_META[n.type] ?? { label: n.type, Icon: Bell };
    const actor = n.actorHandle ? `@${n.actorHandle}` : "Someone";
    const href = n.postSlug
        ? `/discuss/${n.postSlug}${n.commentId ? `#c-${n.commentId}` : ""}`
        : "/notifications";

    return (
        <Link
            href={href}
            className={`flex items-start gap-3 p-4 border-2 border-border ${n.read ? "bg-card" : "bg-secondary-background"} hover:bg-secondary-background transition-colors`}
        >
            <meta.Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-semibold">{actor}</span>{" "}
                    {meta.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()}
                </p>
            </div>
            {!n.read && (
                <span className="size-2 rounded-full bg-main shrink-0 mt-1.5" />
            )}
        </Link>
    );
}

export default async function NotificationsPage() {
    if (!FEATURE_FLAGS.NOTIFICATIONS) notFound();
    const notifications = await getNotifications();

    // Mark all as read on page load (fire-and-forget)
    void markAllRead();

    return (
        <div className="w-full max-w-[700px] py-6">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="size-6" />
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            {notifications.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground/70">
                    No notifications yet.
                </Card>
            ) : (
                <Card className="p-0 gap-1 overflow-hidden">
                    {notifications.map((n) => (
                        <NotifItem key={n.id} n={n} />
                    ))}
                </Card>
            )}
        </div>
    );
}

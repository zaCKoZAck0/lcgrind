import { headers } from "next/headers";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { computeViewerKey } from "~/server/views/viewer-key";

const BOT_UA = /bot|crawl|spider|slurp|headless|preview|fetch|monitor/i;

export async function POST(req: Request): Promise<Response> {
    try {
        const secret = process.env.VIEW_HASH_SECRET;
        if (!secret) return new Response(null, { status: 204 });

        const hdrs = await headers();

        // Drop bots and prefetch requests.
        const ua = hdrs.get("user-agent") ?? "";
        if (!ua || BOT_UA.test(ua)) return new Response(null, { status: 204 });

        const purpose = hdrs.get("purpose") ?? "";
        const secPurpose = hdrs.get("sec-purpose") ?? "";
        if (
            purpose === "prefetch" ||
            secPurpose.includes("prefetch") ||
            secPurpose.includes("prerender")
        ) {
            return new Response(null, { status: 204 });
        }

        const body = await req.json().catch(() => null);
        const postId = typeof body?.postId === "string" ? body.postId : null;
        if (!postId) return new Response(null, { status: 204 });

        // Resolve viewer identity.
        const session = await auth.api.getSession({ headers: hdrs });
        const signedIn = Boolean(session?.user?.id);

        const utcDate = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
        const day = new Date(`${utcDate}T00:00:00.000Z`);

        let message: string;
        if (signedIn) {
            message = session!.user.id;
        } else {
            const ip =
                hdrs.get("x-forwarded-for")?.split(",")[0]?.trim()
                ?? hdrs.get("x-real-ip")
                ?? "unknown";
            message = ip + ua;
        }

        const viewerKey = computeViewerKey(secret, message, utcDate);

        // Insert with duplicate suppression (P2002) and unknown-postId suppression (P2003).
        await db.postView
            .create({ data: { postId, viewerKey, day, signedIn } })
            .catch((err: { code?: string }) => {
                // P2002 = unique constraint (already counted today)
                // P2003 = foreign key (postId does not exist)
                if (err?.code !== "P2002" && err?.code !== "P2003") throw err;
            });
    } catch {
        // Beacon failures must never surface errors to the client.
    }

    return new Response(null, { status: 204 });
}

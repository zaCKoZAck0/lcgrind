import { ImageResponse } from "next/og";
import { db } from "~/lib/db";
import { postIdFromParam } from "~/server/actions/posts/core";

export const alt = "LC Grind - Grinds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ idSlug: string }>;
}) {
  const { idSlug } = await params;
  const id = postIdFromParam(idSlug);

  const post = await db.post.findUnique({
    where: { id },
    select: { title: true, status: true },
  });

  const rawTitle =
    post?.status === "PUBLISHED"
      ? post.title
      : "Grinds — interview experiences & discussion";

  const title = rawTitle.length > 80 ? rawTitle.slice(0, 77) + "..." : rawTitle;

  const fontData = await fetch(
    "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu8-Dg.woff"
  )
    .then((r) => r.arrayBuffer())
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#ede8fb",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "DM Sans",
        }}
      >
        <p
          style={{
            fontSize: 26,
            color: "#7375e8",
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          LC Grind · Grinds
        </p>
        <h1
          style={{
            fontSize: title.length > 50 ? 52 : 68,
            fontWeight: 800,
            color: "#000",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 1000,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 22,
            color: "#666",
            marginTop: 36,
          }}
        >
          lcgrind.zackozack.xyz/grinds
        </p>
      </div>
    ),
    { ...size, ...(fontData ? { fonts: [{ name: "DM Sans", data: fontData, style: "normal", weight: 800 }] } : {}) }
  );
}

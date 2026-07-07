import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LC Grind - DSA Sheet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function formatSlugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => {
      if (["dsa", "sde"].includes(w.toLowerCase())) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export default async function Image({
  params,
}: {
  params: Promise<{ "sheet-slug": string }>;
}) {
  const { "sheet-slug": slug } = await params;
  const sheetName = formatSlugToName(slug);

  const fontData = await fetch(
    "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu8-Dg.woff"
  ).then((r) => r.arrayBuffer());

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
        <p style={{ fontSize: 26, color: "#7375e8", fontWeight: 700, marginBottom: 16 }}>
          LC Grind
        </p>
        <h1
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#000",
            textAlign: "center",
            lineHeight: 1.15,
            margin: "0 0 28px 0",
            maxWidth: 900,
          }}
        >
          {sheetName}
        </h1>
        <div
          style={{
            backgroundColor: "#7375e8",
            border: "3px solid #000",
            boxShadow: "4px 4px 0px #000",
            padding: "10px 28px",
            display: "flex",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 28 }}>
            DSA Sheet for Interview Prep
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "DM Sans", data: fontData, style: "normal", weight: 700 }] }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LC Grind - DSA Sheet";
export const size = {
  width: 1200,
  height: 630,
};

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

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(to bottom right, #0a0a0a, #1a1a2e)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            LC Grind
          </p>
          <h1
            style={{
              fontSize: 64,
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {sheetName}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f97316",
              padding: "12px 28px",
              borderRadius: 8,
              marginBottom: 30,
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "#000000",
              }}
            >
              DSA Sheet for Interview Preparation
            </span>
          </div>
          <p
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Curated coding problems with progress tracking
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { ImageResponse } from "next/og";
import { getCompanyNameFromSlug } from "~/utils/slug";

export const runtime = "edge";

export const alt = "LC Grind - Company LeetCode Problems";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ "company-slug": string }>;
}) {
  const { "company-slug": slug } = await params;
  const companyName = getCompanyNameFromSlug(slug) || slug;

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
            {companyName}
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
              LeetCode Interview Questions
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
            Free company-wise problems, prep guide & progress tracking
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

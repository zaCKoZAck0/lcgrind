import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "LC Grind - Company Wise LeetCode Problems";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
          backgroundImage: "linear-gradient(to bottom right, #0a0a0a, #1a1a2e)",
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
          <h1
            style={{
              fontSize: 72,
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            LC Grind
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f97316",
              padding: "16px 32px",
              borderRadius: 8,
              marginBottom: 30,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: "#000000",
              }}
            >
              Company Wise LeetCode Problems
            </span>
          </div>
          <p
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Free interview prep • DSA Sheets • Google • Meta • Amazon • Microsoft
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

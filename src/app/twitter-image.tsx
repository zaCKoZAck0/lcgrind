import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LC Grind - Company Wise LeetCode Problems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        <div
          style={{
            backgroundColor: "#7375e8",
            border: "3px solid #000",
            boxShadow: "4px 4px 0px #000",
            padding: "10px 28px",
            marginBottom: "36px",
            display: "flex",
          }}
        >
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 32 }}>
            LC Grind
          </span>
        </div>
        <h1
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: "#000",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1000,
            margin: 0,
          }}
        >
          Company-Wise LeetCode Problems
        </h1>
        <p
          style={{
            fontSize: 26,
            color: "#444",
            marginTop: 32,
            textAlign: "center",
          }}
        >
          Free interview prep • FAANG • 700+ companies
        </p>
      </div>
    ),
    { ...size, fonts: [{ name: "DM Sans", data: fontData, style: "normal", weight: 700 }] }
  );
}

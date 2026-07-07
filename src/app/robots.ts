import { MetadataRoute } from "next";
import { CANONICAL_URL } from "~/config/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/"],
      },
    ],
    sitemap: `${CANONICAL_URL}/sitemap.xml`,
  };
}

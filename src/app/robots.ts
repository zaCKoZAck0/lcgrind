import { MetadataRoute } from "next";
import { BASE_URL } from "~/config/constants"; // Adjust path

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*", // Applies to all crawlers
        allow: "/", // Allow crawling of the entire site
        // disallow: '/admin/', // Example: Disallow crawling specific private sections
      },
      // You could add specific rules for different bots if needed
      // {
      //   userAgent: 'Googlebot',
      //   allow: '/',
      // }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`, // Location of your sitemap
  };
}

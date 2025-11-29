import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { DM_Sans } from "next/font/google"
import { BASE_URL } from "~/config/constants";
import { WebsiteJsonLd, OrganizationJsonLd } from "~/components/seo/json-ld";


const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "LC Grind - Company Wise LeetCode Problems | Free Interview Prep",
    template: "%s | LC Grind",
  },
  description:
    "Practice company-wise LeetCode problems for free. Access interview questions, DSA sheets, and premium problems for top tech companies like Google, Meta, Amazon, Microsoft, and more. Prepare for FAANG interviews with curated coding challenges.",
  keywords: [
    "leetcode",
    "company wise leetcode problems",
    "coding interview",
    "faang interview questions",
    "maang interview prep",
    "dsa sheets",
    "blind 75",
    "neetcode 150",
    "leetcode premium free",
    "google interview questions",
    "meta interview questions",
    "amazon interview questions",
    "microsoft interview questions",
    "apple interview questions",
    "tech interview preparation",
    "data structures algorithms",
    "coding practice",
  ],
  authors: [{ name: "LC Grind" }],
  creator: "LC Grind",
  publisher: "LC Grind",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "LC Grind - Company Wise LeetCode Problems | Free Interview Prep",
    description:
      "Free company-wise LeetCode problems and interview preparation. Practice coding questions from Google, Meta, Amazon, Microsoft, Apple, and more top tech companies.",
    url: BASE_URL,
    siteName: "LC Grind",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LC Grind - Company Wise LeetCode Problems | Free Interview Prep",
    description:
      "Free company-wise LeetCode problems and interview preparation for FAANG and top tech companies.",
    creator: "@zaCKoZAck0",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body
        className={`${dmSans.className} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col bg-background text-foreground text-base px-2">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

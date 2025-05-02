import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { DM_Sans } from "next/font/google"
import { BASE_URL } from "~/config/constants";


const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "LC Grind - Company Wise LeetCode Problems",
    template: "%s | LC Grind",
  },
  description:
    "Practice company-wise LeetCode problems for free. Access interview questions, DSA sheets, and premium problems for top tech companies like Google, Meta, Amazon, and more.",
  openGraph: {
    title: "LC Grind - Company Wise LeetCode Problems",
    description:
      "Free company-wise LeetCode problems and interview preparation.",
    url: BASE_URL,
    siteName: "LC Grind",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LC Grind - Company Wise LeetCode Problems",
    description:
      "Free company-wise LeetCode problems and interview preparation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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

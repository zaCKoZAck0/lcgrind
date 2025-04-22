import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { DM_Sans } from "next/font/google"


const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})


export const metadata: Metadata = {
  title: "LC Grind",
  description: "Focused Interview Preparation",
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

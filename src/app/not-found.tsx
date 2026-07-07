import { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

export const metadata: Metadata = {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Browse company-wise LeetCode problems, DSA sheets, and more on LC Grind.",
    robots: {
        index: false,
        follow: true,
    },
};

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <Link href="/" className={buttonVariants()}>Go Home</Link>
                <Link href="/companies" className={buttonVariants({ variant: "neutral" })}>
                    Browse Companies
                </Link>
                <Link href="/sheets" className={buttonVariants({ variant: "neutral" })}>
                    DSA Sheets
                </Link>
            </div>
        </div>
    );
}

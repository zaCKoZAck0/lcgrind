"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                An unexpected error occurred. Please try again.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-main text-main-foreground border-2 border-border font-semibold hover:shadow-shadow transition-shadow cursor-pointer"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="px-6 py-3 bg-card text-foreground border-2 border-border font-semibold hover:shadow-shadow transition-shadow"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

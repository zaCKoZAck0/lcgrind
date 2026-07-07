"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { buttonVariants } from "~/components/ui/button";

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
                <Button onClick={reset}>Try Again</Button>
                <Link href="/" className={buttonVariants({ variant: "neutral" })}>
                    Go Home
                </Link>
            </div>
        </div>
    );
}

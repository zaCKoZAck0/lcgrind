"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function GrindsError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto">
            <Card>
                <CardContent className="py-8 flex flex-col items-center gap-4 text-center">
                    <p className="text-muted-foreground">Something went wrong.</p>
                    <Button variant="neutral" onClick={reset}>
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

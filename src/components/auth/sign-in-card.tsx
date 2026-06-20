"use client";

import { LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { signIn } from "~/lib/auth-client";

export function SignInCard({ message }: { message: string }) {
    return (
        <Card className="p-10 items-center gap-4 text-center">
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => signIn.social({ provider: "google" })}>
                <LogIn className="size-4" />
                Sign in with Google
            </Button>
        </Card>
    );
}

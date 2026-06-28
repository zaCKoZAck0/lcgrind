"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { updateMyProfile } from "~/server/actions/grinds/profile-actions";

type Props = {
    initialName: string;
    email: string;
    initialHandle: string;
    onSuccess?: () => void;
};

export function ProfileForm({ initialName, email, initialHandle, onSuccess }: Props) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [handle, setHandle] = useState(initialHandle);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setName(initialName);
        setHandle(initialHandle);
    }, [initialName, initialHandle]);

    function handleSave() {
        startTransition(async () => {
            const result = await updateMyProfile({ name, handle });
            if (result.ok === false) {
                toast.error(result.error);
                return;
            }
            toast.success("Profile updated.");
            router.refresh();
            onSuccess?.();
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-name">Name</Label>
                <Input
                    id="pf-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={80}
                />
                <p className="text-xs text-muted-foreground">Private — not shown publicly.</p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-email">Email</Label>
                <Input id="pf-email" value={email} disabled readOnly className="opacity-60" />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-handle">Username</Label>
                <div className="flex items-center">
                    <span className="border-2 border-r-0 border-border bg-secondary-background px-2.5 py-2 text-sm text-muted-foreground select-none">
                        @
                    </span>
                    <Input
                        id="pf-handle"
                        value={handle}
                        onChange={(e) =>
                            setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                        }
                        placeholder="your_handle"
                        maxLength={20}
                        className="rounded-l-none border-l-0 focus-visible:z-10"
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    3-20 chars, lowercase letters, digits, underscores. Public URL: /u/{handle || "…"}
                </p>
            </div>

            <Button onClick={handleSave} disabled={isPending} className="self-start">
                {isPending ? "Saving…" : "Save changes"}
            </Button>
        </div>
    );
}

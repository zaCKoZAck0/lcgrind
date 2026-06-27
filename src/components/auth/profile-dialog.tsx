"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPen } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { updateMyProfile } from "~/server/actions/grinds/profile-actions";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName: string;
    email: string;
    initialHandle: string;
};

export function ProfileDialog({
    open,
    onOpenChange,
    initialName,
    email,
    initialHandle,
}: Props) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [handle, setHandle] = useState(initialHandle);
    const [isPending, startTransition] = useTransition();

    // Sync if props change (e.g. re-opened after a refresh).
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
            onOpenChange(false);
            router.refresh();
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPen className="size-5" />
                        Edit profile
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pd-name">Name</Label>
                        <Input
                            id="pd-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your display name"
                            maxLength={80}
                        />
                        <p className="text-xs text-muted-foreground">
                            Private — not shown publicly.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pd-email">Email</Label>
                        <Input
                            id="pd-email"
                            value={email}
                            disabled
                            readOnly
                            className="opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pd-handle">Username</Label>
                        <div className="flex items-center">
                            <span className="border-2 border-r-0 border-border bg-secondary-background px-2.5 py-2 text-sm text-muted-foreground select-none">
                                @
                            </span>
                            <Input
                                id="pd-handle"
                                value={handle}
                                onChange={(e) =>
                                    setHandle(
                                        e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9_]/g, ""),
                                    )
                                }
                                placeholder="your_handle"
                                maxLength={20}
                                className="rounded-l-none border-l-0 focus-visible:z-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            3-20 chars, lowercase letters, digits, underscores. Your public URL: /u/{handle || "…"}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

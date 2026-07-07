"use client";

import { UserPen } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { ProfileForm } from "./profile-form";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName: string;
    email: string;
    initialHandle: string;
};

export function ProfileDialog({ open, onOpenChange, initialName, email, initialHandle }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPen className="size-5" />
                        Set up your profile
                    </DialogTitle>
                </DialogHeader>
                <ProfileForm
                    initialName={initialName}
                    email={email}
                    initialHandle={initialHandle}
                    onSuccess={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}

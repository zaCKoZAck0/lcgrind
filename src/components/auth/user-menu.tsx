"use client";

import { useEffect, useState } from "react";
import {
    LogOut,
    Bug,
    FileText,
    MessagesSquare,
    ShieldCheck,
    Trophy,
    UserPen,
    Bell,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "~/lib/utils";
import { isCurrentUserAdmin } from "~/server/actions/admin/whoami";
import { getMyPoints } from "~/server/actions/gamification/actions";
import {
    getMyProfileStatus,
    type ProfileStatus,
} from "~/server/actions/discuss/profile-actions";
import { getUnreadCount } from "~/server/actions/notifications/getNotifications";
import { ProfileDialog } from "./profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Twitter } from "../home/tweet";
import { SyncMenuItems } from "../sync-dropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signIn, signOut, useSession } from "~/lib/auth-client";
import { FEATURE_FLAGS } from "~/config/feature-flags";

export function UserMenu() {
    const { data: session, isPending } = useSession();
    const [isAdmin, setIsAdmin] = useState(false);
    const [points, setPoints] = useState<number | null>(null);
    const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (session) {
            isCurrentUserAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
            getMyPoints().then(setPoints).catch(() => setPoints(null));
            if (FEATURE_FLAGS.NOTIFICATIONS) {
                getUnreadCount().then(setUnreadCount).catch(() => setUnreadCount(0));
            }
            getMyProfileStatus()
                .then((s) => {
                    setProfileStatus(s);
                    // Auto-open onboarding popup for new users who haven't confirmed.
                    if (!s.onboarded) setDialogOpen(true);
                })
                .catch(() => setProfileStatus(null));
        } else {
            setIsAdmin(false);
            setPoints(null);
            setProfileStatus(null);
            setUnreadCount(0);
        }
    }, [session]);

    if (isPending) {
        return <div className="size-9" />;
    }

    if (!session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger
                    className={cn(buttonVariants({ variant: "neutral", size: "icon" }))}
                    aria-label="Account menu"
                >
                    <Bug className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <SyncMenuItems />
                    <DropdownMenuItem asChild>
                        <a target="_blank" rel="noopener noreferrer" href="https://x.com/zaCKoZAck0/status/1913558597688009006">
                            <Twitter className="size-4" />
                            Follow on X
                        </a>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    const user = session.user;
    return (
        <>
            {profileStatus && (
                <ProfileDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    initialName={profileStatus.name}
                    email={profileStatus.email}
                    initialHandle={profileStatus.handle}
                />
            )}

            {FEATURE_FLAGS.NOTIFICATIONS && (
                <Link
                    href="/notifications"
                    className={cn(buttonVariants({ variant: "neutral", size: "icon" }), "relative")}
                    aria-label="Notifications"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-main text-main-foreground text-[10px] font-bold leading-none rounded-full size-4 flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Link>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger
                    className={cn(
                        buttonVariants({ variant: "neutral" }),
                        "h-auto px-2 py-1.5 flex items-center gap-3"
                    )}
                    aria-label="Account menu"
                >
                    {points !== null && (
                        <div className="flex items-center gap-1.5 font-semibold tabular-nums pl-1">
                            <Trophy className="size-4" />
                            <span>{points}</span>
                        </div>
                    )}
                    <Avatar className="size-7">
                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="max-w-[200px] truncate">
                        {user.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                        <UserPen className="size-4" />
                        Edit profile
                    </DropdownMenuItem>
                    {FEATURE_FLAGS.DISCUSS && (
                        <DropdownMenuItem asChild>
                            <Link href="/discuss">
                                <MessagesSquare className="size-4" />
                                Discuss
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="/my-submissions">
                            <FileText className="size-4" />
                            My submissions
                        </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/submissions">
                                    <ShieldCheck className="size-4" />
                                    Admin review
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/reports">
                                    <ShieldCheck className="size-4" />
                                    Reports queue
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <SyncMenuItems />
                    <DropdownMenuItem asChild>
                        <a target="_blank" rel="noopener noreferrer" href="https://x.com/zaCKoZAck0/status/1913558597688009006">
                            <Twitter className="size-4" />
                            Follow on X
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="size-4" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

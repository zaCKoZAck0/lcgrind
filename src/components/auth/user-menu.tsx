"use client";

import { useEffect, useState } from "react";
import {
    LogOut,
    User,
    ScrollText,
    ShieldCheck,
    Zap, Flame,
    Bell,
    LogIn,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "~/lib/utils";
import { isCurrentUserAdmin } from "~/server/actions/admin/whoami";
import { getMyGameStats, creditMyDailyLogin } from "~/server/actions/gamification/actions";
import {
    getMyProfileStatus,
    type ProfileStatus,
} from "~/server/actions/grinds/profile-actions";
import { getUnreadCount } from "~/server/actions/notifications/getNotifications";
import { ProfileDialog } from "./profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Twitter } from "../home/tweet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut, useSession, signIn } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { SyncMenuItems } from "../sync-dropdown";

const CREDIT_KEY = "daily_credited";

export function UserMenu() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [exp, setExp] = useState<number | null>(null);
    const [loginStreak, setLoginStreak] = useState<number>(0);
    const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (session) {
            isCurrentUserAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));

            try { localStorage.removeItem("gs_cache"); } catch { /* ignore */ }

            const today = new Date().toISOString().slice(0, 10);
            let alreadyCredited = false;
            try { alreadyCredited = localStorage.getItem(CREDIT_KEY) === today; } catch { /* ignore */ }

            const statsPromise = alreadyCredited
                ? getMyGameStats().then((stats) => ({ ...stats, didCredit: false }))
                : creditMyDailyLogin().then((credited) => {
                    // Only mark the day credited (and refresh) when the server
                    // actually credited — a no-op call must not poison the flag.
                    if (credited) {
                        try { localStorage.setItem(CREDIT_KEY, today); } catch { /* ignore */ }
                    }
                    return getMyGameStats().then((stats) => ({ ...stats, didCredit: credited }));
                });

            statsPromise
                .then(({ exp, loginStreak, didCredit }) => {
                    setExp(exp);
                    setLoginStreak(loginStreak);
                    if (didCredit) router.refresh();
                })
                .catch(() => { setExp(null); setLoginStreak(0); });
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
            setExp(null);
            setLoginStreak(0);
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
                    <User className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {FEATURE_FLAGS.LOGIN && (
                        <DropdownMenuItem onClick={() => signIn.social({ provider: "google" })}>
                            <LogIn className="size-4" />
                            Sign in
                        </DropdownMenuItem>
                    )}
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
                    {exp !== null && (
                        <div className="flex items-center gap-2 pl-1">
                            <div className="flex items-center gap-1.5 font-semibold tabular-nums">
                                <Zap className="size-4" />
                                <span>{exp}</span>
                            </div>
                            {loginStreak > 0 && (
                                <div className="flex items-center gap-1 font-semibold tabular-nums text-sm text-orange-500">
                                    <Flame className="size-4" />
                                    <span>{loginStreak}</span>
                                </div>
                            )}
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
                    {FEATURE_FLAGS.GRINDS && profileStatus?.handle && (
                        <DropdownMenuItem asChild>
                            <Link href={`/u/${profileStatus.handle}`}>
                                <ScrollText className="size-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                    )}


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
                    <SyncMenuItems />
                    <DropdownMenuSeparator />
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

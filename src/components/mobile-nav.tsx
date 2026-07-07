"use client"

import Link from "next/link"
import {
    Menu,
    ListTodoIcon,
    TargetIcon,
    HashIcon,
    BookMarkedIcon,
    Building2,
    LogIn,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { signIn } from "~/lib/auth-client"
import {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet"
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { Badge } from "~/components/ui/badge";

const BASE_NAV_ITEMS = [
    {
        label: "Problems",
        href: "/all-problems",
        icon: <ListTodoIcon className="size-4" />,
    },
    {
        label: "DSA Sheets",
        href: "/sheets",
        icon: <TargetIcon className="size-4" />,
    },
    {
        label: "Topics",
        href: "/topics",
        icon: <HashIcon className="size-4" />,
    },
    {
        label: "Solvelists",
        href: "/lists",
        icon: <BookMarkedIcon className="size-4" />,
    },
    {
        label: "Companies",
        href: "/companies",
        icon: <Building2 className="size-4" />,
    },
    ...(FEATURE_FLAGS.GRINDS ? [{
        label: "Grinds",
        href: "/grinds",
        icon: null,
    }] : []),
    ...(FEATURE_FLAGS.LOGIN ? [{
        label: "Sign in",
        href: "#",
        icon: <LogIn className="size-4" />,
        onClick: () => signIn.social({ provider: "google" }),
    }] : []),
]

const NAV_ITEMS = BASE_NAV_ITEMS;

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="neutral"
                    size="icon"
                    className="sm:hidden"
                    aria-label="Open navigation menu"
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-2">
                    {NAV_ITEMS.map((item) => (
                        <SheetClose asChild key={item.label}>
                            {"onClick" in item ? (
                                <button
                                    onClick={item.onClick}
                                    className="flex items-center gap-3 px-3 py-2.5 font-base text-sm border-2 border-transparent hover:border-border hover:bg-secondary-background transition-colors"
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 px-3 py-2.5 font-base text-sm border-2 border-transparent hover:border-border hover:bg-secondary-background transition-colors"
                                >
                                    {item.icon}
                                    {item.label}
                                    {item.label === "Grinds" && (
                                        <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4">Beta</Badge>
                                    )}
                                </Link>
                            )}
                        </SheetClose>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    )
}

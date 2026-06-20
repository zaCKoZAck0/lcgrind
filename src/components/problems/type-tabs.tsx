"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { FEATURE_FLAGS } from "~/config/feature-flags";

const TABS = [
    { label: "Coding", href: "/all-problems" },
    ...(FEATURE_FLAGS.SYSTEM_DESIGN ? [{ label: "System Design", href: "/problems/system-design" as const }] : []),
    ...(FEATURE_FLAGS.LLD ? [{ label: "LLD", href: "/problems/lld" as const }] : []),
    ...(FEATURE_FLAGS.OTHERS ? [{ label: "Others", href: "/problems/others" as const }] : []),
];

export function TypeTabs() {
    const pathname = usePathname();

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "px-3 py-1 text-sm font-bold border-2 border-border rounded-base transition-colors",
                            active
                                ? "bg-main text-main-foreground shadow-shadow"
                                : "bg-background text-foreground hover:bg-secondary-background",
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}

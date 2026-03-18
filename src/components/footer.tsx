"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTheme } from "~/hooks/use-theme";
import { getLogoUrl } from "~/utils/logo";
import { LAST_UPDATED } from "~/config/last-updated";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "~/components/ui/tooltip";

function getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

function formatExactDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date
        .toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        .toLowerCase();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year} at ${time}`;
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (diffSecs < 60) return rtf.format(-diffSecs, "second");
    if (diffMins < 60) return rtf.format(-diffMins, "minute");
    if (diffHours < 24) return rtf.format(-diffHours, "hour");
    if (diffDays < 7) return rtf.format(-diffDays, "day");
    if (diffWeeks < 5) return rtf.format(-diffWeeks, "week");
    if (diffMonths < 12) return rtf.format(-diffMonths, "month");
    return rtf.format(-diffYears, "year");
}

export const Footer = () => {
    const theme = useTheme();
    const [relativeTime, setRelativeTime] = useState<string | null>(null);
    const [exactDate, setExactDate] = useState<string | null>(null);

    useEffect(() => {
        const date = new Date(LAST_UPDATED);
        setRelativeTime(getRelativeTime(date));
        setExactDate(formatExactDate(date));
    }, []);

    return (
        <footer className="p-2 bg-background">
            <div className="bg-main shadow-shadow border-2 border-border text-base text-main-foreground">
                <div className="container mx-auto py-12 px-3 sm:px-5 lg:px-7">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-7">
                        <div className="col-span-1 md:col-span-2">
                            <Link href="/" className="mb-2">
                                <Image
                                    src="/images/logo.svg"
                                    alt="LC Grind Logo"
                                    width={100}
                                    height={100}
                                />
                            </Link>
                            <h2 className="text-2xl font-bold text-main-foreground mb-1">
                                LC Grind
                            </h2>
                            <p className="text-main-foreground max-w-md">
                                Focused Interview Preparation.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold tracking-wide uppercase mb-4">Resources</h3>
                            <ul className="space-y-3">
                                <li><Link className="hover:underline hover:underline-offset-2" href="/all-problems">Problems</Link></li>
                                <li><Link className="hover:underline hover:underline-offset-2" href="/companies">Companies</Link></li>
                                <li><Link className="hover:underline hover:underline-offset-2" href="/sheets">DSA Sheets</Link></li>
                                <li><Link className="hover:underline hover:underline-offset-2" href="/topics">Topics</Link></li>
                                <li><Link className="hover:underline hover:underline-offset-2" href="/all-problems?order=all-problems&sort=question-id&companies=Meta&companies=Apple&companies=Amazon&companies=Netflix&companies=Google&companies=Microsoft">MAANG Interview Problems</Link></li>
                            </ul>
                        </div>

                        <div className="flex-shrink-0">
                            <a className="flex items-center gap-1 text-lg border-2 border-border shadow-shadow px-1 rounded-md bg-secondary-background text-foreground" href="https://logo.dev" target="_blank" rel="noopener noreferrer nofollow"><Image src={getLogoUrl("logo.dev", theme)} className="rounded-md" alt="Logo.dev logo" width={30} height={30} /> Logos provided by Logo.dev</a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t-2 border-border">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                            <p>
                                &copy; {new Date().getFullYear()} LC Grind. All rights reserved.
                            </p>
                            {relativeTime && exactDate && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-sm text-muted-foreground cursor-default">
                                            Problems Last Synced: <span className="capitalize">{relativeTime}</span>
                                        </p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{exactDate}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

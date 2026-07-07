"use client";

import { Flame } from "lucide-react";

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type Props = {
    loginStreak: number;
    lastSeenOn: string | null; // YYYY-MM-DD UTC
};

export function StreakCalendar({ loginStreak, lastSeenOn }: Props) {
    // Build the 7-day window ending on lastSeenOn (or today as fallback)
    const anchor = lastSeenOn ? new Date(lastSeenOn + "T12:00:00Z") : new Date();
    const anchorDay = anchor.toISOString().slice(0, 10);

    // activeSet: set of YYYY-MM-DD strings where the user was active
    // Derived from streak: consecutive days [anchorDay - (streak-1), ..., anchorDay]
    const activeSet = new Set<string>();
    if (loginStreak > 0) {
        for (let i = 0; i < loginStreak && i < 7; i++) {
            const d = new Date(anchor);
            d.setUTCDate(d.getUTCDate() - i);
            activeSet.add(d.toISOString().slice(0, 10));
        }
    }

    // 7 days: today (or anchor) going back
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(anchor);
        d.setUTCDate(d.getUTCDate() - (6 - i)); // oldest first
        const iso = d.toISOString().slice(0, 10);
        return {
            iso,
            dayAbbr: DAY_ABBR[d.getUTCDay()],
            date: d.getUTCDate(),
            active: activeSet.has(iso),
            isAnchor: iso === anchorDay,
        };
    });

    return (
        <div className="flex items-end justify-between gap-1 w-full">
            {days.map((day) => (
                <div key={day.iso} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        {day.dayAbbr}
                    </span>
                    {day.active ? (
                        <div className="size-8 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center">
                            <Flame className="size-4 text-orange-500 fill-orange-400" />
                        </div>
                    ) : (
                        <div className="size-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                                {day.date}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

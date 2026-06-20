import Link from "next/link";
import { cn } from "~/lib/utils";

export const BANDS = ["all", "0-2", "2-5", "5-8", "8+"] as const;
export type Band = (typeof BANDS)[number];

export function isBand(value: string | undefined): value is Band {
    return value !== undefined && (BANDS as readonly string[]).includes(value);
}

function label(band: Band): string {
    return band === "all" ? "All levels" : `${band} yrs`;
}

interface BandSelectorProps {
    slug: string;
    active: Band;
    /** Bands that actually have data ("all" is always available). */
    available: string[];
}

export function BandSelector({ slug, active, available }: BandSelectorProps) {
    return (
        <div className="inline-flex h-12 items-center rounded-base border-2 border-border bg-background p-1 gap-1">
            {BANDS.map((band) => {
                const hasData = band === "all" || available.includes(band);
                const isActive = band === active;
                if (!hasData) {
                    return (
                        <span
                            key={band}
                            className="px-2 py-1 text-sm font-heading opacity-40 cursor-not-allowed whitespace-nowrap"
                            title="No reports in this range"
                        >
                            {label(band)}
                        </span>
                    );
                }
                return (
                    <Link
                        key={band}
                        href={band === "all"
                            ? `/companies/${slug}`
                            : `/companies/${slug}?band=${encodeURIComponent(band)}`}
                        className={cn(
                            "px-2 py-1 text-sm font-heading rounded-base border-2 border-transparent whitespace-nowrap transition-all",
                            isActive && "bg-main text-main-foreground border-border",
                        )}
                    >
                        {label(band)}
                    </Link>
                );
            })}
        </div>
    );
}

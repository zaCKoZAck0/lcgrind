import { DollarSign, Star } from "lucide-react";
import { cn } from "~/lib/utils";
import type { TierLevel } from "~/utils/company-tiers";

// Icon-only signals: labels stay qualitative so no count or ratio leaks.
// Tiers are quintiles of the observed data, so the labels speak in
// comparatives, never absolutes. Color is theme foreground throughout —
// the tier is read from the FILLED-icon count, not the hue. Always five slots:
// `tier` rendered solid, the rest dimmed.
const SLOTS = 5;
const PAY_LABELS = [
    "",
    "Among the lowest paying in our data",
    "Below-average pay",
    "Average pay",
    "Above-average pay",
    "Among the highest paying in our data",
] as const;

const DIFFICULTY_LABELS = [
    "",
    "Among the easiest interviews",
    "Easier than most",
    "Average difficulty",
    "Harder than most",
    "Among the hardest interviews",
] as const;

function Marker({
    tier,
    label,
    icon: Icon,
    filled,
    className,
}: {
    tier: TierLevel;
    label: string;
    icon: typeof DollarSign;
    filled?: boolean;
    className?: string;
}) {
    if (tier === 0) return null;
    return (
        <span
            role="img"
            aria-label={label}
            title={label}
            className={cn("flex items-center gap-0.5 text-foreground cursor-help", className)}
        >
            {Array.from({ length: SLOTS }).map((_, i) => {
                const lit = i < tier;
                return (
                    <Icon
                        key={i}
                        aria-hidden
                        className={cn(
                            "size-4 shrink-0",
                            lit ? (filled && "fill-current") : "text-foreground/30",
                        )}
                    />
                );
            })}
        </span>
    );
}

export function PayMarker({ tier, className }: { tier: TierLevel; className?: string }) {
    return (
        <Marker
            tier={tier}
            label={PAY_LABELS[tier]}
            icon={DollarSign}
            className={className}
        />
    );
}

export function DifficultyMarker({ tier, className }: { tier: TierLevel; className?: string }) {
    return (
        <Marker
            tier={tier}
            label={DIFFICULTY_LABELS[tier]}
            icon={Star}
            filled
            className={className}
        />
    );
}

import { CompanyLogo } from "../company-logo";
import { COMPANIES } from "~/config/constants";
import type { TierLevel } from "~/utils/company-tiers";
import { DifficultyMarker, PayMarker } from "./tier-markers";

interface CompanyHeaderProps {
    name: string;
    slug: string;
    payTier?: TierLevel;
    difficultyTier?: TierLevel;
}

export function CompanyHeader({
    name,
    slug,
    payTier = 0,
    difficultyTier = 0,
}: CompanyHeaderProps) {
    const logoDomain = COMPANIES[name.trim()] ?? `${slug}.com`;

    return (
        <div className="p-6 border-2 border-t-0 border-border bg-card flex justify-between items-center">
            <div className="flex gap-6 min-w-[360px]">
                <CompanyLogo
                    domain={logoDomain}
                    alt={`${name} logo`}
                    className="size-14 rounded-base"
                    width={56}
                    height={56}
                    priority
                />
                <div className="flex flex-col justify-center gap-2">
                    <h1 className="font-semibold text-2xl">{name}</h1>
                    {(payTier > 0 || difficultyTier > 0) && (
                        <span className="flex items-center gap-3">
                            <PayMarker tier={payTier} />
                            <DifficultyMarker tier={difficultyTier} />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

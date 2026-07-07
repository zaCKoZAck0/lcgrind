import { CompanyLogo } from "../company-logo";
import { COMPANIES } from "~/config/constants";
import type { TierLevel } from "~/utils/company-tiers";
import { PayMarker } from "./tier-markers";
import { DifficultyBar } from "./difficulty-bar";

interface CompanyHeaderProps {
    name: string;
    slug: string;
    payTier?: TierLevel;
    easyCount?: number;
    mediumCount?: number;
    hardCount?: number;
    headingSuffix?: string;
    headingFull?: string;
}

export function CompanyHeader({
    name,
    slug,
    payTier = 0,
    easyCount = 0,
    mediumCount = 0,
    hardCount = 0,
    headingSuffix = "Interview Questions",
    headingFull,
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
                    <h1 className="font-semibold text-2xl">{headingFull ?? `${name} ${headingSuffix}`}</h1>
                    {payTier > 0 && (
                        <span className="flex items-center gap-3">
                            <PayMarker tier={payTier} />
                        </span>
                    )}
                    <DifficultyBar
                        easyCount={easyCount}
                        mediumCount={mediumCount}
                        hardCount={hardCount}
                    />
                </div>
            </div>
        </div>
    );
}

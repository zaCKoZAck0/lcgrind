"use client";

import {
  COMPANIES,
  MAANG_COMPANIES,
  TOP_PRODUCT_MNCS,
  TOP_PRODUCT_COMPANIES_INDIA,
} from "~/config/constants";
import { getLogoUrl } from "~/utils/logo";
import { useTheme } from "~/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";

interface CompanyAvatarGroupProps {
  companies: string[];
}

const PREFERRED_COMPANIES = new Set([
  ...MAANG_COMPANIES,
  ...TOP_PRODUCT_MNCS,
  ...TOP_PRODUCT_COMPANIES_INDIA,
]);

function sortCompanies(companies: string[]): string[] {
  const preferred = companies.filter((c) => PREFERRED_COMPANIES.has(c));
  const rest = companies.filter((c) => !PREFERRED_COMPANIES.has(c));
  return [...preferred, ...rest];
}

function getCompanyDomain(company: string): string {
  const trimmed = company.trim();
  return (
    (COMPANIES as Record<string, string>)[trimmed] ??
    `${trimmed.toLowerCase().replace(/\s+/g, "")}.com`
  );
}

export function CompanyAvatarGroup({ companies }: CompanyAvatarGroupProps) {
  const theme = useTheme();
  const sorted = sortCompanies(companies);
  const total = sorted.length;
  const maxVisible = 7;
  const visibleCompanies = sorted.slice(0, maxVisible);

  return (
    <div className="mt-3 flex items-center">
      {visibleCompanies.map((company, i) => {
        const domain = getCompanyDomain(company);
        return (
          <Tooltip key={company}>
            <TooltipTrigger asChild>
              <div className={cn("relative", i > 0 && "-ml-1")}>
                <Avatar className="size-9 outline-none ring-2 ring-border shadow bg-secondary-background">
                  <AvatarImage
                    src={getLogoUrl(domain, theme)}
                    alt={company}
                    className="object-contain bg-transparent"
                  />
                  <AvatarFallback className="text-xs">
                    {company.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>{company}</TooltipContent>
          </Tooltip>
        );
      })}

      {/* Responsive overflow indicators */}
      {total > 7 && (
        <OverflowIndicator
          count={total - 7}
          hiddenCompanies={sorted.slice(7)}
        />
      )}
    </div>
  );
}

function OverflowIndicator({
  count,
  hiddenCompanies,
  className,
}: {
  count: number;
  hiddenCompanies: string[];
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "ml-2 text-base font-semibold text-muted-foreground cursor-default",
            className,
          )}
        >
          +{count}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        {hiddenCompanies.join(", ")}
      </TooltipContent>
    </Tooltip>
  );
}

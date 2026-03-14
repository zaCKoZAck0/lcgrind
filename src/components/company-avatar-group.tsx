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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
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

function getVisibilityClass(index: number): string {
  if (index < 5) return "";
  if (index < 10) return "hidden md:flex";
  if (index < 15) return "hidden lg:flex";
  if (index < 20) return "hidden xl:flex";
  return "hidden";
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
  const maxVisible = 20;
  const visibleCompanies = sorted.slice(0, maxVisible);

  return (
    <div className="mt-3 flex items-center">
      {visibleCompanies.map((company, i) => {
        const domain = getCompanyDomain(company);
        return (
          <Tooltip key={company}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative",
                  i > 0 && "-ml-2",
                  getVisibilityClass(i),
                )}
              >
                <Avatar className="size-9 ring-2 ring-background outline-none bg-background">
                  <AvatarImage
                    src={getLogoUrl(domain, theme)}
                    alt={company}
                    className="p-1"
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
      {total > 5 && (
        <OverflowIndicator
          count={total - 5}
          hiddenCompanies={sorted.slice(5)}
          className="md:hidden"
        />
      )}
      {total > 10 && (
        <OverflowIndicator
          count={total - 10}
          hiddenCompanies={sorted.slice(10)}
          className="hidden md:inline lg:hidden"
        />
      )}
      {total > 15 && (
        <OverflowIndicator
          count={total - 15}
          hiddenCompanies={sorted.slice(15)}
          className="hidden lg:inline xl:hidden"
        />
      )}
      {total > 20 && (
        <OverflowIndicator
          count={total - 20}
          hiddenCompanies={sorted.slice(20)}
          className="hidden xl:inline"
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
            "ml-1.5 text-sm font-bold text-muted-foreground cursor-default",
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

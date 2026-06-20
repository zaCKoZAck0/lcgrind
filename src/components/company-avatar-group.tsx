"use client";

import {
  COMPANIES,
  MAANG_COMPANIES,
  TOP_PRODUCT_MNCS,
  TOP_PRODUCT_COMPANIES_INDIA,
} from "~/config/constants";
import { getLogoUrl } from "~/utils/logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "~/lib/utils";

type CompanyItem = { slug: string; name: string };

interface CompanyAvatarGroupProps {
  // Legacy string[] (sheet names, non-clickable) or {slug,name}[] (interview0
  // chips, clickable when onCompanyClick is set).
  companies: (string | CompanyItem)[];
  onCompanyClick?: (slug: string, name: string) => void;
  maxVisible?: number;
}

const PREFERRED_COMPANIES = new Set([
  ...MAANG_COMPANIES,
  ...TOP_PRODUCT_MNCS,
  ...TOP_PRODUCT_COMPANIES_INDIA,
]);

function normalize(c: string | CompanyItem): CompanyItem {
  return typeof c === "string" ? { slug: "", name: c } : c;
}

function sortCompanies(companies: CompanyItem[]): CompanyItem[] {
  const preferred = companies.filter((c) => PREFERRED_COMPANIES.has(c.name));
  const rest = companies.filter((c) => !PREFERRED_COMPANIES.has(c.name));
  return [...preferred, ...rest];
}

function getCompanyDomain(company: string): string {
  const trimmed = company.trim();
  return (
    (COMPANIES as Record<string, string>)[trimmed] ??
    `${trimmed.toLowerCase().replace(/\s+/g, "")}.com`
  );
}

export function CompanyAvatarGroup({
  companies,
  onCompanyClick,
  maxVisible = 7,
}: CompanyAvatarGroupProps) {
  const items = companies.map(normalize);
  // {slug,name} objects arrive pre-ordered by ask_count DESC from SQL — preserve
  // that. Legacy string[] sheet names get the preferred-first sort.
  const isStructured = companies.length > 0 && typeof companies[0] !== 'string';
  const ordered = isStructured ? items : sortCompanies(items);
  const total = ordered.length;
  const visibleCompanies = ordered.slice(0, maxVisible);
  const clickable = Boolean(onCompanyClick);

  return (
    <div className="mt-3 flex items-center">
      {visibleCompanies.map((company, i) => {
        const domain = getCompanyDomain(company.name);
        const avatar = (
          <Avatar className="size-9 outline-none ring-2 ring-border shadow bg-secondary-background">
            <AvatarImage
              src={getLogoUrl(domain, "light")}
              alt={company.name}
              className="object-contain bg-transparent"
            />
            <AvatarFallback className="text-xs">
              {company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
        return (
          <Tooltip key={company.slug || company.name}>
            <TooltipTrigger asChild>
              {clickable ? (
                <button
                  type="button"
                  aria-label={`Filter by ${company.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompanyClick?.(company.slug, company.name);
                  }}
                  className={cn(
                    "relative cursor-pointer transition-transform hover:-translate-y-0.5 focus:outline-none",
                    i > 0 && "-ml-1",
                  )}
                >
                  {avatar}
                </button>
              ) : (
                <div className={cn("relative", i > 0 && "-ml-1")}>{avatar}</div>
              )}
            </TooltipTrigger>
            <TooltipContent>{company.name}</TooltipContent>
          </Tooltip>
        );
      })}

      {/* Responsive overflow indicators */}
      {total > maxVisible && (
        <OverflowIndicator
          count={total - maxVisible}
          hiddenCompanies={ordered.slice(maxVisible).map((c) => c.name)}
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

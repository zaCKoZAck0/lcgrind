"use client";

import Image from "next/image";
import { getLogoUrl } from "~/utils/logo";

interface CompanyLogoProps {
  domain: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function CompanyLogo({ domain, alt, className, width = 32, height = 32, priority = false }: CompanyLogoProps) {
  return (
    <Image
      src={getLogoUrl(domain, "light")}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  );
}

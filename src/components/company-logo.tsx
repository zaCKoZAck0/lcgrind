"use client";

import Image from "next/image";
import { useTheme } from "~/hooks/use-theme";
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
  const theme = useTheme();
  
  return (
    <Image
      src={getLogoUrl(domain, theme)}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  );
}

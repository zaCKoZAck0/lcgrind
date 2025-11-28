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
}

export function CompanyLogo({ domain, alt, className, width = 32, height = 32 }: CompanyLogoProps) {
  const theme = useTheme();
  
  return (
    <Image
      src={getLogoUrl(domain, theme)}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

"use client";

import Image from "next/image";
import { useTheme } from "~/hooks/use-theme";
import { addThemeToLogoUrl } from "~/utils/logo";

interface SheetOwnerLogoProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function SheetOwnerLogo({ src, alt, className, width = 100, height = 100 }: SheetOwnerLogoProps) {
  const theme = useTheme();
  
  return (
    <Image
      src={addThemeToLogoUrl(src, theme)}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

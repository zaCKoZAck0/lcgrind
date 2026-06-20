"use client";

import Image from "next/image";
import { addThemeToLogoUrl } from "~/utils/logo";

interface SheetOwnerLogoProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function SheetOwnerLogo({ src, alt, className, width = 100, height = 100 }: SheetOwnerLogoProps) {
  return (
    <Image
      src={addThemeToLogoUrl(src, "light")}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}

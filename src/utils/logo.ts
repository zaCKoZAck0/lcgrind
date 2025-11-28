import { LOGO_DEV_TOKEN } from "~/config/constants";

/**
 * Generates a logo URL from logo.dev with theme and format parameters.
 * @param domain - The domain for the logo (e.g., "google.com")
 * @param theme - The theme to use ("light" or "dark")
 *                - "dark": Use when displaying logos on dark backgrounds. Inverts light-colored logos.
 *                - "light": Use when displaying logos on light backgrounds. Inverts dark-colored logos.
 * @returns The full logo URL with token, theme, and format parameters
 */
export function getLogoUrl(domain: string, theme: "light" | "dark"): string {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&format=png&theme=${theme}`;
}

/**
 * Adds theme parameter to a logo.dev URL if it's a logo.dev URL.
 * For non-logo.dev URLs, returns the original URL unchanged.
 * @param url - The original logo URL
 * @param theme - The theme to use ("light" or "dark")
 * @returns The URL with theme parameter if it's a logo.dev URL, otherwise the original URL
 */
export function addThemeToLogoUrl(url: string, theme: "light" | "dark"): string {
  if (url.includes("img.logo.dev")) {
    const separator = url.includes("?") ? "&" : "?";
    const params: string[] = [];
    
    // Only add format if not already present
    if (!url.includes("format=")) {
      params.push("format=png");
    }
    
    // Only add theme if not already present
    if (!url.includes("theme=")) {
      params.push(`theme=${theme}`);
    }
    
    return params.length > 0 ? `${url}${separator}${params.join("&")}` : url;
  }
  return url;
}

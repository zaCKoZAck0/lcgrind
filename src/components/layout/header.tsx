"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="w-full max-w-full flex h-14 items-center px-4 md:px-6">
        <div className="font-semibold text-xl">LC Grind</div>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}





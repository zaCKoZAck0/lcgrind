"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Toggle } from "~/components/ui/toggle"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check initial theme on mount
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    
    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <Toggle 
      pressed={isDarkMode}
      onPressedChange={toggleTheme}
      aria-label="Toggle theme"
      variant="outline"
      size="sm"
      className="text-foreground"
    >
      {isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Toggle>
  )
}

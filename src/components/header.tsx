import Link from "next/link"
import { ThemeToggle } from "~/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background">
      <div className="w-full flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="font-heading text-lg font-bold text-foreground">
          LC Grind
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}



"use client";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import Link from "next/link"
import { HashIcon, ListTodoIcon, TargetIcon } from "lucide-react";
import { cn } from "~/lib/utils";


export function NavLinks() {
    return <div className="hidden sm:flex text-base">
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-base">Practice</NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[200px]">
                        <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "items-center gap-2 text-base")}>
                            <Link href="/all-problems">
                                <ListTodoIcon className="size-5" /> Problems
                            </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "items-center gap-2 text-base")}>
                            <Link href="/sheets">
                                <TargetIcon className="size-5" /> DSA Sheets
                            </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "items-center gap-2 text-base")}>
                            <Link href="/topics">
                                <HashIcon className="size-5" /> Topics
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "text-base")}>
                        <Link href="/companies">
                            Companies
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
}
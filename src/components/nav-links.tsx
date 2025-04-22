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
import { ListTodoIcon, TargetIcon } from "lucide-react";
import { cn } from "~/lib/utils";


export function NavLinks() {
    return <div className="hidden sm:flex text-base">
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-base">Practice</NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[200px]">
                        <Link href="/all-problems" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "items-center gap-2 text-base")}>
                                <ListTodoIcon className="size-5" /> Problems
                            </NavigationMenuLink>
                        </Link>
                        <Link href="/sheets" legacyBehavior passHref>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "items-center gap-2 text-base")}>
                                <TargetIcon className="size-5" /> DSA Sheets
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/companies" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-base")}>
                            Companies
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    </div>
}
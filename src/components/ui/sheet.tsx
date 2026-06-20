"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import * as React from "react"
import { cn } from "~/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

function SheetOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className,
            )}
            {...props}
        />
    )
}

function SheetContent({
    className,
    children,
    side = "left",
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    side?: "left" | "right"
}) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Content
                className={cn(
                    "fixed z-50 flex flex-col gap-4 bg-background border-2 border-border shadow-shadow p-6",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out duration-200",
                    "inset-y-0 w-72 max-w-full",
                    side === "left"
                        ? "left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
                        : "right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                    className,
                )}
                {...props}
            >
                <DialogPrimitive.Close className="absolute right-4 top-4 opacity-100 ring-offset-white focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:pointer-events-none">
                    <X className="size-5" />
                    <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
                {children}
            </DialogPrimitive.Content>
        </SheetPortal>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col gap-1.5", className)}
            {...props}
        />
    )
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn("text-lg font-heading", className)}
            {...props}
        />
    )
}

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
}

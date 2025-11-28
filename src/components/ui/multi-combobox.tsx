"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { ScrollArea } from "./scroll-area"

interface MultiSelectContextValue {
    value: string[]
    onValueChange: (value: string[]) => void
    disabled?: boolean
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    registerOption: (value: string, label: string) => void
    getOptionLabel: (value: string) => string
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | undefined>(undefined)

function useMultiSelect() {
    const context = React.useContext(MultiSelectContext)
    if (!context) {
        throw new Error("useMultiSelect must be used within a MultiSelect")
    }
    return context
}

interface MultiSelectProps {
    value: string[]
    onValueChange: (value: string[]) => void
    disabled?: boolean
    children: React.ReactNode
    className?: string
}

export function MultiSelect({
    value,
    onValueChange,
    disabled = false,
    children,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const optionLabelsRef = React.useRef(new Map<string, string>())

    const registerOption = React.useCallback((value: string, label: string) => {
        optionLabelsRef.current.set(value, label)
    }, [])

    const getOptionLabel = React.useCallback((value: string) => {
        return optionLabelsRef.current.get(value) || value
    }, [])

    return (
        <MultiSelectContext.Provider
            value={{
                value,
                onValueChange,
                disabled,
                open,
                setOpen,
                registerOption,
                getOptionLabel
            }}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <div className={cn("relative", className)}>{children}</div>
            </Popover>
        </MultiSelectContext.Provider>
    )
}

interface MultiSelectTriggerProps {
    className?: string
    children: React.ReactNode
}

export function MultiSelectTrigger({ className, children }: MultiSelectTriggerProps) {
    const { disabled } = useMultiSelect()

    return (
        <PopoverTrigger
            asChild
            disabled={disabled}
        >
            <div // Changed from button to div
                role="button"
                tabIndex={0}
                className={cn(
                    "flex h-fit w-full items-center justify-between rounded-base border-2 border-border bg-main gap-2 px-3 py-2 text-sm font-base text-main-foreground ring-offset-white placeholder:text-foreground/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-hidden focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                )}
            >
                {children}
            </div>
        </PopoverTrigger>
    )
}


interface MultiSelectValueProps {
    placeholder?: string
    className?: string
}

export function MultiSelectValue({ placeholder = "Select items...", className }: MultiSelectValueProps) {
    const { value, getOptionLabel } = useMultiSelect()

    return (
        <div className={cn("flex flex-1 flex-shrink-0 flex-wrap gap-1 w-fit", className)}>
            {value.length > 0 ? (
                value.map((item) => (
                    <MultiSelectBadge key={item} value={item}>
                        {getOptionLabel(item)}
                    </MultiSelectBadge>
                ))
            ) : (
                <span className="text-muted-foreground flex-shrink-0">{placeholder}</span>
            )}
        </div>
    )
}

interface MultiSelectBadgeProps {
    value: string
    children: React.ReactNode
}

function MultiSelectBadge({ value, children }: MultiSelectBadgeProps) {
    const { value: selectedValues, onValueChange } = useMultiSelect()

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onValueChange(selectedValues.filter((v) => v !== value))
    }

    return (
        <Badge variant="neutral" className="flex items-center gap-1 px-2 py-0.5">
            {children}
            <span
                role="button"
                tabIndex={0}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                }}
                onClick={handleRemove}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleRemove(e as unknown as React.MouseEvent<HTMLSpanElement>)
                    }
                }}
            >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Remove {children}</span>
            </span>
        </Badge>
    )
}


interface MultiSelectContentProps {
    className?: string
    children: React.ReactNode
}

export function MultiSelectContent({ className, children }: MultiSelectContentProps) {
    return (
        <PopoverContent className={cn("p-0", className)} align="start">
            <Command>
                {children}
            </Command>
        </PopoverContent>
    )
}

export function MultiSelectInput({ placeholder = "Search..." }: { placeholder?: string }) {
    return <CommandInput placeholder={placeholder} />
}

export function MultiSelectList({ className, children, autoHeight = false }: { className?: string, children: React.ReactNode, autoHeight?: boolean }) {
    return <CommandList className={className}><ScrollArea className={autoHeight ? "max-h-[300px]" : "h-[300px]"}>{children}</ScrollArea></CommandList>
}

export function MultiSelectEmpty({ children = "No results found." }: { children?: React.ReactNode }) {
    return <CommandEmpty>{children}</CommandEmpty>
}

export function MultiSelectGroup({ className, children }: { className?: string, children: React.ReactNode }) {
    return <CommandGroup className={className}>{children}</CommandGroup>
}

export function MultiSelectLabel({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
}

interface MultiSelectItemProps {
    value: string
    className?: string
    disabled?: boolean
    children: React.ReactNode
}

export function MultiSelectItem({ value, className, disabled, children }: MultiSelectItemProps) {
    const { value: selectedValues, onValueChange, registerOption } = useMultiSelect()
    const isSelected = selectedValues.includes(value)

    // Register this option's label with the context when component mounts
    React.useEffect(() => {
        const label = children?.toString() || value
        registerOption(value, label)
    }, [value, children, registerOption])

    const handleSelect = () => {
        if (disabled) return

        if (isSelected) {
            onValueChange(selectedValues.filter((v) => v !== value))
        } else {
            onValueChange([...selectedValues, value])
        }
    }

    return (
        <CommandItem
            value={value}
            disabled={disabled}
            onSelect={handleSelect}
            className={cn(
                "flex items-center gap-2",
                isSelected && "bg-accent",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            <div
                className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                )}
            >
                <Check className="h-3 w-3" />
            </div>
            <span>{children}</span>
        </CommandItem>
    )
}

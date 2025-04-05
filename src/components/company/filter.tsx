"use client";
import { ArrowUpDownIcon, ClockIcon } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"

export const Filters = ({ filters }: { filters: { sorting: string; order: string } }) => {
    const [sort, setSort] = useState(filters.sorting);
    const [order, setOrder] = useState(filters.order);
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathName = usePathname();

    useEffect(() => {
        const params = new URLSearchParams(currentSearchParams.toString());

        params.set('order', order);
        params.set('sort', sort);

        const newQueryString = params.toString();
        const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ''}`;

        router.replace(targetPath);

    }, [sort, order, currentSearchParams])

    return <div className="w-full bg-card flex items-center justify-between p-3 px-6 border border-muted-foreground/50">
        <div className="flex gap-3 items-center">
            <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="min-w-[120px] w-fit">
                    <ClockIcon />
                    <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">30 Days</SelectItem>
                    <SelectItem value="three-months">3 Months</SelectItem>
                    <SelectItem value="six-months">6 Months</SelectItem>
                    <SelectItem value="yearly">More that 6 Months</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="min-w-[120px] w-fit">
                    <ArrowUpDownIcon />
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="frequency">Frequency</SelectItem>
                    <SelectItem value="difficulty">Difficulty</SelectItem>
                    {/* <SelectItem value="question-id">Question ID</SelectItem> */}
                </SelectContent>
            </Select>
        </div>
    </div>
}
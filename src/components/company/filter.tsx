"use client";
import { ArrowUpDownIcon, BriefcaseBusinessIcon, ClockIcon, HashIcon, RotateCcwIcon } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { MultiSelect, MultiSelectTrigger, MultiSelectValue, MultiSelectContent, MultiSelectInput, MultiSelectList, MultiSelectGroup, MultiSelectLabel, MultiSelectItem } from "../ui/multi-combobox";
import { ALGORITHMS, COMPANIES, DATA_STRUCTURES, MAANG_COMPANIES } from "~/config/constants";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

export const Filters = ({ filters, isProblemFilter = false, companies, tags }: { filters: { sorting: string; order: string }, isProblemFilter?: boolean, companies?: string[], tags?: string[] }) => {
    const [sort, setSort] = useState(filters.sorting);
    const [order, setOrder] = useState(filters.order);
    const [c, setC] = useState<string[]>(companies ?? []);
    const [t, setT] = useState<string[]>(tags ?? []);
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathName = usePathname();

    function reset() {
        setSort(isProblemFilter ? 'question-id' : 'frequency');
        setOrder('all');
        setC([]);
        setT([]);
    }

    useEffect(() => {
        const params = new URLSearchParams(currentSearchParams.toString());

        params.set('order', order);
        params.set('sort', sort);
        params.delete('companies');
        params.delete('tags');
        c.forEach(company => params.append('companies', company));
        t.forEach(tag => params.append('tags', tag));

        const newQueryString = params.toString();
        const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ''}`;

        router.replace(targetPath);

    }, [sort, order, t, c, currentSearchParams])

    return <div
        className="w-full bg-card flex flex-col items-center justify-between gap-3 p-3 border border-muted-foreground/50">
        <div className="flex gap-3 flex-col md:flex-row md:items-center w-full">
            <Select value={order} onValueChange={setOrder}>
                <SelectTrigger className="min-w-[120px] w-fit">
                    <ClockIcon />
                    <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Asked in last</SelectLabel>
                        <SelectItem value="monthly">30 Days</SelectItem>
                        <SelectItem value="three-months">3 Months</SelectItem>
                        <SelectItem value="six-months">6 Months</SelectItem>
                        <SelectItem value="yearly">More that 6 Months</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectGroup>
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
                    <SelectItem value="acceptance">Acceptance</SelectItem>
                    <SelectItem value="question-id">Question ID</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={reset}><RotateCcwIcon /> Reset</Button>
        </div>
        <div className="flex gap-3 flex-col md:flex-row md:items-center w-full">
            <MultiSelect
                value={t}
                onValueChange={setT}
            >
                <MultiSelectTrigger className="max-w-[300px]">
                    <HashIcon size={16} className="mr-1" />
                    <MultiSelectValue placeholder="Problem Tags" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectInput placeholder="Search..." />
                    <MultiSelectList>
                        <MultiSelectGroup>
                            <MultiSelectLabel>Algorithms</MultiSelectLabel>
                            {
                                ALGORITHMS.map(tag => (
                                    <MultiSelectItem key={tag} value={tag}>
                                        {tag}
                                    </MultiSelectItem>
                                ))
                            }
                        </MultiSelectGroup>
                        <MultiSelectGroup>
                            <MultiSelectLabel>Data Structures</MultiSelectLabel>
                            {
                                DATA_STRUCTURES.map(tag => (
                                    <MultiSelectItem key={tag} value={tag}>
                                        {tag}
                                    </MultiSelectItem>
                                ))
                            }
                        </MultiSelectGroup>
                    </MultiSelectList>
                </MultiSelectContent>
            </MultiSelect>
            {
                isProblemFilter && <>
                    <MultiSelect
                        value={c}
                        onValueChange={setC}
                    >
                        <MultiSelectTrigger className="max-w-[300px]">
                            <BriefcaseBusinessIcon size={16} className="mr-1" />
                            <MultiSelectValue placeholder="Companies" />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                            <MultiSelectInput placeholder="Search..." />
                            <MultiSelectList>
                                <MultiSelectGroup>
                                    <MultiSelectLabel>MAANG</MultiSelectLabel>
                                    {
                                        MAANG_COMPANIES.map(tag => (
                                            <MultiSelectItem key={tag} value={tag}>
                                                {tag}
                                            </MultiSelectItem>
                                        ))
                                    }
                                </MultiSelectGroup>
                                <MultiSelectGroup>
                                    <MultiSelectLabel>All Companies</MultiSelectLabel>
                                    {
                                        COMPANIES.map(tag => (
                                            <MultiSelectItem key={tag} value={tag}>
                                                {tag}
                                            </MultiSelectItem>
                                        ))
                                    }
                                </MultiSelectGroup>
                            </MultiSelectList>
                        </MultiSelectContent>
                    </MultiSelect>
                    <div className="flex items-center gap-2">
                        <Checkbox checked={c === MAANG_COMPANIES} onCheckedChange={(checked) => {
                            if (checked) {
                                setC(MAANG_COMPANIES);
                            } else {
                                setC([]);
                            }
                        }} />
                        <p>MAANG</p>
                    </div>
                </>
            }
        </div>
    </div>
}
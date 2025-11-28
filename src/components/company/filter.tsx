"use client";
import { ArrowUpDownIcon, BriefcaseBusinessIcon, ClockIcon, HashIcon, RotateCcwIcon, SignalIcon } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
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
import { ALGORITHMS, COMPANIES, DATA_STRUCTURES, DIFFICULTIES, MAANG_COMPANIES } from "~/config/constants";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { onClickAdUrl } from "~/lib/utils";
import { RandomProblemPicker } from "../random-problem-picker";

export const Filters = ({ filters, isProblemFilter = false, companies, tags, difficulties }: { filters: { sorting: string; order: string, search?: string }, isProblemFilter?: boolean, companies?: string[], tags?: string[], difficulties?: string[] }) => {
    const [sort, setSort] = useState(filters.sorting);
    const [order, setOrder] = useState(filters.order);
    const [c, setC] = useState<string[]>(companies ?? []);
    const [t, setT] = useState<string[]>(tags ?? []);
    const [d, setD] = useState<string[]>(difficulties ?? []);
    const [problemQuery, setProblemQuery] = useState<string>((filters.search && filters.search.trim()) ?? '');
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathName = usePathname();

    function reset() {
        setSort(isProblemFilter ? 'question-id' : 'frequency');
        setOrder(isProblemFilter ? 'all-problems' : 'all');
        setProblemQuery('');
        setC([]);
        setT([]);
        setD([]);
    }

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setProblemQuery(event.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(currentSearchParams.toString());

            if (problemQuery && problemQuery.trim() !== '') {
                params.set('search', problemQuery.trim());
                params.set('page', '1');
            } else {
                params.delete('search');
            }

            const newQueryString = params.toString();
            const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ''}`;

            router.replace(targetPath);

        }, 300);

        return () => clearTimeout(timeoutId);

    }, [problemQuery, currentSearchParams]);

    useEffect(() => {
        const params = new URLSearchParams(currentSearchParams.toString());

        params.set('order', order);
        params.set('sort', sort);
        params.delete('companies');
        params.delete('tags');
        params.delete('difficulties');
        c.forEach(company => params.append('companies', company));
        t.forEach(tag => params.append('tags', tag));
        d.forEach(difficulty => params.append('difficulties', difficulty));

        const newQueryString = params.toString();
        const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ''}`;

        router.replace(targetPath);

    }, [sort, order, t, c, d, currentSearchParams])

    return <div
        className="w-full bg-card flex flex-col md:flex-row border-2 border-border relative">
        <div className="flex gap-3 flex-col py-6 px-3 md:border-r-2 border-b-2 md:border-b-0 border-border">
            <div className='flex gap-3'>
                <Select value={order} onValueChange={setOrder}>
                    <SelectTrigger className="min-w-[120px] w-fit">
                        <ClockIcon />
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all-problems">All Problems</SelectItem>
                        </SelectGroup>
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
            </div>
            <Input placeholder="Search Problem.." value={problemQuery} onChange={handleSearchInputChange} />
        </div>
        <div className="flex flex-col-reverse md:flex-row py-6 px-3 flex-1 gap-3 flex-shrink-0">
            {
                isProblemFilter && <div className="flex flex-col gap-3 md:max-w-[70%]">
                    <MultiSelect
                        value={c}
                        onValueChange={setC}
                    >
                        <MultiSelectTrigger className="flex-shrink-0">
                            <BriefcaseBusinessIcon size={16} />
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
                                        Object.keys(COMPANIES).map(tag => (
                                            <MultiSelectItem key={tag} value={tag}>
                                                {tag}
                                            </MultiSelectItem>
                                        ))
                                    }
                                </MultiSelectGroup>
                            </MultiSelectList>
                        </MultiSelectContent>
                    </MultiSelect>
                    <div onClick={onClickAdUrl} className="flex items-center gap-3 px-1">
                        <Checkbox id="MAANG" checked={c === MAANG_COMPANIES} onCheckedChange={(checked) => {
                            if (checked) {
                                setC(MAANG_COMPANIES);
                            } else {
                                setC([]);
                            }
                        }} />
                        <Label htmlFor="MAANG">MAANG</Label>
                    </div>
                </div>
            }
            <MultiSelect
                value={t}
                onValueChange={setT}
            >
                <MultiSelectTrigger className="flex-shrink-0">
                    <HashIcon size={16} />
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
            <MultiSelect
                value={d}
                onValueChange={setD}
            >
                <MultiSelectTrigger className="flex-shrink-0">
                    <SignalIcon size={16} />
                    <MultiSelectValue placeholder="Difficulty" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectList autoHeight>
                        <MultiSelectGroup>
                            {
                                DIFFICULTIES.map(difficulty => (
                                    <MultiSelectItem key={difficulty} value={difficulty}>
                                        {difficulty}
                                    </MultiSelectItem>
                                ))
                            }
                        </MultiSelectGroup>
                    </MultiSelectList>
                </MultiSelectContent>
            </MultiSelect>
        </div>
        <div className="absolute top-0 right-3 -translate-y-1/2 flex gap-2">
            <RandomProblemPicker
                order={order}
                search={problemQuery}
                tags={t.length > 0 ? t : null}
                companies={c.length > 0 ? c : null}
                difficulties={d.length > 0 ? d : null}
            />
            <Button className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit" variant="noShadow" size='sm' onClick={reset}><RotateCcwIcon /> Reset</Button>
        </div>


    </div>
}
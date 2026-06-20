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
import type { FilterCompany } from "~/server/actions/companies/getFilterCompanies";

import { RandomProblemPicker } from "../random-problem-picker";

export type FilterValues = {
    order: string;
    sort: string;
    search: string;
    companies: string[];
    tags: string[];
    difficulties: string[];
};

export const Filters = ({ filters, isProblemFilter = false, companies, companyOptions, tags, difficulties, slug, topicSlug, defaultSort, controlled }: { filters: { sorting: string; order: string, search?: string }, isProblemFilter?: boolean, companies?: string[], companyOptions?: FilterCompany[], tags?: string[], difficulties?: string[], slug?: string, topicSlug?: string, defaultSort?: string, controlled?: { onChange: (values: FilterValues) => void; hideRandomPicker?: boolean } }) => {
    const [sort, setSort] = useState(filters.sorting);
    const [order, setOrder] = useState(filters.order);
    const [c, setC] = useState<string[]>(companies ?? []);
    const [t, setT] = useState<string[]>(tags ?? []);
    const [d, setD] = useState<string[]>(difficulties ?? []);
    const [problemQuery, setProblemQuery] = useState<string>((filters.search && filters.search.trim()) ?? '');
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathName = usePathname();

    // Slug-based company options (interview0-backed) when provided; the MAANG
    // quick-toggle then operates on the matching slugs.
    const useSlugCompanies = Boolean(companyOptions);
    const maangSelection = useSlugCompanies
        ? (companyOptions ?? []).filter((o) => MAANG_COMPANIES.includes(o.name)).map((o) => o.slug)
        : MAANG_COMPANIES;
    const maangChecked = maangSelection.length > 0
        && c.length === maangSelection.length
        && maangSelection.every((s) => c.includes(s));

    // Keep internal company state in sync with the URL-driven `companies` prop so
    // a chip click on a row (which appends to the URL) isn't clobbered by the
    // param-writing effect below. Keyed on the joined string to avoid loops.
    const companiesKey = (companies ?? []).join(',');
    useEffect(() => {
        if (controlled) return;
        setC(companies ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companiesKey]);

    function reset() {
        setSort(defaultSort ?? (isProblemFilter ? 'question-id' : 'frequency'));
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
        if (controlled) {
            const timeoutId = setTimeout(() => {
                controlled.onChange({ order, sort, search: problemQuery, companies: c, tags: t, difficulties: d });
            }, 300);
            return () => clearTimeout(timeoutId);
        }

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

    }, [problemQuery, currentSearchParams, controlled, order, sort, c, t, d]);

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
        className="w-full bg-card flex flex-col md:flex-row border-2 border-border rounded-base relative shadow-shadow">
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
                        {isProblemFilter && <SelectItem value="recency">Recently Asked</SelectItem>}
                        <SelectItem value="difficulty">Difficulty</SelectItem>
                        <SelectItem value="acceptance">Acceptance</SelectItem>
                        <SelectItem value="question-id">Question ID</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <label htmlFor="problem-search" className="sr-only">Search problem</label>
            <Input id="problem-search" placeholder="Search Problem.." value={problemQuery} onChange={handleSearchInputChange} />
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
                                {useSlugCompanies ? (
                                    <MultiSelectGroup>
                                        <MultiSelectLabel>Companies</MultiSelectLabel>
                                        {
                                            (companyOptions ?? []).map(co => (
                                                <MultiSelectItem key={co.slug} value={co.slug}>
                                                    {co.name}
                                                </MultiSelectItem>
                                            ))
                                        }
                                    </MultiSelectGroup>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </MultiSelectList>
                        </MultiSelectContent>
                    </MultiSelect>
                    <div className="flex items-center gap-3 px-1">
                        <Checkbox id="MAANG" checked={maangChecked} onCheckedChange={(checked) => {
                            setC(checked ? maangSelection : []);
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
        <div className={controlled ? "absolute top-0 right-12 -translate-y-1/2 flex gap-2" : "absolute top-0 right-3 -translate-y-1/2 flex gap-2"}>
            {!controlled?.hideRandomPicker && (
                <RandomProblemPicker
                    order={order}
                    search={problemQuery}
                    tags={t.length > 0 ? t : null}
                    companies={c.length > 0 ? c : null}
                    difficulties={d.length > 0 ? d : null}
                    slug={slug}
                    topicSlug={topicSlug}
                />
            )}
            <Button className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit" variant="noShadow" size='sm' onClick={reset}><RotateCcwIcon /> Reset</Button>
        </div>


    </div>
}
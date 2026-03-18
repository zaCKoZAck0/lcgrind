"use client";

import { ArrowUpDownIcon, RotateCcwIcon, SignalIcon } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectContent,
    MultiSelectList,
    MultiSelectGroup,
    MultiSelectItem,
} from "~/components/ui/multi-combobox";
import { DIFFICULTIES } from "~/config/constants";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function TopicFilters({
    filters,
    difficulties,
}: {
    filters: { sorting: string; search?: string };
    difficulties?: string[] | null;
}) {
    const [sort, setSort] = useState(filters.sorting);
    const [d, setD] = useState<string[]>(difficulties ?? []);
    const [problemQuery, setProblemQuery] = useState<string>(
        (filters.search && filters.search.trim()) ?? "",
    );
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathName = usePathname();

    function reset() {
        setSort("question-id");
        setProblemQuery("");
        setD([]);
    }

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setProblemQuery(event.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(currentSearchParams.toString());

            if (problemQuery && problemQuery.trim() !== "") {
                params.set("search", problemQuery.trim());
                params.set("page", "1");
            } else {
                params.delete("search");
            }

            const newQueryString = params.toString();
            const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ""}`;

            router.replace(targetPath);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [problemQuery, currentSearchParams, pathName, router]);

    useEffect(() => {
        const params = new URLSearchParams(currentSearchParams.toString());

        params.set("sort", sort);
        params.delete("difficulties");
        d.forEach((difficulty) => params.append("difficulties", difficulty));

        const newQueryString = params.toString();
        const targetPath = `${pathName}${newQueryString ? `?${newQueryString}` : ""}`;

        router.replace(targetPath);
    }, [sort, d, currentSearchParams, pathName, router]);

    return (
        <div className="w-full bg-card flex flex-col md:flex-row border-2 border-border relative">
            <div className="flex gap-3 flex-col py-6 px-3 md:border-r-2 border-b-2 md:border-b-0 border-border">
                <div className="flex gap-3">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="min-w-[120px] w-fit">
                            <ArrowUpDownIcon />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="question-id">Question ID</SelectItem>
                            <SelectItem value="difficulty">Difficulty</SelectItem>
                            <SelectItem value="acceptance">Acceptance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <label htmlFor="topic-problem-search" className="sr-only">
                    Search problem
                </label>
                <Input
                    id="topic-problem-search"
                    placeholder="Search Problem.."
                    value={problemQuery}
                    onChange={handleSearchInputChange}
                />
            </div>
            <div className="flex flex-col-reverse md:flex-row py-6 px-3 flex-1 gap-3 flex-shrink-0">
                <MultiSelect value={d} onValueChange={setD}>
                    <MultiSelectTrigger className="flex-shrink-0">
                        <SignalIcon size={16} />
                        <MultiSelectValue placeholder="Difficulty" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                        <MultiSelectList autoHeight>
                            <MultiSelectGroup>
                                {DIFFICULTIES.map((difficulty) => (
                                    <MultiSelectItem
                                        key={difficulty}
                                        value={difficulty}
                                    >
                                        {difficulty}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelectGroup>
                        </MultiSelectList>
                    </MultiSelectContent>
                </MultiSelect>
            </div>
            <div className="absolute top-0 right-3 -translate-y-1/2 flex gap-2">
                <Button
                    className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit"
                    variant="noShadow"
                    size="sm"
                    onClick={reset}
                >
                    <RotateCcwIcon /> Reset
                </Button>
            </div>
        </div>
    );
}

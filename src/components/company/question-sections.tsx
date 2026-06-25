"use client";

import { useMemo, useState } from "react";
import {
    Code2,
    Network,
    Boxes,
    MessagesSquare,
    ExternalLink,
    ArrowUpDownIcon,
    SignalIcon,
    RotateCcwIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectContent,
    MultiSelectList,
    MultiSelectGroup,
    MultiSelectItem,
} from "../ui/multi-combobox";
import { difficultyColor } from "~/utils/sorting";
import { DIFFICULTIES } from "~/config/constants";
import { ProblemRow } from "./problem-row";
import { QuestionChips } from "./question-chips";
import { CompanyAvatarGroup } from "../company-avatar-group";
import type { InterviewQuestion, InterviewSections } from "~/server/actions/companies/getCompanyInterviews";
import { FEATURE_FLAGS } from "~/config/feature-flags";

type SortKey = "asked" | "diff-asc" | "diff-desc";

const DIFF_RANK: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

const SECTION_ORDER: {
    key: keyof InterviewSections;
    title: string;
    icon: React.ReactNode;
}[] = [
    { key: "problemSolving", title: "Problem Solving", icon: <Code2 className="size-5" /> },
    { key: "systemDesign", title: "System Design", icon: <Network className="size-5" /> },
    ...(FEATURE_FLAGS.LLD ? [{ key: "lld" as const, title: "Machine Coding / LLD", icon: <Boxes className="size-5" /> }] : []),
    ...(FEATURE_FLAGS.OTHERS ? [{ key: "others" as const, title: "Others", icon: <MessagesSquare className="size-5" /> }] : []),
];

function matchesFilters(
    q: InterviewQuestion,
    search: string,
    diffs: string[],
): boolean {
    if (search) {
        const hay = `${q.problemTitle ?? ""} ${q.statement}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
    }
    // Difficulty is a DSA concept; rows without one drop out of a difficulty filter.
    if (diffs.length > 0 && (!q.difficulty || !diffs.includes(q.difficulty))) {
        return false;
    }
    return true;
}

function sortQuestions(list: InterviewQuestion[], sort: SortKey): InterviewQuestion[] {
    // "asked" preserves the server-side relevance order (weight never leaves the server).
    if (sort === "asked") return list;
    const dir = sort === "diff-asc" ? 1 : -1;
    return [...list].sort((a, b) => {
        const ra = DIFF_RANK[a.difficulty ?? ""];
        const rb = DIFF_RANK[b.difficulty ?? ""];
        // Unknown difficulty always sinks, regardless of sort direction.
        if (ra === undefined && rb === undefined) return a.statement.localeCompare(b.statement);
        if (ra === undefined) return 1;
        if (rb === undefined) return -1;
        return (ra - rb) * dir || a.statement.localeCompare(b.statement);
    });
}

/** Free-text / non-DSA rows: same ProblemRow look, minus problem-only affordances. */
export function LightRow({ q, companyName }: { q: InterviewQuestion; companyName?: string }) {
    return (
        <div className="relative flex p-3 border-2 border-border border-t-0">
            <div className="flex-grow">
                <div className="flex items-center flex-wrap gap-2">
                    {q.problemUrl ? (
                        <a
                            href={q.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="text-blue-700 dark:text-main hover:underline underline-offset-2 text-xl md:text-2xl font-bold flex items-center gap-1.5"
                        >
                            {q.statement}
                            <ExternalLink className="size-4 shrink-0" />
                        </a>
                    ) : (
                        <span className="text-xl md:text-2xl font-bold">{q.statement}</span>
                    )}
                    {q.kind === "topic" && (
                        <Badge className="bg-background text-foreground">Topic</Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-4 mt-2 font-base items-center">
                    {q.difficulty && (
                        <Badge className={`${difficultyColor(q.difficulty)} text-main-foreground`}>
                            {q.difficulty}
                        </Badge>
                    )}
                    <QuestionChips q={q} companyName={companyName} />
                </div>
                {q.askedInCompanies && q.askedInCompanies.length > 0 && (
                    <CompanyAvatarGroup companies={q.askedInCompanies} maxVisible={5} />
                )}
            </div>
        </div>
    );
}

function QuestionRow({ q, index, companyName }: { q: InterviewQuestion; index: number; companyName?: string }) {
    if (q.problemId != null && q.problemUrl) {
        return (
            <ProblemRow
                index={index}
                order=""
                problemUrl={q.problemUrl}
                problemTitle={q.problemTitle ?? q.statement}
                problemId={String(q.problemId)}
                difficulty={q.difficulty ?? "Unknown"}
                acceptance={q.acceptance ?? 0}
                isPaid={q.isPaid ?? false}
                tags={q.tags ?? []}
                chips={<QuestionChips q={q} companyName={companyName} />}
                companyChips={q.askedInCompanies}
            />
        );
    }
    return <LightRow q={q} companyName={companyName} />;
}

function QuestionFilters({
    sort,
    setSort,
    diffs,
    setDiffs,
    search,
    setSearch,
    onReset,
}: {
    sort: SortKey;
    setSort: (v: SortKey) => void;
    diffs: string[];
    setDiffs: (v: string[]) => void;
    search: string;
    setSearch: (v: string) => void;
    onReset: () => void;
}) {
    return (
        <Card className="flex-col md:flex-row md:items-center p-3 mb-6 gap-3 shadow-none bg-card">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="min-w-[150px] w-fit">
                    <ArrowUpDownIcon />
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="asked">Most asked</SelectItem>
                    <SelectItem value="diff-asc">Difficulty: Easy → Hard</SelectItem>
                    <SelectItem value="diff-desc">Difficulty: Hard → Easy</SelectItem>
                </SelectContent>
            </Select>
            <MultiSelect value={diffs} onValueChange={setDiffs}>
                <MultiSelectTrigger className="flex-shrink-0 min-w-[150px]">
                    <SignalIcon size={16} />
                    <MultiSelectValue placeholder="Difficulty" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectList autoHeight>
                        <MultiSelectGroup>
                            {DIFFICULTIES.map((d) => (
                                <MultiSelectItem key={d} value={d}>
                                    {d}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectGroup>
                    </MultiSelectList>
                </MultiSelectContent>
            </MultiSelect>
            <label htmlFor="question-search" className="sr-only">Search question</label>
            <Input
                id="question-search"
                placeholder="Search question.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:max-w-[280px]"
            />
            <Button
                className="bg-secondary-background text-secondary-foreground cursor-pointer w-fit md:ml-auto"
                variant="noShadow"
                size="sm"
                onClick={onReset}
            >
                <RotateCcwIcon /> Reset
            </Button>
        </Card>
    );
}

const SECTION_KEY_TO_CATEGORY: Record<keyof InterviewSections, string> = {
    problemSolving: "dsa",
    systemDesign: "system-design",
    lld: "lld",
    others: "behavioral",
};

export function QuestionSections({ sections, companyName, companySlug, enabledCategories }: {
    sections: InterviewSections;
    companyName?: string;
    companySlug?: string;
    enabledCategories?: string[];
}) {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("asked");
    const [diffs, setDiffs] = useState<string[]>([]);

    const view = useMemo(
        () =>
            SECTION_ORDER.map((s) => ({
                ...s,
                list: sortQuestions(
                    sections[s.key].filter((q) => matchesFilters(q, search, diffs)),
                    sort,
                ),
            })),
        [sections, search, sort, diffs],
    );

    const total = view.reduce((n, s) => n + s.list.length, 0);

    // Running index across every rendered row keeps ProblemRow's ad cadence sane.
    let running = 0;

    return (
        <div>
            <QuestionFilters
                sort={sort}
                setSort={setSort}
                diffs={diffs}
                setDiffs={setDiffs}
                search={search}
                setSearch={setSearch}
                onReset={() => {
                    setSearch("");
                    setSort("asked");
                    setDiffs([]);
                }}
            />
            {total === 0 ? (
                <Card className="p-10 text-center text-muted-foreground/70">
                    No questions match these filters.
                </Card>
            ) : (
                view.map((s) =>
                    s.list.length === 0 ? null : (
                        <div key={s.key} className="mb-8 shadow-shadow">
                            <div className="p-3 border-2 border-border bg-main text-main-foreground flex items-center gap-2 font-heading">
                                {s.icon}
                                <h2>{s.title}</h2>
                                <span className="text-sm opacity-70">({s.list.length})</span>
                                {companySlug && enabledCategories?.includes(SECTION_KEY_TO_CATEGORY[s.key]) && (
                                    <a
                                        href={`/companies/${companySlug}/${SECTION_KEY_TO_CATEGORY[s.key]}`}
                                        className="ml-auto text-sm underline hover:no-underline"
                                    >
                                        View all →
                                    </a>
                                )}
                            </div>
                            {s.list.map((q) => {
                                const row = (
                                    <QuestionRow
                                        key={`${q.statement}-${q.kind}`}
                                        q={q}
                                        index={running}
                                        companyName={companyName}
                                    />
                                );
                                running += 1;
                                return row;
                            })}
                        </div>
                    ),
                )
            )}
        </div>
    );
}

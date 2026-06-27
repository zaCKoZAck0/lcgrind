"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Code2,
    Network,
    Boxes,
    MessagesSquare,
    ExternalLink,
    ArrowUpDownIcon,
    SignalIcon,
    RotateCcwIcon,
    ChevronLeft,
    ChevronRight,
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
import { cn } from "~/lib/utils";
import { difficultyColor } from "~/utils/sorting";
import { DIFFICULTIES } from "~/config/constants";
import { ProblemRow } from "./problem-row";
import { QuestionChips } from "./question-chips";
import { CompanyAvatarGroup } from "../company-avatar-group";
import type { InterviewQuestion, InterviewSections } from "~/server/actions/companies/getCompanyInterviews";
import { FEATURE_FLAGS } from "~/config/feature-flags";

type SortKey = "asked" | "diff-asc" | "recent";

const DIFF_RANK: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };

const SECTION_ORDER: {
    key: keyof InterviewSections;
    title: string;
    icon: React.ReactNode;
}[] = [
    { key: "problemSolving", title: "DSA", icon: <Code2 className="size-5" /> },
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
    if (sort === "asked") return list;
    if (sort === "recent") {
        return [...list].sort((a, b) => {
            if (!a.lastAsked && !b.lastAsked) return 0;
            if (!a.lastAsked) return 1;
            if (!b.lastAsked) return -1;
            return b.lastAsked.localeCompare(a.lastAsked);
        });
    }
    return [...list].sort((a, b) => {
        const ra = DIFF_RANK[a.difficulty ?? ""];
        const rb = DIFF_RANK[b.difficulty ?? ""];
        if (ra === undefined && rb === undefined) return a.statement.localeCompare(b.statement);
        if (ra === undefined) return 1;
        if (rb === undefined) return -1;
        return (ra - rb) || a.statement.localeCompare(b.statement);
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

function QuestionRow({ q, index, companyName, onCompanyClick }: { q: InterviewQuestion; index: number; companyName?: string; onCompanyClick?: (slug: string) => void }) {
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
                onCompanyClick={onCompanyClick}
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
    showDifficulty,
}: {
    sort: SortKey;
    setSort: (v: SortKey) => void;
    diffs: string[];
    setDiffs: (v: string[]) => void;
    search: string;
    setSearch: (v: string) => void;
    onReset: () => void;
    showDifficulty: boolean;
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
                    <SelectItem value="recent">Recently asked</SelectItem>
                    {showDifficulty && <SelectItem value="diff-asc">Difficulty</SelectItem>}
                </SelectContent>
            </Select>
            {showDifficulty && (
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
            )}
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

const PAGE_SIZE = 50;

type SectionView = { key: keyof InterviewSections; title: string; icon: React.ReactNode; list: InterviewQuestion[] };

function pagedSections(view: SectionView[], start: number, end: number): SectionView[] {
    let offset = 0;
    return view.map((s) => {
        const sEnd = offset + s.list.length;
        const sliced = s.list.slice(Math.max(0, start - offset), Math.max(0, end - offset));
        offset = sEnd;
        return { ...s, list: sliced };
    });
}


export function QuestionSections({ sections, companyName }: {
    sections: InterviewSections;
    companyName?: string;
}) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("asked");
    const [diffs, setDiffs] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState<keyof InterviewSections | null>("problemSolving");
    const [page, setPage] = useState(1);

    const onCompanyClick = useCallback((slug: string) => {
        if (slug) router.push(`/companies/${slug}`);
    }, [router]);

    const availableSections = SECTION_ORDER.filter((s) => sections[s.key].length > 0);

    const view = useMemo(
        () =>
            SECTION_ORDER
                .filter((s) => activeSection === null || s.key === activeSection)
                .map((s) => ({
                    ...s,
                    list: sortQuestions(
                        sections[s.key].filter((q) => matchesFilters(q, search, diffs)),
                        sort,
                    ),
                })),
        [sections, search, sort, diffs, activeSection],
    );

    const total = view.reduce((n, s) => n + s.list.length, 0);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const pageStart = (page - 1) * PAGE_SIZE;
    const pageEnd = page * PAGE_SIZE;
    const currentView = useMemo(() => pagedSections(view, pageStart, pageEnd), [view, pageStart, pageEnd]);
    const sectionTotals = useMemo(() => new Map(view.map((s) => [s.key, s.list.length])), [view]);

    // Running index starts at page offset so ProblemRow's ad cadence stays consistent.
    let running = pageStart;

    return (
        <div>
            {availableSections.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {availableSections.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => { setActiveSection(s.key); setPage(1); if (s.key !== "problemSolving") { setDiffs([]); setSort("asked"); } }}
                            className={cn(
                                "px-3 py-1 text-sm font-bold border-2 border-border rounded-base transition-colors flex items-center gap-1.5",
                                activeSection === s.key
                                    ? "bg-main text-main-foreground shadow-shadow"
                                    : "bg-background text-foreground hover:bg-secondary-background",
                            )}
                        >
                            {s.icon}
                            {s.title}
                        </button>
                    ))}
                </div>
            )}
            <QuestionFilters
                sort={sort}
                setSort={(v) => { setSort(v); setPage(1); }}
                diffs={diffs}
                setDiffs={(v) => { setDiffs(v); setPage(1); }}
                search={search}
                setSearch={(v) => { setSearch(v); setPage(1); }}
                onReset={() => {
                    setSearch("");
                    setSort("asked");
                    setDiffs([]);
                    setPage(1);
                }}
                showDifficulty={activeSection === "problemSolving"}
            />
            {total === 0 ? (
                <Card className="p-10 text-center text-muted-foreground/70">
                    No questions match these filters.
                </Card>
            ) : (
                <>
                    {currentView.map((s) =>
                        s.list.length === 0 ? null : (
                            <div key={s.key} className="mb-8 shadow-shadow">
                                <div className="p-3 border-2 border-border bg-main text-main-foreground flex items-center gap-2 font-heading">
                                    {s.icon}
                                    <h2>{s.title}</h2>
                                    <span className="text-sm opacity-70">({sectionTotals.get(s.key) ?? s.list.length})</span>
                                </div>
                                {s.list.map((q) => {
                                    const row = (
                                        <QuestionRow
                                            key={`${q.statement}-${q.kind}`}
                                            q={q}
                                            index={running}
                                            companyName={companyName}
                                            onCompanyClick={onCompanyClick}
                                        />
                                    );
                                    running += 1;
                                    return row;
                                })}
                            </div>
                        ),
                    )}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-6 mb-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold border-2 border-border rounded-base bg-background text-foreground hover:bg-secondary-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="size-4" /> Prev
                            </button>
                            <span className="text-sm font-bold border-2 border-border rounded-base px-3 py-1.5 bg-card">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold border-2 border-border rounded-base bg-background text-foreground hover:bg-secondary-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next <ChevronRight className="size-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

"use client";

import { ProblemRow } from "~/components/company/problem-row";
import { ProgressTracker } from "~/components/company/progress-tracker";
import { getSheetProblems } from "~/server/actions/sheets/getSheetProblems";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion"
import { buttonVariants } from "~/components/ui/button";
import { ChevronLeft, ExternalLinkIcon, TargetIcon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_REVALIDATION, SHEET_OWNER_LOGO_SRC } from "~/config/constants";
import { usePathname } from "next/navigation";
import { getSheetMetadata } from "~/server/actions/sheets/getSheetMetadata";
import { useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { useTheme } from "~/hooks/use-theme";
import { addThemeToLogoUrl } from "~/utils/logo";
import { SheetSettingsPanel } from "./sheet-settings-panel";
import { useAppSelector } from "~/hooks/redux";
import { defaultSettings } from "~/store/sheetSettingsSlice";

// Time estimates in minutes per problem difficulty
const DIFFICULTY_TIME_MINUTES: Record<string, number> = {
    'Easy': 15,
    'Medium': 30,
    'Hard': 60
};

type SheetProblem = {
    order: number;
    group: string;
    id: number;
    url: string;
    difficulty: string;
    title: string;
    isPaid: boolean;
    acceptance: number;
    difficultyOrder: number;
    frontendQuestionId: string;
    platform: string;
};

interface GroupingResult {
    grouped: Map<string, SheetProblem[]>;
    skipped: SheetProblem[];
}

function groupProblemsByWeek(
    problems: SheetProblem[],
    weeks: number,
    hoursPerWeek: number
): GroupingResult {
    const minutesPerWeek = hoursPerWeek * 60;
    const totalMinutesAvailable = weeks * minutesPerWeek;
    const grouped = new Map<string, SheetProblem[]>();
    const skipped: SheetProblem[] = [];
    
    // Initialize all weeks
    for (let i = 1; i <= weeks; i++) {
        grouped.set(`Week ${i}`, []);
    }
    
    let currentWeek = 1;
    let currentWeekTime = 0;
    let totalTimeUsed = 0;
    
    for (const problem of problems) {
        const problemTime = DIFFICULTY_TIME_MINUTES[problem.difficulty] ?? 30;
        
        // Check if we've exceeded total available time
        if (totalTimeUsed + problemTime > totalMinutesAvailable) {
            skipped.push(problem);
            continue;
        }
        
        // If adding this problem exceeds the week's time and there are more weeks
        if (currentWeekTime + problemTime > minutesPerWeek && currentWeek < weeks) {
            currentWeek++;
            currentWeekTime = 0;
        }
        
        grouped.get(`Week ${currentWeek}`)?.push(problem);
        currentWeekTime += problemTime;
        totalTimeUsed += problemTime;
    }
    
    // Remove empty weeks (if problems ran out before all weeks were filled)
    for (let i = weeks; i >= 1; i--) {
        const weekKey = `Week ${i}`;
        if (grouped.get(weekKey)?.length === 0) {
            grouped.delete(weekKey);
        }
    }
    
    return { grouped, skipped };
}

function groupProblemsByTopic(problems: SheetProblem[]): GroupingResult {
    const grouped = new Map<string, SheetProblem[]>();
    problems.forEach((problem) => {
        if (!grouped.has(problem.group)) {
            grouped.set(problem.group, []);
        }
        grouped.get(problem.group)?.push(problem);
    });
    return { grouped, skipped: [] };
}


export function Sheet() {

    const slug = usePathname().split('/')[2];
    const theme = useTheme();
    const settings = useAppSelector(
        state => state.sheetSettings.sheets[slug] ?? defaultSettings
    );

    const { data: problems, isLoading: isProblemsLoading } = useQuery({
        queryKey: [`sheet/${slug}/problems`],
        queryFn: () => getSheetProblems(slug),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
    });

    const { data: sheet, isLoading: isSheetLoading } = useQuery({
        queryKey: [`sheet/${slug}/metadata`],
        queryFn: () => getSheetMetadata(slug),
        staleTime: DEFAULT_REVALIDATION,
        gcTime: DEFAULT_REVALIDATION,
    })

    // Get available topics from problems
    const availableTopics = useMemo(() => {
        if (!problems) return [];
        const topics = new Set<string>();
        problems.forEach(p => topics.add(p.group));
        return Array.from(topics).sort();
    }, [problems]);

    // Filter problems based on selected filters
    const filteredProblems = useMemo(() => {
        if (!problems) return [];
        
        return problems.filter(problem => {
            // Filter by difficulty
            if (settings.selectedDifficulties.length > 0 && 
                !settings.selectedDifficulties.includes(problem.difficulty)) {
                return false;
            }
            
            // Filter by topic
            if (settings.selectedTopics.length > 0 && 
                !settings.selectedTopics.includes(problem.group)) {
                return false;
            }
            
            return true;
        });
    }, [problems, settings.selectedDifficulties, settings.selectedTopics]);

    const { groupedSheetProblems, skippedProblems } = useMemo(() => {
        if (!filteredProblems.length) {
            return { 
                groupedSheetProblems: new Map<string, SheetProblem[]>(), 
                skippedProblems: [] 
            };
        }
        
        if (settings.groupBy === 'week') {
            const result = groupProblemsByWeek(filteredProblems, settings.weeks, settings.hoursPerWeek);
            return { groupedSheetProblems: result.grouped, skippedProblems: result.skipped };
        }
        
        const result = groupProblemsByTopic(filteredProblems);
        return { groupedSheetProblems: result.grouped, skippedProblems: result.skipped };
    }, [filteredProblems, settings.groupBy, settings.weeks, settings.hoursPerWeek]);

    const selectedSheet = sheet?.[0];

    return <div className="w-full max-w-[1000px] py-6">
        <div className="mb-12 shadow-shadow">
            <div className='p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground'>
                <Link href="/sheets" className={buttonVariants({ variant: "neutral", size: "sm" })}>
                    <ChevronLeft />
                    All Sheets
                </Link>
            </div>
            <div className='p-6 border-2 border-t-0 border-border bg-card flex flex-col md:flex-row justify-between gap-6 bg-secondary-background'>
                {isSheetLoading ? <SheetSkeleton /> : (<div className="w-fit h-fit">
                    <div className="flex gap-6 min-w-[360px]">
                        <img
                            src={addThemeToLogoUrl(SHEET_OWNER_LOGO_SRC[selectedSheet?.ownerName.toLowerCase()], theme)}
                            alt={`${selectedSheet?.name} logo`}
                            className="size-14 rounded-md"
                        />
                        <div className="flex flex-col justify-between">
                            <h1 className="font-semibold text-2xl flex items-baseline gap-2">
                                {selectedSheet?.name}
                                <span className="text-lg hidden md:block font-normal">by</span>
                                <a href={selectedSheet?.website} className="font-normal hidden underline underline-offset-2 text-xl md:flex items-center gap-2">
                                    {selectedSheet?.ownerName}
                                    <ExternalLinkIcon size={18} />
                                </a>
                            </h1>
                            <p className="flex items-center gap-1 text-muted-foreground/50 text-lg">
                                <TargetIcon size={18} />
                                {selectedSheet?.numOfProblems} Problems
                            </p>
                        </div>
                    </div>
                    <p className="pt-1 hidden md:block">
                        {selectedSheet?.description}
                    </p>
                </div>)}
                <div className="w-full md:max-w-[320px]">
                    <SheetSettingsPanel sheetSlug={slug} availableTopics={availableTopics} />
                </div>
            </div>
            <ProgressTracker text="COMPLETED" className="border-2 border-border border-t-0 p-3" problemIds={problems?.map(p => p.frontendQuestionId) ?? []} />
        </div>

        <Accordion type="multiple" defaultValue={Array.from(groupedSheetProblems.keys())} className="w-full space-y-6">
            {isProblemsLoading ? <div className="w-full">Fetching problems....</div>
                : Array.from(groupedSheetProblems.entries()).map(([group, groupProblems]) => (
                    <AccordionItem key={group} value={group}>
                        <AccordionTrigger className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold flex-grow">{group}</h2>
                            <ProgressTracker className="md:max-w-[50%] hidden md:flex pr-3" problemIds={groupedSheetProblems.get(group)?.map(p => p.frontendQuestionId) ?? []} />
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="min-w-full border-collapse border-t-2 border-border bg-background">
                                {groupProblems?.map((problem, idx) => (
                                    <ProblemRow
                                        key={problem.id}
                                        index={idx}
                                        order={problem.order.toString()}
                                        problemUrl={problem.url}
                                        problemTitle={problem.title}
                                        problemId={problem.frontendQuestionId}
                                        difficulty={problem.difficulty}
                                        acceptance={problem.acceptance}
                                        isPaid={problem.isPaid}
                                        tags={[]}
                                        companies={[]}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))
            }
        </Accordion>

        {/* Skipped Problems Section */}
        {skippedProblems.length > 0 && (
            <div className="mt-8">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="skipped">
                        <AccordionTrigger className="flex justify-between items-center bg-muted/30 px-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon size={20} className="text-muted-foreground" />
                                <h2 className="text-xl font-semibold text-muted-foreground">Skipped Problems</h2>
                                <span className="text-sm text-muted-foreground">({skippedProblems.length})</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm text-muted-foreground mb-4 px-2">
                                These problems didn&apos;t fit into your {settings.weeks} week × {settings.hoursPerWeek}h/week schedule. 
                                You can review them later or adjust your schedule settings.
                            </p>
                            <div className="min-w-full border-collapse border-t-2 border-border bg-background opacity-70">
                                {skippedProblems.map((problem, idx) => (
                                    <ProblemRow
                                        key={problem.id}
                                        index={idx}
                                        order={problem.order.toString()}
                                        problemUrl={problem.url}
                                        problemTitle={problem.title}
                                        problemId={problem.frontendQuestionId}
                                        difficulty={problem.difficulty}
                                        acceptance={problem.acceptance}
                                        isPaid={problem.isPaid}
                                        tags={[]}
                                        companies={[]}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        )}
    </div>
}


const SheetSkeleton = () => {
    return (<div className="w-fit h-fit">
        <div className="flex gap-6 min-w-[360px]">
            <Skeleton className="size-14 rounded-md" />
            <div className="pt-1">
                <Skeleton className="h-5 w-[120px] mb-3" />
                <Skeleton className="h-4 w-[180px]" />
            </div>
        </div>
    </div>)
}
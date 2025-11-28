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
import { ChevronLeft, ExternalLinkIcon, TargetIcon } from "lucide-react";
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

function groupProblemsByWeek(
    problems: SheetProblem[],
    weeks: number,
    hoursPerWeek: number
): Map<string, SheetProblem[]> {
    const minutesPerWeek = hoursPerWeek * 60;
    const result = new Map<string, SheetProblem[]>();
    
    // Initialize all weeks
    for (let i = 1; i <= weeks; i++) {
        result.set(`Week ${i}`, []);
    }
    
    let currentWeek = 1;
    let currentWeekTime = 0;
    
    for (const problem of problems) {
        const problemTime = DIFFICULTY_TIME_MINUTES[problem.difficulty] ?? 30;
        
        // If adding this problem exceeds the week's time and there are more weeks
        if (currentWeekTime + problemTime > minutesPerWeek && currentWeek < weeks) {
            currentWeek++;
            currentWeekTime = 0;
        }
        
        result.get(`Week ${currentWeek}`)?.push(problem);
        currentWeekTime += problemTime;
    }
    
    // Remove empty weeks (if problems ran out before all weeks were filled)
    for (let i = weeks; i >= 1; i--) {
        const weekKey = `Week ${i}`;
        if (result.get(weekKey)?.length === 0) {
            result.delete(weekKey);
        }
    }
    
    return result;
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

    const groupedSheetProblems = useMemo(() => {
        if (!problems) return new Map<string, SheetProblem[]>();
        
        if (settings.groupBy === 'week') {
            return groupProblemsByWeek(problems, settings.weeks, settings.hoursPerWeek);
        }
        
        // Default topic-based grouping
        const map = new Map<string, SheetProblem[]>();
        problems.forEach((problem) => {
            if (!map.has(problem.group)) {
                map.set(problem.group, []);
            }
            map.get(problem.group)?.push(problem);
        });
        return map;
    }, [problems, settings.groupBy, settings.weeks, settings.hoursPerWeek]);

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
                    <SheetSettingsPanel sheetSlug={slug} />
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
"use client";

import { TargetIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { SHEET_OWNER_LOGO_SRC } from "~/config/constants";
import { SheetOwnerLogo } from "~/components/sheet-owner-logo";
import { ProgressTracker } from "~/components/company/progress-tracker";

type Sheet = {
    id: number;
    slug: string;
    name: string;
    ownerName: string;
    _count: {
        SheetProblem: number;
    };
    SheetProblem: {
        problem: {
            frontendQuestionId: string;
        };
    }[];
};

export function SheetsList({ sheets }: { sheets: Sheet[] }) {
    return (
        <div className="w-full p-6 max-w-[1000px] gap-6 grid md:grid-cols-2 grid-cols-1">
            {sheets.map((sheet) => {
                const problemIds = sheet.SheetProblem.map(sp => sp.problem.frontendQuestionId);
                return (
                    <Link
                        key={sheet.id}
                        href={`/sheets/${sheet.slug}`}
                        className={cn(buttonVariants({ variant: "reverse", size: "lg" }), "block text-secondary-foreground bg-secondary-background h-fit p-3 px-auto cursor-pointer w-full")}
                    >
                        <div className="space-y-3">
                            <div className="flex gap-3 items-center">
                                <SheetOwnerLogo alt={sheet.ownerName} src={SHEET_OWNER_LOGO_SRC[sheet.ownerName.toLowerCase()]} width={100} height={100} className="rounded-md size-16" />
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold text-2xl">
                                        {sheet.name}
                                    </p>
                                    <p className="flex gap-2 items-center">
                                        <TargetIcon /> {sheet._count.SheetProblem} Problems
                                    </p>
                                </div>
                            </div>
                            <ProgressTracker problemIds={problemIds} />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

import { TargetIcon } from "lucide-react";
import Link from "next/link";
import { Star13 } from "~/components/ui/stars/s13";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { getAllSheets } from "~/server/actions/sheets/getAllSheets";
import { BASE_URL, SHEET_OWNER_LOGO_SRC } from "~/config/constants";
import { SheetOwnerLogo } from "~/components/sheet-owner-logo";
import { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "DSA Sheets for Interview Preparation",
    description:
        "Explore popular DSA sheets like Blind 75, Leetcode 75 and NeetCode 150. Structure your LeetCode practice for coding interviews.",
    keywords: [
        "dsa sheets",
        "leetcode sheets",
        "data structures algorithms sheet",
        "interview preparation sheets",
        "coding practice sheets",
        "striver sde sheet",
        "blind 75",
        "neetcode 150",
        "leetcode problem list",
        "systematic coding practice",
        "faang preparation",
    ],
    alternates: {
        canonical: `${BASE_URL}/sheets`,
    },
    openGraph: {
        title: "DSA Sheets for Interview Preparation | LC Grind",
        description:
            "Find structured LeetCode problem lists (DSA Sheets) to boost your interview prep.",
        url: `${BASE_URL}/sheets`,
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "DSA Sheets for Interview Preparation | LC Grind",
        description:
            "Find structured LeetCode problem lists (DSA Sheets) to boost your interview prep.",
    },
};

export default async function SheetsPage() {
    const sheets = await getAllSheets();
    return (
        <>
            <div className="pt-6 text-center">
                <h1 className="md:text-5xl text-3xl p-6 font-bold relative">
                    <Star13 className="absolute size-10 top-1/6 left-0 text-main" />
                    <span className="px-2">
                        Top DSA Sheets
                    </span>
                </h1>
            </div>
            <p className="text-center pb-6">Follow top structured coding paths created by experts, based on your preparation timeline or focus areas.</p>
            <div className="w-full p-6 max-w-[1000px] gap-6 grid md:grid-cols-2 grind-cols-1">
                {sheets.map((sheet) => (
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
                            {/* <p className="w-full overflow-hidden text-ellipsis">
                                {sheet.description}
                            </p> */}
                            {/* <div className="flex gap-3 items-center">
                                
                            </div> */}
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
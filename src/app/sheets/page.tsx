import { TargetIcon } from "lucide-react";
import Link from "next/link";
import { Star13 } from "~/components/ui/stars/s13";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { getAllSheets } from "~/server/actions/sheets/getAllSheets";
import { SHEET_OWNER_LOGO_SRC } from "~/config/constants";
import Image from "next/image";

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
            <div className="w-full p-6 max-w-[1000px] space-y-6">
                {sheets.map((sheet) => (
                    <Link
                        key={sheet.id}
                        href={`/sheets/${sheet.slug}`}
                        className={cn(buttonVariants({ variant: "reverse", size: "lg" }), "block text-secondary-foreground bg-secondary-background h-fit py-6 px-auto cursor-pointer w-full")}
                    >

                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <Image alt={sheet.ownerName} src={SHEET_OWNER_LOGO_SRC[sheet.ownerName.toLowerCase()]} width={25} height={25} className="rounded-md" />
                                <p className="font-semibold text-2xl">
                                    {sheet.name}
                                </p>
                            </div>
                            <p className="w-full overflow-hidden text-ellipsis">
                                {sheet.description}
                            </p>
                            <div className="flex gap-3 items-center">
                                <p className="flex gap-2 items-center">
                                    <TargetIcon /> {sheet._count.SheetProblem} Problems
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}
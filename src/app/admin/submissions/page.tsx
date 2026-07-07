import type { Metadata } from "next";
import { db } from "~/lib/db";
import { ReviewBoard, type BoardSubmission } from "~/components/admin/review-board";
import { geminiAvailable } from "~/server/actions/admin/parse";

export const metadata: Metadata = {
    title: "Submission Review",
    robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
    const submissions = await db.submission.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            companyId: true,
            companyName: true,
            mode: true,
            rawText: true,
            structured: true,
            parsed: true,
            parseError: true,
            status: true,
            adminNote: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
        },
    });

    const board: BoardSubmission[] = submissions.map((s) => ({
        id: s.id,
        companyId: s.companyId,
        companyName: s.companyName,
        mode: s.mode,
        rawText: s.rawText,
        structured: s.structured,
        parsed: s.parsed,
        parseError: s.parseError,
        status: s.status,
        adminNote: s.adminNote,
        createdAt: s.createdAt.toISOString(),
        userName: s.user.name,
        userEmail: s.user.email,
    }));

    return (
        <div className="w-full max-w-[1400px] py-6 px-4 mx-auto">
            <div className="mb-6 p-3 border-2 border-border bg-card flex items-center justify-between">
                <h1 className="font-bold text-xl">Submission review</h1>
                <span className="text-sm text-muted-foreground">
                    {board.length} total
                </span>
            </div>
            <ReviewBoard submissions={board} parseAvailable={geminiAvailable()} />
        </div>
    );
}

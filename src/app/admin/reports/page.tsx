import { getOpenReports } from "~/server/actions/moderation/actions";
import { ReportQueue } from "~/components/admin/report-queue";

export const metadata = { title: "Reports Queue | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
    const reports = await getOpenReports();
    return (
        <div className="py-6">
            <h1 className="text-2xl font-bold mb-6">Reports Queue</h1>
            <ReportQueue reports={reports} />
        </div>
    );
}

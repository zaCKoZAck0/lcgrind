import { ProblemsPage } from "~/components/all-problems/problems-page";

export const dynamic = "force-static";

export default async function AllProblemsPage() {
    return <ProblemsPage />
}
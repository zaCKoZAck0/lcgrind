import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { decodeSharePayload } from "~/utils/list-share";
import { getProblemsByIds } from "~/server/actions/problems/getProblemsByIds";
import { SharedListView } from "~/components/lists/shared-list-view";
import type { ListProblem } from "~/server/actions/problems/getProblemsByIds";

export const metadata: Metadata = {
  title: "Shared Solvelist – LC Grind",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = decodeSharePayload(token);

  if (!payload) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-3">Invalid share link</h1>
        <p className="text-foreground/60 mb-6">
          This link is malformed or belongs to an unsupported version.
        </p>
        <Button asChild variant="neutral">
          <Link href="/lists">Go to Solvelists</Link>
        </Button>
      </div>
    );
  }

  const rawProblems = await getProblemsByIds(payload.problemIds);

  // Re-sort to match the shared order
  const idIndex = new Map(payload.problemIds.map((id, i) => [id, i]));
  const problems: ListProblem[] = [...rawProblems].sort(
    (a, b) => (idIndex.get(a.id) ?? 999) - (idIndex.get(b.id) ?? 999)
  );

  return <SharedListView shared={payload} problems={problems} />;
}

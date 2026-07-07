import { Card } from "~/components/ui/card";

export default function PostLoading() {
    return (
        <div className="w-full max-w-[800px] py-6 px-4 mx-auto animate-pulse">
            <div className="mb-4 h-4 w-20 rounded bg-muted" />
            <Card className="gap-0 py-0">
                <div className="p-4 border-b-2 border-border flex flex-col gap-3">
                    <div className="h-7 w-3/4 rounded bg-muted" />
                    <div className="flex gap-3">
                        <div className="h-4 w-20 rounded bg-muted" />
                        <div className="h-4 w-16 rounded bg-muted" />
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-5/6 rounded bg-muted" />
                    <div className="h-4 w-4/6 rounded bg-muted" />
                </div>
                <div className="p-4 border-t-2 border-border flex gap-4">
                    <div className="h-7 w-16 rounded bg-muted" />
                </div>
            </Card>
        </div>
    );
}

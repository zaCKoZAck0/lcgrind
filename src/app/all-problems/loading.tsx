import { Loader2Icon } from "lucide-react"

export default function AllProblemsPageLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center w-full">
            <Loader2Icon className="animate-spin text-accent" size={54} />
            <div className="p-8 w-full h-full items-center justify-center text-center text-muted-foreground/50">
                <p>Loading problems ...</p>
            </div>
        </div>
    );
}
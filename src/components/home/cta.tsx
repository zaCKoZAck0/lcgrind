import Link from "next/link";
import { Button } from "../ui/button";

export function CTA() {
    return <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-background" id="problems">
        <div className="max-w-7xl mx-auto text-center">
            <div className="p-8 border-2 border-border shadow-shadow rotate-1">
                <h2 className="text-3xl font-bold mb-4 text-secondary-foreground">Level Up Your Interview Prep</h2>
                <p className="text-secondary-foreground mb-6 max-w-2xl mx-auto">
                    Start mastering company-specific questions, track your progress, and ace your next interview—all for free.
                </p>
                <Link href="/all-problems">
                    <Button size="lg" className="py-4 cursor-pointer h-fit text-2xl">
                        Start Practicing
                    </Button>
                </Link>
            </div>
        </div>
    </section>
}
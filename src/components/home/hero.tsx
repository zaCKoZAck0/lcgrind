import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

export function HeroSection() {
    return <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-secondary-background">
        <div className="max-w-7xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8">
                    Ace Your
                    <span className="bg-main text-main-foreground px-4 sm:ml-4 mt-2 sm:mt-0 rotate-2 inline-block transform hover:rotate-0 transition-transform border-2 border-border shadow-shadow py-3">
                        Coding Interview
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl mb-10">
                    Company-specific practice problems, all leetcode problems, and popular DSA sheets—all in one place, completely free.
                </p>
                <div className="flex justify-center mb-12">
                    <Image src='/images/platform-screenshot.png' className="md:w-[800px] border-2 border-border shadow-shadow" height={500} width={600} alt="Platform Screenshot" />
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link href="/companies">
                        <Button size="lg" className="text-2xl cursor-pointer py-4 h-fit">
                            Companies
                        </Button>
                    </Link>
                    <Link href="/all-problems">
                        <Button size="lg" variant="neutral" className="text-2xl cursor-pointer py-4 h-fit">
                            Problems
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </section>
}
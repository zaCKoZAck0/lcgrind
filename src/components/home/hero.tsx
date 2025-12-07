"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

const companies = ["Google", "Meta", "Amazon", "Apple", "Microsoft"];
const problemTags = ["Array", "Hash Table", "Dynamic Programming", "Binary Search", "Greedy"];
const sheets = ["Blind 75", "Grind 75", "NeetCode 150", "LeetCode 75"];

export function HeroSection() {
    return <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-secondary-background" aria-label="Hero section">
        <div className="max-w-7xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8">
                    Ace Your
                    <span className="bg-main text-main-foreground px-4 sm:ml-4 mt-2 sm:mt-0 rotate-2 inline-block transform hover:rotate-0 transition-transform border-2 border-border shadow-shadow py-3">
                        Coding Interview
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl mb-10">
                    Company-specific practice problems, all LeetCode problems, and popular DSA sheets—all in one place, completely free.
                </p>
                <InteractiveAnimation />
                <nav className="flex flex-col sm:flex-row gap-6 justify-center items-center" aria-label="Main navigation">
                    <Link href="/companies" aria-label="Browse company-wise LeetCode problems">
                        <Button size="lg" className="text-2xl cursor-pointer py-4 h-fit">
                            Companies
                        </Button>
                    </Link>
                    <Link href="/all-problems" aria-label="Browse all LeetCode problems">
                        <Button size="lg" variant="neutral" className="text-2xl cursor-pointer py-4 h-fit">
                            Problems
                        </Button>
                    </Link>
                </nav>
            </div>
        </div>
    </section>
}

function InteractiveAnimation() {
    const [activeCompany, setActiveCompany] = useState(0);
    const [activeTag, setActiveTag] = useState(0);
    const [activeSheet, setActiveSheet] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCompany((prev) => (prev + 1) % companies.length);
            setActiveTag((prev) => (prev + 1) % problemTags.length);
            setActiveSheet((prev) => (prev + 1) % sheets.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex justify-center mb-12 min-h-[300px] md:min-h-[400px] items-center">
            <div className="relative w-full max-w-4xl h-[300px] md:h-[400px]">
                {/* Companies - Top Left */}
                <div className="absolute top-0 left-0 md:left-[10%]">
                    {companies.map((company, index) => (
                        <div
                            key={company}
                            className={`p-4 bg-main border-2 border-border transition-all duration-500 ${
                                index === activeCompany
                                    ? "rotate-2 shadow-shadow scale-110 opacity-100"
                                    : "rotate-0 shadow-none scale-100 opacity-40"
                            }`}
                            style={{
                                position: index === activeCompany ? "relative" : "absolute",
                                transform: `translateY(${index * 8}px) translateX(${index * 8}px)`,
                            }}
                        >
                            <span className="font-bold text-main-foreground">{company}</span>
                        </div>
                    ))}
                </div>

                {/* Problem Tags - Top Right */}
                <div className="absolute top-0 right-0 md:right-[10%]">
                    {problemTags.map((tag, index) => (
                        <div
                            key={tag}
                            className={`p-3 bg-secondary-background border-2 border-border transition-all duration-500 ${
                                index === activeTag
                                    ? "-rotate-2 shadow-shadow scale-110 opacity-100"
                                    : "rotate-0 shadow-none scale-100 opacity-40"
                            }`}
                            style={{
                                position: index === activeTag ? "relative" : "absolute",
                                transform: `translateY(${index * 8}px) translateX(-${index * 8}px)`,
                            }}
                        >
                            <span className="font-bold text-foreground text-sm">{tag}</span>
                        </div>
                    ))}
                </div>

                {/* DSA Sheets - Bottom Center */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    {sheets.map((sheet, index) => (
                        <div
                            key={sheet}
                            className={`p-4 bg-main border-2 border-border transition-all duration-500 ${
                                index === activeSheet
                                    ? "rotate-1 shadow-shadow scale-110 opacity-100"
                                    : "rotate-0 shadow-none scale-100 opacity-40"
                            }`}
                            style={{
                                position: index === activeSheet ? "relative" : "absolute",
                                transform: `translateY(-${index * 8}px) translateX(${(index - 2) * 8}px)`,
                            }}
                        >
                            <span className="font-bold text-main-foreground">{sheet}</span>
                        </div>
                    ))}
                </div>

                {/* Center Badge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="p-6 bg-secondary-background border-2 border-border shadow-shadow rotate-0 hover:rotate-2 transition-transform">
                        <div className="text-3xl font-bold text-foreground">LC Grind</div>
                        <div className="text-sm text-foreground mt-2">Practice. Track. Succeed.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
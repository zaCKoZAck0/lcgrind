import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "All Companies - LC Grind",
    description: "F*ck leetcode premium",
};

export default function SheetPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center w-full">
                {children}
        </div>
    );
}
import React from "react";

export default function SheetPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center">
            {children}
        </div>
    );
}
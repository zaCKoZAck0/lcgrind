"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MessagesSquare, Banknote, Briefcase } from "lucide-react";

interface InterviewTabsProps {
    interviews: React.ReactNode;
    compensation?: React.ReactNode;
    experiences?: React.ReactNode;
    defaultTab?: string;
}

export function InterviewTabs({ interviews, compensation, experiences, defaultTab }: InterviewTabsProps) {
    const showComp = compensation !== undefined;
    return (
        <Tabs defaultValue={defaultTab ?? "interviews"}>
            <TabsList className="mb-4">
                <TabsTrigger value="interviews">
                    <MessagesSquare className="size-4" />
                    Interviews
                </TabsTrigger>
                {showComp && (
                    <TabsTrigger value="compensation">
                        <Banknote className="size-4" />
                        Compensation
                    </TabsTrigger>
                )}
                {experiences !== undefined && (
                    <TabsTrigger value="experiences">
                        <Briefcase className="size-4" />
                        Experiences
                    </TabsTrigger>
                )}
            </TabsList>
            <TabsContent value="interviews">{interviews}</TabsContent>
            {showComp && (
                <TabsContent value="compensation">{compensation}</TabsContent>
            )}
            {experiences !== undefined && (
                <TabsContent value="experiences">{experiences}</TabsContent>
            )}
        </Tabs>
    );
}

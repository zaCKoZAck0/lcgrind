"use client";

import { useAppDispatch, useAppSelector } from "~/hooks/redux";
import { Checkbox } from "~/components/ui/checkbox";
import {
    setSelectedTopics,
    setSelectedDifficulties,
    defaultSettings,
} from "~/store/sheetSettingsSlice";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";

interface SheetFiltersProps {
    sheetSlug: string;
    availableTopics: string[];
}

const DIFFICULTIES = [
    { value: 'Easy', color: 'text-green-500' },
    { value: 'Medium', color: 'text-yellow-500' },
    { value: 'Hard', color: 'text-red-500' },
];

export function SheetFilters({ sheetSlug, availableTopics }: SheetFiltersProps) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(
        state => state.sheetSettings.sheets[sheetSlug] ?? defaultSettings
    );

    const toggleDifficulty = (difficulty: string) => {
        const current = settings.selectedDifficulties;
        if (current.includes(difficulty)) {
            dispatch(setSelectedDifficulties({ 
                sheetSlug, 
                difficulties: current.filter(d => d !== difficulty) 
            }));
        } else {
            dispatch(setSelectedDifficulties({ 
                sheetSlug, 
                difficulties: [...current, difficulty] 
            }));
        }
    };

    const toggleTopic = (topic: string) => {
        const current = settings.selectedTopics;
        if (current.includes(topic)) {
            dispatch(setSelectedTopics({ 
                sheetSlug, 
                topics: current.filter(t => t !== topic) 
            }));
        } else {
            dispatch(setSelectedTopics({ 
                sheetSlug, 
                topics: [...current, topic] 
            }));
        }
    };

    const selectAllTopics = () => {
        dispatch(setSelectedTopics({ sheetSlug, topics: [] }));
    };

    const isDifficultySelected = (difficulty: string) => {
        return settings.selectedDifficulties.length === 0 || 
               settings.selectedDifficulties.includes(difficulty);
    };

    return (
        <div className="space-y-6 py-4">
            {/* Difficulty Section */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Difficulty
                </h3>
                <div className="space-y-2">
                    {DIFFICULTIES.map(({ value, color }) => (
                        <label 
                            key={value} 
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <Checkbox
                                checked={isDifficultySelected(value)}
                                onCheckedChange={() => toggleDifficulty(value)}
                            />
                            <span className={`font-medium ${color}`}>{value}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Topics Section */}
            {availableTopics.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Topics
                    </h3>
                    {settings.selectedTopics.length === 0 ? (
                        <p className="text-sm">
                            All topics selected (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="text-primary underline underline-offset-2 hover:text-primary/80">
                                        Change
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-0" align="start">
                                    <ScrollArea className="h-[200px] p-4">
                                        <div className="space-y-2">
                                            {availableTopics.map(topic => (
                                                <label 
                                                    key={topic} 
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={!settings.selectedTopics.includes(topic) && settings.selectedTopics.length === 0}
                                                        onCheckedChange={() => {
                                                            // When clicking on a topic from "all selected", select only that topic
                                                            dispatch(setSelectedTopics({ 
                                                                sheetSlug, 
                                                                topics: availableTopics.filter(t => t !== topic)
                                                            }));
                                                        }}
                                                    />
                                                    <span className="text-sm">{topic}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                            )
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm">
                                {availableTopics.length - settings.selectedTopics.length} of {availableTopics.length} topics selected (
                                <button 
                                    onClick={selectAllTopics}
                                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                                >
                                    Select All
                                </button>
                                )
                            </p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="text-sm text-primary underline underline-offset-2 hover:text-primary/80">
                                        Change selection
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-0" align="start">
                                    <ScrollArea className="h-[200px] p-4">
                                        <div className="space-y-2">
                                            {availableTopics.map(topic => (
                                                <label 
                                                    key={topic} 
                                                    className="flex items-center gap-3 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={!settings.selectedTopics.includes(topic)}
                                                        onCheckedChange={() => toggleTopic(topic)}
                                                    />
                                                    <span className="text-sm">{topic}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

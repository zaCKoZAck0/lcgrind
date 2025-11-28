"use client";

import { useAppDispatch, useAppSelector } from "~/hooks/redux";
import {
    setSelectedTopics,
    setSelectedDifficulties,
    defaultSettings,
} from "~/store/sheetSettingsSlice";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectContent,
    MultiSelectInput,
    MultiSelectList,
    MultiSelectGroup,
    MultiSelectItem,
} from "~/components/ui/multi-combobox";
import { HashIcon, SignalIcon } from "lucide-react";
import { DIFFICULTIES } from "~/config/constants";

interface SheetFiltersProps {
    sheetSlug: string;
    availableTopics: string[];
}

export function SheetFilters({ sheetSlug, availableTopics }: SheetFiltersProps) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(
        state => state.sheetSettings.sheets[sheetSlug] ?? defaultSettings
    );

    const handleTopicsChange = (topics: string[]) => {
        dispatch(setSelectedTopics({ sheetSlug, topics }));
    };

    const handleDifficultiesChange = (difficulties: string[]) => {
        dispatch(setSelectedDifficulties({ sheetSlug, difficulties }));
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 py-4">
            {/* Topics Filter */}
            {availableTopics.length > 0 && (
                <MultiSelect
                    value={settings.selectedTopics}
                    onValueChange={handleTopicsChange}
                >
                    <MultiSelectTrigger className="flex-shrink-0">
                        <HashIcon size={16} />
                        <MultiSelectValue placeholder="Topics" />
                    </MultiSelectTrigger>
                    <MultiSelectContent>
                        <MultiSelectInput placeholder="Search..." />
                        <MultiSelectList>
                            <MultiSelectGroup>
                                {availableTopics.map(topic => (
                                    <MultiSelectItem key={topic} value={topic}>
                                        {topic}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelectGroup>
                        </MultiSelectList>
                    </MultiSelectContent>
                </MultiSelect>
            )}

            {/* Difficulty Filter */}
            <MultiSelect
                value={settings.selectedDifficulties}
                onValueChange={handleDifficultiesChange}
            >
                <MultiSelectTrigger className="flex-shrink-0">
                    <SignalIcon size={16} />
                    <MultiSelectValue placeholder="Difficulty" />
                </MultiSelectTrigger>
                <MultiSelectContent>
                    <MultiSelectList autoHeight>
                        <MultiSelectGroup>
                            {DIFFICULTIES.map(difficulty => (
                                <MultiSelectItem key={difficulty} value={difficulty}>
                                    {difficulty}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectGroup>
                    </MultiSelectList>
                </MultiSelectContent>
            </MultiSelect>
        </div>
    );
}

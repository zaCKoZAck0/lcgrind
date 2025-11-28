"use client";

import { CalendarDaysIcon, ClockIcon, FilterIcon, LayoutGridIcon, SignalIcon, TagIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/hooks/redux";
import { Slider } from "~/components/ui/slider";
import {
    setWeeks,
    setHoursPerWeek,
    setGroupBy,
    setSelectedTopics,
    setSelectedDifficulties,
    defaultSettings,
    GroupingType
} from "~/store/sheetSettingsSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectItem,
    MultiSelectList,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectGroup,
} from "~/components/ui/multi-combobox";

interface SheetSettingsPanelProps {
    sheetSlug: string;
    availableTopics: string[];
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export function SheetSettingsPanel({ sheetSlug, availableTopics }: SheetSettingsPanelProps) {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(
        state => state.sheetSettings.sheets[sheetSlug] ?? defaultSettings
    );

    const handleWeeksChange = (value: number[]) => {
        dispatch(setWeeks({ sheetSlug, weeks: value[0] }));
    };

    const handleHoursChange = (value: number[]) => {
        dispatch(setHoursPerWeek({ sheetSlug, hoursPerWeek: value[0] }));
    };

    const handleGroupByChange = (value: GroupingType) => {
        dispatch(setGroupBy({ sheetSlug, groupBy: value }));
    };

    const handleTopicsChange = (topics: string[]) => {
        dispatch(setSelectedTopics({ sheetSlug, topics }));
    };

    const handleDifficultiesChange = (difficulties: string[]) => {
        dispatch(setSelectedDifficulties({ sheetSlug, difficulties }));
    };

    return (
        <div className="w-full bg-card border-2 border-border p-4 space-y-5">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CalendarDaysIcon size={18} />
                    Schedule
                </h3>
                <div className="space-y-4 pl-1">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{settings.weeks} week{settings.weeks > 1 ? 's' : ''}</span>
                        </div>
                        <Slider
                            value={[settings.weeks]}
                            onValueChange={handleWeeksChange}
                            min={1}
                            max={24}
                            step={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <ClockIcon size={14} />
                                {settings.hoursPerWeek} hour{settings.hoursPerWeek > 1 ? 's' : ''} per week
                            </span>
                        </div>
                        <Slider
                            value={[settings.hoursPerWeek]}
                            onValueChange={handleHoursChange}
                            min={1}
                            max={20}
                            step={1}
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FilterIcon size={18} />
                    Filters
                </h3>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <SignalIcon size={14} />
                            Difficulty
                        </span>
                        <MultiSelect value={settings.selectedDifficulties} onValueChange={handleDifficultiesChange}>
                            <MultiSelectTrigger className="w-full">
                                <MultiSelectValue placeholder="All difficulties" />
                            </MultiSelectTrigger>
                            <MultiSelectContent>
                                <MultiSelectList autoHeight>
                                    <MultiSelectGroup>
                                        {DIFFICULTIES.map(difficulty => (
                                            <MultiSelectItem key={difficulty} value={difficulty}>
                                                <span className={
                                                    difficulty === 'Easy' ? 'text-green-500' :
                                                    difficulty === 'Medium' ? 'text-yellow-500' :
                                                    'text-red-500'
                                                }>{difficulty}</span>
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelectGroup>
                                </MultiSelectList>
                            </MultiSelectContent>
                        </MultiSelect>
                    </div>
                    {availableTopics.length > 0 && (
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <TagIcon size={14} />
                                Topics
                            </span>
                            <MultiSelect value={settings.selectedTopics} onValueChange={handleTopicsChange}>
                                <MultiSelectTrigger className="w-full">
                                    <MultiSelectValue placeholder="All topics" />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
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
                        </div>
                    )}
                </div>
            </div>
            
            <div className="border-t border-border pt-4 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <LayoutGridIcon size={18} />
                    Group By
                </h3>
                <Select value={settings.groupBy} onValueChange={handleGroupByChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="topic">Topic</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    {settings.groupBy === 'topic' 
                        ? "Problems grouped by their original topic/category"
                        : `Problems divided into ${settings.weeks} week(s) based on ${settings.hoursPerWeek}h/week schedule`
                    }
                </p>
            </div>
        </div>
    );
}

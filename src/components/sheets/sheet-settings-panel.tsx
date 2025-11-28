"use client";

import { CalendarDaysIcon, ClockIcon, LayoutGridIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "~/hooks/redux";
import { Slider } from "~/components/ui/slider";
import {
    setWeeks,
    setHoursPerWeek,
    setGroupBy,
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

interface SheetSettingsPanelProps {
    sheetSlug: string;
}

export function SheetSettingsPanel({ sheetSlug }: SheetSettingsPanelProps) {
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

"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "~/components/ui/card"
import {
    ChartContainer,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

// TypeScript interfaces
interface TagCount {
    name: string;
    value: number;
    fill: string;
}

interface TagsPieChartProps {
    dataStructures: Record<string, number>;
    algorithms: Record<string, number>;
    totalProblemsCount: number;
}

export function TagsPieChart({ dataStructures, algorithms, totalProblemsCount }: TagsPieChartProps) {
    const [chartType, setChartType] = React.useState<"dataStructures" | "algorithms">("algorithms");

    // Transform the data for the charts
    const transformDataToChartData = (data: Record<string, number>): TagCount[] => {
        return Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value], index) => ({
                name,
                value,
                fill: `hsl(var(--chart-${(index % 5) + 1}))`
            }));
    };

    const dsData = React.useMemo(
        () => transformDataToChartData(dataStructures),
        [dataStructures]
    );

    const algoData = React.useMemo(
        () => transformDataToChartData(algorithms),
        [algorithms]
    );

    const totalProblems = React.useMemo(() => {
        const total = chartType === "dataStructures" ? dsData : algoData;
        return total.reduce((acc, item) => acc + item.value, 0);
    }, [chartType, dsData, algoData]);

    // Select appropriate data based on chart type
    const chartData = chartType === "dataStructures" ? dsData : algoData;

    // State for active tag
    const [activeTag, setActiveTag] = React.useState<string>(
        chartData.length > 0 ? chartData[0].name : ""
    );

    React.useEffect(() => {
        // Reset active tag when switching chart types
        if (chartData.length > 0) {
            setActiveTag(chartData[0].name);
        }
    }, [chartType, chartData]);

    const activeIndex = React.useMemo(
        () => chartData.findIndex((item) => item.name === activeTag),
        [activeTag, chartData]
    );

    const tags = React.useMemo(() => chartData.map((item) => item.name), [chartData]);

    // Dynamic chart config
    const generateChartConfig = () => {
        const config: Record<string, { label: string; color: string }> = {};
        chartData.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`
            };
        });
        return config;
    };

    const chartConfig = generateChartConfig();
    const id = "pie-tags";

    return (
        <Card data-chart={id} className="flex flex-col">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="flex-col flex items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <Tabs
                        value={chartType}
                        onValueChange={(value) => setChartType(value as "dataStructures" | "algorithms")}
                        className="w-[400px]"
                    >
                        <TabsList>
                            <TabsTrigger value="dataStructures">Data Structures</TabsTrigger>
                            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                {chartData.length > 0 && (
                    <Select value={activeTag} onValueChange={setActiveTag}>
                        <SelectTrigger
                            className="ml-auto h-7 w-[180px] rounded-lg pl-2.5"
                            aria-label="Select a tag"
                        >
                            <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl">
                            {tags.map((tag) => {
                                const index = chartData.findIndex(item => item.name === tag);
                                return (
                                    <SelectItem
                                        key={tag}
                                        value={tag}
                                        className="rounded-lg [&_span]:flex"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <span
                                                className="flex h-3 w-3 shrink-0 rounded-sm"
                                                style={{
                                                    backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))`
                                                }}
                                            />
                                            {tag}
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                )}
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        {chartData.length > 0 && (
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                activeIndex={activeIndex}
                                activeShape={({
                                    outerRadius = 0,
                                    ...props
                                }: PieSectorDataItem) => (
                                    <g>
                                        <Sector {...props} outerRadius={outerRadius + 10} />
                                        <Sector
                                            {...props}
                                            outerRadius={outerRadius + 25}
                                            innerRadius={outerRadius + 12}
                                        />
                                    </g>
                                )}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex >= 0) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {((chartData[activeIndex]?.value || 0) / totalProblemsCount * 100).toFixed(1)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-sm"
                                                    >
                                                        Problems
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                            </Pie>
                        )}
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

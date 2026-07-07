"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../ui/chart";
import { Card } from "../ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import type { CompanyComp, CompRollupData } from "~/server/actions/companies/getCompanyComp";

const BAND_ORDER = ["0-2", "2-5", "5-8", "8+", "Unknown"];

function money(value: number, currency: string): string {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

const chartConfig = {
    tc_median: { label: "Median TC", color: "var(--chart-1, #7c83ff)" },
    count: { label: "People", color: "var(--chart-1, #7c83ff)" },
} satisfies ChartConfig;

export function CompensationTab({ comp, band = "all" }: { comp: CompanyComp; band?: string }) {
    // Default currency = the one backing the most samples
    const currencies = useMemo(() => {
        const byCount = new Map<string, number>();
        for (const r of comp.rollups) {
            byCount.set(r.currency, (byCount.get(r.currency) ?? 0) + r.n);
        }
        return [...byCount.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    }, [comp.rollups]);

    const [currency, setCurrency] = useState(currencies[0] ?? "INR");

    // The page-level seniority selector pins the exp band; "all" keeps the
    // tab's own exp-band selector active.
    const pinned = band !== "all";
    const rollups = comp.rollups.filter(
        (r) => r.currency === currency && (!pinned || r.expBand === band),
    );
    const curve = comp.curves.find((c) => c.currency === currency);

    const roles = useMemo(
        () => [...new Set(rollups.map((r) => r.roleFamily))],
        [rollups],
    );
    const [role, setRole] = useState<string | null>(null);
    const activeRole = role && roles.includes(role) ? role : (roles[0] ?? null);

    const bands = useMemo(
        () =>
            BAND_ORDER.filter((b) =>
                rollups.some((r) => r.roleFamily === activeRole && r.expBand === b),
            ),
        [rollups, activeRole],
    );
    const [localBand, setLocalBand] = useState<string | null>(null);
    const activeBand = localBand && bands.includes(localBand)
        ? localBand
        : (bands[0] ?? null);

    // Among level variants in the group, show the best-sampled one
    const selected: CompRollupData | undefined = rollups
        .filter((r) => r.roleFamily === activeRole && r.expBand === activeBand)
        .sort((a, b) => b.n - a.n)[0];

    const otherRoles = useMemo(() => {
        const best = new Map<string, CompRollupData>();
        for (const r of rollups) {
            if (r.roleFamily === activeRole) continue;
            const cur = best.get(r.roleFamily);
            if (!cur || r.n > cur.n) best.set(r.roleFamily, r);
        }
        return [...best.values()].sort((a, b) => b.tcMedian - a.tcMedian).slice(0, 8);
    }, [rollups, activeRole]);

    if (rollups.length === 0) {
        return (
            <Card className="p-10 text-center text-muted-foreground/70">
                {pinned
                    ? `No compensation reports in the ${band} yrs range yet.`
                    : "No compensation reports for this company yet."}
            </Card>
        );
    }

    return (
        <div>
            {curve && curve.points.length > 1 && (
                <Card className="mb-8 p-0 gap-0 overflow-hidden">
                    <div className="p-3 border-b-2 border-border bg-main text-main-foreground flex items-center justify-between font-heading">
                        <h2>Experience vs Total Compensation</h2>
                        {currencies.length > 1 && (
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-[100px] bg-card text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <ChartContainer config={chartConfig} className="h-[260px] w-full p-4">
                        <AreaChart data={curve.points}>
                            <CartesianGrid vertical={false} strokeOpacity={0.2} />
                            <XAxis
                                dataKey="exp"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `${v}y`}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={70}
                                tickFormatter={(v) => money(v, currency)}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(_, payload) =>
                                            `${payload?.[0]?.payload?.exp} yrs experience`
                                        }
                                        formatter={(value) => [money(Number(value), currency), " median TC"]}
                                    />
                                }
                            />
                            <Area
                                dataKey="tc_median"
                                type="monotone"
                                fill="var(--color-tc_median)"
                                fillOpacity={0.25}
                                stroke="var(--color-tc_median)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </Card>
            )}

            <Card className="mb-8 p-0 gap-0 overflow-hidden">
                <div className="p-3 border-b-2 border-border bg-main text-main-foreground flex flex-wrap items-center gap-3 font-heading">
                    <h2 className="mr-auto">Pay Distribution</h2>
                    <Select value={activeRole ?? undefined} onValueChange={setRole}>
                        <SelectTrigger className="w-[180px] bg-card text-foreground">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!pinned && (
                        <Select value={activeBand ?? undefined} onValueChange={setLocalBand}>
                            <SelectTrigger className="w-[130px] bg-card text-foreground">
                                <SelectValue placeholder="Experience" />
                            </SelectTrigger>
                            <SelectContent>
                                {bands.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b === "Unknown" ? "Unknown exp" : `${b} yrs`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
                {selected && (
                    <div className="p-4">
                        <div className="flex flex-wrap gap-x-8 gap-y-1 mb-4 text-sm">
                            <span>
                                Median <strong>{money(selected.tcMedian, currency)}</strong>
                            </span>
                            <span className="text-muted-foreground/70">
                                Range {money(selected.tcP25, currency)} – {money(selected.tcP75, currency)} (p25–p75)
                            </span>
                            {selected.baseMedian !== null && (
                                <span className="text-muted-foreground/70">
                                    Base median {money(selected.baseMedian, currency)}
                                </span>
                            )}
                            {selected.level !== "Unspecified" && (
                                <span className="text-muted-foreground/70">{selected.level}</span>
                            )}
                        </div>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart
                                data={selected.tcHistogram.map((b) => ({
                                    ...b,
                                    label: `${money(b.lo, currency)}–${money(b.hi, currency)}`,
                                }))}
                            >
                                <CartesianGrid vertical={false} strokeOpacity={0.2} />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                    tick={{ fontSize: 11 }}
                                />
                                {/* Y axis ticks would print raw counts; the bar silhouette is enough */}
                                <YAxis hide />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(label) => String(label)}
                                            formatter={() => null}
                                            hideIndicator
                                        />
                                    }
                                />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </Card>

            {otherRoles.length > 0 && (
                <Card className="p-0 gap-0 overflow-hidden">
                    <div className="p-3 border-b-2 border-border bg-main text-main-foreground font-heading">
                        <h2>Other Roles</h2>
                    </div>
                    {otherRoles.map((r) => (
                        <button
                            key={r.roleFamily}
                            onClick={() => setRole(r.roleFamily)}
                            className="w-full p-3 border-t-2 first:border-t-0 border-border flex items-center justify-between hover:bg-background transition-colors text-left cursor-pointer"
                        >
                            <span className="font-base">{r.roleFamily}</span>
                            <span className="text-sm text-muted-foreground/70">
                                {money(r.tcMedian, currency)} median
                            </span>
                        </button>
                    ))}
                </Card>
            )}
        </div>
    );
}

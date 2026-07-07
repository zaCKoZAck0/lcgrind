"use client";

import { Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Card } from "~/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    ROUND_TYPES,
    COMP_SUGGESTIONS,
    ROLE_SUGGESTIONS,
    GHOST_DELETE,
    emptyExperience,
    type ExperienceDraft,
} from "./experience-form.shared";
import type { ExperienceFormHook } from "./use-experience-form";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "CAD", "SGD", "AED"];

function SuggestionCard({
    items,
    onSelect,
}: {
    items: { value: string; label: string; prefix?: string }[];
    onSelect: (value: string) => void;
}) {
    return (
        <Card className="absolute top-full left-0 z-50 mt-1 w-full py-0 gap-0 max-h-48 overflow-y-auto shadow-shadow">
            {items.map((item) => (
                <button
                    key={item.value}
                    type="button"
                    onMouseDown={() => onSelect(item.value)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary-background border-b-2 border-border last:border-b-0 transition-colors flex items-center gap-2"
                >
                    {item.prefix && (
                        <span className="text-xs text-muted-foreground shrink-0 w-8 text-right">
                            {item.prefix}
                        </span>
                    )}
                    <span>{item.label}</span>
                </button>
            ))}
        </Card>
    );
}

export function ExperienceList({ form, disabled }: { form: ExperienceFormHook; disabled?: boolean }) {
    return (
        <div className="flex flex-col gap-3">
            {form.experiences.map((exp, ei) => (
                <ExperienceEntry key={ei} ei={ei} exp={exp} form={form} disabled={disabled} />
            ))}
            <button
                type="button"
                onClick={() => form.setExperiences((prev) => [...prev, emptyExperience()])}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-secondary-background transition-colors"
            >
                <Plus className="size-4" />
                Add another company experience
            </button>
        </div>
    );
}

function ExperienceEntry({
    ei,
    exp,
    form,
    disabled,
}: {
    ei: number;
    exp: ExperienceDraft;
    form: ExperienceFormHook;
    disabled?: boolean;
}) {
    return (
        <div className="rounded-base border-2 border-border p-4 flex flex-col gap-5 bg-background">
            {form.experiences.length > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Company {ei + 1}
                    </span>
                    <button
                        type="button"
                        aria-label="Remove this company experience"
                        onClick={() => form.removeExperience(ei)}
                        className={GHOST_DELETE}
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            {/* Company */}
            <div className="relative flex flex-col gap-1.5">
                <Label>Company</Label>
                <Input
                    value={exp.company}
                    onChange={(e) => form.onCompanyChange(ei, e.target.value)}
                    placeholder="e.g. Amazon"
                    autoComplete="off"
                    disabled={disabled}
                />
                {exp.suggestions.length > 0 && (
                    <SuggestionCard
                        items={exp.suggestions.map((name) => ({ value: name, label: name }))}
                        onSelect={(name) => form.selectSuggestion(ei, name)}
                    />
                )}
            </div>

            {/* Role + Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                <div className="relative flex flex-col gap-1.5">
                    <Label>Role</Label>
                    {(() => {
                        const visible = exp.roleSuggestions.length > 0
                            ? exp.roleSuggestions
                            : ROLE_SUGGESTIONS.filter(
                                  (s) => !exp.role.trim() || s.toLowerCase().includes(exp.role.trim().toLowerCase()),
                              );
                        return (
                            <>
                                <Input
                                    value={exp.role}
                                    onChange={(e) => form.onRoleChange(ei, e.target.value)}
                                    placeholder="e.g. Software Engineer"
                                    onFocus={() => form.setActiveRoleKey(ei)}
                                    onBlur={() => setTimeout(() => form.setActiveRoleKey(null), 150)}
                                    autoComplete="off"
                                    disabled={disabled}
                                />
                                {form.activeRoleKey === ei && visible.length > 0 && (
                                    <SuggestionCard
                                        items={visible.map((s) => ({ value: s, label: s }))}
                                        onSelect={(role) => form.selectRole(ei, role)}
                                    />
                                )}
                            </>
                        );
                    })()}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label>Experience (years)</Label>
                    <Input
                        type="number"
                        min={0}
                        max={50}
                        step={0.5}
                        value={exp.expYears}
                        onChange={(e) => form.updateExp(ei, "expYears", e.target.value)}
                        placeholder="e.g. 4.5"
                        className="w-45"
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Rounds */}
            <div className="flex flex-col gap-1.5">
                <Label>Rounds</Label>
                <div className="flex flex-col gap-4 mt-1">
                    {exp.rounds.map((round, ri) => {
                        const roundKey = `${ei}-${ri}`;
                        const filteredRoundTypes = ROUND_TYPES.filter(
                            (t) => !round.type.trim() || t.toLowerCase().includes(round.type.trim().toLowerCase()),
                        );
                        return (
                            <div key={ri} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Round {ri + 1}
                                    </span>
                                    {exp.rounds.length > 1 && (
                                        <button
                                            type="button"
                                            aria-label="Remove round"
                                            onClick={() => form.removeRound(ei, ri)}
                                            className={GHOST_DELETE}
                                            disabled={disabled}
                                        >
                                            <X className="size-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="pl-3 border-l-2 border-border flex flex-col gap-3">
                                    {/* Type */}
                                    <div className="relative flex flex-col gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Type</Label>
                                        <Input
                                            value={round.type}
                                            onChange={(e) => form.updateRoundType(ei, ri, e.target.value)}
                                            placeholder="e.g. Coding, System Design"
                                            onFocus={() => form.setActiveRoundKey(roundKey)}
                                            onBlur={() => setTimeout(() => form.setActiveRoundKey(null), 150)}
                                            disabled={disabled}
                                        />
                                        {form.activeRoundKey === roundKey && filteredRoundTypes.length > 0 && (
                                            <SuggestionCard
                                                items={filteredRoundTypes.map((t) => ({ value: t, label: t }))}
                                                onSelect={(t) => {
                                                    form.updateRoundType(ei, ri, t);
                                                    form.setActiveRoundKey(null);
                                                }}
                                            />
                                        )}
                                    </div>
                                    {/* Questions */}
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-xs text-muted-foreground">Questions</Label>
                                        <div className="flex flex-col gap-2">
                                            {round.questions.map((q, qi) => {
                                                const qKey = `${ei}-${ri}-${qi}`;
                                                const qSuggestions = form.questionSuggestions[qKey] ?? [];
                                                return (
                                                    <div key={qi} className="relative flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                value={q}
                                                                onChange={(e) => form.onQuestionChange(ei, ri, qi, e.target.value)}
                                                                placeholder="Question asked"
                                                                onFocus={() => form.onQuestionFocus(ei, ri, qi)}
                                                                onBlur={() => setTimeout(() => form.setActiveQuestionKey(null), 150)}
                                                                disabled={disabled}
                                                            />
                                                            {form.activeQuestionKey === qKey && qSuggestions.length > 0 && (
                                                                <SuggestionCard
                                                                    items={qSuggestions.map((s) => ({
                                                                        value: s.title,
                                                                        label: s.title,
                                                                        prefix: s.number ? `${s.number}.` : undefined,
                                                                    }))}
                                                                    onSelect={(title) => form.selectQuestion(ei, ri, qi, title)}
                                                                />
                                                            )}
                                                        </div>
                                                        {round.questions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                aria-label="Remove question"
                                                                onClick={() => form.removeQuestion(ei, ri, qi)}
                                                                className={GHOST_DELETE}
                                                                disabled={disabled}
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                type="button"
                                                variant="noShadow"
                                                size="sm"
                                                className="self-start"
                                                onClick={() => form.addQuestion(ei, ri)}
                                                disabled={disabled}
                                            >
                                                <Plus className="size-3.5" />
                                                Add question
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <Button
                        type="button"
                        variant="noShadow"
                        size="sm"
                        className="self-center"
                        onClick={() => form.addRound(ei)}
                        disabled={disabled}
                    >
                        <Plus className="size-4" />
                        Add round
                    </Button>
                </div>
            </div>

            {/* Compensation */}
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <Checkbox
                        checked={exp.compEnabled}
                        onCheckedChange={(v) => form.updateExp(ei, "compEnabled", v === true)}
                        disabled={disabled}
                    />
                    Share compensation (optional)
                </label>
                {exp.compEnabled && (
                    <div className="flex flex-col gap-3 mt-1 pl-6">
                        <div className="flex items-center gap-3">
                            <Label className="shrink-0">Currency</Label>
                            <Select
                                value={exp.comp.currency}
                                onValueChange={(v) => form.updateExp(ei, "comp", { ...exp.comp, currency: v })}
                                disabled={disabled}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Components</Label>
                            <div className="flex flex-col gap-2">
                                {exp.comp.components.map((cc, ci) => {
                                    const compKey = `${ei}-${ci}`;
                                    const filteredComp = COMP_SUGGESTIONS.filter(
                                        (s) => s.toLowerCase().includes(cc.label.toLowerCase()) && s !== cc.label,
                                    );
                                    return (
                                        <div key={ci} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={cc.label}
                                                    onChange={(e) => form.updateCompComponent(ei, ci, "label", e.target.value)}
                                                    placeholder="e.g. Base Pay"
                                                    onFocus={() => form.setActiveCompKey(compKey)}
                                                    onBlur={() => setTimeout(() => form.setActiveCompKey(null), 150)}
                                                    disabled={disabled}
                                                />
                                                {form.activeCompKey === compKey && filteredComp.length > 0 && (
                                                    <SuggestionCard
                                                        items={filteredComp.map((s) => ({ value: s, label: s }))}
                                                        onSelect={(s) => {
                                                            form.updateCompComponent(ei, ci, "label", s);
                                                            form.setActiveCompKey(null);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={cc.amount}
                                                onChange={(e) => form.updateCompComponent(ei, ci, "amount", e.target.value)}
                                                placeholder="Amount"
                                                className="w-32"
                                                disabled={disabled}
                                            />
                                            {exp.comp.components.length > 1 && (
                                                <button
                                                    type="button"
                                                    aria-label="Remove component"
                                                    onClick={() => form.removeCompComponent(ei, ci)}
                                                    className={GHOST_DELETE}
                                                    disabled={disabled}
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <Button
                                type="button"
                                variant="noShadow"
                                size="sm"
                                className="self-start mt-1"
                                onClick={() => form.addCompComponent(ei)}
                                disabled={disabled}
                            >
                                <Plus className="size-4" />
                                Add component
                            </Button>
                        </div>
                        {(() => {
                            const tc = exp.comp.components.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
                            return tc > 0 ? (
                                <p className="text-sm font-semibold">
                                    Total:{" "}
                                    <span className="text-foreground">
                                        {exp.comp.currency} {tc.toLocaleString()}/yr
                                    </span>
                                </p>
                            ) : null;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

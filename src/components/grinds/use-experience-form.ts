"use client";

import { useRef, useState } from "react";
import { searchCompanyNames } from "~/server/actions/submissions/createSubmission";
import { searchRoles, searchQuestions, type QuestionSuggestion } from "~/server/actions/grinds/suggestions";
import { emptyRound, emptyCompComponent, type ExperienceDraft, type CompComponent } from "./experience-form.shared";

export function useExperienceForm(initial: ExperienceDraft[]) {
    const [experiences, setExperiences] = useState<ExperienceDraft[]>(initial);
    const [activeRoundKey, setActiveRoundKey] = useState<string | null>(null);
    const [activeCompKey, setActiveCompKey] = useState<string | null>(null);
    const [activeRoleKey, setActiveRoleKey] = useState<number | null>(null);
    const [questionSuggestions, setQuestionSuggestions] = useState<Record<string, QuestionSuggestion[]>>({});
    const [activeQuestionKey, setActiveQuestionKey] = useState<string | null>(null);

    const suggestTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const roleTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const questionTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const updateExp = <K extends keyof ExperienceDraft>(idx: number, key: K, val: ExperienceDraft[K]) =>
        setExperiences((prev) => prev.map((e, i) => (i === idx ? { ...e, [key]: val } : e)));

    const onCompanyChange = (idx: number, name: string) => {
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, company: name, suggestions: [] } : e)),
        );
        const timer = suggestTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        const q = name.trim();
        if (!q) return;
        suggestTimers.current.set(idx, setTimeout(() => {
            searchCompanyNames(q).then((names) =>
                setExperiences((prev) =>
                    prev.map((e, i) =>
                        i === idx ? { ...e, suggestions: names.filter((n) => n !== e.company) } : e,
                    ),
                ),
            );
        }, 250));
    };

    const selectSuggestion = (idx: number, name: string) => {
        const timer = suggestTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, company: name, suggestions: [] } : e)),
        );
    };

    const onRoleChange = (idx: number, value: string) => {
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, role: value, roleSuggestions: [] } : e)),
        );
        const timer = roleTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        const q = value.trim();
        if (!q) return;
        roleTimers.current.set(idx, setTimeout(() => {
            searchRoles(q).then((results) =>
                setExperiences((prev) =>
                    prev.map((e, i) => (i === idx ? { ...e, roleSuggestions: results } : e)),
                ),
            );
        }, 300));
    };

    const selectRole = (idx: number, role: string) => {
        const timer = roleTimers.current.get(idx);
        if (timer) clearTimeout(timer);
        setExperiences((prev) =>
            prev.map((e, i) => (i === idx ? { ...e, role, roleSuggestions: [] } : e)),
        );
        setActiveRoleKey(null);
    };

    const updateQuestion = (ei: number, ri: number, qi: number, text: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          rounds: e.rounds.map((r, j) =>
                              j === ri
                                  ? { ...r, questions: r.questions.map((q, k) => (k === qi ? text : q)) }
                                  : r,
                          ),
                      }
                    : e,
            ),
        );

    const onQuestionFocus = (ei: number, ri: number, qi: number) => {
        const key = `${ei}-${ri}-${qi}`;
        setActiveQuestionKey(key);
        if (!questionSuggestions[key]?.length) {
            searchQuestions("").then((results) =>
                setQuestionSuggestions((prev) => ({ ...prev, [key]: results })),
            );
        }
    };

    const onQuestionChange = (ei: number, ri: number, qi: number, text: string) => {
        updateQuestion(ei, ri, qi, text);
        const key = `${ei}-${ri}-${qi}`;
        const timer = questionTimers.current.get(key);
        if (timer) clearTimeout(timer);
        questionTimers.current.set(key, setTimeout(() => {
            searchQuestions(text.trim()).then((results) =>
                setQuestionSuggestions((prev) => ({ ...prev, [key]: results })),
            );
        }, 300));
    };

    const selectQuestion = (ei: number, ri: number, qi: number, title: string) => {
        const key = `${ei}-${ri}-${qi}`;
        const t = questionTimers.current.get(key);
        if (t) clearTimeout(t);
        updateQuestion(ei, ri, qi, title);
        setQuestionSuggestions((prev) => ({ ...prev, [key]: [] }));
        setActiveQuestionKey(null);
    };

    const removeExperience = (idx: number) =>
        setExperiences((prev) => prev.filter((_, i) => i !== idx));

    const addRound = (ei: number) =>
        setExperiences((prev) =>
            prev.map((e, i) => (i === ei ? { ...e, rounds: [...e.rounds, emptyRound()] } : e)),
        );

    const removeRound = (ei: number, ri: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei ? { ...e, rounds: e.rounds.filter((_, j) => j !== ri) } : e,
            ),
        );

    const updateRoundType = (ei: number, ri: number, type: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, rounds: e.rounds.map((r, j) => (j === ri ? { ...r, type } : r)) }
                    : e,
            ),
        );

    const addQuestion = (ei: number, ri: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, rounds: e.rounds.map((r, j) => (j === ri ? { ...r, questions: [...r.questions, ""] } : r)) }
                    : e,
            ),
        );

    const removeQuestion = (ei: number, ri: number, qi: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          rounds: e.rounds.map((r, j) =>
                              j === ri ? { ...r, questions: r.questions.filter((_, k) => k !== qi) } : r,
                          ),
                      }
                    : e,
            ),
        );

    const addCompComponent = (ei: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, comp: { ...e.comp, components: [...e.comp.components, emptyCompComponent()] } }
                    : e,
            ),
        );

    const removeCompComponent = (ei: number, ci: number) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? { ...e, comp: { ...e.comp, components: e.comp.components.filter((_, j) => j !== ci) } }
                    : e,
            ),
        );

    const updateCompComponent = (ei: number, ci: number, field: keyof CompComponent, value: string) =>
        setExperiences((prev) =>
            prev.map((e, i) =>
                i === ei
                    ? {
                          ...e,
                          comp: {
                              ...e.comp,
                              components: e.comp.components.map((c, j) =>
                                  j === ci ? { ...c, [field]: value } : c,
                              ),
                          },
                      }
                    : e,
            ),
        );

    return {
        experiences,
        setExperiences,
        activeRoundKey,
        setActiveRoundKey,
        activeCompKey,
        setActiveCompKey,
        activeRoleKey,
        setActiveRoleKey,
        questionSuggestions,
        activeQuestionKey,
        setActiveQuestionKey,
        updateExp,
        onCompanyChange,
        selectSuggestion,
        onRoleChange,
        selectRole,
        onQuestionFocus,
        onQuestionChange,
        selectQuestion,
        removeExperience,
        addRound,
        removeRound,
        updateRoundType,
        addQuestion,
        removeQuestion,
        updateQuestion,
        addCompComponent,
        removeCompComponent,
        updateCompComponent,
    };
}

export type ExperienceFormHook = ReturnType<typeof useExperienceForm>;

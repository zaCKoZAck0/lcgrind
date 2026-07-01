
export type RoundDraft = { type: string; questions: string[] };
export type CompComponent = { label: string; amount: string };
export type ExperienceDraft = {
    company: string;
    suggestions: string[];
    role: string;
    roleSuggestions: string[];
    expYears: string;
    rounds: RoundDraft[];
    compEnabled: boolean;
    comp: { currency: string; components: CompComponent[] };
};

export const ROUND_TYPES = [
    "Phone Screen",
    "Technical Screen",
    "Coding",
    "Take-Home / Assignment",
    "Pair Programming",
    "System Design",
    "Machine Coding / LLD",
    "Bar Raiser",
    "Hiring Manager",
    "Culture Fit",
    "Behavioral",
    "HR",
];

export const COMP_SUGGESTIONS = [
    "Base Pay",
    "Stock / RSU",
    "Joining Bonus",
    "Relocation Bonus",
    "Performance Bonus",
    "Meal Allowance",
    "Internet Allowance",
];

export const ROLE_SUGGESTIONS = [
    "Software Engineer",
    "Senior Software Engineer",
    "SDE-1",
    "SDE-2",
    "SDE-3",
    "Staff Engineer",
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "Data Engineer",
    "ML Engineer",
    "Site Reliability Engineer (SRE)",
    "DevOps Engineer",
    "Product Manager",
    "Data Scientist",
    "Research Engineer",
];

export const GHOST_DELETE =
    "inline-flex items-center justify-center size-5 text-muted-foreground/30 hover:text-foreground transition-colors shrink-0";

export const emptyRound = (): RoundDraft => ({ type: "Coding", questions: [""] });
export const emptyCompComponent = (): CompComponent => ({ label: "", amount: "" });
export const emptyExperience = (): ExperienceDraft => ({
    company: "",
    suggestions: [],
    role: "",
    roleSuggestions: [],
    expYears: "",
    rounds: [emptyRound()],
    compEnabled: false,
    comp: { currency: "INR", components: [emptyCompComponent()] },
});

export function buildStructured(experiences: ExperienceDraft[]) {
    const active = experiences
        .filter((e) => e.company.trim() || e.role.trim())
        .map((e) => ({
            company: e.company.trim(),
            role: e.role.trim() || undefined,
            expYears: e.expYears !== "" ? Number(e.expYears) : undefined,
            rounds: e.rounds
                .filter((r) => r.questions.some((q) => q.trim()))
                .map((r) => ({
                    type: r.type,
                    questions: r.questions.filter((q) => q.trim()).map((text) => ({ text })),
                })),
            comp: (() => {
                if (!e.compEnabled) return undefined;
                const filled = e.comp.components.filter((c) => c.amount.trim());
                if (!filled.length) return undefined;
                const tc = filled.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
                return {
                    currency: e.comp.currency,
                    tc,
                    components: filled
                        .filter((c) => c.label.trim())
                        .map((c) => ({ label: c.label.trim(), amount: Number(c.amount) })),
                };
            })(),
        }));
    return active.length > 0 ? { experiences: active } : undefined;
}

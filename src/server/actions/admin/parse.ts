import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import type { SanitizedExperience } from "./core";

// The model is asked to return exactly the shape the approval normalizer
// consumes (`SanitizedExperience`). We never ask it for — and always strip —
// any link or date, so nothing about the original source can leak through a
// parsed payload.
const rawQuestionSchema = z
    .object({
        text: z.unknown(),
        type: z.unknown().optional(),
    })
    .passthrough();

const rawRoundSchema = z
    .object({
        type: z.unknown().optional(),
        questions: z.array(rawQuestionSchema).optional(),
    })
    .passthrough();

const rawPayloadSchema = z
    .object({
        role: z.unknown().optional(),
        level: z.unknown().optional(),
        expYears: z.unknown().optional(),
        rounds: z.array(rawRoundSchema).optional(),
        comp: z
            .object({
                currency: z.unknown().optional(),
                base: z.unknown().optional(),
                tc: z.unknown().optional(),
            })
            .passthrough()
            .nullish(),
    })
    .passthrough();

function asString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const n = Number(value.replace(/[,$\s]/g, ""));
        if (Number.isFinite(n)) return n;
    }
    return undefined;
}

export function coerceParsedPayload(raw: unknown): SanitizedExperience | null {
    const parsed = rawPayloadSchema.safeParse(raw);
    if (!parsed.success) return null;
    const data = parsed.data;

    const rounds: NonNullable<SanitizedExperience["rounds"]> = [];
    for (const round of data.rounds ?? []) {
        const questions: NonNullable<
            NonNullable<SanitizedExperience["rounds"]>[number]["questions"]
        > = [];
        for (const q of round.questions ?? []) {
            const text = asString(q.text);
            if (!text) continue;
            // Deliberately omit any link the model may have invented.
            questions.push({ text, type: asString(q.type) });
        }
        if (questions.length === 0) continue;
        rounds.push({ type: asString(round.type) ?? "Other", questions });
    }

    let comp: SanitizedExperience["comp"];
    const tc = asNumber(data.comp?.tc);
    const currency = asString(data.comp?.currency);
    if (tc !== undefined && tc > 0 && currency) {
        comp = {
            currency: currency.toUpperCase(),
            base: asNumber(data.comp?.base) ?? null,
            tc,
        };
    }

    if (rounds.length === 0 && comp === undefined) return null;

    return {
        role: asString(data.role),
        level: asString(data.level),
        expYears: asNumber(data.expYears) ?? null,
        rounds,
        comp,
    };
}

export function buildParsePrompt(companyName: string, rawText: string): string {
    return [
        "You extract structured interview-experience data from a free-text report.",
        `The report is about an interview at: ${companyName}.`,
        "",
        "Return ONLY JSON matching this shape:",
        "{",
        '  "role": string|null,            // candidate role / title',
        '  "level": string|null,           // leveling band if stated (e.g. L4, SDE2)',
        '  "expYears": number|null,        // years of experience if stated',
        '  "rounds": [                      // one entry per interview round mentioned',
        '    { "type": string,            // e.g. Coding, System Design, Behavioral',
        '      "questions": [ { "text": string, "type": string } ] }',
        "  ],",
        '  "comp": { "currency": string, "base": number|null, "tc": number|null } | null',
        "}",
        "",
        "Rules:",
        "- Do not invent links, URLs, dates, post IDs, or any source attribution.",
        "- Only include facts present in the report; use null / omit when unknown.",
        "- Keep question text concise and paraphrased; no candidate names.",
        "",
        "Report:",
        rawText,
    ].join("\n");
}

export type GenerateFn = (prompt: string) => Promise<string>;

function extractJson(text: string): unknown {
    const trimmed = text.trim();
    // Tolerate a ```json ... ``` fence around the payload.
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenced ? fenced[1] : trimmed;
    try {
        return JSON.parse(candidate);
    } catch {
        // Last resort: grab the outermost object braces.
        const start = candidate.indexOf("{");
        const end = candidate.lastIndexOf("}");
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(candidate.slice(start, end + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
}

export async function parseWithGenerator(
    companyName: string,
    rawText: string,
    generate: GenerateFn,
): Promise<SanitizedExperience | null> {
    const prompt = buildParsePrompt(companyName, rawText);
    const output = await generate(prompt);
    return coerceParsedPayload(extractJson(output));
}

export function geminiAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY?.trim());
}

const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

// Real Gemini generator. Imported lazily so the SDK never loads (and the key is
// never required) unless an admin explicitly triggers a parse.
export async function geminiGenerate(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0 },
    });
    return response.text ?? "";
}

export async function parseWithGemini(
    companyName: string,
    rawText: string,
): Promise<SanitizedExperience | null> {
    return parseWithGenerator(companyName, rawText, geminiGenerate);
}

export type ParseItemResult = { id: string; ok: boolean; error?: string };

// Orchestrates a batch parse: one model call per submission that has text,
// each isolated so a single failure never aborts the batch. Only submissions
// that parse cleanly are written and advanced to PARSED.
export async function parseSubmissionsCore(
    db: PrismaClient,
    ids: string[],
    generate: GenerateFn,
): Promise<ParseItemResult[]> {
    const results: ParseItemResult[] = [];
    for (const id of ids) {
        try {
            const submission = await db.submission.findUnique({
                where: { id },
                select: { id: true, companyName: true, rawText: true },
            });
            if (!submission) {
                results.push({ id, ok: false, error: "Submission not found" });
                continue;
            }
            const rawText = submission.rawText?.trim() ?? "";
            if (rawText.length === 0) {
                results.push({ id, ok: false, error: "No text to parse" });
                continue;
            }
            const parsed = await parseWithGenerator(
                submission.companyName,
                rawText,
                generate,
            );
            if (parsed === null) {
                results.push({
                    id,
                    ok: false,
                    error: "Could not extract structured data",
                });
                continue;
            }
            await db.submission.update({
                where: { id },
                data: { parsed: parsed as object, status: "PARSED" },
            });
            results.push({ id, ok: true });
        } catch (err) {
            results.push({
                id,
                ok: false,
                error: err instanceof Error ? err.message : "Parse failed",
            });
        }
    }
    return results;
}

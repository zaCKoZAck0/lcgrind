import { Sheet } from "~/components/sheets/sheet-page";
import { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { db } from "~/lib/db";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { getSheetProblems } from "~/server/actions/sheets/getSheetProblems";
import { getSheetMetadata } from "~/server/actions/sheets/getSheetMetadata";

export const revalidate = 86400;

// Pre-render all sheet pages at build time (relatively few sheets)
export async function generateStaticParams() {
    const sheets = await db.sheet.findMany({
        where: { isCompany: false },
        select: { slug: true },
    });

    return sheets.map((sheet) => ({
        'sheet-slug': sheet.slug,
    }));
}

interface SheetParams {
    "sheet-slug": string;
}

type Props = {
    params: Promise<SheetParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { "sheet-slug": sheetSlug } = await params;
    
    const sheet = await db.sheet.findFirst({
        where: { slug: sheetSlug },
        select: { name: true, description: true, ownerName: true },
    });

    if (!sheet) {
        return {
            title: "Sheet Not Found",
        };
    }

    const pageTitle = `${sheet.name} | DSA Sheet for Interview Preparation`;
    const pageDescription = sheet.description || `Practice ${sheet.name} problems by ${sheet.ownerName}. A curated list of coding problems for interview preparation.`;
    const pageUrl = `${BASE_URL}/sheets/${sheetSlug}`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: [
            sheet.name.toLowerCase(),
            `${sheet.name.toLowerCase()} problems`,
            `${sheet.name.toLowerCase()} leetcode`,
            "dsa sheet",
            "interview preparation",
            "coding practice",
            "leetcode problems",
            sheet.ownerName.toLowerCase(),
        ],
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: pageDescription,
        },
    };
}

export default async function SheetsPage({ params }: Props) {
    const { "sheet-slug": sheetSlug } = await params;

    const sheetExists = await db.sheet.findFirst({
        where: { slug: sheetSlug },
        select: { name: true },
    });

    if (!sheetExists) {
        notFound();
    }

    // Server-fetch initial data for SSR
    const [initialProblems, initialSheet] = await Promise.all([
        getSheetProblems(sheetSlug),
        getSheetMetadata(sheetSlug),
    ]);

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", url: BASE_URL },
                { name: "DSA Sheets", url: `${BASE_URL}/sheets` },
                { name: sheetExists.name, url: `${BASE_URL}/sheets/${sheetSlug}` },
            ]} />
            <Sheet
                slug={sheetSlug}
                initialProblems={initialProblems}
                initialSheet={initialSheet}
            />
        </>
    );
}
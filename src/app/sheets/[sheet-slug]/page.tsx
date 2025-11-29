import { Sheet } from "~/components/sheets/sheet-page";
import { Metadata } from "next";
import { BASE_URL } from "~/config/constants";
import { db } from "~/lib/db";

export const revalidate = 86400;

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
            card: "summary",
            title: pageTitle,
            description: pageDescription,
        },
    };
}

export default function SheetsPage() {
    return (<Sheet />);
}
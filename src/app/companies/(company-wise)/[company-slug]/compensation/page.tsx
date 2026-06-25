import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CANONICAL_URL } from "~/config/constants";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { getCompanyComp, type CompanyComp } from "~/server/actions/companies/getCompanyComp";
import { db } from "~/lib/db";
import { BreadcrumbJsonLd, FAQJsonLd } from "~/components/seo/json-ld";
import { CompanyHeader } from "~/components/company/company-header";
import { CompensationTab } from "~/components/company/compensation-tab";
import { buttonVariants } from "~/components/ui/button";

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
    return [];
}

type Props = {
    params: Promise<{ "company-slug": string }>;
};

async function getCompanyBySlug(slug: string) {
    if (slug === "other") return null;
    return db.company.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, reportCount: true, lastSeen: true, payTier: true, difficultyTier: true },
    });
}

function hasEnoughCompData(comp: CompanyComp): boolean {
    const totalN = comp.rollups.reduce((sum, r) => sum + r.n, 0);
    return totalN >= 5;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if (!FEATURE_FLAGS.COMPENSATION) return { title: "Not Found" };
    const { "company-slug": slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) return { title: "Not Found" };

    const year = new Date().getFullYear();
    const pageTitle = `${company.name} Software Engineer Salary & Compensation [${year}]`;
    const pageDescription = `Real ${company.name} software engineer compensation data from community reports. Base salary, total comp, and equity by role and experience level.`;
    const pageUrl = `${CANONICAL_URL}/companies/${company.slug}/compensation`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: [
            `${company.name} salary`,
            `${company.name} compensation`,
            `${company.name} software engineer salary`,
            `${company.name} total compensation`,
            `${company.name} L3 salary`,
            `${company.name} L4 salary`,
            `software engineer salary`,
        ],
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: pageDescription,
        },
    };
}

export default async function CompanyCompensationPage({ params }: { params: Promise<{ "company-slug": string }> }) {
    if (!FEATURE_FLAGS.COMPENSATION) notFound();

    const { "company-slug": slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) notFound();

    const comp = await getCompanyComp(slug);
    if (!hasEnoughCompData(comp)) notFound();

    const pageUrl = `${CANONICAL_URL}/companies/${slug}/compensation`;

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", url: CANONICAL_URL },
                { name: "Companies", url: `${CANONICAL_URL}/companies` },
                { name: company.name, url: `${CANONICAL_URL}/companies/${slug}` },
                { name: "Salary & Compensation", url: pageUrl },
            ]} />
            <FAQJsonLd items={[
                {
                    question: `How much does ${company.name} pay software engineers?`,
                    answer: `${company.name} software engineer compensation varies by role and experience. See the breakdown below based on community-reported data.`,
                },
                {
                    question: `What is ${company.name} total compensation?`,
                    answer: `${company.name} total compensation includes base salary and equity. The exact amount depends on level, role, and years of experience.`,
                },
            ]} />
            <div className="w-full max-w-[1000px] py-6">
                <div className="mb-12 shadow-shadow">
                    <div className="p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground">
                        <Link className={buttonVariants({ variant: 'neutral', size: 'sm' })} href={`/companies/${slug}`}>
                            <ArrowLeft />{company.name}
                        </Link>
                    </div>
                    <CompanyHeader
                        name={company.name}
                        slug={company.slug}
                        payTier={0}
                        difficultyTier={0}
                        headingFull={`${company.name} Salary & Compensation`}
                    />
                </div>
                <CompensationTab comp={comp} />
            </div>
        </>
    );
}

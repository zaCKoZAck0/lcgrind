import { type CompanyParams } from "~/types/company";
import type { Metadata } from "next";
import { CANONICAL_URL } from "~/config/constants";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "~/components/seo/json-ld";
import { CompanyHeader } from "~/components/company/company-header";
import { InterviewTabs } from "~/components/company/interview-tabs";
import { QuestionSections } from "~/components/company/question-sections";
import { CompensationTab } from "~/components/company/compensation-tab";
import { BandSelector, isBand } from "~/components/company/band-selector";
import { getAvailableBands, getCompanyInterviews } from "~/server/actions/companies/getCompanyInterviews";
import { getCompanyComp } from "~/server/actions/companies/getCompanyComp";
import type { TierLevel } from "~/utils/company-tiers";
import { buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { db } from "~/lib/db";
import { getFeed } from "~/server/actions/grinds/feed";
import { PostCard } from "~/components/grinds/post-card";
import { FEATURE_FLAGS } from "~/config/feature-flags";
import { getCategoryCountsForCompany } from "~/server/actions/companies/getCompanyCategoryCounts";
import { MIN_CATEGORY_QUESTIONS, getEnabledCategorySlugs } from "~/config/categories";

type Props = {
    params: Promise<CompanyParams>;
};

export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render all company pages at build time
export async function generateStaticParams() {
    // Pre-render only companies that carry interview data; empty sheet-derived
    // shells still resolve on demand (empty state) but aren't pre-built. The
    // "other" placeholder bucket is excluded from the browsable set.
    const companies = await db.company.findMany({
        where: { reportCount: { gt: 0 }, slug: { not: "other" } },
        select: { slug: true },
    });

    return companies.map((company) => ({
        'company-slug': company.slug,
    }));
}

async function getCompanyBySlug(slug: string) {
    // "other" is the catch-all bucket for placeholder employer names — hidden
    // from listing/sitemap/static-params; treat direct nav as not-found too.
    if (slug === "other") return null;
    return db.company.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
            reportCount: true,
            lastSeen: true,
            payTier: true,
            difficultyTier: true,
        },
    });
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { 'company-slug': companySlug } = await params;
    const company = await getCompanyBySlug(companySlug);

    if (!company) {
        return {
            title: "Company Not Found",
        };
    }

    const companyName = company.name;
    const currentYear = new Date().getFullYear();
    // Cap title to ~60 chars to prevent SERP truncation
    const shortTitle = `${companyName} Interview Questions & Process [${currentYear}]`;
    const pageTitle = shortTitle.length > 60
        ? `${companyName} Interview Questions [${currentYear}]`
        : shortTitle;
    const pageDescription = `Real ${companyName} interview experiences: questions and compensation insights to prepare for your ${companyName} interview.`;
    const pageUrl = `${CANONICAL_URL}/companies/${companySlug}`;

    const keywords = [
        `${companyName} interview questions`,
        `${companyName} interview process`,
        `${companyName} coding questions`,
        `${companyName} compensation`,
        `prepare for ${companyName} interview`,
        "coding interview",
        "interview experience",
        companyName,
    ];

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: keywords,
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

export default async function CompanyInterviews({
    params,
    searchParams,
}: {
    params: Promise<CompanyParams>;
    searchParams: Promise<{ band?: string }>;
}) {
    const [{ 'company-slug': slug }, { band: bandParam }] = await Promise.all([
        params,
        searchParams,
    ]);
    const company = await getCompanyBySlug(slug);

    if (!company) {
        notFound();
    }

    const band = isBand(bandParam) ? bandParam : "all";

    const sections = company.reportCount > 0 ? await getCompanyInterviews(slug, band) : null;
    const availableBands = company.reportCount > 0 ? await getAvailableBands(slug) : [];

    const categoryCounts = company.reportCount > 0
        ? await getCategoryCountsForCompany(slug)
        : {};
    const enabledCategorySlugs = getEnabledCategorySlugs();
    const enabledCategories = enabledCategorySlugs.filter(
        (cat) => (categoryCounts[cat] ?? 0) >= MIN_CATEGORY_QUESTIONS
    );
    
    let comp: Awaited<ReturnType<typeof getCompanyComp>> | null = null;
    if (company.reportCount > 0 && FEATURE_FLAGS.COMPENSATION) {
        comp = await getCompanyComp(slug);
    }
    
    let experienceFeed: { posts: any[]; nextCursor: string | null } = { posts: [], nextCursor: null };
    if (company.reportCount > 0 && FEATURE_FLAGS.GRINDS) {
        experienceFeed = await getFeed(db, { type: "EXPERIENCE", companyId: company.id, sort: "new", limit: 20 });
    }
    
    const hasQuestions = sections !== null
        && Object.values(sections).some((list) => list.length > 0);
    const hasComp = FEATURE_FLAGS.COMPENSATION && comp !== null && comp.rollups.length > 0;
    const hasExperiences = FEATURE_FLAGS.GRINDS && experienceFeed.posts.length > 0;
    const hasData = hasQuestions || hasComp;

    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", url: CANONICAL_URL },
                { name: "Companies", url: `${CANONICAL_URL}/companies` },
                { name: company.name, url: `${CANONICAL_URL}/companies/${slug}` },
            ]} />
            <div className="w-full max-w-[1000px] py-6">
                <div className="mb-12 shadow-shadow">
                    <div className="p-3 border-2 border-border bg-card flex justify-between items-center bg-main text-main-foreground">
                        <Link
                            className={buttonVariants({ variant: 'neutral', size: 'sm' })}
                            href="/companies"
                        >
                            <ArrowLeft />All Companies
                        </Link>
                        {FEATURE_FLAGS.GRINDS && FEATURE_FLAGS.LOGIN && (
                            <Link
                                className={buttonVariants({ variant: 'neutral', size: 'sm' })}
                                href={`/grinds/new?experience=true&company=${encodeURIComponent(company.name)}`}
                            >
                                <MessageSquarePlus />Share your experience
                            </Link>
                        )}
                    </div>
                    <CompanyHeader
                        name={company.name}
                        slug={company.slug}
                        payTier={FEATURE_FLAGS.COMPENSATION ? (company.payTier as TierLevel) : 0}
                        difficultyTier={company.difficultyTier as TierLevel}
                    />
                </div>

                {hasData && sections ? (
                    <>
                        <div className="mb-4 flex justify-end">
                            <BandSelector slug={slug} active={band} available={availableBands} />
                        </div>
                        <InterviewTabs
                            interviews={
                                hasQuestions ? (
                                    <QuestionSections
                                        sections={sections}
                                        companyName={company.name}
                                        companySlug={slug}
                                        enabledCategories={enabledCategories}
                                    />
                                ) : (
                                    <Card className="p-10 text-center text-muted-foreground/70">
                                        No interview questions reported
                                        {band !== "all" ? ` in the ${band} yrs range` : ""} for {company.name} yet.
                                    </Card>
                                )
                            }
                            compensation={FEATURE_FLAGS.COMPENSATION ? <CompensationTab comp={comp!} band={band} /> : undefined}
                            experiences={FEATURE_FLAGS.GRINDS ? (
                                hasExperiences ? (
                                    <div className="flex flex-col gap-4">
                                        {experienceFeed.posts.map((post) => (
                                            <PostCard key={post.id} post={post} />
                                        ))}
                                        {experienceFeed.nextCursor && (
                                            <Link
                                                href={`/grinds?type=EXPERIENCE&company=${encodeURIComponent(company.name)}`}
                                                className="text-sm text-center text-muted-foreground hover:underline"
                                            >
                                                View all experiences on Discuss
                                            </Link>
                                        )}
                                    </div>
                                    ) : (
                                    <Card className="p-10 items-center gap-3 text-center">
                                        <MessageSquarePlus className="size-10 text-muted-foreground/50" />
                                        <p className="text-muted-foreground/70">
                                            No interview experiences shared for {company.name} yet.
                                        </p>
                                        {FEATURE_FLAGS.LOGIN && (
                                            <Link
                                                className={buttonVariants({ size: 'sm' })}
                                                href={`/grinds/new?experience=true&company=${encodeURIComponent(company.name)}`}
                                            >
                                                <MessageSquarePlus />Share your experience
                                            </Link>
                                        )}
                                    </Card>
                                )
                            ) : undefined}
                        />
                    </>
                ) : (
                    <Card className="p-10 items-center gap-3 text-center">
                        <MessageSquarePlus className="size-10 text-muted-foreground/50" />
                        <h2 className="font-semibold text-xl">No experiences yet</h2>
                        <p className="text-muted-foreground/70 max-w-[480px]">
                            Interviewed at {company.name}? Share your experience to help others prepare.
                        </p>
                        {FEATURE_FLAGS.GRINDS && FEATURE_FLAGS.LOGIN && (
                            <Link
                                className={buttonVariants({ size: 'sm' })}
                                href={`/grinds/new?experience=true&company=${encodeURIComponent(company.name)}`}
                            >
                                <MessageSquarePlus />Share your experience
                            </Link>
                        )}
                    </Card>
                )}
            </div>
        </>
    );
}

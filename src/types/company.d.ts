export type SearchParams = {
  sort?: string;
  order?: string;
  tags?: string | string[];
  search?: string;
};

export type CompanyParams = {
  'company-slug': string;
};

export interface TotalCountResult {
  count: number;
}

export interface CompanyDetails {
  name: string;
  slug: string;
  /** Boolean only: raw report counts never leave the server. */
  hasReports: boolean;
  lastSeen: string | null;
  hasComp: boolean;
  payTier: import("~/utils/company-tiers").TierLevel;
  /** Distinct DSA problems by difficulty — the problem set is public. */
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export type TSheetProblem = SheetProblem & {
  problem: Problem & {
    topicTags: {
      topicTagId: number;
      topicTag: {
        id: number;
        name: string;
        slug: string;
      };
    }[];
  };
};

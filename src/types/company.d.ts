export type SearchParams = {
  sort?: string;
  order?: string;
  tags?: string | string[];
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
  numOfProblems: number;
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

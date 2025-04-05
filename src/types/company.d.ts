export type SearchParams = {
  sort?: string;
  order?: string;
};

export type CompanyParams = {
  'company-slug': string;
};

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

import { COMPANIES } from "~/config/constants";

const SPACES_RE = / /g;
const NON_WORD_RE = /[^\w-]+/g;

export const generateSlug = (name: string): string =>
  name.toLowerCase().replace(SPACES_RE, "-").replace(NON_WORD_RE, "");

export const getCompanyNameFromSlug = (slug: string): string | undefined => {
  return Object.keys(COMPANIES).find((company) => generateSlug(company) === slug);
};
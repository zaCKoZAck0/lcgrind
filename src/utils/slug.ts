import { COMPANIES } from "~/config/constants";

export const generateSlug = (name: string): string =>
  name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

export const getCompanyNameFromSlug = (slug: string): string | undefined => {
  return Object.keys(COMPANIES).find((company) => generateSlug(company) === slug);
};
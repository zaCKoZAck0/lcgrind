import { Sheet } from "~/components/sheets/sheet-page";
import { DEFAULT_REVALIDATION } from "~/config/constants";

export const revalidate = DEFAULT_REVALIDATION;

export default function SheetsPage() {
    return (<Sheet />);
}
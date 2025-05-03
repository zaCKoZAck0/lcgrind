import { Sheet } from "~/components/sheets/sheet-page";

export const revalidate = 3600 * 24;

export default function SheetsPage() {
    return (<Sheet />);
}
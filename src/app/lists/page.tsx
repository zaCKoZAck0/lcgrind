import type { Metadata } from "next";
import { ListsIndexPage } from "~/components/lists/lists-index";

export const metadata: Metadata = {
  title: "Solvelists – LC Grind",
  description: "Your custom Solvelists for LeetCode practice",
};

export default function Page() {
  return <ListsIndexPage />;
}

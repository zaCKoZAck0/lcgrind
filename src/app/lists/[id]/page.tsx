import type { Metadata } from "next";
import { ListEditorPage } from "~/components/lists/list-editor";

export const metadata: Metadata = {
  title: "Edit List – LC Grind",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListEditorPage id={id} />;
}

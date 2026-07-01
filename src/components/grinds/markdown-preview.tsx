"use client";

import { renderMarkdown } from "~/utils/markdown";

// Split out so the markdown parser (unified/remark/rehype) is code-split into
// its own chunk and only fetched when a MarkdownField preview is toggled on,
// instead of shipping with every composer/comment form.
export default function MarkdownPreview({
  value,
  className,
}: {
  value: string;
  className: string;
}) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
  );
}

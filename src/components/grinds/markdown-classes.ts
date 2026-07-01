// Shared Tailwind class strings that style rendered markdown ("markdown-body").
// Used by the post page, comment thread, and the live preview in MarkdownField
// so authored content and its preview look identical.

export const POST_MD =
    "markdown-body break-words text-[15px] leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-base [&_code]:bg-secondary-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-border [&_pre]:bg-secondary-background [&_pre]:p-3 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground";

export const COMMENT_MD =
    "markdown-body break-words text-sm leading-relaxed [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-base [&_code]:bg-secondary-background [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:border-2 [&_pre]:border-border [&_pre]:bg-secondary-background [&_pre]:p-2 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic";

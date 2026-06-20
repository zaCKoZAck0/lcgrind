import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

import { isProvenanceLink } from "~/server/actions/posts/publish-gate";

// Protocols a link href may use after rendering. Everything else (javascript:,
// data:, vbscript:, …) is neutralized to plain text.
const SAFE_LINK_PROTOCOL = /^(https?:|mailto:)/i;

// hast transform run BEFORE sanitize. Three jobs, all defense-in-depth so the
// rendered HTML can never carry a live unsafe/provenance link or an image:
//   - external links get rel="nofollow ugc" + a safe target
//   - provenance-shaped or non-http(s) links are stripped to their text
//   - images are removed entirely (no embeds in v1)
function rehypeDiscussLinks() {
    return (tree: Root) => {
        visit(tree, "element", (node: Element, index, parent) => {
            if (node.tagName === "img" && parent && typeof index === "number") {
                parent.children.splice(index, 1);
                return index; // re-visit the node now at this position
            }

            if (node.tagName === "a") {
                const href = node.properties?.href;
                const url = typeof href === "string" ? href : "";
                const unsafe =
                    !SAFE_LINK_PROTOCOL.test(url) || isProvenanceLink(url);

                if (unsafe) {
                    // Drop the anchor, keep its text content in place.
                    if (parent && typeof index === "number") {
                        parent.children.splice(index, 1, ...node.children);
                        return index;
                    }
                    return;
                }

                node.properties = {
                    ...node.properties,
                    rel: "nofollow ugc",
                    target: "_blank",
                };
            }
        });
    };
}

// Tightened sanitize schema: the default allowlist, minus images, plus the
// rel/target we set on links and the language-* class on code blocks.
const schema = {
    ...defaultSchema,
    tagNames: (defaultSchema.tagNames ?? []).filter((t) => t !== "img"),
    attributes: {
        ...defaultSchema.attributes,
        a: [...(defaultSchema.attributes?.a ?? []), "rel", "target"],
        code: [...(defaultSchema.attributes?.code ?? []), "className"],
    },
};

const processor = unified()
    .use(remarkParse)
    .use(remarkRehype) // allowDangerousHtml defaults false → raw HTML dropped
    .use(rehypeDiscussLinks)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify);

// Renders a post/comment body (CommonMark subset + fenced code) to sanitized
// HTML. Shared by the post page and the comment thread — pure and synchronous.
export function renderMarkdown(src: string): string {
    return String(processor.processSync(src ?? ""));
}

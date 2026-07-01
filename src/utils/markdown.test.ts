import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";

describe("renderMarkdown — formatting", () => {
    it("renders a CommonMark subset (bold, headings, paragraphs)", () => {
        const html = renderMarkdown("# Title\n\nSome **bold** text.");
        expect(html).toContain("<h1>Title</h1>");
        expect(html).toContain("<strong>bold</strong>");
    });

    it("renders fenced code blocks with a language class", () => {
        const html = renderMarkdown("```js\nconst x = 1;\n```");
        expect(html).toContain("<pre>");
        expect(html).toContain("<code");
        expect(html).toContain("const x = 1;");
        expect(html).toContain("language-js");
    });

    it("renders inline code", () => {
        const html = renderMarkdown("Use `useMemo` here.");
        expect(html).toContain("<code>useMemo</code>");
    });
});

describe("renderMarkdown — sanitization", () => {
    it("strips raw <script> tags (any leftover text is inert)", () => {
        const html = renderMarkdown("hi <script>alert(1)</script> there");
        // No executable element survives — only escaped paragraph text remains.
        expect(html).not.toContain("<script");
        expect(html).toContain("<p>");
    });

    it("strips inline event handlers and raw HTML tags", () => {
        const html = renderMarkdown('<div onclick="steal()">x</div>');
        expect(html).not.toContain("onclick");
        expect(html).not.toContain("<div");
    });

    it("drops javascript: URIs on links", () => {
        const html = renderMarkdown("[click](javascript:alert(1))");
        expect(html).not.toContain("javascript:");
    });
});

describe("renderMarkdown — links", () => {
    it("marks external links rel=\"nofollow ugc\" and opens safely", () => {
        const html = renderMarkdown("[docs](https://example.com/guide)");
        expect(html).toContain('href="https://example.com/guide"');
        expect(html).toContain('rel="nofollow ugc"');
    });
});

describe("renderMarkdown — images", () => {
    it("renders no <img> for image markdown in v1", () => {
        const html = renderMarkdown("![alt](https://example.com/cat.png)");
        expect(html).not.toContain("<img");
    });
});

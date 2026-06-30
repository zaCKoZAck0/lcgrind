import { describe, it, expect } from "vitest";
import { stripMarkdown, shouldNoindexPost } from "./grinds-seo";

describe("stripMarkdown", () => {
  it("strips bold markers", () => {
    expect(stripMarkdown("**bold** text")).toBe("bold text");
  });
  it("strips italic markers", () => {
    expect(stripMarkdown("*italic* and _also_")).toBe("italic and also");
  });
  it("strips nested bold+italic", () => {
    expect(stripMarkdown("**bold *italic* text**")).toBe("bold italic text");
  });
  it("strips headings", () => {
    expect(stripMarkdown("## My Heading")).toBe("My Heading");
  });
  it("strips inline code", () => {
    expect(stripMarkdown("use `Array.sort()` here")).toBe("use Array.sort() here");
  });
  it("strips fenced code blocks", () => {
    expect(stripMarkdown("text\n```js\nconst x = 1;\n```\nmore")).toBe("text more");
  });
  it("strips blockquotes", () => {
    expect(stripMarkdown("> quoted line")).toBe("quoted line");
  });
  it("strips links, keeps text", () => {
    expect(stripMarkdown("[click here](https://example.com)")).toBe("click here");
  });
  it("strips images", () => {
    expect(stripMarkdown("![alt](img.png) text")).toBe("text");
  });
  it("collapses whitespace", () => {
    expect(stripMarkdown("a\n\nb")).toBe("a b");
  });
  it("handles plain text unchanged", () => {
    expect(stripMarkdown("just plain text")).toBe("just plain text");
  });
});

describe("shouldNoindexPost", () => {
  it("noindexes non-published posts", () => {
    expect(shouldNoindexPost({ status: "PENDING", body: "x".repeat(100), score: 0 })).toBe(true);
  });
  it("noindexes thin body", () => {
    expect(shouldNoindexPost({ status: "PUBLISHED", body: "short", score: 0 })).toBe(true);
  });
  it("noindexes heavily downvoted", () => {
    expect(shouldNoindexPost({ status: "PUBLISHED", body: "x".repeat(100), score: -5 })).toBe(true);
  });
  it("indexes healthy posts", () => {
    expect(shouldNoindexPost({ status: "PUBLISHED", body: "x".repeat(100), score: 1 })).toBe(false);
  });
});

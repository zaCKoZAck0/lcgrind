import { describe, expect, it } from "vitest";
import {
  getStatWindowColumn,
  getAggregatedOrderByClause,
  getAggregatedWhereClause,
} from "./sorting";

describe("getStatWindowColumn", () => {
  it("maps each window order to its CompanyQuestionStat column", () => {
    expect(getStatWindowColumn("monthly")).toBe("ask30d");
    expect(getStatWindowColumn("three-months")).toBe("ask90d");
    expect(getStatWindowColumn("six-months")).toBe("ask180d");
    expect(getStatWindowColumn("yearly")).toBe("ask365d");
  });

  it("falls back to the all-time askCount for all-problems / all / unknown", () => {
    expect(getStatWindowColumn("all-problems")).toBe("askCount");
    expect(getStatWindowColumn("all")).toBe("askCount");
    expect(getStatWindowColumn("")).toBe("askCount");
    expect(getStatWindowColumn("garbage")).toBe("askCount");
  });
});

describe("getAggregatedOrderByClause", () => {
  it("orders frequency by the aggregated window sum, NULLS LAST", () => {
    expect(getAggregatedOrderByClause("frequency")).toBe(
      `agg."order" DESC NULLS LAST, p.id`,
    );
  });

  it("orders recency by the aggregated max lastAsked, NULLS LAST", () => {
    expect(getAggregatedOrderByClause("recency")).toBe(
      `agg."recency" DESC NULLS LAST, p.id`,
    );
  });

  it("keeps the legacy non-aggregated sorts unchanged", () => {
    expect(getAggregatedOrderByClause("acceptance")).toBe(
      `p.acceptance DESC NULLS LAST, p.id`,
    );
    expect(getAggregatedOrderByClause("difficulty")).toBe(`p."difficultyOrder", p.id`);
    expect(getAggregatedOrderByClause("question-id")).toBe(`p.id`);
    expect(getAggregatedOrderByClause("whatever")).toBe(`p.id`);
  });
});

describe("getAggregatedWhereClause", () => {
  it("returns an empty string when there is nothing to filter", () => {
    expect(getAggregatedWhereClause("", null)).toBe("");
    expect(getAggregatedWhereClause("   ", [])).toBe("");
  });

  it("builds a search predicate over title and id (no WHERE keyword)", () => {
    expect(getAggregatedWhereClause("two sum", null)).toBe(
      `(p.title ILIKE '%two sum%' OR p.id::text ILIKE '%two sum%')`,
    );
  });

  it("builds a difficulty predicate, dropping invalid values", () => {
    expect(getAggregatedWhereClause("", ["Easy", "Hard"])).toBe(
      `p.difficulty IN ('Easy', 'Hard')`,
    );
    expect(getAggregatedWhereClause("", ["Easy", "DROP TABLE"])).toBe(
      `p.difficulty IN ('Easy')`,
    );
    expect(getAggregatedWhereClause("", ["DROP TABLE"])).toBe("");
  });

  it("AND-joins search and difficulty predicates", () => {
    expect(getAggregatedWhereClause("dp", ["Medium"])).toBe(
      `(p.title ILIKE '%dp%' OR p.id::text ILIKE '%dp%') AND p.difficulty IN ('Medium')`,
    );
  });

  it("never references Sheet / SheetProblem columns", () => {
    const clause = getAggregatedWhereClause("foo", ["Easy"]);
    expect(clause).not.toMatch(/sh\.|SheetProblem|sheetOrder/);
  });
});

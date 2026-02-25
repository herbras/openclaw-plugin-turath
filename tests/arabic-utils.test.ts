import { describe, it, expect } from "vitest";
import { normalizeArabicSearchTerm } from "../src/arabic-utils.js";

describe("normalizeArabicSearchTerm", () => {
  it("returns empty array for empty string", () => {
    expect(normalizeArabicSearchTerm("")).toEqual([]);
  });

  it("returns patterns for a single word", () => {
    const result = normalizeArabicSearchTerm("فقه");
    expect(result).toContain("%فقه%");
    expect(result).toContain("%الفقه%");
  });

  it("returns per-word patterns for multi-word input", () => {
    const result = normalizeArabicSearchTerm("علم الفقه");
    // Full phrase
    expect(result).toContain("%علم الفقه%");
    // Individual words (>= 2 chars)
    expect(result).toContain("%علم%");
    expect(result).toContain("%الفقه%");
    // ال-prefixed full phrase (searchTerm doesn't start with ال)
    expect(result).toContain("%العلم الفقه%");
    // ال-prefixed individual word (علم doesn't start with ال)
    expect(result).toContain("%العلم%");
    // الفقه already starts with ال → no %الالفقه%
    expect(result).not.toContain("%الالفقه%");
  });

  it("does not duplicate ال prefix for words already starting with ال", () => {
    const result = normalizeArabicSearchTerm("الفقه");
    // Should NOT have %الالفقه%
    expect(result).not.toContain("%الالفقه%");
    // Should have the base pattern
    expect(result).toContain("%الفقه%");
  });

  it("skips words shorter than 2 characters", () => {
    // "و" is 1 character
    const result = normalizeArabicSearchTerm("و فقه");
    // Full phrase still included
    expect(result).toContain("%و فقه%");
    // "فقه" word pattern present
    expect(result).toContain("%فقه%");
    // "و" alone should NOT appear as an individual pattern
    const singleCharPatterns = result.filter(
      (p) => p === "%و%" || p === "%الو%",
    );
    expect(singleCharPatterns).toEqual([]);
  });

  it("returns full phrase + ال-prefixed phrase for single word without ال", () => {
    const result = normalizeArabicSearchTerm("حديث");
    expect(result[0]).toBe("%حديث%");
    expect(result).toContain("%الحديث%");
  });
});

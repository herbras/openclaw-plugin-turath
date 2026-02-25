import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Dispatcher } from "undici";

// Mock undici before importing the module under test
vi.mock("undici", () => ({
  request: vi.fn(),
}));

import { request } from "undici";
import { HttpError, fetchApi, fetchFile, fetchBookFile, parseMeta } from "../src/turath-api.js";

const mockRequest = vi.mocked(request);

function mockResponse(statusCode: number, jsonBody: unknown): Partial<Dispatcher.ResponseData> {
  return {
    statusCode,
    body: {
      json: () => Promise.resolve(jsonBody),
    } as any,
  };
}

beforeEach(() => {
  mockRequest.mockReset();
});

// ── HttpError ──────────────────────────────────────────────────────

describe("HttpError", () => {
  it("sets all fields correctly", () => {
    const err = new HttpError(404, "Not Found", "https://api.turath.io/book");
    expect(err.status).toBe(404);
    expect(err.statusText).toBe("Not Found");
    expect(err.url).toBe("https://api.turath.io/book");
    expect(err.message).toContain("404");
  });

  it("is an instance of Error", () => {
    const err = new HttpError(500, "Server Error", "https://example.com");
    expect(err).toBeInstanceOf(Error);
  });

  it('has name "HttpError"', () => {
    const err = new HttpError(400, "Bad Request", "https://example.com");
    expect(err.name).toBe("HttpError");
  });
});

// ── parseMeta ──────────────────────────────────────────────────────

describe("parseMeta", () => {
  it("returns { headings: [] } for null", () => {
    expect(parseMeta(null)).toEqual({ headings: [] });
  });

  it("returns { headings: [] } for undefined", () => {
    expect(parseMeta(undefined)).toEqual({ headings: [] });
  });

  it("returns { headings: [] } for empty string", () => {
    expect(parseMeta("")).toEqual({ headings: [] });
  });

  it("parses valid JSON string with all fields", () => {
    const meta = JSON.stringify({
      author_name: "ابن تيمية",
      book_name: "الفتاوى",
      headings: ["باب أول", "باب ثاني"],
      page: 42,
      page_id: 100,
      vol: "3",
    });
    const result = parseMeta(meta);
    expect(result.author_name).toBe("ابن تيمية");
    expect(result.book_name).toBe("الفتاوى");
    expect(result.headings).toEqual(["باب أول", "باب ثاني"]);
    expect(result.page).toBe(42);
    expect(result.page_id).toBe(100);
    expect(result.vol).toBe("3");
  });

  it("returns undefined for missing optional fields", () => {
    const meta = JSON.stringify({ headings: [] });
    const result = parseMeta(meta);
    expect(result.author_name).toBeUndefined();
    expect(result.book_name).toBeUndefined();
    expect(result.page).toBeUndefined();
    expect(result.page_id).toBeUndefined();
    expect(result.vol).toBeUndefined();
  });

  it("returns { headings: [] } for invalid JSON", () => {
    expect(parseMeta("{not valid json")).toEqual({ headings: [] });
  });

  it("defaults headings to [] when headings is not an array", () => {
    const meta = JSON.stringify({ headings: "not an array" });
    expect(parseMeta(meta).headings).toEqual([]);
  });
});

// ── fetchApi ───────────────────────────────────────────────────────

describe("fetchApi", () => {
  it("returns parsed JSON for 200 response", async () => {
    const data = { count: 5, data: [] };
    mockRequest.mockResolvedValueOnce(mockResponse(200, data) as any);

    const result = await fetchApi("/search", { q: "فقه" });
    expect(result).toEqual(data);
  });

  it("always includes ver=3 in query params", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(200, {}) as any);

    await fetchApi("/search", { q: "test" });

    const calledUrl = mockRequest.mock.calls[0][0] as string;
    expect(calledUrl).toContain("ver=3");
  });

  it("filters out null and undefined query params", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(200, {}) as any);

    await fetchApi("/search", { q: "test", author: null, cat_id: undefined });

    const calledUrl = mockRequest.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("author");
    expect(calledUrl).not.toContain("cat_id");
  });

  it("throws HttpError for 404 response", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(404, {}) as any);

    await expect(fetchApi("/book", { id: 99999 })).rejects.toThrow(HttpError);

    try {
      mockRequest.mockResolvedValueOnce(mockResponse(404, {}) as any);
      await fetchApi("/book", { id: 99999 });
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(404);
    }
  });

  it("throws HttpError for 500 response", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(500, {}) as any);
    await expect(fetchApi("/search")).rejects.toThrow(HttpError);
  });

  it("uses API_BASE url", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(200, {}) as any);
    await fetchApi("/search");
    const calledUrl = mockRequest.mock.calls[0][0] as string;
    expect(calledUrl).toContain("https://api.turath.io/search");
  });

  it("sends Accept: application/json header", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(200, {}) as any);
    await fetchApi("/search");
    const opts = mockRequest.mock.calls[0][1] as any;
    expect(opts.headers.accept).toBe("application/json");
  });
});

// ── fetchFile ──────────────────────────────────────────────────────

describe("fetchFile", () => {
  it("returns parsed JSON for 200 response", async () => {
    const data = { meta: {}, pages: [] };
    mockRequest.mockResolvedValueOnce(mockResponse(200, data) as any);

    const result = await fetchFile("/123.json");
    expect(result).toEqual(data);
  });

  it("uses FILES_BASE url", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(200, {}) as any);
    await fetchFile("/456.json");
    const calledUrl = mockRequest.mock.calls[0][0] as string;
    expect(calledUrl).toBe("https://files.turath.io/books/456.json");
  });

  it("throws HttpError for non-2xx response", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(500, {}) as any);
    await expect(fetchFile("/bad.json")).rejects.toThrow(HttpError);
  });
});

// ── fetchBookFile ──────────────────────────────────────────────────

describe("fetchBookFile", () => {
  it("returns BookFileApiResponse for 200", async () => {
    const bookData = {
      meta: { id: 123, name: "test" },
      indexes: {},
      indexes_generated: {},
      pages: [],
    };
    mockRequest.mockResolvedValueOnce(mockResponse(200, bookData) as any);

    const result = await fetchBookFile(123);
    expect(result).toEqual(bookData);
  });

  it('throws Error("Book X not found") for 404', async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(404, {}) as any);

    await expect(fetchBookFile(999)).rejects.toThrow("Book 999 not found");
    // Should be plain Error, not HttpError
    try {
      mockRequest.mockResolvedValueOnce(mockResponse(404, {}) as any);
      await fetchBookFile(999);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).not.toBeInstanceOf(HttpError);
    }
  });

  it("re-throws HttpError as-is for non-404 errors", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(500, {}) as any);

    try {
      await fetchBookFile(123);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(500);
    }
  });
});

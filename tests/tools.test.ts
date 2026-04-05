/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import type Database from "better-sqlite3";
import type { Dispatcher } from "undici";

// Mock undici before importing tool modules
vi.mock("undici", () => ({
  request: vi.fn(),
}));

import { request } from "undici";
import { getDb } from "../src/turath-db.js";
import { registerSearchTools } from "../src/tools/search.js";
import { registerBookTools } from "../src/tools/book.js";
import { registerAuthorTools } from "../src/tools/author.js";
import { registerFilterTools } from "../src/tools/filters.js";

const mockRequest = vi.mocked(request);

function mockResponse(statusCode: number, jsonBody: unknown): Partial<Dispatcher.ResponseData> {
  return {
    statusCode,
    body: {
      json: () => Promise.resolve(jsonBody),
    } as any,
  };
}

// Collect tools via fake api object
type ToolDef = {
  name: string;
  description: string;
  parameters: any;
  execute: (...args: any[]) => Promise<any>;
};

let db: Database.Database;
const tools = new Map<string, ToolDef>();

beforeAll(() => {
  db = getDb();

  const api = {
    registerTool: vi.fn((def: ToolDef) => {
      tools.set(def.name, def);
    }),
    logger: { info: vi.fn() },
    pluginConfig: {},
  };

  registerSearchTools(api, db);
  registerBookTools(api, db);
  registerAuthorTools(api, db);
  registerFilterTools(api, db);
});

afterAll(() => {
  db.close();
});

beforeEach(() => {
  mockRequest.mockReset();
});

function getTool(name: string): ToolDef {
  const tool = tools.get(name);
  if (!tool) throw new Error(`Tool "${name}" not registered`);
  return tool;
}

// ── Registration ───────────────────────────────────────────────────

describe("tool registration", () => {
  it("registers all 8 tools", () => {
    expect(tools.size).toBe(8);
    expect(tools.has("turath_search")).toBe(true);
    expect(tools.has("turath_get_book")).toBe(true);
    expect(tools.has("turath_get_page")).toBe(true);
    expect(tools.has("turath_get_book_file")).toBe(true);
    expect(tools.has("turath_get_author")).toBe(true);
    expect(tools.has("turath_filter_ids")).toBe(true);
    expect(tools.has("turath_list_categories")).toBe(true);
    expect(tools.has("turath_list_authors")).toBe(true);
  });
});

// ── turath_search ──────────────────────────────────────────────────

describe("turath_search", () => {
  it("returns enriched search results", async () => {
    // Get a real book_id for enrichment
    const row = db.prepare("SELECT id, author_id, cat_id FROM books LIMIT 1").get() as
      | { id: number; author_id: number; cat_id: number }
      | undefined;
    const bookId = row?.id ?? 1;

    const apiResponse = {
      count: 1,
      data: [
        {
          book_id: bookId,
          author_id: row?.author_id ?? 1,
          cat_id: row?.cat_id ?? 1,
          meta: JSON.stringify({ book_name: "Test", headings: ["ch1"], page: 5, page_id: 10 }),
          snip: "test snippet",
          text: "test text",
        },
      ],
    };
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_search");
    const result = await tool.execute({ query: "فقه" });

    expect(result.count).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].meta).toHaveProperty("headings");
    // If book was found in local DB, should have reference_info
    expect(result.data[0]).toHaveProperty("reference_info");
  });
});

// ── turath_get_book ────────────────────────────────────────────────

describe("turath_get_book", () => {
  it("returns enriched book info", async () => {
    const row = db.prepare("SELECT id FROM books LIMIT 1").get() as { id: number } | undefined;
    const bookId = row?.id ?? 1;

    const apiResponse = {
      meta: { id: bookId, name: "Test Book", author_id: 1 },
      indexes: { headings: [], volumes: [] },
    };
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_get_book");
    const result = await tool.execute({ book_id: bookId });

    expect(result.meta).toBeDefined();
    if (row) {
      expect("local_book_name" in result).toBe(true);
    }
  });
});

// ── turath_get_page ────────────────────────────────────────────────

describe("turath_get_page", () => {
  it("returns parsed page with metadata", async () => {
    const apiResponse = {
      meta: JSON.stringify({
        book_name: "الفتاوى",
        headings: ["مقدمة"],
        page: 1,
      }),
      text: "<p>بسم الله الرحمن الرحيم</p>",
    };
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_get_page");
    const result = await tool.execute({ book_id: 1, page_number: 1 });

    expect(result.meta.book_name).toBe("الفتاوى");
    expect(result.meta.headings).toEqual(["مقدمة"]);
    expect(result.text).toContain("بسم الله");
  });

  it("throws Error when page not found (empty response)", async () => {
    const apiResponse = { meta: "", text: "" };
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_get_page");
    await expect(tool.execute({ book_id: 1, page_number: 99999 })).rejects.toThrow(
      "not found",
    );
  });
});

// ── turath_get_book_file ───────────────────────────────────────────

describe("turath_get_book_file", () => {
  it("returns book file data", async () => {
    const bookData = {
      meta: { id: 123 },
      indexes: { headings: [] },
      indexes_generated: {},
      pages: [{ text: "page 1" }],
    };
    mockRequest.mockResolvedValueOnce(mockResponse(200, bookData) as any);

    const tool = getTool("turath_get_book_file");
    const result = await tool.execute({ book_id: 123 });

    expect(result.pages).toHaveLength(1);
    expect(result.meta.id).toBe(123);
  });

  it("throws when book not found", async () => {
    mockRequest.mockResolvedValueOnce(mockResponse(404, {}) as any);

    const tool = getTool("turath_get_book_file");
    await expect(tool.execute({ book_id: 999 })).rejects.toThrow("Book 999 not found");
  });
});

// ── turath_get_author ──────────────────────────────────────────────

describe("turath_get_author", () => {
  it("returns enriched author info", async () => {
    const row = db.prepare("SELECT id FROM authors LIMIT 1").get() as { id: number } | undefined;
    const authorId = row?.id ?? 1;

    const apiResponse = { info: "<p>ترجمة المؤلف</p>" };
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_get_author");
    const result = await tool.execute({ author_id: authorId });

    expect(result.info).toContain("ترجمة");
    if (row) {
      expect("local_name" in result).toBe(true);
    }
  });

  it("throws when author not found (empty info)", async () => {
    const apiResponse = {};
    mockRequest.mockResolvedValueOnce(mockResponse(200, apiResponse) as any);

    const tool = getTool("turath_get_author");
    await expect(tool.execute({ author_id: -1 })).rejects.toThrow("not found");
  });
});

// ── turath_filter_ids (local DB only) ──────────────────────────────

describe("turath_filter_ids", () => {
  it("returns matching category IDs", async () => {
    // Get a real category name from DB
    const row = db.prepare("SELECT name FROM cats LIMIT 1").get() as { name: string } | undefined;
    if (!row) return;

    const tool = getTool("turath_filter_ids");
    const result = await tool.execute({ category_name: row.name });

    expect(result.category_ids).toBeTruthy();
  });

  it("returns matching author IDs", async () => {
    const row = db.prepare("SELECT name FROM authors LIMIT 1").get() as { name: string } | undefined;
    if (!row) return;

    const tool = getTool("turath_filter_ids");
    const result = await tool.execute({ author_name: row.name });

    expect(result.author_ids).toBeTruthy();
  });

  it("returns message when no IDs found", async () => {
    const tool = getTool("turath_filter_ids");
    const result = await tool.execute({ category_name: "xyznotexist12345" });

    expect(result.message).toContain("No IDs found");
  });
});

// ── turath_list_categories (local DB only) ─────────────────────────

describe("turath_list_categories", () => {
  it("returns array of categories with id and name", async () => {
    const tool = getTool("turath_list_categories");
    const result = await tool.execute();

    expect(result.categories).toBeInstanceOf(Array);
    if (result.categories.length > 0) {
      expect(result.categories[0]).toHaveProperty("id");
      expect(result.categories[0]).toHaveProperty("name");
    }
  });
});

// ── turath_list_authors (local DB only) ────────────────────────────

describe("turath_list_authors", () => {
  it("returns array of authors with id, name, death, death_label", async () => {
    const tool = getTool("turath_list_authors");
    const result = await tool.execute();

    expect(result.authors).toBeInstanceOf(Array);
    if (result.authors.length > 0) {
      const a = result.authors[0];
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("name");
      expect(a).toHaveProperty("death");
      expect(a).toHaveProperty("death_label");
    }
  });
});

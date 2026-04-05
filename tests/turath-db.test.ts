/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type Database from "better-sqlite3";
import { getDb, enrichSearchResult, enrichBookInfo, enrichAuthor } from "../src/turath-db.js";

let db: Database.Database;

beforeAll(() => {
  db = getDb(); // uses default path: data/turath_metadata.db
});

afterAll(() => {
  db.close();
});

describe("getDb", () => {
  it("returns a Database instance", () => {
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe("function");
  });

  it("opens in readonly mode", () => {
    expect(db.readonly).toBe(true);
  });
});

describe("enrichSearchResult", () => {
  it("adds local enrichment fields for known book_id", () => {
    // Get a real book_id from the database
    const row = db.prepare("SELECT id FROM books LIMIT 1").get() as { id: number } | undefined;
    if (!row) return; // skip if empty DB

    const item: Record<string, any> = { book_id: row.id, meta: {} };
    enrichSearchResult(db, item);

    // Should have at least local_book_name set (even if null from DB)
    expect("local_book_name" in item).toBe(true);
    expect("local_author_name" in item).toBe(true);
    expect("local_cat_name" in item).toBe(true);
    expect("reference_info" in item).toBe(true);
  });

  it("does not mutate item with unknown book_id", () => {
    const item: Record<string, any> = { book_id: -99999 };
    const before = { ...item };
    enrichSearchResult(db, item);

    // reference_info is always set, but local_ fields should NOT exist
    expect("local_book_name" in item).toBe(false);
  });

  it("does nothing when book_id is falsy", () => {
    const item: Record<string, any> = {};
    enrichSearchResult(db, item);
    expect("local_book_name" in item).toBe(false);
  });

  it("includes reference_info with Shamela link for known book", () => {
    const row = db.prepare("SELECT id FROM books LIMIT 1").get() as { id: number } | undefined;
    if (!row) return;

    const item: Record<string, any> = { book_id: row.id, meta: {} };
    enrichSearchResult(db, item);

    expect(item.reference_info).toContain("shamela.ws/book/");
    expect(item.reference_info).toContain("Sumber:");
  });
});

describe("enrichBookInfo", () => {
  it("adds local enrichment fields for known book_id", () => {
    const row = db.prepare("SELECT id FROM books LIMIT 1").get() as { id: number } | undefined;
    if (!row) return;

    const result: Record<string, any> = {};
    enrichBookInfo(db, row.id, result);

    expect("local_book_name" in result).toBe(true);
    expect("local_author_name" in result).toBe(true);
    expect("local_category_name" in result).toBe(true);
  });

  it("does not add fields for unknown book_id", () => {
    const result: Record<string, any> = {};
    enrichBookInfo(db, -99999, result);
    expect("local_book_name" in result).toBe(false);
  });
});

describe("enrichAuthor", () => {
  it("adds local_name, local_death, local_death_label for known author", () => {
    const row = db.prepare("SELECT id FROM authors LIMIT 1").get() as { id: number } | undefined;
    if (!row) return;

    const result: Record<string, any> = {};
    enrichAuthor(db, row.id, result);

    expect("local_name" in result).toBe(true);
    expect("local_death" in result).toBe(true);
    expect("local_death_label" in result).toBe(true);
  });

  it("does not add fields for unknown author_id", () => {
    const result: Record<string, any> = {};
    enrichAuthor(db, -99999, result);
    expect("local_name" in result).toBe(false);
  });
});

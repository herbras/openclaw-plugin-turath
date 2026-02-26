import type Database from "better-sqlite3";
import { normalizeArabicSearchTerm } from "../arabic-utils.js";

export function executeFilterIds(
  db: Database.Database,
  params: { category_name?: string; author_name?: string },
) {
  const results: Record<string, string | null> = {
    category_ids: null,
    author_ids: null,
  };

  function findIds(name: string, table: string): string | null {
    const patterns = normalizeArabicSearchTerm(name);
    const seenIds = new Set<number>();

    const stmt = db.prepare(`SELECT id FROM ${table} WHERE name LIKE ?`);

    for (const pattern of patterns) {
      const rows = stmt.all(pattern) as { id: number }[];
      for (const row of rows) {
        seenIds.add(row.id);
      }
    }

    return seenIds.size > 0 ? Array.from(seenIds).join(",") : null;
  }

  if (params.category_name) {
    results.category_ids = findIds(params.category_name, "cats");
  }

  if (params.author_name) {
    results.author_ids = findIds(params.author_name, "authors");
  }

  if (!results.category_ids && !results.author_ids) {
    return { message: "No IDs found for the given names." };
  }

  return results;
}

export function executeListCategories(db: Database.Database) {
  const rows = db
    .prepare("SELECT id, name FROM cats ORDER BY name ASC")
    .all() as { id: number; name: string }[];

  return {
    categories: rows.map((r) => ({ id: r.id, name: r.name })),
  };
}

export function executeListAuthors(db: Database.Database) {
  const rows = db
    .prepare(
      "SELECT id, name, death, death_inexact_label FROM authors ORDER BY name ASC",
    )
    .all() as {
    id: number;
    name: string;
    death: number;
    death_inexact_label: string;
  }[];

  return {
    authors: rows.map((r) => ({
      id: r.id,
      name: r.name,
      death: r.death,
      death_label: r.death_inexact_label,
    })),
  };
}

export function registerFilterTools(api: any, db: Database.Database): void {
  api.registerTool({
    name: "turath_filter_ids",
    description:
      "Find category or author IDs by Arabic name. Use this before turath_search to get IDs for filtering.",
    parameters: {
      type: "object",
      properties: {
        category_name: {
          type: "string",
          description: "Arabic category name to search for",
        },
        author_name: {
          type: "string",
          description: "Arabic author name to search for",
        },
      },
    },
    execute: (params: { category_name?: string; author_name?: string }) =>
      executeFilterIds(db, params),
  });

  api.registerTool({
    name: "turath_list_categories",
    description:
      "List all available categories (~40) from the local metadata database.",
    parameters: {
      type: "object",
      properties: {},
    },
    execute: () => executeListCategories(db),
  });

  api.registerTool({
    name: "turath_list_authors",
    description:
      "List all available authors (~3,100) from the local metadata database with death dates.",
    parameters: {
      type: "object",
      properties: {},
    },
    execute: () => executeListAuthors(db),
  });
}

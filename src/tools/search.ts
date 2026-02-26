import type Database from "better-sqlite3";
import type { SearchApiResponse } from "../types.js";
import { SortField } from "../types.js";
import { fetchApi, parseMeta } from "../turath-api.js";
import { enrichSearchResult } from "../turath-db.js";

export type SearchParams = {
  query: string;
  precision?: number;
  category?: number;
  author?: number;
  page?: number;
  sort_field?: string;
};

export async function executeSearch(db: Database.Database, params: SearchParams) {
  const result = await fetchApi<SearchApiResponse>("/search", {
    q: params.query,
    author: params.author,
    cat_id: params.category,
    page: params.page,
    precision: params.precision,
    sort:
      params.sort_field && params.sort_field !== "default"
        ? params.sort_field
        : undefined,
  });

  const enrichedData = [];
  for (const item of result.data || []) {
    const enriched: Record<string, any> = {
      ...item,
      meta: parseMeta(item.meta),
    };
    enrichSearchResult(db, enriched);
    enrichedData.push(enriched);
  }

  return { count: result.count || 0, data: enrichedData };
}

export function registerSearchTools(api: any, db: Database.Database): void {
  api.registerTool({
    name: "turath_search",
    description:
      "Search 100,000+ Islamic classical texts from the Turath.io library. Returns enriched results with book names, authors, categories, and Shamela links.",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "Arabic search query",
        },
        precision: {
          type: "number",
          description: "Search precision: 0=broad (default), 3=exact match",
        },
        category: {
          type: "number",
          description: "Category ID to filter results",
        },
        author: {
          type: "number",
          description: "Author ID to filter results",
        },
        page: {
          type: "number",
          description: "Result page number for pagination",
        },
        sort_field: {
          type: "string",
          enum: [SortField.PageId, SortField.Death, "default"],
          description: "Sort results by field",
        },
      },
    },
    execute: (params: SearchParams) => executeSearch(db, params),
  });
}

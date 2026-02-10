import type Database from "better-sqlite3";
import { fetchApi, parseMeta } from "../turath-api.js";
import { enrichSearchResult } from "../turath-db.js";

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
          enum: ["page_id", "death", "default"],
          description: "Sort results by field",
        },
      },
    },
    async execute(params: {
      query: string;
      precision?: number;
      category?: number;
      author?: number;
      page?: number;
      sort_field?: string;
    }) {
      const apiParams: Record<string, string | number> = { q: params.query };

      if (params.author != null) apiParams.author = params.author;
      if (params.category != null) apiParams.cat_id = params.category;
      if (params.page != null) apiParams.page = params.page;
      if (params.precision != null) apiParams.precision = params.precision;
      if (params.sort_field && params.sort_field !== "default") {
        apiParams.sort = params.sort_field;
      }

      const result = await fetchApi("/search", apiParams);

      const enrichedData = [];
      for (const item of result.data || []) {
        const enriched = { ...item, meta: parseMeta(item.meta) };
        enrichSearchResult(db, enriched);
        enrichedData.push(enriched);
      }

      return { count: result.count || 0, data: enrichedData };
    },
  });
}

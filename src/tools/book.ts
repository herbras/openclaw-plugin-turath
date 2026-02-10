import type Database from "better-sqlite3";
import { fetchApi, parseMeta, TurathError } from "../turath-api.js";
import { enrichBookInfo } from "../turath-db.js";

export function registerBookTools(api: any, db: Database.Database): void {
  api.registerTool({
    name: "turath_get_book",
    description:
      "Get detailed information about a specific book including metadata, table of contents, and local enrichment (PDF links, author, category).",
    parameters: {
      type: "object",
      required: ["book_id"],
      properties: {
        book_id: {
          type: "number",
          description: "The book ID from Turath.io",
        },
        include: {
          type: "string",
          description:
            'Optional data to include, e.g. "indexes" for table of contents',
        },
      },
    },
    async execute(params: { book_id: number; include?: string }) {
      const apiParams: Record<string, string | number> = {
        id: params.book_id,
        include: params.include || "indexes",
      };

      const result = await fetchApi("/book", apiParams);
      enrichBookInfo(db, params.book_id, result);
      return result;
    },
  });

  api.registerTool({
    name: "turath_get_page",
    description:
      "Get the text content and metadata of a specific page from a book.",
    parameters: {
      type: "object",
      required: ["book_id", "page_number"],
      properties: {
        book_id: {
          type: "number",
          description: "The book ID from Turath.io",
        },
        page_number: {
          type: "number",
          description: "The page number to retrieve",
        },
      },
    },
    async execute(params: { book_id: number; page_number: number }) {
      const apiParams: Record<string, string | number> = {
        book_id: params.book_id,
        pg: params.page_number,
      };

      const result = await fetchApi("/page", apiParams);

      if (!result.meta && !result.text) {
        throw new TurathError(
          `Book ${params.book_id}, page ${params.page_number} not found`,
        );
      }

      return { meta: parseMeta(result.meta), text: result.text || "" };
    },
  });
}

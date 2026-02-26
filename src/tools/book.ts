import type Database from "better-sqlite3";
import type { BookApiResponse, PageApiResponse } from "../types.js";
import { fetchApi, fetchBookFile, parseMeta } from "../turath-api.js";
import { enrichBookInfo } from "../turath-db.js";

export async function executeGetBook(
  db: Database.Database,
  params: { book_id: number; include?: string },
) {
  const result: Record<string, any> = await fetchApi<BookApiResponse>("/book", {
    id: params.book_id,
    include: params.include || "indexes",
  });

  enrichBookInfo(db, params.book_id, result);
  return result;
}

export async function executeGetPage(params: {
  book_id: number;
  page_number: number;
}) {
  const result = await fetchApi<PageApiResponse>("/page", {
    book_id: params.book_id,
    pg: params.page_number,
  });

  if (!result.meta && !result.text) {
    throw new Error(
      `Book ${params.book_id}, page ${params.page_number} not found`,
    );
  }

  return { meta: parseMeta(result.meta), text: result.text || "" };
}

export async function executeGetBookFile(params: { book_id: number }) {
  return fetchBookFile(params.book_id);
}

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
    execute: (params: { book_id: number; include?: string }) =>
      executeGetBook(db, params),
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
    execute: (params: { book_id: number; page_number: number }) =>
      executeGetPage(params),
  });

  api.registerTool({
    name: "turath_get_book_file",
    description:
      "Download the full JSON file of a book from Turath.io CDN. Returns complete book content including all pages, indexes, and metadata. Use this when you need the entire book text rather than individual pages.",
    parameters: {
      type: "object",
      required: ["book_id"],
      properties: {
        book_id: {
          type: "number",
          description: "The book ID from Turath.io",
        },
      },
    },
    execute: (params: { book_id: number }) => executeGetBookFile(params),
  });
}

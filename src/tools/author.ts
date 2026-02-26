import type Database from "better-sqlite3";
import type { AuthorApiResponse } from "../types.js";
import { fetchApi } from "../turath-api.js";
import { enrichAuthor } from "../turath-db.js";

export async function executeGetAuthor(
  db: Database.Database,
  params: { author_id: number },
) {
  const result: Record<string, any> = await fetchApi<AuthorApiResponse>(
    "/author",
    { id: params.author_id },
  );

  if (!result.info) {
    throw new Error(`Author ${params.author_id} not found`);
  }

  enrichAuthor(db, params.author_id, result);
  return result;
}

export function registerAuthorTools(api: any, db: Database.Database): void {
  api.registerTool({
    name: "turath_get_author",
    description:
      "Get author biography, book list, and death dates from Turath.io, enriched with local metadata.",
    parameters: {
      type: "object",
      required: ["author_id"],
      properties: {
        author_id: {
          type: "number",
          description: "The author ID from Turath.io",
        },
      },
    },
    execute: (params: { author_id: number }) => executeGetAuthor(db, params),
  });
}

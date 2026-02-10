import type Database from "better-sqlite3";
import { fetchApi, TurathError } from "../turath-api.js";
import { enrichAuthor } from "../turath-db.js";

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
    async execute(params: { author_id: number }) {
      const result = await fetchApi("/author", { id: params.author_id });

      if (!result.info) {
        throw new TurathError(`Author ${params.author_id} not found`);
      }

      enrichAuthor(db, params.author_id, result);
      return result;
    },
  });
}

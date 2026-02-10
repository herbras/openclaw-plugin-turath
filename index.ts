import { registerSearchTools } from "./src/tools/search.js";
import { registerBookTools } from "./src/tools/book.js";
import { registerAuthorTools } from "./src/tools/author.js";
import { registerFilterTools } from "./src/tools/filters.js";
import { getDb } from "./src/turath-db.js";

const plugin = {
  id: "turath",
  name: "Turath Islamic Research",
  description:
    "Search and retrieve 100,000+ Islamic classical texts from Turath.io",
  configSchema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      dbPath: { type: "string" as const },
    },
  },
  register(api: any) {
    const config = api.pluginConfig || {};
    const db = getDb(config.dbPath);

    registerSearchTools(api, db);
    registerBookTools(api, db);
    registerAuthorTools(api, db);
    registerFilterTools(api, db);

    api.logger.info("[turath] 7 Islamic research tools registered");
  },
};

export default plugin;

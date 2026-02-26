#!/usr/bin/env bun
// @ts-ignore — bun:sqlite embedded import (with { type: "sqlite", embed: "true" })
// In compiled binary: DB is embedded in the executable and loaded in-memory
// In dev mode (bun run): this import loads the file from disk
import embeddedDb from "./data/turath_metadata.db" with { type: "sqlite", embed: "true" };
import { executeSearch } from "./src/tools/search.js";
import {
  executeGetBook,
  executeGetPage,
  executeGetBookFile,
} from "./src/tools/book.js";
import { executeGetAuthor } from "./src/tools/author.js";
import {
  executeFilterIds,
  executeListCategories,
  executeListAuthors,
} from "./src/tools/filters.js";

// ── ANSI Colors ──────────────────────────────────────────────────

const isTTY = process.stdout.isTTY;
const c = {
  bold: (s: string) => (isTTY ? `\x1b[1m${s}\x1b[0m` : s),
  dim: (s: string) => (isTTY ? `\x1b[2m${s}\x1b[0m` : s),
  cyan: (s: string) => (isTTY ? `\x1b[36m${s}\x1b[0m` : s),
  green: (s: string) => (isTTY ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s: string) => (isTTY ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s: string) => (isTTY ? `\x1b[31m${s}\x1b[0m` : s),
};

// ── Argument Parsing ─────────────────────────────────────────────

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const helpMode = args.includes("--help") || args.includes("-h");
const filteredArgs = args.filter(
  (a) => a !== "--json" && a !== "--help" && a !== "-h",
);
const command = filteredArgs[0];

function getOpt(name: string): string | undefined {
  const idx = filteredArgs.indexOf(name);
  if (idx === -1 || idx + 1 >= filteredArgs.length) return undefined;
  return filteredArgs[idx + 1];
}

function getNumOpt(name: string): number | undefined {
  const val = getOpt(name);
  return val !== undefined ? Number(val) : undefined;
}

// ── Help Text ────────────────────────────────────────────────────

const HELP = `
${c.bold("turath")} - Search 100,000+ Islamic classical texts from Turath.io

${c.bold("USAGE")}
  turath <command> [options]

${c.bold("COMMANDS")}
  ${c.cyan("search")} <query>           Search Islamic texts
  ${c.cyan("book")} <id>                Get book info
  ${c.cyan("page")} <book_id> <page>    Get page content
  ${c.cyan("book-file")} <id>           Download full book JSON
  ${c.cyan("author")} <id>              Get author info
  ${c.cyan("filter")} [options]         Find category/author IDs by name
  ${c.cyan("categories")}               List all categories
  ${c.cyan("authors")}                  List all authors

${c.bold("GLOBAL OPTIONS")}
  --json                   Output raw JSON (default: formatted)
  --help                   Show help

${c.bold("SEARCH OPTIONS")}
  --precision <0-3>        Search precision (0=broad, 3=exact)
  --category <id>          Filter by category ID
  --author <id>            Filter by author ID
  --page <n>               Result page number
  --sort <field>           Sort: page_id | death

${c.bold("FILTER OPTIONS")}
  --category-name <name>   Arabic category name to search
  --author-name <name>     Arabic author name to search

${c.bold("EXAMPLES")}
  turath search "فقه الصلاة"
  turath search "الحديث" --precision 2 --category 5
  turath book 21796
  turath page 21796 10
  turath author 641
  turath filter --author-name "ابن تيمية"
  turath categories
`.trimStart();

// ── Output Helpers ───────────────────────────────────────────────

function out(data: any): void {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  // Formatted output dispatched per command
  console.log(JSON.stringify(data, null, 2));
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function printSearchResults(data: any): void {
  if (jsonMode) return out(data);

  console.log(c.bold(`Found ${data.count} results\n`));
  for (const item of data.data || []) {
    const meta = item.meta || {};
    const bookName = item.local_book_name || meta.book_name || "Unknown";
    const authorName = item.local_author_name || meta.author_name || "";
    const snippet = stripHtml(item.snip || item.text || "").slice(0, 200);

    console.log(c.cyan(`[Book ${item.book_id}]`) + " " + c.bold(bookName));
    if (authorName) console.log("  " + c.dim("Author: " + authorName));
    if (item.local_cat_name)
      console.log("  " + c.dim("Category: " + item.local_cat_name));
    if (meta.vol || meta.page)
      console.log(
        "  " +
          c.dim(
            [meta.vol && `Vol ${meta.vol}`, meta.page && `Page ${meta.page}`]
              .filter(Boolean)
              .join(", "),
          ),
      );
    console.log("  " + snippet.replace(/\n/g, " ").trim());
    console.log();
  }
}

function printBook(data: any): void {
  if (jsonMode) return out(data);

  const meta = data.meta || {};
  console.log(c.bold(meta.name || "Unknown Book"));
  console.log(c.dim("─".repeat(40)));
  if (data.local_book_name && data.local_book_name !== meta.name)
    console.log("  Name (local): " + data.local_book_name);
  if (data.local_author_name)
    console.log("  Author: " + c.green(data.local_author_name));
  if (data.local_category_name)
    console.log("  Category: " + data.local_category_name);
  if (meta.info) console.log("  Info: " + stripHtml(meta.info));
  if (data.local_pdf_links) console.log("  PDF: " + data.local_pdf_links);
  if (data.local_author_death)
    console.log("  Author death: " + data.local_author_death + " AH");

  const indexes = data.indexes;
  if (indexes?.headings?.length) {
    console.log("\n" + c.bold("Table of Contents") + ` (${indexes.headings.length} headings)`);
    for (const h of indexes.headings.slice(0, 20)) {
      const indent = "  ".repeat(h.level || 1);
      console.log(`${indent}${c.dim(`p.${h.page}`)} ${h.title}`);
    }
    if (indexes.headings.length > 20)
      console.log(c.dim(`  ... and ${indexes.headings.length - 20} more`));
  }
}

function printPage(data: any): void {
  if (jsonMode) return out(data);

  const meta = data.meta || {};
  if (meta.book_name) console.log(c.bold(meta.book_name));
  if (meta.vol || meta.page)
    console.log(
      c.dim(
        [meta.vol && `Volume ${meta.vol}`, meta.page && `Page ${meta.page}`]
          .filter(Boolean)
          .join(", "),
      ),
    );
  if (meta.headings?.length)
    console.log(c.yellow(meta.headings.join(" > ")));

  console.log(c.dim("─".repeat(40)));
  console.log(stripHtml(data.text || ""));
}

function printAuthor(data: any): void {
  if (jsonMode) return out(data);

  const name = data.local_name || "Author";
  console.log(c.bold(name));
  console.log(c.dim("─".repeat(40)));
  if (data.local_death) console.log("  Death: " + data.local_death + " AH");
  if (data.local_death_label)
    console.log("  Death (approx): " + data.local_death_label);
  if (data.info) console.log("\n" + stripHtml(data.info));
}

function printFilter(data: any): void {
  if (jsonMode) return out(data);

  if (data.message) {
    console.log(c.yellow(data.message));
    return;
  }
  if (data.category_ids)
    console.log("Category IDs: " + c.cyan(data.category_ids));
  if (data.author_ids) console.log("Author IDs: " + c.cyan(data.author_ids));
}

function printCategories(data: any): void {
  if (jsonMode) return out(data);

  console.log(c.bold(`Categories (${data.categories.length})\n`));
  for (const cat of data.categories) {
    console.log(`  ${c.cyan(String(cat.id).padStart(4))}  ${cat.name}`);
  }
}

function printAuthors(data: any): void {
  if (jsonMode) return out(data);

  console.log(c.bold(`Authors (${data.authors.length})\n`));
  for (const a of data.authors) {
    const death = a.death ? ` (d. ${a.death})` : "";
    console.log(`  ${c.cyan(String(a.id).padStart(6))}  ${a.name}${c.dim(death)}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  if (helpMode || !command) {
    console.log(HELP);
    process.exit(helpMode ? 0 : 1);
  }

  const db = embeddedDb as any;

  try {
    switch (command) {
      case "search": {
        const query = filteredArgs[1];
        if (!query) {
          console.error(c.red("Error: search requires a query argument"));
          process.exit(1);
        }
        const result = await executeSearch(db, {
          query,
          precision: getNumOpt("--precision"),
          category: getNumOpt("--category"),
          author: getNumOpt("--author"),
          page: getNumOpt("--page"),
          sort_field: getOpt("--sort"),
        });
        printSearchResults(result);
        break;
      }

      case "book": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: book requires a numeric ID"));
          process.exit(1);
        }
        const result = await executeGetBook(db, { book_id: id });
        printBook(result);
        break;
      }

      case "page": {
        const bookId = Number(filteredArgs[1]);
        const pageNum = Number(filteredArgs[2]);
        if (!bookId || isNaN(bookId) || !pageNum || isNaN(pageNum)) {
          console.error(
            c.red("Error: page requires <book_id> and <page_number>"),
          );
          process.exit(1);
        }
        const result = await executeGetPage({
          book_id: bookId,
          page_number: pageNum,
        });
        printPage(result);
        break;
      }

      case "book-file": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: book-file requires a numeric ID"));
          process.exit(1);
        }
        const result = await executeGetBookFile({ book_id: id });
        out(result);
        break;
      }

      case "author": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: author requires a numeric ID"));
          process.exit(1);
        }
        const result = await executeGetAuthor(db, { author_id: id });
        printAuthor(result);
        break;
      }

      case "filter": {
        const categoryName = getOpt("--category-name");
        const authorName = getOpt("--author-name");
        if (!categoryName && !authorName) {
          console.error(
            c.red(
              "Error: filter requires --category-name and/or --author-name",
            ),
          );
          process.exit(1);
        }
        const result = executeFilterIds(db, {
          category_name: categoryName,
          author_name: authorName,
        });
        printFilter(result);
        break;
      }

      case "categories": {
        const result = executeListCategories(db);
        printCategories(result);
        break;
      }

      case "authors": {
        const result = executeListAuthors(db);
        printAuthors(result);
        break;
      }

      default:
        console.error(c.red(`Unknown command: ${command}`));
        console.log(`Run ${c.cyan("turath --help")} for usage info.`);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(c.red("Error: " + (err.message || err)));
    process.exit(1);
  } finally {
    db.close();
  }
}

main();

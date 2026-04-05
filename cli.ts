#!/usr/bin/env bun
/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

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
import { fetchBookFile } from "./src/turath-api.js";
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
  ${c.cyan("read")} <book_id>           Interactive book reader
  ${c.cyan("toc")} <book_id>            Show table of contents
  ${c.cyan("export")} <book_id>          Export book to file
  ${c.cyan("compare")} <id1> <id2>       Compare two books side-by-side
  ${c.cyan("random")}                   Random book quote
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

${c.bold("READ OPTIONS")}
  --start <page>           Start reading from page (default: 1)

${c.bold("EXPORT OPTIONS")}
  --format <md|txt>        Export format (default: md)

${c.bold("FILTER OPTIONS")}
  --category-name <name>   Arabic category name to search
  --author-name <name>     Arabic author name to search

${c.bold("EXAMPLES")}
  turath search "فقه الصلاة"
  turath search "الحديث" --precision 2 --category 5
  turath book 21796
  turath page 21796 10
  turath read 21796
  turath read 21796 --start 50
  turath toc 21796
  turath export 21796 --format md
  turath compare 21796 12345
  turath random
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

// ── RTL Arabic Support ──────────────────────────────────────────
// Ported from github.com/latiif/ara — full glyph shaping, ligatures, tashkeel, RTL

import { formatArabic } from "./src/arabic-render.js";

function formatArabicContent(text: string): string {
  const width = process.stdout.columns || 80;
  return formatArabic(text, width);
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

// ── Interactive Input Helper ─────────────────────────────────────

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.resume();
    process.stdin.once("data", (chunk: string) => {
      data = chunk.trim();
      process.stdin.pause();
      resolve(data);
    });
  });
}

// ── New Feature Printers ────────────────────────────────────────

async function runInteractiveReader(
  db: any,
  bookId: number,
  startPage: number,
): Promise<void> {
  // Fetch book info first to get total pages and name
  const bookInfo = await executeGetBook(db, { book_id: bookId });
  const bookName =
    bookInfo.local_book_name || bookInfo.meta?.name || `Book ${bookId}`;
  const indexes = bookInfo.indexes;
  const pageMap = indexes?.page_map;
  const totalPages = pageMap ? pageMap.length : null;

  console.log(c.bold(`\n  ${bookName}`));
  console.log(c.dim("─".repeat(50)));
  if (totalPages) console.log(c.dim(`  Total pages: ${totalPages}`));
  console.log(
    c.dim("  Controls: [n]ext  [p]rev  [g]oto  [q]uit\n"),
  );

  let currentPage = startPage;

  while (true) {
    try {
      const result = await executeGetPage({
        book_id: bookId,
        page_number: currentPage,
      });
      const meta = result.meta || {};
      const pageLabel = [
        meta.vol && `Vol ${meta.vol}`,
        meta.page && `Page ${meta.page}`,
      ]
        .filter(Boolean)
        .join(", ");

      console.log(
        c.cyan(`── Page ${currentPage}`) +
          (pageLabel ? c.dim(` (${pageLabel})`) : "") +
          (totalPages ? c.dim(` of ${totalPages}`) : "") +
          c.cyan(" ──"),
      );
      if (meta.headings?.length)
        console.log(formatArabicContent(c.yellow(meta.headings.join(" > "))));
      console.log();
      console.log(formatArabicContent(stripHtml(result.text || "")));
      console.log();
    } catch {
      console.log(c.red(`  Page ${currentPage} not found.`));
    }

    const input = await prompt(
      c.dim(`[n/p/g/q] (current: ${currentPage})> `),
    );

    if (input === "q" || input === "quit") break;
    else if (input === "n" || input === "") currentPage++;
    else if (input === "p") currentPage = Math.max(1, currentPage - 1);
    else if (input === "g" || input.startsWith("g")) {
      const num = parseInt(input.replace("g", "").trim()) || 0;
      if (num > 0) currentPage = num;
      else {
        const pageInput = await prompt(c.dim("  Go to page: "));
        const parsed = parseInt(pageInput);
        if (parsed > 0) currentPage = parsed;
      }
    } else {
      const parsed = parseInt(input);
      if (parsed > 0) currentPage = parsed;
    }
  }
  console.log(c.dim("\nDone reading."));
}

function printToc(data: any): void {
  if (jsonMode) return out(data);

  const bookName =
    data.local_book_name || data.meta?.name || "Unknown Book";
  const headings = data.indexes?.headings || [];

  console.log(formatArabicContent(c.bold(bookName)));
  console.log(c.dim("─".repeat(50)));

  if (!headings.length) {
    console.log(c.yellow("  No table of contents available for this book."));
    return;
  }

  console.log(c.bold(`  ${headings.length} headings\n`));

  for (const h of headings) {
    const indent = "  ".repeat(h.level || 1);
    console.log(formatArabicContent(`${indent}${c.dim(`p.${h.page}`)} ${h.title}`));
  }
}

async function runExport(
  bookId: number,
  format: string,
): Promise<void> {
  console.log(c.dim(`Downloading book ${bookId}...`));
  const bookData = await fetchBookFile(bookId);
  const bookName = bookData.meta?.name || `book_${bookId}`;
  const pages = bookData.pages || [];
  const headings = bookData.indexes?.headings || [];

  // Build heading lookup: page number -> heading titles
  const headingMap = new Map<number, string[]>();
  for (const h of headings) {
    if (!headingMap.has(h.page)) headingMap.set(h.page, []);
    headingMap.get(h.page)!.push(h.title);
  }

  const lines: string[] = [];

  if (format === "md") {
    lines.push(`# ${bookName}\n`);
    if (bookData.meta?.details) lines.push(`> ${stripHtml(bookData.meta.details)}\n`);
    lines.push(`---\n`);

    for (const page of pages) {
      const pageNum = page.page;
      if (pageNum !== undefined && headingMap.has(pageNum)) {
        for (const title of headingMap.get(pageNum)!) {
          lines.push(`\n## ${title}\n`);
        }
      }
      const vol = page.vol ? `[Vol ${page.vol}] ` : "";
      const pg = pageNum !== undefined ? `Page ${pageNum}` : "";
      if (vol || pg) lines.push(`\n*${vol}${pg}*\n`);
      lines.push(stripHtml(page.text || ""));
      lines.push("");
    }
  } else {
    lines.push(bookName);
    lines.push("=".repeat(bookName.length));
    lines.push("");

    for (const page of pages) {
      const pageNum = page.page;
      if (pageNum !== undefined && headingMap.has(pageNum)) {
        for (const title of headingMap.get(pageNum)!) {
          lines.push(`\n--- ${title} ---\n`);
        }
      }
      const vol = page.vol ? `[Vol ${page.vol}] ` : "";
      const pg = pageNum !== undefined ? `Page ${pageNum}` : "";
      if (vol || pg) lines.push(`${vol}${pg}`);
      lines.push(stripHtml(page.text || ""));
      lines.push("");
    }
  }

  const ext = format === "md" ? "md" : "txt";
  const safeBookName = bookName.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 100);
  const filename = `${safeBookName}_${bookId}.${ext}`;

  const fs = await import("node:fs");
  fs.writeFileSync(filename, lines.join("\n"), "utf-8");
  console.log(
    c.green(`Exported ${pages.length} pages to `) + c.bold(filename),
  );
}

async function runCompare(db: any, id1: number, id2: number): Promise<void> {
  const [book1, book2] = await Promise.all([
    executeGetBook(db, { book_id: id1 }),
    executeGetBook(db, { book_id: id2 }),
  ]);

  if (jsonMode) return out({ book1, book2 });

  const name1 = book1.local_book_name || book1.meta?.name || `Book ${id1}`;
  const name2 = book2.local_book_name || book2.meta?.name || `Book ${id2}`;

  const w = 35; // column width
  const pad = (s: string) => {
    // Pad considering Arabic chars might have different display width
    const len = s.length;
    return len >= w ? s.slice(0, w) : s + " ".repeat(w - len);
  };

  console.log(
    c.bold("\n  " + pad("") + pad(name1.slice(0, w)) + "  " + name2.slice(0, w)),
  );
  console.log("  " + "─".repeat(w * 2 + w + 2));

  const rows: [string, string, string][] = [
    [
      "ID",
      String(id1),
      String(id2),
    ],
    [
      "Author",
      book1.local_author_name || "-",
      book2.local_author_name || "-",
    ],
    [
      "Category",
      book1.local_category_name || "-",
      book2.local_category_name || "-",
    ],
    [
      "Author Death",
      book1.local_author_death ? `${book1.local_author_death} AH` : "-",
      book2.local_author_death ? `${book2.local_author_death} AH` : "-",
    ],
    [
      "Headings",
      String(book1.indexes?.headings?.length || 0),
      String(book2.indexes?.headings?.length || 0),
    ],
    [
      "Volumes",
      book1.indexes?.volumes?.length
        ? book1.indexes.volumes.join(", ")
        : "-",
      book2.indexes?.volumes?.length
        ? book2.indexes.volumes.join(", ")
        : "-",
    ],
    [
      "PDF",
      book1.local_pdf_links ? "Yes" : "No",
      book2.local_pdf_links ? "Yes" : "No",
    ],
  ];

  for (const [label, v1, v2] of rows) {
    const match = v1 === v2;
    const marker = match ? c.dim("=") : c.yellow("≠");
    console.log(
      `  ${c.cyan(pad(label))}${pad(v1)}${marker} ${v2}`,
    );
  }
  console.log();
}

async function runRandom(db: any): Promise<void> {
  // Pick a random book from DB
  const row = db
    .prepare(
      "SELECT id, name, author_id FROM books ORDER BY RANDOM() LIMIT 1",
    )
    .get() as { id: number; name: string; author_id: number } | undefined;

  if (!row) {
    console.log(c.red("No books found in database."));
    return;
  }

  const bookId = row.id;
  const bookName = row.name;

  // Get author name
  const authorRow = db
    .prepare("SELECT name FROM authors WHERE id = ?")
    .get(row.author_id) as { name: string } | undefined;

  // Fetch a random page from this book
  try {
    const bookInfo = await executeGetBook(db, { book_id: bookId });
    const pageMap = bookInfo.indexes?.page_map;
    const totalPages = pageMap ? pageMap.length : 10;
    const randomPage = Math.floor(Math.random() * totalPages) + 1;

    const page = await executeGetPage({
      book_id: bookId,
      page_number: randomPage,
    });

    const text = stripHtml(page.text || "").trim();
    // Take a meaningful snippet (first 500 chars)
    const snippet = text.slice(0, 500) + (text.length > 500 ? "..." : "");

    if (jsonMode) {
      return out({
        book_id: bookId,
        book_name: bookName,
        author_name: authorRow?.name,
        page: randomPage,
        text: snippet,
      });
    }

    console.log(c.dim("─".repeat(50)));
    console.log();
    console.log(formatArabicContent("  " + snippet.replace(/\n/g, "\n  ")));
    console.log();
    console.log(c.dim("─".repeat(50)));
    console.log(
      formatArabicContent(c.cyan(`  ${bookName}`) +
        (authorRow ? c.dim(` — ${authorRow.name}`) : "")),
    );
    console.log(
      c.dim(`  Page ${randomPage}`) +
        c.dim(` · Book ID: ${bookId}`),
    );
    console.log();
  } catch {
    // If API call fails, just show the book info
    if (jsonMode) return out({ book_id: bookId, book_name: bookName, author_name: authorRow?.name });
    console.log(c.cyan(`  ${bookName}`) + (authorRow ? c.dim(` — ${authorRow.name}`) : ""));
    console.log(c.dim(`  Book ID: ${bookId}`));
    console.log(c.yellow("  (Could not fetch page content)"));
  }
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
    console.log(formatArabicContent("  " + snippet.replace(/\n/g, " ").trim()));
    console.log();
  }
}

function printBook(data: any): void {
  if (jsonMode) return out(data);

  const meta = data.meta || {};
  console.log(formatArabicContent(c.bold(meta.name || "Unknown Book")));
  console.log(c.dim("─".repeat(40)));
  if (data.local_book_name && data.local_book_name !== meta.name)
    console.log(formatArabicContent("  Name (local): " + data.local_book_name));
  if (data.local_author_name)
    console.log(formatArabicContent("  Author: " + c.green(data.local_author_name)));
  if (data.local_category_name)
    console.log(formatArabicContent("  Category: " + data.local_category_name));
  if (meta.info) console.log(formatArabicContent("  Info: " + stripHtml(meta.info)));
  if (data.local_pdf_links) console.log("  PDF: " + data.local_pdf_links);
  if (data.local_author_death)
    console.log("  Author death: " + data.local_author_death + " AH");

  const indexes = data.indexes;
  if (indexes?.headings?.length) {
    console.log("\n" + c.bold("Table of Contents") + ` (${indexes.headings.length} headings)`);
    for (const h of indexes.headings.slice(0, 20)) {
      const indent = "  ".repeat(h.level || 1);
      console.log(formatArabicContent(`${indent}${c.dim(`p.${h.page}`)} ${h.title}`));
    }
    if (indexes.headings.length > 20)
      console.log(c.dim(`  ... and ${indexes.headings.length - 20} more`));
  }
}

function printPage(data: any): void {
  if (jsonMode) return out(data);

  const meta = data.meta || {};
  if (meta.book_name) console.log(formatArabicContent(c.bold(meta.book_name)));
  if (meta.vol || meta.page)
    console.log(
      c.dim(
        [meta.vol && `Volume ${meta.vol}`, meta.page && `Page ${meta.page}`]
          .filter(Boolean)
          .join(", "),
      ),
    );
  if (meta.headings?.length)
    console.log(formatArabicContent(c.yellow(meta.headings.join(" > "))));

  console.log(c.dim("─".repeat(40)));
  console.log(formatArabicContent(stripHtml(data.text || "")));
}

function printAuthor(data: any): void {
  if (jsonMode) return out(data);

  const name = data.local_name || "Author";
  console.log(formatArabicContent(c.bold(name)));
  console.log(c.dim("─".repeat(40)));
  if (data.local_death) console.log("  Death: " + data.local_death + " AH");
  if (data.local_death_label)
    console.log("  Death (approx): " + data.local_death_label);
  if (data.info) console.log(formatArabicContent("\n" + stripHtml(data.info)));
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

      case "read": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: read requires a numeric book ID"));
          process.exit(1);
        }
        const startPage = getNumOpt("--start") || 1;
        await runInteractiveReader(db, id, startPage);
        break;
      }

      case "toc": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: toc requires a numeric book ID"));
          process.exit(1);
        }
        const result = await executeGetBook(db, { book_id: id });
        printToc(result);
        break;
      }

      case "export": {
        const id = Number(filteredArgs[1]);
        if (!id || isNaN(id)) {
          console.error(c.red("Error: export requires a numeric book ID"));
          process.exit(1);
        }
        const format = getOpt("--format") || "md";
        if (format !== "md" && format !== "txt") {
          console.error(c.red("Error: --format must be 'md' or 'txt'"));
          process.exit(1);
        }
        await runExport(id, format);
        break;
      }

      case "compare": {
        const id1 = Number(filteredArgs[1]);
        const id2 = Number(filteredArgs[2]);
        if (!id1 || isNaN(id1) || !id2 || isNaN(id2)) {
          console.error(
            c.red("Error: compare requires two numeric book IDs"),
          );
          process.exit(1);
        }
        await runCompare(db, id1, id2);
        break;
      }

      case "random": {
        await runRandom(db);
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

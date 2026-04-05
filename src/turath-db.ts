/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, "../data/turath_metadata.db");

export function getDb(customPath?: string): Database.Database {
  const dbPath = customPath || DEFAULT_DB_PATH;
  return new Database(dbPath, { readonly: true });
}

interface SearchEnrichRow {
  book_name: string | null;
  author_name: string | null;
  cat_name: string | null;
  pdf_links: string | null;
}

interface BookEnrichRow {
  book_name: string | null;
  author_name: string | null;
  cat_name: string | null;
  pdf_links: string | null;
  info_long: string | null;
  author_death: number | null;
}

interface AuthorEnrichRow {
  name: string | null;
  death: number | null;
  death_inexact_label: string | null;
}

export function enrichSearchResult(
  db: Database.Database,
  item: Record<string, any>,
): void {
  const bookId = item.book_id;
  if (!bookId) return;

  const row = db
    .prepare(
      `SELECT b.name AS book_name, a.name AS author_name, c.name AS cat_name, b.pdf_links
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN cats c ON b.cat_id = c.id
       WHERE b.id = ?`,
    )
    .get(bookId) as SearchEnrichRow | undefined;

  if (row) {
    item.local_book_name = row.book_name;
    item.local_author_name = row.author_name;
    item.local_cat_name = row.cat_name;
    item.local_pdf_links = row.pdf_links;
  }

  const meta = item.meta || {};
  const parts: string[] = [];

  const bookName = item.local_book_name || meta.book_name;
  if (bookName) parts.push(`Kitab: ${bookName}`);

  const authorName = item.local_author_name || meta.author_name;
  if (authorName) parts.push(`Penulis: ${authorName}`);

  if (item.local_cat_name) parts.push(`Kategori: ${item.local_cat_name}`);

  if (meta.vol) parts.push(`Jilid: ${meta.vol}`);
  if (meta.page) parts.push(`Halaman: ${meta.page}`);

  let url = `https://shamela.ws/book/${bookId}`;
  if (meta.page_id) url += `/${meta.page_id}`;
  parts.push(`Link: ${url}`);

  item.reference_info = "Sumber: " + parts.join(", ");
}

export function enrichBookInfo(
  db: Database.Database,
  bookId: number,
  result: Record<string, any>,
): void {
  const row = db
    .prepare(
      `SELECT b.name AS book_name, a.name AS author_name, c.name AS cat_name,
              b.pdf_links, b.info_long, a.death AS author_death
       FROM books b
       LEFT JOIN authors a ON b.author_id = a.id
       LEFT JOIN cats c ON b.cat_id = c.id
       WHERE b.id = ?`,
    )
    .get(bookId) as BookEnrichRow | undefined;

  if (row) {
    result.local_book_name = row.book_name;
    result.local_author_name = row.author_name;
    result.local_category_name = row.cat_name;
    result.local_pdf_links = row.pdf_links;
    result.local_info_long = row.info_long;
    result.local_author_death = row.author_death;
  }
}

export function enrichAuthor(
  db: Database.Database,
  authorId: number,
  result: Record<string, any>,
): void {
  const row = db
    .prepare(
      "SELECT name, death, death_inexact_label FROM authors WHERE id = ?",
    )
    .get(authorId) as AuthorEnrichRow | undefined;

  if (row) {
    result.local_name = row.name;
    result.local_death = row.death;
    result.local_death_label = row.death_inexact_label;
  }
}

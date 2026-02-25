// ── API Response Types ──────────────────────────────────────────────

export type SearchResult = {
  author_id: number;
  book_id: number;
  cat_id: number;
  meta: string;
  snip: string;
  text: string;
};

export type SearchApiResponse = {
  count: number;
  data: SearchResult[];
};

export type BookMeta = {
  author_id: number;
  author_page_start: number;
  cat_id: number;
  date_built: number;
  id: number;
  info: string;
  info_long: string;
  name: string;
  printed: number;
  type: number;
  version: string;
};

export type BookHeading = {
  level: number;
  page: number;
  title: string;
};

export type BookIndexes = {
  headings: BookHeading[];
  non_author: unknown[];
  page_headings: Record<number, number[]>;
  page_map: string[];
  print_pg_to_pg: Record<string, number>;
  volume_bounds: Record<string, [number, number]>;
  volumes: string[];
};

export type BookApiResponse = {
  indexes: BookIndexes;
  meta: BookMeta;
};

export type PageApiResponse = {
  meta: string;
  text: string;
};

export type AuthorApiResponse = {
  info: string;
};

// ── Book File Types (files.turath.io) ──────────────────────────────

export type BookFileMeta = {
  author_id: number;
  cat_id: number;
  date_built: number;
  details: string;
  has_pdf: boolean;
  id: number;
  name: string;
  size: number;
};

export type BookFileHeading = {
  level: number;
  page: number;
  title: string;
};

export type BookFileIndexes = {
  hadiths: Record<string, number>;
  headings: BookFileHeading[];
  pdf_base: string;
  pdfs: Record<string, string>;
  volumes: string[];
};

export type GeneratedIndexes = {
  hadith_max: string;
  hadith_pages: Record<string, string>;
  page_headings: Record<number, number[]>;
  page_map: (null | string)[];
  print_pg_to_pg: Record<string, number>;
  volume_bounds: Record<string, [number, number]>;
};

export type BookPage = {
  page?: number;
  text: string;
  vol?: string;
};

export type BookFileApiResponse = {
  indexes: BookFileIndexes;
  indexes_generated: GeneratedIndexes;
  meta: BookFileMeta;
  pages: BookPage[];
};

// ── Shared Types ───────────────────────────────────────────────────

export type PageMetadata = {
  author_name?: string;
  book_name?: string;
  headings: string[]; // always array, even if empty
  page?: number;
  page_id?: number;
  vol?: string;
};

export enum SortField {
  PageId = "page_id",
  Death = "death",
}

export type SearchOptions = {
  author?: number;
  book?: number;
  category?: number;
  page?: number;
  precision?: number;
  sortField?: SortField;
};

export type QueryParameters = Record<
  string,
  string | number | undefined | null
>;

// ── Error Types ────────────────────────────────────────────────────
// HttpError is a class in turath-api.ts — all fields required,
// constructed only from a Response object (impossible states can't exist)

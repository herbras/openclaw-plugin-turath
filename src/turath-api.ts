/**
 * Dibuat oleh Ibrahim Nurul Huda
 * Website: sarbeh.com
 * https://academy.founderplus.id/p/turath-plugin
 */

import { request } from "undici";
import type {
  QueryParameters,
  PageMetadata,
  BookFileApiResponse,
} from "./types.js";

const API_BASE = "https://api.turath.io";
const FILES_BASE = "https://files.turath.io/books-v3";
const API_VER = 3;

// ── Error Handling (ADT: all fields required, instanceof narrowing) ──

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.url = url;
  }
}

// ── Query Parameter Helpers ────────────────────────────────────────

function appendQueryParameters(url: URL, params: QueryParameters): void {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

// ── Fetch Functions ────────────────────────────────────────────────

export async function fetchApi<T = unknown>(
  path: string,
  params?: QueryParameters,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("ver", String(API_VER));
  if (params) {
    appendQueryParameters(url, params);
  }

  const { statusCode, body } = await request(url.toString(), {
    headers: { accept: "application/json" },
  });

  if (statusCode < 200 || statusCode >= 300) {
    throw new HttpError(statusCode, `HTTP ${statusCode}`, url.toString());
  }

  return (await body.json()) as T;
}

export async function fetchFile<T = unknown>(path: string): Promise<T> {
  const url = `${FILES_BASE}${path}`;

  const { statusCode, body } = await request(url, {
    headers: { accept: "application/json" },
  });

  if (statusCode < 200 || statusCode >= 300) {
    throw new HttpError(statusCode, `HTTP ${statusCode}`, url);
  }

  return (await body.json()) as T;
}

// ── v3 Book File Decoder ──────────────────────────────────────────
// files.turath.io/books-v3 uses Arabic diacritics as minified keys.
// This maps them back to readable fields.

function decodeBookFileV3(raw: any): BookFileApiResponse {
  const meta = raw["\u064B"] || {}; // ً
  const indexes = raw["\u0658"] || {}; // ٘

  return {
    meta: {
      id: meta["\u064C"], // ٌ
      name: meta["\u064D"] || "", // ٍ
      cat_id: meta["\u064E"], // َ
      author_id: meta["\u064F"], // ُ
      details: meta["\u0651"] || "", // ّ
      has_pdf: !!meta["\u0650"], // ِ
      size: meta["\u0654"] || 0, // ٔ
      date_built: meta["\u0656"] || 0, // ٖ
    },
    indexes: {
      volumes: indexes["\u0659"] || [], // ٙ
      headings: indexes["\u065A"] || [], // ٚ
      pdf_base: "",
      pdfs: {},
    },
    indexes_generated: {
      hadith_max: "",
      hadith_pages: {},
      page_headings: indexes["\u065B"] || {}, // ٛ
      page_map: indexes["\u065D"] || [], // ٝ
      print_pg_to_pg: indexes["\u065E"] || {}, // ٞ
      volume_bounds: indexes["\u065C"] || {}, // ٜ
    },
    pages: raw.pages || [],
  };
}

export async function fetchBookFile(id: number): Promise<BookFileApiResponse> {
  try {
    const raw = await fetchFile<any>(`/${id}.json`);
    // v3 format uses Arabic diacritics as keys
    if (raw["\u064B"]) return decodeBookFileV3(raw);
    // Fallback: already in standard format
    return raw as BookFileApiResponse;
  } catch (error: unknown) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error(`Book ${id} not found`);
    }
    throw error;
  }
}

// ── Metadata Parser ────────────────────────────────────────────────

export function parseMeta(metaStr?: string | null): PageMetadata {
  if (!metaStr) return { headings: [] };
  try {
    const parsed = JSON.parse(metaStr);
    return {
      author_name: parsed.author_name,
      book_name: parsed.book_name,
      headings: Array.isArray(parsed.headings) ? parsed.headings : [],
      page: parsed.page,
      page_id: parsed.page_id,
      vol: parsed.vol,
    };
  } catch {
    return { headings: [] };
  }
}

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
const FILES_BASE = "https://files.turath.io/books";
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

export async function fetchBookFile(id: number): Promise<BookFileApiResponse> {
  try {
    return await fetchFile<BookFileApiResponse>(`/${id}.json`);
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

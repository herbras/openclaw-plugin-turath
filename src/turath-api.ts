const API_BASE = "https://api.turath.io";
const FILES_BASE = "https://files.turath.io/books";
const API_VER = 3;

const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  Referer: "https://turath.io/",
  Origin: "https://turath.io",
};

export class TurathError extends Error {
  status?: number;
  url?: string;

  constructor(message: string, status?: number, url?: string) {
    super(message);
    this.name = "TurathError";
    this.status = status;
    this.url = url;
  }
}

export interface PageMetadata {
  author_name?: string;
  book_name?: string;
  headings?: string[];
  page?: number;
  page_id?: number;
  vol?: string;
}

export async function fetchApi(
  path: string,
  params?: Record<string, string | number>,
): Promise<any> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("ver", String(API_VER));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), { headers: HEADERS });

  if (!response.ok) {
    throw new TurathError(
      `Request failed: ${response.status}`,
      response.status,
      url.toString(),
    );
  }

  return response.json();
}

export async function fetchFile(path: string): Promise<any> {
  const url = `${FILES_BASE}${path}`;
  const response = await fetch(url, { headers: HEADERS });

  if (!response.ok) {
    throw new TurathError(
      `Request failed: ${response.status}`,
      response.status,
      url,
    );
  }

  return response.json();
}

export function parseMeta(metaStr?: string | null): PageMetadata {
  if (!metaStr) return {};
  try {
    const parsed = JSON.parse(metaStr);
    if (!parsed.headings) parsed.headings = [];
    return parsed;
  } catch {
    return {};
  }
}

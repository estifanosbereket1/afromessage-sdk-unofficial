import {
  AfroAuthError,
  AfroMessageError,
  AfroRateLimitError,
} from "../types/errors.js";

export interface RequestOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AfroMessageError(
      `Non-JSON response from server: ${text}`,
      res.status,
      text,
    );
  }

  if (res.status === 401) throw new AfroAuthError(parsed);
  if (res.status === 429) throw new AfroRateLimitError(parsed);

  if (!res.ok) {
    throw new AfroMessageError(
      `Request failed with status ${res.status}`,
      res.status,
      parsed,
    );
  }

  return parsed as T;
}

function buildUrl(
  base: string,
  path: string,
  params: RequestOptions["params"],
): string {
  const url = new URL(path, base);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
  retries = 3,
): Promise<T> {
  const { method = "GET", params, body, headers = {} } = options;

  const url = buildUrl(baseUrl, path, params);

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method === "POST") {
    init.body = JSON.stringify(body);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, init);

      if (res.status === 429 && attempt < retries - 1) {
        await sleep(exponentialDelay(attempt));
        continue;
      }

      return await parseResponse<T>(res);
    } catch (err) {
      if (err instanceof AfroAuthError) throw err;
      lastError = err;

      if (attempt < retries - 1) {
        await sleep(exponentialDelay(attempt));
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exponentialDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 10_000);
}

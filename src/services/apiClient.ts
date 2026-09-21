/**
 * Thin fetch wrapper for the XOGameBackend REST API — replaces
 * supabase.rpc(...) calls. Same idea as supabaseClient.ts before it: a
 * single place that knows the base URL and how to surface errors.
 */
import { en } from "../i18n/dictionaries/en";
import { ru } from "../i18n/dictionaries/ru";

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8092";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

type ApiErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
  field?: string | null;
};

/**
 * The API's error messages are English and written for logs. The few a
 * player can actually run into are shown in the page's language instead —
 * I18nProvider keeps <html lang> in sync, and this module has no React
 * context to read it from otherwise.
 */
function localizedMessage(code: string | undefined): string | undefined {
  const t = document.documentElement.lang.startsWith("en") ? en : ru;
  switch (code) {
    case "game_not_found":
      return t.game.notFound;
    case "rate_limited":
      return t.common.rateLimited;
    default:
      return undefined;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // Response body wasn't JSON (e.g. a proxy error page) — fall through
      // to the generic message below.
    }
    throw new ApiError(
      response.status,
      body.code ?? "request_failed",
      localizedMessage(body.code) ??
        body.message ??
        `Request failed with status ${response.status}`,
      body.field ?? undefined,
    );
  }

  return (await response.json()) as T;
}

export function apiGet<T>(
  path: string,
  headers?: Record<string, string>,
): Promise<T> {
  return request<T>(path, { method: "GET", headers });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiBaseUrl(): string {
  return API_BASE_URL;
}

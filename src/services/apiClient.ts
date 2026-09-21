/**
 * Thin fetch wrapper for the XOGameBackend REST API — replaces
 * supabase.rpc(...) calls. Same idea as supabaseClient.ts before it: a
 * single place that knows the base URL and how to surface errors.
 */
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
      body.message ?? `Request failed with status ${response.status}`,
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

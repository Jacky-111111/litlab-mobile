import { AppConfig } from "./config";
import { supabase } from "./supabase";

export class APIError extends Error {
  public readonly status: number;
  public readonly notAuthenticated: boolean;

  constructor(message: string, status = 0, notAuthenticated = false) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.notAuthenticated = notAuthenticated;
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildURL(path: string, query?: Record<string, QueryValue>): string {
  const base = AppConfig.apiBaseURL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new APIError(error.message, 0, true);
  }
  const token = data.session?.access_token;
  if (!token) {
    throw new APIError("Not signed in.", 401, true);
  }
  return token;
}

async function getOptionalAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    return null;
  }
  return data.session.access_token;
}

async function parseError(response: Response): Promise<never> {
  const status = response.status;
  let message = `Something went wrong (${status})`;
  try {
    const data = (await response.json()) as { detail?: unknown };
    if (typeof data.detail === "string" && data.detail.length > 0) {
      message = data.detail;
    }
  } catch {
    // Ignore JSON parse failures; keep the generic message.
  }
  if (status === 401) {
    // Caller layer will trigger sign-out.
    await supabase.auth.signOut().catch(() => undefined);
    throw new APIError(message, status, true);
  }
  throw new APIError(message, status, false);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 = globalThis.btoa;
  if (typeof b64 !== "function") {
    throw new APIError("Base64 encoding is not available.");
  }
  return b64(binary);
}

type HttpMethod = "GET" | "POST" | "PATCH";

async function request<T>(
  method: HttpMethod,
  path: string,
  options: {
    query?: Record<string, QueryValue>;
    body?: unknown;
    requiresAuth?: boolean;
  } = {}
): Promise<T> {
  const { query, body, requiresAuth = true } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (requiresAuth) {
    const token = await getAccessToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AppConfig.requestTimeoutMs
  );

  let response: Response;
  try {
    response = await fetch(buildURL(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new APIError("Request timed out. Please try again.");
    }
    const message =
      err instanceof Error ? err.message : "Network request failed.";
    throw new APIError(message);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new APIError("Couldn't read server response.");
  }
}

async function getOptionalAuth<T>(
  path: string,
  query?: Record<string, QueryValue>
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const token = await getOptionalAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AppConfig.requestTimeoutMs
  );

  let response: Response;
  try {
    response = await fetch(buildURL(path, query), {
      method: "GET",
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new APIError("Request timed out. Please try again.");
    }
    const message =
      err instanceof Error ? err.message : "Network request failed.";
    throw new APIError(message);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    await parseError(response);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new APIError("Couldn't read server response.");
  }
}

async function fetchAuthedBlobDataUri(
  path: string,
  query?: Record<string, QueryValue>,
  accept = "image/png"
): Promise<string> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: accept,
    Authorization: `Bearer ${token}`,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AppConfig.requestTimeoutMs
  );

  let response: Response;
  try {
    response = await fetch(buildURL(path, query), {
      method: "GET",
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new APIError("Request timed out. Please try again.");
    }
    const message =
      err instanceof Error ? err.message : "Network request failed.";
    throw new APIError(message);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    await parseError(response);
  }

  const buf = await response.arrayBuffer();
  const mime = response.headers.get("content-type")?.split(";")[0] || accept;
  return `data:${mime};base64,${arrayBufferToBase64(buf)}`;
}

export const api = {
  get<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    return request<T>("GET", path, { query });
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("POST", path, { body });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("PATCH", path, { body });
  },
  getOptionalAuth<T>(
    path: string,
    query?: Record<string, QueryValue>
  ): Promise<T> {
    return getOptionalAuth<T>(path, query);
  },
  fetchAuthedBlobDataUri(
    path: string,
    query?: Record<string, QueryValue>
  ): Promise<string> {
    return fetchAuthedBlobDataUri(path, query);
  },
};

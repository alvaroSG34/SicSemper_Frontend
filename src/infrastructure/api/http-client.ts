"use client";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
};

type ErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  details?: unknown;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string | null;
  readonly details: unknown;

  constructor(statusCode: number, message: string, code: string | null, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details ?? null;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:3001/api/v1";

let accessToken: string | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;
let refreshPromise: Promise<string | null> | null = null;

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

const getUrl = (path: string) => `${getApiBaseUrl()}${normalizePath(path)}`;

const getCodeFromPayload = (payload: ErrorPayload): string | null => {
  if (typeof payload.message === "string" && /^[A-Z0-9_]+$/.test(payload.message)) {
    return payload.message;
  }

  if (typeof payload.error === "string" && /^[A-Z0-9_]+$/.test(payload.error)) {
    return payload.error;
  }

  return null;
};

const getMessageFromPayload = (payload: ErrorPayload, statusCode: number) => {
  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return `HTTP_${statusCode}`;
};

const toApiError = (statusCode: number, payload: ErrorPayload) =>
  new ApiError(
    statusCode,
    getMessageFromPayload(payload, statusCode),
    getCodeFromPayload(payload),
    payload.details,
  );

const parseResponse = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  return text ? ({ message: text } satisfies ErrorPayload) : null;
};

const runRefresh = async () => {
  if (!refreshHandler) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshHandler().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const sendRequest = async (
  path: string,
  options: RequestOptions,
  allowRetry: boolean,
): Promise<unknown> => {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(getUrl(path), {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
  });

  if (response.ok) {
    return parseResponse(response);
  }

  const payload = ((await parseResponse(response)) ?? {}) as ErrorPayload;

  if (
    response.status === 401 &&
    allowRetry &&
    !options.skipAuthRefresh &&
    typeof window !== "undefined"
  ) {
    const nextToken = await runRefresh();

    if (nextToken) {
      return sendRequest(path, options, false);
    }
  }

  throw toApiError(response.status, payload);
};

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

export const getAccessToken = () => accessToken;

export const registerRefreshHandler = (handler: (() => Promise<string | null>) | null) => {
  refreshHandler = handler;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> =>
  (await sendRequest(path, options, true)) as T;

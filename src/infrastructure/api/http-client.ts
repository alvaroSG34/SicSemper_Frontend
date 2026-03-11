import { getApiBaseUrl } from "@/infrastructure/api/api-base-url";

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

let refreshPromise: Promise<boolean> | null = null;

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

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
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(getUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
        });

        return response.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const sendRequest = async (
  path: string,
  options: RequestOptions,
  allowRetry: boolean,
): Promise<unknown> => {
  const isFormDataBody = options.body instanceof FormData;
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body !== undefined && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(getUrl(path), {
    method: options.method ?? "GET",
    headers,
    body:
      options.body === undefined
        ? undefined
        : isFormDataBody
          ? (options.body as FormData)
          : JSON.stringify(options.body),
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
    const refreshed = await runRefresh();

    if (refreshed) {
      return sendRequest(path, options, false);
    }
  }

  throw toApiError(response.status, payload);
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> =>
  (await sendRequest(path, options, true)) as T;

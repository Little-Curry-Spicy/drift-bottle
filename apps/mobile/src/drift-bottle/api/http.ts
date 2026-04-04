import ky, { type KyInstance } from "ky";

import type { GetAccessToken } from "./api-types";

export type { DriftStats, GetAccessToken } from "./api-types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!.replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly code: number;

  constructor(message: string, status: number, code = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** 与 apps/api 全局拦截器 / 异常过滤器一致 */
type ApiEnvelope<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
};

type AuthedRequestConfig = {
  method: "GET" | "POST" | "DELETE";
  url: string;
  data?: unknown;
};

function parseEnvelope<T>(status: number, raw: unknown): T {
  if (typeof raw !== "object" || raw === null) {
    if (status >= 400) {
      throw new ApiError(`Request failed: ${status}`, status);
    }
    throw new ApiError("Invalid response", status);
  }

  const body = raw as ApiEnvelope<T>;
  const bizCode = typeof body.code === "number" ? body.code : 0;

  if (status >= 400 || body.success === false) {
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : errorMessageFromBody(raw) || `Request failed: ${status}`;
    throw new ApiError(message, status, bizCode);
  }

  if (body.success !== true || body.code !== 0) {
    throw new ApiError(body.message, status, bizCode);
  }

  return (body.data === null ? undefined : body.data) as T;
}

function errorMessageFromBody(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string") return m;
    if (Array.isArray(m)) return m.join(", ");
  }
  try {
    return JSON.stringify(data);
  } catch {
    return "Request failed";
  }
}

async function readResponseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** 固定请求头：`Authorization: Bearer <token>`（无 token 时不带头）；基于 fetch，适合 RN / Web */
export function createAuthedRequest(getAccessToken: GetAccessToken) {
  const client: KyInstance = ky.create({
    prefixUrl: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    throwHttpErrors: false,
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await getAccessToken();
          if (token) request.headers.set("Authorization", `Bearer ${token}`);
        },
      ],
    },
  });

  return async function request<T>(config: AuthedRequestConfig): Promise<T> {
    const path = config.url.replace(/^\//, "");
    const response = await client(path, {
      method: config.method,
      ...(config.data !== undefined ? { json: config.data } : {}),
    });

    const raw = await readResponseJson(response);
    return parseEnvelope<T>(response.status, raw);
  };
}

import type { Bottle } from "./types";

export type DriftStats = {
  thrown: number;
  favorite: number;
  replied: number;
};

type GetHeaders = () => Promise<Record<string, string>>;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function request<T>(
  path: string,
  init: RequestInit | undefined,
  getHeaders: GetHeaders,
): Promise<T> {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    const message = text || `Request failed: ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const driftBottleApi = {
  listMine(getHeaders: GetHeaders) {
    return request<Bottle[]>("/bottles/mine", { method: "GET" }, getHeaders);
  },
  listFavorites(getHeaders: GetHeaders) {
    return request<Bottle[]>("/bottles/favorites", { method: "GET" }, getHeaders);
  },
  getStats(getHeaders: GetHeaders) {
    return request<DriftStats>("/bottles/stats", { method: "GET" }, getHeaders);
  },
  createBottle(content: string, mood: Bottle["mood"], getHeaders: GetHeaders) {
    return request<Bottle>(
      "/bottles",
      {
        method: "POST",
        body: JSON.stringify({ content, mood }),
      },
      getHeaders,
    );
  },
  catchRandom(getHeaders: GetHeaders) {
    return request<Bottle>("/bottles/catch", { method: "GET" }, getHeaders);
  },
  addReply(bottleId: string, content: string, getHeaders: GetHeaders) {
    return request<Bottle>(
      `/bottles/${bottleId}/replies`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
      getHeaders,
    );
  },
  addFavorite(bottleId: string, getHeaders: GetHeaders) {
    return request<void>(
      `/bottles/${bottleId}/favorite`,
      {
        method: "POST",
      },
      getHeaders,
    );
  },
};

import {
  createAuthedRequest,
  type DriftStats,
  type GetAccessToken,
} from "./http";
import type { BottlePayload, RepliedOutItem, RepliedToMeItem } from "../types";

export function createDriftBottleApi(getAccessToken: GetAccessToken) {
  const request = createAuthedRequest(getAccessToken);

  return {
    listMine() {
      return request<BottlePayload[]>({ method: "GET", url: "/bottles/mine" });
    },
    listFavorites() {
      return request<BottlePayload[]>({ method: "GET", url: "/bottles/favorites" });
    },
    getStats() {
      return request<DriftStats>({ method: "GET", url: "/bottles/stats" });
    },
    listRepliedByMe() {
      return request<RepliedOutItem[]>({
        method: "GET",
        url: "/bottles/replied-by-me",
      });
    },
    listRepliesToMyBottles() {
      return request<RepliedToMeItem[]>({
        method: "GET",
        url: "/bottles/replies-to-me",
      });
    },
    createBottle(content: string) {
      return request<BottlePayload>({
        method: "POST",
        url: "/bottles",
        data: { content },
      });
    },
    catchRandom() {
      return request<{ bottle: BottlePayload | null }>({
        method: "GET",
        url: "/bottles/catch",
      });
    },
    addReply(bottleId: string, content: string) {
      return request<BottlePayload>({
        method: "POST",
        url: `/bottles/${bottleId}/replies`,
        data: { content },
      });
    },
    addFavorite(bottleId: string) {
      return request<void>({
        method: "POST",
        url: `/bottles/${bottleId}/favorite`,
      });
    },
    removeFavorite(bottleId: string) {
      return request<void>({
        method: "DELETE",
        url: `/bottles/${bottleId}/favorite`,
      });
    },
  };
}

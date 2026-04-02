export type DriftStats = {
  thrown: number;
  favorite: number;
  replied: number;
  receivedReplies?: number;
};

/** 与后端一致：仅 Bearer Token（如 Clerk `getToken()`） */
export type GetAccessToken = () => Promise<string | null>;

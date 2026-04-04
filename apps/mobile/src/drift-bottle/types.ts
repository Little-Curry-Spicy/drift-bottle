export type BottleAuthor = "me" | "stranger";

export type Bottle = {
  id: string;
  content: string;
  author: BottleAuthor;
  replies: string[];
  createdAt: string;
};

/** 与 GET 接口返回的瓶子字段一致 */
export type BottlePayload = Bottle;

export function bottleFromPayload(p: BottlePayload): Bottle {
  return p;
}

export type Tab = "sea" | "throw" | "favorites" | "mine";

/** GET /bottles/replied-by-me 单项 */
export type RepliedOutItem = {
  bottleId: string;
  bottleContent: string;
  bottleCreatedAt: string;
  bottleAuthorMask: string;
  myReplyContents: string[];
  lastRepliedAt: string;
};

/** GET /bottles/replies-to-me 单项：他人回复了我的瓶子 */
export type IncomingReplyLine = {
  content: string;
  authorMask: string;
  createdAt: string;
};

export type RepliedToMeItem = {
  bottleId: string;
  bottleContent: string;
  bottleCreatedAt: string;
  incomingReplies: IncomingReplyLine[];
  /** 我在该瓶子下发出的回复内容（时间升序） */
  myReplyContents: string[];
  lastReplyAt: string;
};

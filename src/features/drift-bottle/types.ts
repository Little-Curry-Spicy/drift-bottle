export type Mood = "开心" | "迷茫" | "焦虑" | "期待";

export type BottleAuthor = "我" | "陌生人";

export type Bottle = {
  id: string;
  content: string;
  mood: Mood;
  author: BottleAuthor;
  replies: string[];
  createdAt: string;
};

export type Tab = "sea" | "throw" | "favorites" | "mine";

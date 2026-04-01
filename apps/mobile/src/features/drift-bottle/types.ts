export type Mood = "Calm" | "Confused" | "Anxious" | "Hopeful";

export type BottleAuthor = "me" | "stranger";

export type Bottle = {
  id: string;
  content: string;
  mood: Mood;
  author: BottleAuthor;
  replies: string[];
  createdAt: string;
};

export type Tab = "sea" | "throw" | "favorites" | "mine";

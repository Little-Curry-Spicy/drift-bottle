import type { Bottle, Mood, Tab } from "./types";

export const moodOptions: Mood[] = ["Calm", "Confused", "Anxious", "Hopeful"];

export const tabItems: { key: Tab; label: string }[] = [
  { key: "sea", label: "Sea" },
  { key: "throw", label: "Drop" },
  { key: "favorites", label: "Saved" },
  { key: "mine", label: "Mine" },
];

export const seedBottles: Bottle[] = [
  {
    id: "b-1",
    content: "Finally fixed a nasty bug today. Sending this little win into the sea.",
    mood: "Calm",
    author: "stranger",
    replies: ["I know that feeling. Congrats!"],
    createdAt: "2m ago",
  },
  {
    id: "b-2",
    content: "I recently moved into web3. So many directions, not sure where to focus.",
    mood: "Confused",
    author: "stranger",
    replies: [],
    createdAt: "12m ago",
  },
];

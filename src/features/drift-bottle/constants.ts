import type { Bottle, Mood, Tab } from "./types";

export const moodOptions: Mood[] = ["开心", "迷茫", "焦虑", "期待"];

export const tabItems: { key: Tab; label: string }[] = [
  { key: "sea", label: "海域" },
  { key: "throw", label: "扔瓶" },
  { key: "favorites", label: "收藏" },
  { key: "mine", label: "我的" },
];

export const seedBottles: Bottle[] = [
  {
    id: "b-1",
    content: "今天终于把一个 bug 修好了，想把这份开心丢进海里。",
    mood: "开心",
    author: "陌生人",
    replies: ["太懂这种快乐了！"],
    createdAt: "2分钟前",
  },
  {
    id: "b-2",
    content: "刚转行 web3，方向很多，有点迷茫。",
    mood: "迷茫",
    author: "陌生人",
    replies: [],
    createdAt: "12分钟前",
  },
];

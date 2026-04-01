/**
 * 前后端共享类型与常量（API 契约可逐步迁到这里）。
 */

export type BottleMood = "calm" | "hopeful" | "playful" | "reflective";

export interface BottleDto {
  id: string;
  content: string;
  mood: BottleMood;
  createdAt: string;
}

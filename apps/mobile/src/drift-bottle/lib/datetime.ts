import i18next from "@/src/i18n/i18n";

/** 后端 `createdAt` 为 ISO 字符串时的展示（随界面语言切换区域格式） */
export function formatBottleTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const locale = i18next.language === "zh" ? "zh-CN" : "en-US";
  return d.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

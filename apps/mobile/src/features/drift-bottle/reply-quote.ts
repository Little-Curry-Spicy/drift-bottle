export type ParsedQuotedReply = {
  /** 第一行引用内容（不含引号）；如果没有引用，则为 undefined */
  quote?: string;
  /** 引用之后的正文（去掉首尾空白）；没有正文则为 "" */
  text: string;
};

/**
 * 解析“引用回复”格式：
 * - 第一行：“被引用内容”（全角引号）
 * - 第二行开始：用户自己要说的话（可多行）
 */
export function parseQuotedReply(raw: string): ParsedQuotedReply {
  const s = raw.trim();
  const lines = s.split(/\r?\n/);
  const first = (lines[0] ?? "").trim();
  const m = first.match(/^“([\s\S]+)”$/);
  if (m) {
    const quote = m[1];
    const text = lines.slice(1).join("\n").trim();
    return { quote, text };
  }
  return { text: s };
}

/**
 * 生成“引用回复”payload：
 * - targetContent 存在：payload 第一行放 “targetContent”
 * - extraContent 存在：payload 第二行追加 extraContent（换行分隔）
 * - targetContent 不存在：直接返回 extraContent（会由调用方保证已 trim）
 */
export function buildQuotedReplyPayload(
  targetContent: string | null,
  extraContent: string,
): string {
  const extra = extraContent.trim();
  if (!targetContent) return extra;

  const quote = `“${targetContent}”`;
  return extra ? `${quote}\n${extra}` : quote;
}


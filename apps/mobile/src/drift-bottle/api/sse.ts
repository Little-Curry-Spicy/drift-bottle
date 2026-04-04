/**
 * SSE：`GET /bottles/events?token=`（与后端 ClerkAuthGuard 一致；EventSource 无法设 Authorization）。
 * 可选 `EXPO_PUBLIC_API_SSE_URL` 覆盖 HTTP API 基址（须含协议、无尾斜杠）。
 */

export function getDriftBottleSseUrl(token: string): string {
  const explicit = process.env.EXPO_PUBLIC_API_SSE_URL;
  const base = (explicit ?? process.env.EXPO_PUBLIC_API_URL!).replace(/\/$/, "");
  return `${base}/bottles/events?token=${encodeURIComponent(token)}`;
}

/** 解析标准 SSE 帧（按空行分帧），每帧内取 `data:` 行交给回调 */
export async function consumeSseJsonLines(
  url: string,
  onDataLine: (rawDataLine: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(url, {
    headers: { Accept: "text/event-stream" },
    signal,
  });
  if (!res.ok) {
    throw new Error(`SSE ${res.status}`);
  }
  const body = res.body;
  if (!body) {
    throw new Error("SSE no body");
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      for (;;) {
        const sep = buffer.indexOf("\n\n");
        if (sep === -1) break;
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const line of block.split("\n")) {
          if (line.startsWith("data:")) {
            const raw = line.slice(5).trimStart();
            if (raw.length) onDataLine(raw);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

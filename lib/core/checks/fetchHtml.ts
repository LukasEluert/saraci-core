import { fetch } from "undici";
import type { FetchData } from "./types";

const TIMEOUT_MS = 10_000;
const MAX_BYTES = 5 * 1024 * 1024;

export async function fetchHtml(url: string): Promise<
  | { html: string; fetch: FetchData }
  | { error: string; fetch: Partial<FetchData> }
> {
  const started = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Saraci-Core/1.0 (+https://saraci-design.de/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) {
      return {
        error: `Unerwarteter Content-Type: ${contentType || "unbekannt"}`,
        fetch: {
          status_code: res.status,
          response_time_ms: Date.now() - started,
          content_type: contentType,
        },
      };
    }

    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let truncated = false;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        if (total + value.length > MAX_BYTES) {
          const remaining = MAX_BYTES - total;
          if (remaining > 0) chunks.push(value.subarray(0, remaining));
          truncated = true;
          break;
        }
        chunks.push(value);
        total += value.length;
      }
    }

    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");

    return {
      html,
      fetch: {
        status_code: res.status,
        response_time_ms: Date.now() - started,
        content_type: contentType,
        body_size_bytes: total,
        truncated,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error: message,
      fetch: {
        response_time_ms: Date.now() - started,
        content_type: "",
        body_size_bytes: 0,
        truncated: false,
      },
    };
  }
}

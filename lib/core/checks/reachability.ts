import { fetch } from "undici";
import type { ReachabilityData } from "./types";

const HEAD_TIMEOUT_MS = 6_000;
const GET_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 5;

type RequestResult = {
  statusCode: number;
  finalUrl: string;
  redirectChain: string[];
  durationMs: number;
  sslValid: boolean | null;
  sslError?: string;
};

function isReachableStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 400 && statusCode !== 0;
}

function toHttpUrl(httpsUrl: string): string {
  return httpsUrl.replace(/^https:\/\//i, "http://");
}

async function singleRequest(
  targetUrl: string,
  method: "HEAD" | "GET",
  timeoutMs: number,
  rangeOnly: boolean
): Promise<RequestResult> {
  const started = Date.now();
  const redirectChain: string[] = [targetUrl];
  let currentUrl = targetUrl;
  let statusCode = 0;
  let sslValid: boolean | null = null;
  let sslError: string | undefined;

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
      const headers: Record<string, string> = {
        "User-Agent": "Saraci-Core/1.0 (+https://saraci-design.de/bot)",
      };
      if (rangeOnly && method === "GET") {
        headers.Range = "bytes=0-1024";
      }

      const res = await fetch(currentUrl, {
        method,
        headers,
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      });

      statusCode = res.status;
      if (currentUrl.startsWith("https://")) {
        sslValid = true;
      }

      if (statusCode >= 300 && statusCode < 400) {
        const location = res.headers.get("location");
        await res.arrayBuffer().catch(() => null);

        if (location && i < MAX_REDIRECTS) {
          const next = new URL(location, currentUrl).toString();
          redirectChain.push(next);
          currentUrl = next;
          continue;
        }
      }

      await res.arrayBuffer().catch(() => null);

      return {
        statusCode,
        finalUrl: currentUrl,
        redirectChain,
        durationMs: Date.now() - started,
        sslValid,
        sslError,
      };
    }

    return {
      statusCode,
      finalUrl: currentUrl,
      redirectChain,
      durationMs: Date.now() - started,
      sslValid,
      sslError,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (currentUrl.startsWith("https://")) {
      sslValid = false;
      sslError = message;
    }
    return {
      statusCode: 0,
      finalUrl: currentUrl,
      redirectChain,
      durationMs: Date.now() - started,
      sslValid,
      sslError,
    };
  }
}

async function probeUrl(targetUrl: string): Promise<RequestResult> {
  let result = await singleRequest(targetUrl, "HEAD", HEAD_TIMEOUT_MS, false);

  if (
    result.statusCode === 0 ||
    result.statusCode === 405 ||
    result.statusCode === 501
  ) {
    result = await singleRequest(targetUrl, "GET", GET_TIMEOUT_MS, true);
  }

  return result;
}

function buildSslField(
  usedProtocol: "https" | "http",
  result: RequestResult,
  httpsAttempted: boolean
): ReachabilityData["ssl"] {
  if (usedProtocol === "https") {
    return {
      valid: result.sslValid === true,
      error: result.sslError,
    };
  }

  if (httpsAttempted) {
    return { valid: false, error: "no_https_available" };
  }

  return { valid: false, error: "Kein HTTPS" };
}

function toReachabilityData(
  result: RequestResult,
  usedProtocol: "https" | "http",
  started: number,
  httpsAttempted: boolean
): ReachabilityData {
  const ok = isReachableStatus(result.statusCode);

  return {
    ok,
    duration_ms: Date.now() - started,
    final_url: result.finalUrl,
    status_code: result.statusCode || null,
    redirect_chain: result.redirectChain,
    ssl: buildSslField(usedProtocol, result, httpsAttempted),
    used_protocol: usedProtocol,
    error: ok
      ? undefined
      : result.sslError ?? `HTTP ${result.statusCode || "unreachable"}`,
  };
}

export async function checkReachability(url: string): Promise<ReachabilityData> {
  const started = Date.now();
  const inputIsHttp = /^http:\/\//i.test(url);

  if (inputIsHttp) {
    const result = await probeUrl(url);
    const usedProtocol: "https" | "http" = result.finalUrl.startsWith("https://")
      ? "https"
      : "http";
    return toReachabilityData(result, usedProtocol, started, false);
  }

  const httpsResult = await probeUrl(url);
  if (isReachableStatus(httpsResult.statusCode)) {
    const usedProtocol: "https" | "http" = httpsResult.finalUrl.startsWith(
      "https://"
    )
      ? "https"
      : "http";
    return toReachabilityData(httpsResult, usedProtocol, started, true);
  }

  const httpUrl = toHttpUrl(url);
  const httpResult = await probeUrl(httpUrl);
  if (isReachableStatus(httpResult.statusCode)) {
    return toReachabilityData(httpResult, "http", started, true);
  }

  return toReachabilityData(httpResult, "http", started, true);
}

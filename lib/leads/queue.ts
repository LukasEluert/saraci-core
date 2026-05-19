export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export async function triggerProcessQueue(): Promise<void> {
  const token = process.env.INTERNAL_QUEUE_TOKEN;
  if (!token) {
    console.warn("[queue] INTERNAL_QUEUE_TOKEN fehlt – Queue nicht gestartet.");
    return;
  }

  const url = `${getAppBaseUrl()}/api/internal/process-check-queue`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-internal-token": token },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) {
      console.warn("[queue] trigger failed:", res.status);
    }
  } catch (e) {
    if (
      e instanceof Error &&
      e.name !== "TimeoutError" &&
      e.name !== "AbortError"
    ) {
      console.warn("[queue] trigger failed:", e);
    }
  }
}

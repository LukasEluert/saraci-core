"use client";

import { useState, type FormEvent } from "react";
import type { WebsiteCheckResult } from "@/lib/core/checks";

const TOKEN_STORAGE_KEY = "saraci_dev_check_token";

type DevCheckResponse = WebsiteCheckResult & { cached?: boolean };

export default function DevCheckPage() {
  const [url, setUrl] = useState("https://example.com");
  const [devToken, setDevToken] = useState(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  });
  const [force, setForce] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DevCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabaseProjectRef =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([^.]+)\.supabase\.co/
    )?.[1] ?? null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);

    if (!devToken.trim()) {
      setError("Bitte DEV_CHECK_TOKEN aus .env.local eintragen.");
      setPending(false);
      return;
    }

    sessionStorage.setItem(TOKEN_STORAGE_KEY, devToken.trim());

    try {
      const query = force ? "?force=true" : "";
      const res = await fetch(`/api/dev/check-url${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-token": devToken.trim(),
        },
        body: JSON.stringify({ url, force }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : JSON.stringify(data.error)
        );
        return;
      }
      setResult(data as DevCheckResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen");
    } finally {
      setPending(false);
    }
  };

  return (
    <div style={{ fontFamily: "monospace", padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 18, marginBottom: 8 }}>Dev: Website-Check</h1>
      <p style={{ color: "#888", marginBottom: 16 }}>
        POST /api/dev/check-url · Header: x-dev-token · target: standalone
      </p>

      <form
        onSubmit={(e) => void submit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#888", fontSize: 11 }}>DEV_CHECK_TOKEN</span>
          <input
            type="password"
            value={devToken}
            onChange={(e) => setDevToken(e.target.value)}
            autoComplete="off"
            style={{
              padding: 8,
              background: "#111",
              color: "#eee",
              border: "1px solid #333",
            }}
            placeholder="Aus .env.local"
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              flex: 1,
              padding: 8,
              background: "#111",
              color: "#eee",
              border: "1px solid #333",
            }}
            placeholder="https://example.com"
          />
          <button
            type="submit"
            disabled={pending}
            style={{
              padding: "8px 16px",
              background: "#e63030",
              color: "#fff",
              border: "none",
            }}
          >
            {pending ? "Läuft…" : "Check starten"}
          </button>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#888",
            fontSize: 12,
          }}
        >
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
          />
          force (PageSpeed erneut, Cache unter 5 Min ignorieren)
        </label>
      </form>

      {error && (
        <pre style={{ marginTop: 16, color: "#e63030", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      {result && (
        <div style={{ marginTop: 24, lineHeight: 1.6 }}>
          {result.cached && (
            <div style={{ color: "#f59e0b", marginBottom: 8 }}>
              Aus Cache (unter 5 Min, kein neuer PageSpeed-Lauf)
            </div>
          )}
          <div>ok: {String(result.ok)}</div>
          <div>check_id: {result.check_id}</div>
          <div>report_id: {result.report_id ?? "—"}</div>
          <div>score: {result.score ?? "—"}</div>
          <div>potential: {result.potential ?? "—"}</div>
          <div>status: {result.status}</div>
          {result.error && <div>error: {result.error}</div>}
          {supabaseProjectRef && result.check_id && (
            <p style={{ marginTop: 12 }}>
              <a
                href={`https://supabase.com/dashboard/project/${supabaseProjectRef}/editor`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#6af" }}
              >
                Supabase Dashboard öffnen
              </a>
              {" · "}
              <span style={{ color: "#666" }}>
                website_checks.id = {result.check_id}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

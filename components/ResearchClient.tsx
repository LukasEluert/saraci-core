"use client";

import { useMemo, useState } from "react";
import { saveLeadFromResearch } from "@/app/actions/core";
import type { SiteCheckResult } from "@/lib/types/core";
import { PotenzialBadge } from "@/components/PotenzialBadge";

type RowState =
  | { status: "idle"; url: string }
  | { status: "running"; url: string }
  | { status: "done"; url: string; result: SiteCheckResult }
  | { status: "error"; url: string; message: string };

function scoreDotClass(score: number) {
  if (score >= 71) return "bg-[var(--accent)]";
  if (score >= 31) return "bg-[var(--amber)]";
  return "bg-[var(--green)]";
}

export function ResearchClient() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<RowState[]>([]);
  const [running, setRunning] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const parsedUrls = useMemo(() => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.slice(0, 20);
  }, [text]);

  const progress = useMemo(() => {
    if (rows.length === 0) return 0;
    const done = rows.filter((r) => r.status === "done").length;
    return Math.round((done / rows.length) * 100);
  }, [rows]);

  const reset = () => {
    setRows([]);
    setGlobalError(null);
    setRunning(false);
  };

  const startChecks = async () => {
    setGlobalError(null);
    if (parsedUrls.length === 0) {
      setGlobalError("Bitte mindestens eine URL eingeben (eine Zeile je URL).");
      return;
    }

    const initial: RowState[] = parsedUrls.map((url) => ({ status: "idle", url }));
    setRows(initial);
    setRunning(true);

    let current = [...initial];

    for (let index = 0; index < parsedUrls.length; index += 1) {
      const url = parsedUrls[index];
      current = current.map((row, idx) =>
        idx === index ? ({ status: "running", url } as RowState) : row
      );
      setRows(current);

      try {
        const res = await fetch("/api/check-site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok || !data.result) {
          const message =
            typeof data?.error === "string" ? data.error : "Check fehlgeschlagen.";
          current = current.map((row, idx) =>
            idx === index ? ({ status: "error", url, message } as RowState) : row
          );
          setRows(current);
          continue;
        }

        current = current.map((row, idx) =>
          idx === index ? ({ status: "done", url, result: data.result } as RowState) : row
        );
        setRows(current);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Netzwerkfehler.";
        current = current.map((row, idx) =>
          idx === index ? ({ status: "error", url, message } as RowState) : row
        );
        setRows(current);
      }
    }

    setRunning(false);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <div className="label-caps">URLs (maximal 20, eine Zeile je URL)</div>
          <textarea
            value={text}
            disabled={running}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder={"https://beispiel.de\nbeispiel2.de"}
            className="focus-ring w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          <div className="text-xs text-[var(--text-tertiary)]">
            Erkannt: {parsedUrls.length} URL{parsedUrls.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-stretch">
          <button
            type="button"
            disabled={running}
            onClick={() => void startChecks()}
            className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Checks starten
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => reset()}
            className="focus-ring rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      {(running || rows.length > 0) && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="label-caps">Fortschritt</div>
            <div className="font-mono text-xs text-[var(--text-secondary)]">{progress}%</div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {globalError && (
        <div className="rounded-md border border-[var(--accent)] bg-[var(--accent-dim)] px-3 py-2 text-xs text-[var(--text-primary)]">
          {globalError}
        </div>
      )}

      {rows.length > 0 && (
        <div className="min-h-0 flex-1 space-y-2 overflow-auto">
          {rows.map((row, idx) => {
            if (row.status === "idle") {
              return (
                <div
                  key={`${row.url}-${idx}`}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-tertiary)]"
                >
                  Wartet: <span className="text-[var(--text-secondary)]">{row.url}</span>
                </div>
              );
            }

            if (row.status === "running") {
              return (
                <div
                  key={`${row.url}-${idx}`}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-secondary)]"
                >
                  Läuft: <span className="font-mono text-[var(--text-primary)]">{row.url}</span>
                </div>
              );
            }

            if (row.status === "error") {
              return (
                <div
                  key={`${row.url}-${idx}`}
                  className="rounded-md border border-[var(--accent)] bg-[rgba(230,48,48,0.06)] px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  <div className="font-mono text-[11px] text-[var(--text-secondary)]">{row.url}</div>
                  <div className="mt-2">{row.message}</div>
                </div>
              );
            }

            return (
              <ResultPanel key={`${row.url}-${idx}`} row={row} />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultPanel({ row }: { row: Extract<RowState, { status: "done" }> }) {
  const [firma, setFirma] = useState("");
  const [branche, setBranche] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const save = async () => {
    setMessage(null);
    setPending(true);
    try {
      await saveLeadFromResearch({
        result: row.result,
        firma: firma.trim() || undefined,
        branche: branche.trim() || undefined,
      });
      setMessage("Lead gespeichert.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Konnte nicht speichern.";
      setMessage(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-mono text-sm text-[var(--text-primary)]">
            {row.result.domain}
          </div>
          <div className="mt-1 truncate text-[11px] text-[var(--text-tertiary)]">{row.url}</div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${scoreDotClass(row.result.score)}`}
            aria-hidden
          />
          <div className="font-mono text-xs text-[var(--text-secondary)]">
            Score <span className="text-[var(--text-primary)]">{row.result.score}</span>
          </div>
          <PotenzialBadge potenzial={row.result.potenzial} />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <div className="label-caps">Firma (optional)</div>
          <input
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
            className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)]"
            placeholder="z. B. Muster GmbH"
          />
        </div>
        <div className="space-y-1">
          <div className="label-caps">Branche (optional)</div>
          <input
            value={branche}
            onChange={(e) => setBranche(e.target.value)}
            className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)]"
            placeholder="z. B. Gastronomie"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void save()}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] hover:border-[var(--accent)]"
        >
          {pending ? "Speichert…" : "Als Lead speichern"}
        </button>
        {message && <div className="text-xs text-[var(--text-secondary)]">{message}</div>}
      </div>
    </div>
  );
}

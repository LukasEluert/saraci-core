"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteBericht } from "@/app/actions/core";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PotenzialBadge } from "@/components/PotenzialBadge";
import { useRouter } from "next/navigation";

export type BerichtListItem = {
  id: string;
  lead_id: string;
  inhalt: string | null;
  erstellt_at: string;
  lead_domain: string;
  lead_firma: string | null;
  lead_potenzial: string | null;
};

function previewText(md: string) {
  const flat = md.replace(/\s+/g, " ").trim();
  if (flat.length <= 220) return flat;
  return `${flat.slice(0, 217)}…`;
}

export function BerichteClient({ items }: { items: BerichtListItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<BerichtListItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogStart, startDialog] = useTransition();

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.erstellt_at).getTime() - new Date(a.erstellt_at).getTime()
    );
  }, [items]);

  const remove = (id: string) => {
    const ok = window.confirm("Bericht wirklich löschen?");
    if (!ok) return;
    setError(null);
    setPendingId(id);
    startDialog(() => {
      void (async () => {
        try {
          await deleteBericht(id);
          setOpen((cur) => (cur?.id === id ? null : cur));
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
        } finally {
          setPendingId(null);
        }
      })();
    });
  };

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-6">
      <div>
        <div className="label-caps">Berichte</div>
        <div className="mt-1 text-sm text-[var(--text-secondary)]">{sorted.length} Berichte</div>
      </div>

      {error && (
        <div className="rounded-md border border-[var(--accent)] bg-[var(--accent-dim)] px-3 py-2 text-xs text-[var(--text-primary)]">
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2 overflow-auto">
        {sorted.map((item) => {
          const title = item.lead_firma?.trim() || item.lead_domain;
          const body = item.inhalt ?? "";
          return (
            <div
              key={item.id}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="truncate text-sm font-medium tracking-tight text-[var(--text-primary)]">
                    {title}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                    {item.lead_domain}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {new Date(item.erstellt_at).toLocaleString("de-DE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <PotenzialBadge potenzial={item.lead_potenzial} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setOpen(item)}
                    className="focus-ring rounded-md border border-[var(--border)] bg-[var(--surface-hover)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]"
                  >
                    Öffnen
                  </button>
                  <button
                    type="button"
                    disabled={pendingId === item.id || dialogStart}
                    onClick={() => remove(item.id)}
                    className="focus-ring rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)] disabled:opacity-40"
                  >
                    {pendingId === item.id ? "Löscht…" : "Löschen"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {previewText(body)}
              </p>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)]">
            Noch keine Berichte — aus einem Lead heraus erzeugen.
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Schließen"
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-[rgba(0,0,0,0.65)] backdrop-blur-sm"
          />
          <div className="relative z-[71] flex max-h-[min(720px,90vh)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
              <div className="min-w-0">
                <div className="label-caps">Bericht</div>
                <div className="mt-1 truncate text-sm text-[var(--text-primary)]">
                  {open.lead_firma?.trim() || open.lead_domain}
                </div>
                <div className="mt-2">
                  <PotenzialBadge potenzial={open.lead_potenzial} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="focus-ring rounded-md border border-[var(--border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
              >
                Schließen
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
              <MarkdownBody source={open.inhalt ?? ""} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createBericht, updateLead } from "@/app/actions/core";
import type { CoreLeadRow } from "@/lib/types/core";
import { STATUS_OPTIONS } from "@/lib/constants";
import { PotenzialBadge } from "@/components/PotenzialBadge";

type PotenzialFilter = "alle" | "hoch" | "mittel" | "niedrig";

function normalizeText(v: string | null | undefined) {
  return (v ?? "").trim();
}

export function LeadsClient({ initialLeads }: { initialLeads: CoreLeadRow[] }) {
  const [potenzial, setPotenzial] = useState<PotenzialFilter>("alle");
  const [status, setStatus] = useState<string>("alle");
  const [selected, setSelected] = useState<CoreLeadRow | null>(null);

  const filtered = useMemo(() => {
    return initialLeads.filter((lead) => {
      const pMatch =
        potenzial === "alle" ||
        normalizeText(lead.potenzial).toLowerCase() === potenzial;
      const sMatch =
        status === "alle" ||
        normalizeText(lead.status).toLowerCase() === status.toLowerCase();
      return pMatch && sMatch;
    });
  }, [initialLeads, potenzial, status]);

  return (
    <div className="flex h-full flex-col gap-3 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="label-caps">Pipeline</div>
          <div className="mt-1 text-sm tracking-tight text-[var(--text-primary)]">
            {filtered.length} Lead{filtered.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <FilterSelect
            label="Potenzial"
            value={potenzial}
            onChange={(value) => setPotenzial(value as PotenzialFilter)}
            options={[
              { value: "alle", label: "Alle" },
              { value: "hoch", label: "Hoch" },
              { value: "mittel", label: "Mittel" },
              { value: "niedrig", label: "Niedrig" },
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: "alle", label: "Alle Status" },
              ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full border-collapse text-left text-[13px] tracking-[-0.01em]">
          <thead className="sticky top-0 z-10 bg-[var(--surface-hover)]">
            <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th className="border-b border-[var(--border)] font-mono uppercase">Domain</th>
              <th className="hidden border-b border-[var(--border)] md:table-cell">Firma</th>
              <th className="hidden border-b border-[var(--border)] lg:table-cell">Branche</th>
              <th className="hidden border-b border-[var(--border)] xl:table-cell">Region</th>
              <th className="border-b border-[var(--border)]">Score</th>
              <th className="hidden border-b border-[var(--border)] sm:table-cell">Potenzial</th>
              <th className="hidden border-b border-[var(--border)] lg:table-cell">Status</th>
              <th className="hidden border-b border-[var(--border)] xl:table-cell">Nächster Schritt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelected(lead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(lead);
                  }
                }}
                className="cursor-pointer border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-3"
              >
                <td className="border-b border-[var(--border-subtle)] font-mono text-[12px] text-[var(--text-primary)]">
                  {lead.domain}
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] text-[var(--text-secondary)] md:table-cell">
                  {lead.firma || "—"}
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] text-[var(--text-secondary)] lg:table-cell">
                  {lead.branche || "—"}
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] text-[var(--text-secondary)] xl:table-cell">
                  {lead.region || "—"}
                </td>
                <td className="border-b border-[var(--border-subtle)] font-mono text-[12px] text-[var(--text-secondary)]">
                  {lead.score ?? 0}
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] sm:table-cell">
                  <PotenzialBadge potenzial={lead.potenzial} />
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] capitalize text-[var(--text-secondary)] lg:table-cell">
                  {(lead.status || "neu").replaceAll("_", " ")}
                </td>
                <td className="hidden border-b border-[var(--border-subtle)] text-[var(--text-secondary)] xl:table-cell">
                  {normalizeText(lead.naechster_schritt) ? lead.naechster_schritt : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            Keine Leads gefunden — Filter anpassen oder neue Checks starten.
          </div>
        )}
      </div>

      {selected && (
        <LeadDrawer key={selected.id} lead={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex min-w-[200px] flex-col gap-1">
      <span className="label-caps">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm tracking-[-0.01em] text-[var(--text-primary)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LeadDrawer({
  lead,
  onClose,
}: {
  lead: CoreLeadRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(() => lead.status ?? "neu");
  const [firma, setFirma] = useState(() => lead.firma ?? "");
  const [branche, setBranche] = useState(() => lead.branche ?? "");
  const [region, setRegion] = useState(() => lead.region ?? "");
  const [notiz, setNotiz] = useState(() => lead.notiz ?? "");
  const [naechsterSchritt, setNaechsterSchritt] = useState(
    () => lead.naechster_schritt ?? ""
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [savePending, startSave] = useTransition();
  const [reportPending, startReport] = useTransition();

  const save = () => {
    setError(null);
    setMessage(null);
    startSave(() => {
      void (async () => {
        try {
          await updateLead({
            id: lead.id,
            status,
            firma: firma.trim() || null,
            branche: branche.trim() || null,
            region: region.trim() || null,
            notiz: notiz.trim() ? notiz.trim() : null,
            naechster_schritt: naechsterSchritt.trim() ? naechsterSchritt.trim() : null,
          });
          setMessage("Änderungen gespeichert.");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Konnte nicht speichern.");
        }
      })();
    });
  };

  const berichtErstellen = () => {
    setError(null);
    setMessage(null);
    startReport(() => {
      void (async () => {
        try {
          await createBericht(lead.id);
          setMessage("Bericht erstellt. Du findest ihn unter „Berichte“.");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Bericht konnte nicht erstellt werden.");
        }
      })();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Schließen"
        onClick={() => onClose()}
        className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] backdrop-blur-sm"
      />
      <aside className="fixed right-0 top-0 z-[60] flex h-[100vh] w-full flex-col bg-[var(--bg-elevated)] shadow-[-20px_0_60px_rgba(0,0,0,0.6)] md:max-w-[420px]">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
          <div className="min-w-0 space-y-1">
            <div className="label-caps">Lead Detail</div>
            <div className="truncate font-mono text-sm text-[var(--text-primary)]">{lead.domain}</div>
            <div className="pt-2">
              <PotenzialBadge potenzial={lead.potenzial} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="focus-ring shrink-0 rounded-md border border-[var(--border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Schließen
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="grid gap-3">
            <Field label="Score">
              <div className="font-mono text-sm text-[var(--text-secondary)]">{lead.score ?? 0}</div>
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Firma">
              <input
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Branche">
              <input
                value={branche}
                onChange={(e) => setBranche(e.target.value)}
                className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Region">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Notiz">
              <textarea
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                rows={5}
                className="focus-ring min-h-[120px] w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Nächster Schritt">
              <textarea
                value={naechsterSchritt}
                onChange={(e) => setNaechsterSchritt(e.target.value)}
                rows={3}
                className="focus-ring w-full resize-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4">
          {error && <div className="text-xs text-[var(--accent)]">{error}</div>}
          {message && <div className="text-xs text-[var(--text-secondary)]">{message}</div>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={savePending}
              onClick={() => save()}
              className="focus-ring flex-1 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
            >
              {savePending ? "Speichert…" : "Speichern"}
            </button>
            <button
              type="button"
              disabled={reportPending}
              onClick={() => berichtErstellen()}
              className="focus-ring flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-40"
            >
              {reportPending ? "Erstellt…" : "Bericht erstellen"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="label-caps">{label}</span>
      {children}
    </label>
  );
}

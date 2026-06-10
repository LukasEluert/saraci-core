"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AkquiseLeadFilters } from "@/lib/akquise/swimlanes";

type Props = {
  filters: AkquiseLeadFilters;
  onChange: (filters: AkquiseLeadFilters) => void;
  onReset: () => void;
  branchen: string[];
  regionen: string[];
  assigneeOptions: { id: string; label: string }[];
  actions?: React.ReactNode;
};

const selectClass =
  "focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]";

export function AkquiseFilterBar({
  filters,
  onChange,
  onReset,
  branchen,
  regionen,
  assigneeOptions,
  actions,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const patch = (updates: Partial<AkquiseLeadFilters>) =>
    onChange({ ...filters, ...updates });

  const hasActiveFilters =
    !!filters.q.trim() ||
    !!filters.branche ||
    !!filters.region ||
    !!filters.assignedTo;

  const fields = (
    <>
      <div className="min-w-0 flex-1 md:min-w-[200px] md:max-w-[320px]">
        <label className="label-caps mb-1 block md:sr-only">Suche</label>
        <input
          type="search"
          value={filters.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder="Firma, Domain, Telefon, E-Mail…"
          className={selectClass}
        />
      </div>

      <div className="min-w-[140px]">
        <label className="label-caps mb-1 block">Branche</label>
        <select
          value={filters.branche}
          onChange={(e) => patch({ branche: e.target.value })}
          className={selectClass}
        >
          <option value="">Alle</option>
          {branchen.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[140px]">
        <label className="label-caps mb-1 block">Stadt</label>
        <select
          value={filters.region}
          onChange={(e) => patch({ region: e.target.value })}
          className={selectClass}
        >
          <option value="">Alle</option>
          {regionen.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px]">
        <label className="label-caps mb-1 block">Zugewiesen</label>
        <select
          value={filters.assignedTo}
          onChange={(e) => patch({ assignedTo: e.target.value })}
          className={selectClass}
        >
          <option value="">Alle</option>
          {assigneeOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
        >
          Reset
        </button>
        {actions}
      </div>
    </>
  );

  return (
    <div className="sticky top-0 z-10 -mx-1 border-b border-[var(--border)] bg-[var(--bg)] px-1 pb-4 pt-1">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="focus-ring mb-3 flex w-full items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] md:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
          Filter
          {hasActiveFilters && (
            <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              aktiv
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("size-4 transition-transform", mobileOpen && "rotate-180")}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "flex-wrap items-end gap-3",
          mobileOpen ? "flex flex-col" : "hidden",
          "md:flex md:flex-row"
        )}
      >
        {fields}
      </div>
    </div>
  );
}

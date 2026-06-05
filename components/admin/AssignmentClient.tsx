"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { assignLeads } from "@/app/actions/admin";
import type { AssignableLead } from "@/lib/admin/queries";

type UserOption = { id: string; label: string };

export function AssignmentClient({
  leads,
  users,
}: {
  leads: AssignableLead[];
  users: UserOption[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [branche, setBranche] = useState("");
  const [region, setRegion] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetUser, setTargetUser] = useState<string>(users[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  const userLabelById = useMemo(
    () => new Map(users.map((u) => [u.id, u.label])),
    [users]
  );

  const branchen = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.branche).filter((b): b is string => !!b))
      ).sort(),
    [leads]
  );
  const regionen = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.region).filter((r): r is string => !!r))
      ).sort(),
    [leads]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (branche && l.branche !== branche) return false;
      if (region && l.region !== region) return false;
      if (needle) {
        const hay = `${l.firma ?? ""} ${l.domain} ${l.branche ?? ""} ${
          l.region ?? ""
        }`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [leads, q, branche, region]);

  const filteredIds = filtered.map((l) => l.id);
  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) filteredIds.forEach((id) => next.delete(id));
      else filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const run = (assignedTo: string | null) => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      toast.error("Keine Leads ausgewählt");
      return;
    }
    if (assignedTo !== null && !assignedTo) {
      toast.error("Kein Nutzer gewählt");
      return;
    }
    startTransition(async () => {
      try {
        const res = await assignLeads(ids, assignedTo);
        toast.success(
          assignedTo
            ? `${res.count} Leads zugewiesen`
            : `Zuweisung für ${res.count} Leads entfernt`
        );
        setSelected(new Set());
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="flex flex-col gap-1">
          <span className="label-caps">Suche</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Firma, Website…"
            className="focus-ring w-[200px] rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps">Branche</span>
          <select
            value={branche}
            onChange={(e) => setBranche(e.target.value)}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">Alle</option>
            {branchen.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps">Stadt</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">Alle</option>
            {regionen.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
        <label className="flex flex-col gap-1">
          <span className="label-caps">Zuweisen an</span>
          <select
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(targetUser)}
          className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
        >
          {pending ? "…" : `Zuweisen (${selected.size})`}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(null)}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
        >
          Zuweisung entfernen
        </button>
      </div>

      <div className="overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-10 bg-[var(--surface-hover)]">
            <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Alle auswählen"
                />
              </th>
              <th>Firma</th>
              <th className="hidden md:table-cell">Branche</th>
              <th className="hidden lg:table-cell">Stadt</th>
              <th>Zugewiesen an</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-[var(--border-subtle)] [&>td]:px-4 [&>td]:py-2.5"
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggle(lead.id)}
                    aria-label={`${lead.firma ?? lead.domain} auswählen`}
                  />
                </td>
                <td className="text-[var(--text-primary)]">
                  {lead.firma || lead.domain}
                </td>
                <td className="hidden text-[var(--text-secondary)] md:table-cell">
                  {lead.branche || "—"}
                </td>
                <td className="hidden text-[var(--text-secondary)] lg:table-cell">
                  {lead.region || "—"}
                </td>
                <td className="text-[var(--text-secondary)]">
                  {lead.assigned_to
                    ? userLabelById.get(lead.assigned_to) ?? "Unbekannt"
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            Keine Leads.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  assignToDiego,
  setAkquiseStatus,
} from "@/app/actions/akquise";
import { BearbeitungBadge } from "@/components/akquise/BearbeitungBadge";
import { isLeadInArbeit } from "@/lib/akquise/inArbeit";
import { AKQUISE_STATUS, LUKAS_SCHREIB_STATUS } from "@/lib/akquise/constants";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import { formatCreatedAt, formatDateTime } from "@/lib/leads/format";
import type { AkquiseLead } from "@/lib/akquise/types";

type Props = {
  leads: AkquiseLead[];
  userLabels: Record<string, string>;
  lastActivity: Record<string, string>;
  currentUserId: string;
  adminUserId: string;
  latestNotes?: Record<string, string>;
};

function needsAction(lead: AkquiseLead, currentUserId: string): boolean {
  return lead.assigned_to === currentUserId;
}

function assignedSinceTime(lead: AkquiseLead): number {
  const iso = lead.updated_at ?? lead.created_at;
  return iso ? new Date(iso).getTime() : 0;
}

function createdAtTime(lead: AkquiseLead): number {
  return lead.created_at ? new Date(lead.created_at).getTime() : Number.MAX_SAFE_INTEGER;
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function AdminOverview({
  leads,
  userLabels,
  lastActivity,
  currentUserId,
  adminUserId,
  latestNotes = {},
}: Props) {
  const [status, setStatus] = useState("");
  const [branche, setBranche] = useState("");
  const [region, setRegion] = useState("");
  const [nutzer, setNutzer] = useState("");
  const [nurHandlung, setNurHandlung] = useState(false);

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
  const nutzerOptions = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.assigned_to).filter((a): a is string => !!a))
      ).map((id) => ({ id, label: userLabels[id] ?? "Unbekannt" })),
    [leads, userLabels]
  );

  const handlungsbedarf = useMemo(
    () =>
      leads
        .filter((l) => needsAction(l, currentUserId))
        .sort(
          (a, b) =>
            createdAtTime(a) - createdAtTime(b) ||
            assignedSinceTime(a) - assignedSinceTime(b)
        ),
    [leads, currentUserId]
  );

  const fullList = useMemo(() => {
    return leads.filter((l) => {
      if (status && l.akquise_status !== status) return false;
      if (branche && l.branche !== branche) return false;
      if (region && l.region !== region) return false;
      if (nutzer && l.assigned_to !== nutzer) return false;
      if (nurHandlung && !needsAction(l, currentUserId)) return false;
      return true;
    });
  }, [leads, status, branche, region, nutzer, nurHandlung, currentUserId]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-300">
            Handlungsbedarf
          </h2>
          <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-300">
            {handlungsbedarf.length}
          </span>
        </div>

        {handlungsbedarf.length === 0 ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
            Aktuell nichts zu tun.
          </div>
        ) : (
          <LeadTable
            leads={handlungsbedarf}
            userLabels={userLabels}
            lastActivity={lastActivity}
            currentUserId={currentUserId}
            adminUserId={adminUserId}
            latestNotes={latestNotes}
            highlight
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          Alle Leads
        </h2>

        <div className="flex flex-wrap items-end gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <Filter label="Status" value={status} onChange={setStatus}>
            <option value="">Alle</option>
            {AKQUISE_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Filter>
          <Filter label="Branche" value={branche} onChange={setBranche}>
            <option value="">Alle</option>
            {branchen.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Filter>
          <Filter label="Stadt" value={region} onChange={setRegion}>
            <option value="">Alle</option>
            {regionen.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Filter>
          <Filter label="Zugewiesen" value={nutzer} onChange={setNutzer}>
            <option value="">Alle</option>
            {nutzerOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Filter>
          <label className="flex items-center gap-2 pb-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={nurHandlung}
              onChange={(e) => setNurHandlung(e.target.checked)}
            />
            Nur Handlungsbedarf
          </label>
        </div>

        <LeadTable
          leads={fullList}
          userLabels={userLabels}
          lastActivity={lastActivity}
          currentUserId={currentUserId}
          adminUserId={adminUserId}
          latestNotes={latestNotes}
        />
      </section>
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-caps">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
      >
        {children}
      </select>
    </label>
  );
}

function LeadTable({
  leads,
  userLabels,
  lastActivity,
  currentUserId,
  adminUserId,
  latestNotes = {},
  highlight = false,
}: {
  leads: AkquiseLead[];
  userLabels: Record<string, string>;
  lastActivity: Record<string, string>;
  currentUserId: string;
  adminUserId: string;
  latestNotes?: Record<string, string>;
  highlight?: boolean;
}) {
  return (
    <div className="overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="sticky top-0 z-10 bg-[var(--surface-hover)]">
          <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
            <th>Firma</th>
            <th>Status</th>
            <th className="hidden lg:table-cell">Notiz</th>
            <th className="hidden md:table-cell">Telefon</th>
            <th className="hidden lg:table-cell">Zugewiesen seit</th>
            <th className="hidden lg:table-cell">Erstellt</th>
            <th className="hidden xl:table-cell">Letzte Akt.</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              userLabels={userLabels}
              lastActivity={lastActivity}
              currentUserId={currentUserId}
              adminUserId={adminUserId}
              latestNote={latestNotes[lead.id] ?? null}
              highlight={highlight}
            />
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
          Keine Leads.
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  userLabels,
  lastActivity,
  currentUserId,
  adminUserId,
  latestNote,
  highlight,
}: {
  lead: AkquiseLead;
  userLabels: Record<string, string>;
  lastActivity: Record<string, string>;
  currentUserId: string;
  adminUserId: string;
  latestNote: string | null;
  highlight: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const days = daysSince(lastActivity[lead.id]);
  const assignedSince = lead.updated_at ?? lead.created_at;

  const inArbeit = isLeadInArbeit(lead.assigned_to, adminUserId);
  const assigneeName =
    lead.assigned_to != null ? userLabels[lead.assigned_to] ?? null : null;

  const run = (fn: () => Promise<unknown>, msg: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast.success(msg);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });

  const open = () => router.push(`/akquise/${lead.id}?from=handlungsbedarf`);

  const schreibStatus = LUKAS_SCHREIB_STATUS.includes(lead.akquise_status);

  return (
    <tr
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") open();
      }}
      className={cn(
        "cursor-pointer border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-2.5",
        highlight &&
          lead.akquise_status === "angebot_schreiben" &&
          "border-l-2 border-l-orange-500/60",
        highlight &&
          lead.akquise_status === "email_schreiben" &&
          "border-l-2 border-l-amber-500/60"
      )}
    >
      <td className="font-medium text-[var(--text-primary)]">
        <div className="flex flex-col gap-1">
          <span>{lead.firma || lead.domain || "Lead"}</span>
          {inArbeit && <BearbeitungBadge name={assigneeName} />}
        </div>
      </td>
      <td>
        <AkquiseStatusBadge status={lead.akquise_status} />
      </td>
      <td className="hidden max-w-[240px] lg:table-cell">
        <span
          className="block truncate text-[var(--text-tertiary)]"
          title={latestNote ?? undefined}
        >
          {latestNote || "—"}
        </span>
      </td>
      <td className="hidden text-[var(--text-secondary)] md:table-cell">
        {lead.telefon || "—"}
      </td>
      <td className="hidden whitespace-nowrap text-[var(--text-tertiary)] lg:table-cell">
        {assignedSince ? formatDateTime(assignedSince) : "—"}
      </td>
      <td className="hidden whitespace-nowrap text-[var(--text-tertiary)] lg:table-cell">
        {formatCreatedAt(lead.created_at)}
      </td>
      <td className="hidden text-[var(--text-tertiary)] xl:table-cell">
        {days === null ? "—" : days === 0 ? "heute" : `${days} T`}
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap justify-end gap-1.5">
          {schreibStatus && lead.akquise_status === "angebot_schreiben" && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    setAkquiseStatus(lead.id, "angebot_raus", {
                      logNote: "Angebot raus",
                    }),
                  "Angebot raus"
                )
              }
              className="focus-ring whitespace-nowrap rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Angebot raus
            </button>
          )}
          {schreibStatus && lead.akquise_status === "email_schreiben" && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    setAkquiseStatus(lead.id, "email_raus", {
                      logNote: "Email raus",
                    }),
                  "Email raus"
                )
              }
              className="focus-ring whitespace-nowrap rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Email raus
            </button>
          )}
          {needsAction(lead, currentUserId) && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => assignToDiego(lead.id), "An Diego zurück")}
              className="focus-ring whitespace-nowrap rounded-md border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
            >
              Zurück an Diego
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

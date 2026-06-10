"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AkquiseLead } from "@/lib/akquise/types";
import {
  applyAkquiseFilters,
  hasVisibleSwimlanes,
  splitIntoSwimlanes,
  visibleSwimlanes,
  type AkquiseLeadFilters,
  type SwimlaneId,
} from "@/lib/akquise/swimlanes";
import { AkquiseFilterBar } from "@/components/akquise/AkquiseFilterBar";
import { AkquiseLeadListSection } from "@/components/akquise/AkquiseLeadListSection";
import { NewLeadDialog } from "@/components/akquise/NewLeadDialog";
import { SubscribeButton } from "@/components/akquise/SubscribeButton";

const EMPTY_FILTERS: AkquiseLeadFilters = {
  q: "",
  branche: "",
  region: "",
  assignedTo: "",
};

type Props = {
  leads: AkquiseLead[];
  adminUserId: string;
  assigneeLabels: Record<string, string>;
  latestNotes: Record<string, string>;
  branchen: string[];
  regionen: string[];
  assigneeOptions: { id: string; label: string }[];
  calendarToken: string;
  archiveHref: string;
  showArchived: boolean;
};

export function AkquiseSwimlaneView({
  leads,
  adminUserId,
  assigneeLabels,
  latestNotes,
  branchen,
  regionen,
  assigneeOptions,
  calendarToken,
  archiveHref,
  showArchived,
}: Props) {
  const [filters, setFilters] = useState<AkquiseLeadFilters>(EMPTY_FILTERS);
  const [collapsed, setCollapsed] = useState<Partial<Record<SwimlaneId, boolean>>>({});

  const filtered = useMemo(
    () => applyAkquiseFilters(leads, filters),
    [leads, filters]
  );

  const buckets = useMemo(() => splitIntoSwimlanes(filtered), [filtered]);

  const visibleLanes = useMemo(() => visibleSwimlanes(buckets), [buckets]);
  const hasLanes = useMemo(() => hasVisibleSwimlanes(buckets), [buckets]);

  const toggleLane = (id: SwimlaneId) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <AkquiseFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        branchen={branchen}
        regionen={regionen}
        assigneeOptions={assigneeOptions}
        actions={
          <>
            <Link
              href={archiveHref}
              className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {showArchived ? "Aktive Leads" : "Archiv"}
            </Link>
            {!showArchived && <NewLeadDialog />}
            <SubscribeButton token={calendarToken} />
          </>
        }
      />

      {hasLanes ? (
        <div className="flex flex-col gap-2">
          {visibleLanes.map(({ id, title }) => {
            const laneLeads = buckets[id];
            const isCollapsed = collapsed[id] ?? false;

            return (
              <section key={id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <button
                  type="button"
                  onClick={() => toggleLane(id)}
                  className="focus-ring flex w-full items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 pt-6 pb-3 text-left"
                >
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    {title} ({laneLeads.length})
                  </h2>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-[var(--text-tertiary)] transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>

                {!isCollapsed && (
                  <div className="p-2 md:p-3">
                    <AkquiseLeadListSection
                      leads={laneLeads}
                      adminUserId={adminUserId}
                      assigneeLabels={assigneeLabels}
                      showArchived={false}
                      latestNotes={latestNotes}
                      swimlaneLayout
                      highlight={id === "heute"}
                    />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)] md:rounded-md">
          {leads.length === 0
            ? "Keine zugewiesenen Leads."
            : "Keine Leads für die aktuelle Filterauswahl."}
        </div>
      )}
    </div>
  );
}

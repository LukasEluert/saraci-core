import type { AkquiseLead, AkquiseStatus } from "./types";
import { isUpdatedTodayBerlin } from "./dates";

const ZU_TUN_STATUS: AkquiseStatus[] = [
  "in_kontakt",
  "email_schreiben",
  "angebot_schreiben",
  "nachfassen",
];

const WARTEND_STATUS: AkquiseStatus[] = ["email_raus", "angebot_raus"];

const PIPELINE_STATUS: AkquiseStatus[] = ["neu", "nicht_erreicht"];

const ABGESCHLOSSEN_STATUS: AkquiseStatus[] = ["kein_interesse", "kunde"];

export type SwimlaneId =
  | "zu_tun"
  | "wartend"
  | "termine"
  | "pipeline"
  | "abgeschlossen"
  | "heute";

export type SwimlaneDefinition = {
  id: SwimlaneId;
  title: string;
};

/** Status-Lanes in Anzeige-Reihenfolge (ohne „Heute bearbeitet“). */
export const STATUS_SWIMLANE_ORDER: SwimlaneDefinition[] = [
  { id: "zu_tun", title: "Zu tun" },
  { id: "wartend", title: "Wartend" },
  { id: "termine", title: "Termine" },
  { id: "pipeline", title: "Pipeline" },
  { id: "abgeschlossen", title: "Abgeschlossen" },
];

export const HEUTE_SWIMLANE: SwimlaneDefinition = {
  id: "heute",
  title: "Heute bearbeitet",
};

export type SwimlaneBuckets = Record<SwimlaneId, AkquiseLead[]>;

/** Variante B: Status-Lanes + „Heute bearbeitet“ zusaetzlich unten. */
export function splitIntoSwimlanes(leads: AkquiseLead[]): SwimlaneBuckets {
  return {
    zu_tun: leads.filter((l) => ZU_TUN_STATUS.includes(l.akquise_status)),
    wartend: leads.filter((l) => WARTEND_STATUS.includes(l.akquise_status)),
    termine: leads.filter((l) => l.akquise_status === "rueckruf_vereinbart"),
    pipeline: leads.filter((l) => PIPELINE_STATUS.includes(l.akquise_status)),
    abgeschlossen: leads.filter((l) => ABGESCHLOSSEN_STATUS.includes(l.akquise_status)),
    heute: leads.filter((l) => isUpdatedTodayBerlin(l.updated_at)),
  };
}

export type AkquiseLeadFilters = {
  q: string;
  branche: string;
  region: string;
  assignedTo: string;
};

export function applyAkquiseFilters(
  leads: AkquiseLead[],
  filters: AkquiseLeadFilters
): AkquiseLead[] {
  const q = filters.q.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.branche && lead.branche !== filters.branche) return false;
    if (filters.region && lead.region !== filters.region) return false;
    if (filters.assignedTo && lead.assigned_to !== filters.assignedTo) return false;

    if (!q) return true;

    const fields = [
      lead.firma,
      lead.domain,
      lead.telefon,
      lead.email,
      lead.branche,
      lead.region,
    ]
      .filter((v): v is string => !!v)
      .map((v) => v.toLowerCase());

    return fields.some((v) => v.includes(q));
  });
}

export function deriveFilterOptions(leads: AkquiseLead[]) {
  const branchen = Array.from(
    new Set(leads.map((l) => l.branche).filter((b): b is string => !!b))
  ).sort();

  const regionen = Array.from(
    new Set(leads.map((l) => l.region).filter((r): r is string => !!r))
  ).sort();

  const assigneeIds = Array.from(
    new Set(leads.map((l) => l.assigned_to).filter((id): id is string => !!id))
  );

  return { branchen, regionen, assigneeIds };
}

export function visibleSwimlanes(buckets: SwimlaneBuckets): SwimlaneDefinition[] {
  const statusLanes = STATUS_SWIMLANE_ORDER.filter(({ id }) => buckets[id].length > 0);
  if (buckets.heute.length > 0) {
    return [...statusLanes, HEUTE_SWIMLANE];
  }
  return statusLanes;
}

export function hasVisibleSwimlanes(buckets: SwimlaneBuckets): boolean {
  return visibleSwimlanes(buckets).length > 0;
}

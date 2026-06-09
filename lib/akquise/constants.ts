import type { AkquiseStatus, LeadAktion } from "./types";

export const AKQUISE_STATUS: { value: AkquiseStatus; label: string }[] = [
  { value: "offen", label: "Offen" },
  { value: "nicht_erreicht", label: "Nicht erreicht" },
  { value: "rueckruf_vereinbart", label: "Rückruf vereinbart" },
  { value: "rueckruf_offen", label: "Rückruf offen" },
  { value: "interesse", label: "Interesse" },
  { value: "angebot_raus", label: "Angebot raus" },
  { value: "kein_interesse", label: "Kein Interesse" },
  { value: "kunde", label: "Kunde" },
];

export const AKQUISE_STATUS_VALUES = new Set<string>(
  AKQUISE_STATUS.map((s) => s.value)
);

export const AKQUISE_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  AKQUISE_STATUS.map((s) => [s.value, s.label])
);

// Farbhierarchie: heisse Leads ziehen das Auge, tote Leads treten zurueck.
// Eine zentrale Stelle - Badge und Status-Dropdown lesen beide hieraus.
export const AKQUISE_STATUS_STYLES: Record<AkquiseStatus, string> = {
  offen: "bg-neutral-400/10 text-[var(--text-secondary)] border-neutral-400/30",
  nicht_erreicht: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  rueckruf_vereinbart: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  rueckruf_offen: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  interesse: "bg-green-500/15 text-green-300 border-green-500/40",
  angebot_raus: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  kein_interesse: "bg-neutral-600/10 text-neutral-500 border-neutral-600/25",
  kunde: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
};

export const LEAD_AKTION: { value: LeadAktion; label: string }[] = [
  { value: "keine", label: "Keine" },
  { value: "angebot", label: "Angebot erstellen" },
  { value: "brief", label: "Brief senden" },
];

export const LEAD_AKTION_VALUES = new Set<string>(
  LEAD_AKTION.map((a) => a.value)
);

export const LEAD_AKTION_LABELS: Record<string, string> = Object.fromEntries(
  LEAD_AKTION.map((a) => [a.value, a.label])
);

// Kurz-Label fuer Badges in Listen
export const LEAD_AKTION_BADGE: Record<LeadAktion, string> = {
  keine: "",
  angebot: "Angebot",
  brief: "Brief",
};

export const LEAD_AKTION_STYLES: Record<LeadAktion, string> = {
  keine: "",
  angebot: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  brief: "bg-amber-500/15 text-amber-300 border-amber-500/40",
};

export const ACTIVITY_TYPES: { value: "anruf" | "mail" | "notiz"; label: string }[] = [
  { value: "anruf", label: "Anruf" },
  { value: "mail", label: "Mail" },
  { value: "notiz", label: "Notiz" },
];

export const ACTIVITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.label])
);

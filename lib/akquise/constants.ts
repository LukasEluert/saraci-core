import type { AkquiseStatus, LeadAktion } from "./types";

export const AKQUISE_STATUS: { value: AkquiseStatus; label: string }[] = [
  { value: "offen", label: "Offen" },
  { value: "nicht_erreicht", label: "Nicht erreicht" },
  { value: "rueckruf_vereinbart", label: "Rückruf vereinbart" },
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

export const AKQUISE_STATUS_STYLES: Record<AkquiseStatus, string> = {
  offen: "bg-neutral-500/10 text-neutral-300 border-neutral-500/30",
  nicht_erreicht: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  rueckruf_vereinbart: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  interesse: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  angebot_raus: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  kein_interesse: "bg-red-500/10 text-red-400 border-red-500/30",
  kunde: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
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

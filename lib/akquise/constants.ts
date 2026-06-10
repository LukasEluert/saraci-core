import type { AkquiseStatus, LeadAktion } from "./types";

export const AKQUISE_STATUS: { value: AkquiseStatus; label: string }[] = [
  { value: "neu", label: "Neu" },
  { value: "in_kontakt", label: "In Kontakt" },
  { value: "nicht_erreicht", label: "Nicht erreicht" },
  { value: "rueckruf_vereinbart", label: "Rückruf vereinbart" },
  { value: "email_schreiben", label: "Email schreiben" },
  { value: "angebot_schreiben", label: "Angebot schreiben" },
  { value: "email_raus", label: "Email raus" },
  { value: "angebot_raus", label: "Angebot raus" },
  { value: "nachfassen", label: "Nachfassen" },
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
  neu: "bg-neutral-400/10 text-[var(--text-secondary)] border-neutral-400/30",
  in_kontakt: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  nicht_erreicht: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  rueckruf_vereinbart: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  email_schreiben: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  angebot_schreiben: "bg-red-500/15 text-red-300 border-red-500/40",
  email_raus: "bg-violet-500/15 text-violet-300 border-violet-500/40",
  angebot_raus: "bg-violet-600/15 text-violet-200 border-violet-600/40",
  nachfassen: "bg-amber-500/15 text-amber-300 border-amber-500/40",
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

/** Status, bei denen Lukas schreiben soll (Phase-1-Handlungsbedarf). */
export const LUKAS_SCHREIB_STATUS: AkquiseStatus[] = [
  "email_schreiben",
  "angebot_schreiben",
];

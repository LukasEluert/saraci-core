import type { LeadStatus } from "./types";

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Neu" },
  { value: "qualified", label: "Qualifiziert" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "won", label: "Gewonnen" },
  { value: "lost", label: "Verloren" },
  { value: "rejected", label: "Verworfen" },
  { value: "later", label: "Später" },
];

export const LEAD_STATUS_SET = new Set(LEAD_STATUSES.map((s) => s.value));

export const POTENTIAL_OPTIONS = [
  { value: "high", label: "Hoch" },
  { value: "medium", label: "Mittel" },
  { value: "low", label: "Niedrig" },
] as const;

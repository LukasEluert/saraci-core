export type AkquiseStatus =
  | "offen"
  | "nicht_erreicht"
  | "rueckruf_vereinbart"
  | "interesse"
  | "angebot_raus"
  | "kein_interesse"
  | "kunde";

export type ActivityTyp = "anruf" | "mail" | "notiz";

export type LeadAktion = "keine" | "angebot" | "brief";

export interface AkquiseLead {
  id: string;
  firma: string | null;
  branche: string | null;
  region: string | null;
  domain: string;
  telefon: string | null;
  email: string | null;
  akquise_status: AkquiseStatus;
  assigned_to: string | null;
  notiz: string | null;
  aktion_benoetigt: LeadAktion;
  aktion_notiz: string | null;
  aktion_seit: string | null;
  bearbeitung_von: string | null;
  bearbeitung_seit: string | null;
  archiviert: boolean;
  created_at: string | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  typ: ActivityTyp;
  ergebnis: string | null;
  notiz: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string | null;
  user_id: string;
  titel: string;
  faellig_am: string;
  erledigt: boolean;
  created_at: string;
}

export interface AppointmentWithLead extends Appointment {
  lead: { id: string; firma: string | null; domain: string | null } | null;
}

export interface AkquiseLeadDetail extends AkquiseLead {
  activities: Activity[];
  appointments: Appointment[];
}

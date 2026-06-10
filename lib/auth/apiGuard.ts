import "server-only";
import { NextResponse } from "next/server";
import { getCurrentProfile } from "./profile";

/**
 * Guard fuer Service-Role-API-Routen, die nur Admins erreichen duerfen.
 * Gibt eine Fehler-Response zurueck (401/403) oder null, wenn der Aufrufer Admin ist.
 *
 * Bewusst KEIN redirect() wie requireAdmin(): API-Clients erwarten Statuscodes.
 */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }
  return null;
}

/** Eingeloggte Nutzer (Admin oder Vertrieb) – z. B. Duplikat-Check beim Lead-Anlegen. */
export async function requireAuthenticatedApi(): Promise<NextResponse | null> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  return null;
}

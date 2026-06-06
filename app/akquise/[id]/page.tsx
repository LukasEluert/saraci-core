import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAkquiseLead } from "@/lib/akquise/queries";
import { formatDateTime } from "@/lib/leads/format";
import {
  ACTIVITY_TYPE_LABELS,
} from "@/lib/akquise/constants";
import { StatusSelect } from "@/components/akquise/StatusSelect";
import { ActivityForm } from "@/components/akquise/ActivityForm";
import { AppointmentForm } from "@/components/akquise/AppointmentForm";
import { AppointmentToggle } from "@/components/akquise/AppointmentToggle";
import { LeadContactCard } from "@/components/akquise/LeadContactCard";
import { LeadNotizCard } from "@/components/akquise/LeadNotizCard";
import { ActionFlagControl } from "@/components/akquise/ActionFlagControl";
import { ArchiveLeadButton } from "@/components/akquise/ArchiveLeadButton";
import { DeleteActivityButton } from "@/components/akquise/DeleteActivityButton";
import { DeleteAppointmentButton } from "@/components/akquise/DeleteAppointmentButton";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

function websiteHref(domain: string): string {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

export default async function AkquiseLeadPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getAkquiseLead(id);
  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/akquise"
        className="inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        ← Meine Leads
      </Link>

      {lead.archiviert && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          Dieser Lead ist archiviert und erscheint nicht in der Standard-Liste.
        </div>
      )}

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="space-y-3 border-b border-[var(--border)] pb-6">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {lead.firma || lead.domain || "Lead"}
            </h1>
            {lead.domain && (
              <a
                href={websiteHref(lead.domain)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-mono text-sm text-[var(--accent)] hover:underline"
              >
                {lead.domain}
              </a>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              {lead.branche && <span>{lead.branche}</span>}
              {lead.region && <span>· {lead.region}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="label-caps">Status</span>
              <StatusSelect leadId={lead.id} value={lead.akquise_status} />
            </div>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Über diesen Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadNotizCard leadId={lead.id} notiz={lead.notiz} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktivität loggen</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityForm leadId={lead.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.activities.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Noch keine Aktivitäten.
                </p>
              ) : (
                <ul className="space-y-3">
                  {lead.activities.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
                          {ACTIVITY_TYPE_LABELS[a.typ] ?? a.typ}
                          {a.ergebnis ? (
                            <span className="font-normal normal-case text-[var(--text-secondary)]">
                              {" "}
                              — {a.ergebnis}
                            </span>
                          ) : null}
                        </span>
                        <span className="flex shrink-0 items-center gap-1">
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {formatDateTime(a.created_at)}
                          </span>
                          <DeleteActivityButton id={a.id} leadId={lead.id} />
                        </span>
                      </div>
                      {a.notiz && (
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">
                          {a.notiz}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[340px]">
          <Card>
            <CardHeader>
              <CardTitle>Aktion</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionFlagControl
                leadId={lead.id}
                aktion={lead.aktion_benoetigt}
                aktionNotiz={lead.aktion_notiz}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadContactCard
                leadId={lead.id}
                telefon={lead.telefon}
                email={lead.email}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wiedervorlage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AppointmentForm leadId={lead.id} />
              {lead.appointments.length > 0 && (
                <ul className="space-y-2 border-t border-[var(--border)] pt-4">
                  {lead.appointments.map((appt) => (
                    <li
                      key={appt.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div
                          className={
                            "truncate text-sm " +
                            (appt.erledigt
                              ? "text-[var(--text-tertiary)] line-through"
                              : "text-[var(--text-primary)]")
                          }
                        >
                          {appt.titel}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {formatDateTime(appt.faellig_am)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <AppointmentToggle id={appt.id} erledigt={appt.erledigt} />
                        <DeleteAppointmentButton id={appt.id} leadId={lead.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead verwalten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                Archivieren blendet den Lead aus den Listen aus, ohne Kontakt und
                Historie zu loeschen.
              </p>
              <ArchiveLeadButton leadId={lead.id} archiviert={lead.archiviert} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

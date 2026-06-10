import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAkquiseLead } from "@/lib/akquise/queries";
import { listLeadNotes } from "@/lib/akquise/leadNotes";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getAdminUser, getVertriebUser } from "@/lib/auth/users";
import { resolveUserDisplayNames } from "@/lib/admin/queries";
import { isLeadInArbeit } from "@/lib/akquise/inArbeit";
import { formatCreatedAtVerbose, formatDateTime } from "@/lib/leads/format";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import { ActivityForm } from "@/components/akquise/ActivityForm";
import { ActivityHistory } from "@/components/akquise/ActivityHistory";
import { AppointmentForm } from "@/components/akquise/AppointmentForm";
import { AppointmentToggle } from "@/components/akquise/AppointmentToggle";
import { LeadContactCard } from "@/components/akquise/LeadContactCard";
import { LeadNotes } from "@/components/akquise/LeadNotes";
import { AssignmentControl } from "@/components/akquise/AssignmentControl";
import { LeadStatusCard } from "@/components/akquise/LeadStatusCard";
import { ArchiveLeadButton } from "@/components/akquise/ArchiveLeadButton";
import { DeleteAppointmentButton } from "@/components/akquise/DeleteAppointmentButton";
import { BearbeitungBadge } from "@/components/akquise/BearbeitungBadge";

export const metadata: Metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function websiteHref(domain: string): string {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

export default async function AkquiseLeadPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const back =
    from === "handlungsbedarf"
      ? { href: "/admin/uebersicht", label: "← Zurück zu Handlungsbedarf" }
      : from === "heute"
        ? { href: "/akquise/heute", label: "← Zurück zu Heute" }
        : { href: "/akquise", label: "← Zurück zu Akquise" };
  const [lead, profile, notes, adminUser, vertriebUser] = await Promise.all([
    getAkquiseLead(id),
    getCurrentProfile(),
    listLeadNotes(id),
    getAdminUser(),
    getVertriebUser(),
  ]);
  if (!lead) notFound();

  const isAdmin = profile?.role === "admin";
  const assignedIds = lead.assigned_to ? [lead.assigned_to] : [];
  const profileIds = profile ? [profile.id] : [];
  const names = await resolveUserDisplayNames([...assignedIds, ...profileIds]);
  const assignedName = lead.assigned_to ? names[lead.assigned_to] ?? null : null;
  const currentUserDisplayName = profile
    ? names[profile.id] ?? profile.full_name ?? profile.email
    : null;
  const inArbeit = isLeadInArbeit(lead.assigned_to, adminUser.id);

  return (
    <div className="space-y-6">
      <Link
        href={back.href}
        className="inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {back.label}
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
              <AkquiseStatusBadge status={lead.akquise_status} />
              {inArbeit && <BearbeitungBadge name={assignedName} />}
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              Erstellt: {formatCreatedAtVerbose(lead.created_at)}
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Über diesen Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadNotes
                leadId={lead.id}
                notes={notes}
                currentUserId={profile?.id ?? ""}
                isAdmin={isAdmin}
              />
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
              <ActivityHistory activities={lead.activities} leadId={lead.id} />
            </CardContent>
          </Card>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[340px]">
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Zuweisung</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentControl
                  leadId={lead.id}
                  assignedTo={lead.assigned_to}
                  assignedName={assignedName}
                  currentUserId={profile.id}
                  currentUserDisplayName={profile.full_name}
                  adminUserId={adminUser.id}
                  vertriebUserId={vertriebUser.id}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStatusCard leadId={lead.id} status={lead.akquise_status} />
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

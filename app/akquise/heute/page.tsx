import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listOpenAppointments } from "@/lib/akquise/queries";
import { formatDateTime } from "@/lib/leads/format";
import { SubscribeButton } from "@/components/akquise/SubscribeButton";
import { AppointmentToggle } from "@/components/akquise/AppointmentToggle";
import type { AppointmentWithLead } from "@/lib/akquise/types";

export const metadata: Metadata = { title: "Heute" };
export const dynamic = "force-dynamic";

const TZ = "Europe/Berlin";

// YYYY-MM-DD in Berliner Zeit (lexikographisch vergleichbar)
function berlinDay(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function bucketLabel(firma: string | null, domain: string | null): string {
  return firma || domain || "Ohne Lead";
}

export default async function HeutePage() {
  const [appointments, profile] = await Promise.all([
    listOpenAppointments(),
    getCurrentProfile(),
  ]);

  const today = berlinDay(new Date());

  const overdue: AppointmentWithLead[] = [];
  const todays: AppointmentWithLead[] = [];
  const upcoming: AppointmentWithLead[] = [];

  for (const appt of appointments) {
    const day = berlinDay(appt.faellig_am);
    if (day < today) overdue.push(appt);
    else if (day === today) todays.push(appt);
    else upcoming.push(appt);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-caps">Akquise</div>
          <h1 className="text-xl font-medium tracking-tight">Heute & Überfällig</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Deine offenen Wiedervorlagen.
          </p>
        </div>
        {profile && <SubscribeButton token={profile.calendar_token} />}
      </div>

      <Section
        title="Überfällig"
        accent="border-red-500/40"
        items={overdue}
        tone="text-red-400"
      />
      <Section
        title="Heute"
        accent="border-yellow-500/40"
        items={todays}
        tone="text-yellow-400"
      />
      <Section
        title="Demnächst"
        accent="border-[var(--border)]"
        items={upcoming}
        tone="text-[var(--text-secondary)]"
      />

      {appointments.length === 0 && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)]">
          Keine offenen Wiedervorlagen.
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  tone,
  items,
}: {
  title: string;
  accent: string;
  tone: string;
  items: AppointmentWithLead[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h2 className={"label-caps " + tone}>
        {title} ({items.length})
      </h2>
      <ul className="space-y-2">
        {items.map((appt) => (
          <li
            key={appt.id}
            className={
              "flex items-center justify-between gap-3 rounded-md border-l-2 border border-[var(--border)] bg-[var(--surface)] px-4 py-3 " +
              accent
            }
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                {appt.titel}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
                <span>{formatDateTime(appt.faellig_am)}</span>
                {appt.lead && (
                  <Link
                    href={`/akquise/${appt.lead.id}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {bucketLabel(appt.lead.firma, appt.lead.domain)}
                  </Link>
                )}
              </div>
            </div>
            <AppointmentToggle id={appt.id} erledigt={appt.erledigt} />
          </li>
        ))}
      </ul>
    </section>
  );
}

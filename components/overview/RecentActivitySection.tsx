import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, Phone, StickyNote } from "lucide-react";
import { ACTIVITY_TYPE_LABELS } from "@/lib/akquise/constants";
import type { RecentActivityRow } from "@/lib/overview/queries";
import { periodLabel, type OverviewPeriod } from "@/lib/overview/periods";

function truncate(text: string | null, max = 80): string {
  if (!text) return "—";
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

function ActivityIcon({ typ }: { typ: string }) {
  const cls = "size-4 text-[var(--text-tertiary)]";
  if (typ === "anruf") return <Phone className={cls} strokeWidth={1.75} aria-hidden />;
  if (typ === "mail") return <Mail className={cls} strokeWidth={1.75} aria-hidden />;
  return <StickyNote className={cls} strokeWidth={1.75} aria-hidden />;
}

export function RecentActivitySection({
  rows,
  period = "this_week",
}: {
  rows: RecentActivityRow[];
  period?: OverviewPeriod;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Activity
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {periodLabel(period)}
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Keine Aktivitäten in diesem Zeitraum
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <thead className="bg-[var(--surface-hover)]">
                <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3">
                  <th>Wer</th>
                  <th>Was</th>
                  <th>Wo</th>
                  <th>Wann</th>
                  <th className="hidden md:table-cell">Notiz</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-2.5"
                  >
                    <td className="whitespace-nowrap text-[var(--text-secondary)]">
                      {row.userName}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-2 text-[var(--text-primary)]">
                        <ActivityIcon typ={row.typ} />
                        {ACTIVITY_TYPE_LABELS[row.typ] ?? row.typ}
                      </span>
                    </td>
                    <td>
                      {row.leadId ? (
                        <Link
                          href={`/akquise/${row.leadId}`}
                          className="font-medium hover:text-[var(--accent)] hover:underline"
                        >
                          {row.firma}
                        </Link>
                      ) : (
                        row.firma
                      )}
                    </td>
                    <td className="whitespace-nowrap text-xs text-[var(--text-tertiary)]">
                      {formatDistanceToNow(new Date(row.createdAt), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </td>
                    <td className="hidden max-w-[280px] truncate text-[var(--text-secondary)] md:table-cell">
                      {truncate(row.notiz)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

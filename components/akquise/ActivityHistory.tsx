import { DeleteActivityButton } from "@/components/akquise/DeleteActivityButton";
import { formatDateTime } from "@/lib/leads/format";
import { ACTIVITY_TYPE_LABELS } from "@/lib/akquise/constants";
import type { ActivityWithAuthor } from "@/lib/akquise/types";

export function ActivityHistory({
  activities,
  leadId,
}: {
  activities: ActivityWithAuthor[];
  leadId: string;
}) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">Noch keine Aktivitäten.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
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
              <span className="font-normal normal-case text-[var(--text-tertiary)]">
                {" "}
                · {a.author_name}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatDateTime(a.created_at)}
              </span>
              <DeleteActivityButton id={a.id} leadId={leadId} />
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
  );
}

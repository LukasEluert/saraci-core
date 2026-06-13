import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import type { ActionItemRow } from "@/lib/overview/queries";
import type { AkquiseStatus } from "@/lib/akquise/types";

function truncate(text: string | null, max = 80): string {
  if (!text) return "—";
  return text.length <= max ? text : `${text.slice(0, max).trim()}…`;
}

export function MyActionItemsSection({ items }: { items: ActionItemRow[] }) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Was du heute tun musst
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Zugewiesene Leads und offene Nachfass-Aufgaben
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead className="bg-[var(--surface-hover)]">
              <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3">
                <th>Firma</th>
                <th>Status</th>
                <th>Notiz</th>
                <th>Telefon</th>
                <th>Zugewiesen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-2.5"
                >
                  <td>
                    <Link
                      href={`/akquise/${item.id}`}
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                    >
                      {item.firma}
                    </Link>
                  </td>
                  <td>
                    <AkquiseStatusBadge
                      status={item.akquiseStatus as AkquiseStatus}
                    />
                  </td>
                  <td className="max-w-[240px] truncate text-[var(--text-secondary)]">
                    {truncate(item.latestNote)}
                  </td>
                  <td className="whitespace-nowrap text-[var(--text-secondary)]">
                    {item.telefon ? (
                      <a
                        href={`tel:${item.telefon}`}
                        className="hover:text-[var(--accent)] hover:underline"
                      >
                        {item.telefon}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap text-xs text-[var(--text-tertiary)]">
                    {formatDistanceToNow(new Date(item.assignedSince), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

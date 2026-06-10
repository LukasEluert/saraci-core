import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import type { ActionLeadItem, ActionRequired } from "@/lib/overview/queries";
import type { AkquiseStatus } from "@/lib/akquise/types";

function ActionRow({
  item,
  meta,
}: {
  item: ActionLeadItem;
  meta: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          href={`/akquise/${item.id}`}
          className="truncate font-medium text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
        >
          {item.firma}
        </Link>
        <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">{meta}</div>
      </div>
      {item.telefon ? (
        <a
          href={`tel:${item.telefon}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
        >
          <Phone className="size-3.5" strokeWidth={1.75} aria-hidden />
          {item.telefon}
        </a>
      ) : (
        <span className="text-xs text-[var(--text-tertiary)]">Keine Nummer</span>
      )}
    </li>
  );
}

function ActionList({
  title,
  items,
  total,
  emptyHint,
  moreHref,
  children,
}: {
  title: string;
  items: ActionLeadItem[];
  total: number;
  emptyHint: string;
  moreHref: string;
  children: (item: ActionLeadItem) => ReactNode;
}) {
  return (
    <div className="flex min-h-[180px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="label-caps text-[var(--text-secondary)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-tertiary)]">{emptyHint}</p>
      ) : (
        <ul className="mt-3 flex-1 space-y-2">
          {items.map((item) => (
            <ActionRow key={item.id} item={item} meta={children(item)} />
          ))}
        </ul>
      )}
      {total > items.length && (
        <Link
          href={moreHref}
          className="mt-3 text-xs text-[var(--accent)] hover:underline"
        >
          {total - items.length} weitere →
        </Link>
      )}
    </div>
  );
}

export function ActionRequiredSection({ data }: { data: ActionRequired }) {
  const bothEmpty = data.followUpTotal === 0 && data.rueckrufTotal === 0;

  if (bothEmpty) {
    return (
      <section>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Aktion erforderlich
        </h2>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Alles unter Kontrolle
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        Aktion erforderlich
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ActionList
          title="Angebote: Follow-up fällig"
          items={data.followUps}
          total={data.followUpTotal}
          emptyHint="Keine überfälligen Angebots-Follow-ups."
          moreHref="/admin/uebersicht"
        >
          {(item) => `vor ${item.daysAgo} Tagen Angebot raus`}
        </ActionList>
        <ActionList
          title="Rückrufe ohne Reaktion"
          items={data.rueckrufe}
          total={data.rueckrufTotal}
          emptyHint="Keine überfälligen Rückrufe."
          moreHref="/akquise"
        >
          {(item) => (
            <span className="flex flex-wrap items-center gap-2">
              <AkquiseStatusBadge status={item.akquiseStatus as AkquiseStatus} />
              <span>vor {item.daysAgo} Tagen</span>
            </span>
          )}
        </ActionList>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PotentialBadge } from "@/components/leads/PotentialBadge";
import { ScoreBadge } from "@/components/leads/ScoreBadge";
import { StatusBadge } from "@/components/leads/StatusBadge";
import { formatDateTime } from "@/lib/leads/format";
import type { LeadListItem } from "@/lib/leads/types";

export function LeadsTable({
  leads,
  pendingIds,
}: {
  leads: LeadListItem[];
  pendingIds?: Set<string>;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-secondary)]">
        Noch keine Leads.{" "}
        <Link href="/leads/new" className="text-[var(--accent)] underline">
          URL eingeben
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-[var(--border)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firma</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Potenzial</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Letzter Check</TableHead>
            <TableHead className="hidden lg:table-cell">Nächster Schritt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const pending = pendingIds?.has(lead.id);
            return (
              <TableRow key={lead.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/leads/${lead.id}`} className="block font-medium">
                    {lead.firma ?? "—"}
                    {pending && (
                      <span className="ml-2 text-xs text-yellow-400">
                        Wird geprüft…
                      </span>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.normalized_domain ?? lead.domain}
                  </Link>
                </TableCell>
                <TableCell>
                  <ScoreBadge score={lead.score} potential={lead.potential} />
                </TableCell>
                <TableCell>
                  <PotentialBadge potential={lead.potential} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="hidden text-xs text-[var(--text-secondary)] md:table-cell">
                  {formatDateTime(lead.last_checked_at)}
                </TableCell>
                <TableCell className="hidden max-w-[200px] truncate text-xs text-[var(--text-secondary)] lg:table-cell">
                  {lead.naechster_schritt ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

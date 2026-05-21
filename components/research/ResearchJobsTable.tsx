import Link from "next/link";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { ResearchJobStatusBadge } from "@/components/research/ResearchJobStatusBadge";
import { formatDateTime } from "@/lib/leads/format";
import type { ResearchJobListItem } from "@/lib/research/queries";

export function ResearchJobsTable({ jobs }: { jobs: ResearchJobListItem[] }) {
  if (jobs.length === 0) {
    return (
      <div className="table-shell">
        <TableEmptyState
          icon={Search}
          title="Noch keine Recherchen"
          description="Starte eine OSM-Recherche nach Unternehmen in Branche und Region."
          actionLabel="Neue Recherche"
          actionHref="/research/new"
        />
      </div>
    );
  }

  return (
    <div className="table-shell overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="pointer-events-none hover:bg-transparent">
            <TableHead>Datum</TableHead>
            <TableHead>Branche</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funde</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="cursor-pointer">
              <TableCell className="text-xs text-[var(--text-secondary)]">
                <Link href={`/research/${job.id}`} className="block">
                  {formatDateTime(job.created_at)}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/research/${job.id}`} className="block">
                  {job.industry?.name ?? "—"}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/research/${job.id}`} className="block">
                  {job.region?.name ?? "—"}
                </Link>
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                <Link href={`/research/${job.id}`} className="block">
                  {job.radius_km} km
                </Link>
              </TableCell>
              <TableCell>
                <ResearchJobStatusBadge status={job.status} />
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {job.results_found ?? 0}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/research/${job.id}`}
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                >
                  Detail →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

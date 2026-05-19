import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResearchJobStatusBadge } from "@/components/research/ResearchJobStatusBadge";
import { formatDateTime } from "@/lib/leads/format";
import type { ResearchJobListItem } from "@/lib/research/queries";

export function ResearchJobsTable({ jobs }: { jobs: ResearchJobListItem[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-secondary)]">
        Noch keine Recherchen.{" "}
        <Link href="/research/new" className="text-[var(--accent)] underline">
          Neue Recherche starten
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
            <TableHead>Datum</TableHead>
            <TableHead>Branche</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Radius</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funde</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="text-xs text-[var(--text-secondary)]">
                {formatDateTime(job.created_at)}
              </TableCell>
              <TableCell>{job.industry?.name ?? "—"}</TableCell>
              <TableCell>{job.region?.name ?? "—"}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {job.radius_km} km
              </TableCell>
              <TableCell>
                <ResearchJobStatusBadge status={job.status} />
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {job.results_found ?? 0}
              </TableCell>
              <TableCell>
                <Link
                  href={`/research/${job.id}`}
                  className="text-sm text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                >
                  Detail
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

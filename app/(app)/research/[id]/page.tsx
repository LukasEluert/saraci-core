import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResearchJobStatusBadge } from "@/components/research/ResearchJobStatusBadge";
import { ResearchResultsTable } from "@/components/research/ResearchResultsTable";
import { formatDateTime } from "@/lib/leads/format";
import {
  getResearchJob,
  listResearchResultsForJob,
} from "@/lib/research/queries";

export const metadata: Metadata = {
  title: "Recherche",
};

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ResearchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [job, results] = await Promise.all([
    getResearchJob(id),
    listResearchResultsForJob(id),
  ]);

  if (!job) notFound();

  const industryName = job.industry?.name ?? "—";
  const regionName = job.region?.name ?? "—";

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-6">
      <div>
        <Link
          href="/research"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Lead Research
        </Link>
        <h1 className="mt-2 text-xl font-medium tracking-tight">
          Recherche {industryName} in {regionName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
          <ResearchJobStatusBadge status={job.status} />
          <span>{formatDateTime(job.created_at)}</span>
          <span className="font-mono">{job.radius_km} km</span>
          <span>
            <strong className="text-[var(--text-primary)]">
              {job.results_found ?? results.length}
            </strong>{" "}
            Funde
          </span>
        </div>
        {job.error_message && (
          <p className="mt-2 text-sm text-red-400">{job.error_message}</p>
        )}
      </div>

      <ResearchResultsTable results={results} />
    </div>
  );
}

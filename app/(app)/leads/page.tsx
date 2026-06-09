import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LeadsPolling } from "@/components/leads/LeadsPolling";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listLeads } from "@/lib/leads/queries";
import { getPendingLeadIds } from "@/lib/leads/pending";

export const metadata: Metadata = {
  title: "Leads",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const statusParam = params.status;
  const status = Array.isArray(statusParam)
    ? statusParam
    : statusParam
      ? [statusParam]
      : undefined;

  const potentialParam = params.potential;
  const potential = Array.isArray(potentialParam)
    ? potentialParam
    : potentialParam
      ? [potentialParam]
      : undefined;

  const scoreMin = params.score_min ? Number(params.score_min) : undefined;
  const scoreMax = params.score_max ? Number(params.score_max) : undefined;
  const q = typeof params.q === "string" ? params.q : undefined;

  const { leads, total } = await listLeads({
    status,
    potential,
    score_min: Number.isFinite(scoreMin) ? scoreMin : undefined,
    score_max: Number.isFinite(scoreMax) ? scoreMax : undefined,
    q,
  });

  const pendingIds = await getPendingLeadIds();
  const showPolling = params.pending === "1" || pendingIds.size > 0;

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label-caps">Pipeline</div>
          <h1 className="text-xl font-medium tracking-tight">Leads</h1>
          <p className="text-sm text-[var(--text-secondary)]">{total} Einträge</p>
        </div>
        <Link href="/leads/new" className={cn(buttonVariants())}>
          Neuer Lead
        </Link>
      </div>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-[var(--surface)]" />}>
        <LeadFilters />
      </Suspense>

      <LeadsPolling enabled={showPolling} />

      <LeadsTable leads={leads} pendingIds={pendingIds} />
    </div>
  );
}

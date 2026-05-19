import type { Metadata } from "next";
import Link from "next/link";
import { ResearchJobsTable } from "@/components/research/ResearchJobsTable";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listResearchJobs } from "@/lib/research/queries";

export const metadata: Metadata = {
  title: "Lead Research",
};

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const jobs = await listResearchJobs();

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label-caps">OSM / Overpass</div>
          <h1 className="text-xl font-medium tracking-tight">Lead Research</h1>
        </div>
        <Link href="/research/new" className={cn(buttonVariants())}>
          Neue Recherche
        </Link>
      </div>

      <ResearchJobsTable jobs={jobs} />
    </div>
  );
}

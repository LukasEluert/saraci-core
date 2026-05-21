"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon, Search, XIcon } from "lucide-react";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResearchResultStatusBadge } from "@/components/research/ResearchResultStatusBadge";
import type { ResearchResultRow } from "@/lib/research/queries";
import { cn } from "@/lib/utils";

function isActionable(status: string | null): boolean {
  return (status ?? "new").toLowerCase() === "new";
}

function ResearchResultRowView({
  initial,
}: {
  initial: ResearchResultRow;
}) {
  const router = useRouter();
  const [row, setRow] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"save" | "dismiss" | "later" | null>(
    null
  );

  const statusKey = (row.status ?? "new").toLowerCase();
  const actionable = isActionable(row.status);
  const dimmed = statusKey === "dismissed" || statusKey === "pending";

  function save() {
    setAction("save");
    startTransition(async () => {
      toast.message("Prüfung kann ~25–30s dauern …");
      try {
        const res = await fetch(`/api/research/results/${row.id}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ run_check: true }),
        });
        const data = await res.json();

        if (res.status === 409 && data.lead_id) {
          toast.error(
            data.error === "Lead with this URL exists"
              ? "Lead mit dieser URL existiert bereits"
              : data.error === "Already saved"
                ? "Bereits als Lead gespeichert"
                : (data.error ?? "Konflikt")
          );
          setRow((r) => ({
            ...r,
            status: "saved",
            lead_id: data.lead_id,
          }));
          router.refresh();
          return;
        }

        if (!res.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Übernahme fehlgeschlagen"
          );
        }

        setRow((r) => ({
          ...r,
          status: "saved",
          lead_id: data.lead_id,
        }));

        const msg = data.check_started
          ? "Lead angelegt, Check läuft …"
          : "Lead angelegt (ohne Website-Check)";

        toast.success(msg, {
          action: {
            label: "→ Zum Lead",
            onClick: () => router.push(`/leads/${data.lead_id}`),
          },
        });
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Übernahme fehlgeschlagen"
        );
      } finally {
        setAction(null);
      }
    });
  }

  function dismiss() {
    if (
      !confirm("Diesen Fund wirklich verwerfen? Er wird nicht als Lead übernommen.")
    ) {
      return;
    }

    setAction("dismiss");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/research/results/${row.id}/dismiss`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Verwerfen fehlgeschlagen"
          );
        }
        setRow((r) => ({ ...r, status: "dismissed" }));
        toast.success("Fund verworfen");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Verwerfen fehlgeschlagen"
        );
      } finally {
        setAction(null);
      }
    });
  }

  function later() {
    setAction("later");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/research/results/${row.id}/later`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Aktion fehlgeschlagen"
          );
        }
        setRow((r) => ({ ...r, status: "pending" }));
        toast.success("Für später markiert");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Aktion fehlgeschlagen"
        );
      } finally {
        setAction(null);
      }
    });
  }

  return (
    <TableRow
      className={cn(
        dimmed && "opacity-50",
        statusKey === "saved" && "opacity-80"
      )}
    >
      <TableCell className="font-medium">
        {row.company_name ?? "—"}
      </TableCell>
      <TableCell>
        {row.website_url ? (
          <a
            href={
              row.website_url.startsWith("http")
                ? row.website_url
                : `https://${row.website_url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
          >
            {row.website_url.replace(/^https?:\/\//i, "")}
          </a>
        ) : (
          <span className="text-[var(--text-tertiary)]">—</span>
        )}
      </TableCell>
      <TableCell className="max-w-[200px] truncate text-xs text-[var(--text-secondary)]">
        {row.address ?? "—"}
      </TableCell>
      <TableCell>
        {row.has_website ? (
          <CheckIcon
            className="size-4 text-green-500"
            aria-label="Hat Website"
          />
        ) : (
          <XIcon className="size-4 text-zinc-500" aria-label="Keine Website" />
        )}
      </TableCell>
      <TableCell>
        <ResearchResultStatusBadge status={row.status} />
      </TableCell>
      <TableCell>
        {actionable ? (
          <div className="flex flex-col items-end gap-1">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              onClick={save}
            >
              {action === "save" && pending
                ? "Wird übernommen..."
                : "Als Lead übernehmen"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={pending}
              onClick={dismiss}
            >
              {action === "dismiss" && pending ? "…" : "Verwerfen"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={later}
              title="Status wird als „Ausstehend“ gespeichert (DB: pending)"
            >
              {action === "later" && pending ? "…" : "Später"}
            </Button>
          </div>
        ) : (
          <div className="text-right text-xs text-[var(--text-secondary)]">
            {statusKey === "saved" && row.lead_id ? (
              <Link
                href={`/leads/${row.lead_id}`}
                className="text-[var(--accent)] hover:underline"
              >
                → Lead
              </Link>
            ) : (
              <span className="text-[var(--text-tertiary)]">Erledigt</span>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ResearchResultsTable({
  results,
}: {
  results: ResearchResultRow[];
}) {
  if (results.length === 0) {
    return (
      <div className="table-shell">
        <TableEmptyState
          icon={Search}
          title="Keine Funde"
          description="Für diesen Research-Job wurden keine passenden Unternehmen gefunden."
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
            <TableHead>Firma</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead className="w-12">Hat Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row) => (
            <ResearchResultRowView key={row.id} initial={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

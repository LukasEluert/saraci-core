"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LEAD_STATUSES } from "@/lib/leads/constants";
import {
  labeledSelectItems,
  refSelectItemsById,
} from "@/lib/leads/selectItems";
import type { LeadDetail } from "@/lib/leads/types";

type RefItem = { id: string; name: string; slug: string | null };

export function LeadActionsPanel({
  lead,
  industries,
  regions,
}: {
  lead: LeadDetail;
  industries: RefItem[];
  regions: RefItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(lead.notiz ?? "");
  const [nextStep, setNextStep] = useState(lead.naechster_schritt ?? "");
  const [status, setStatus] = useState(lead.status ?? "new");
  const [industryId, setIndustryId] = useState(lead.industry_id ?? "");
  const [regionId, setRegionId] = useState(lead.region_id ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const leadLabel =
    lead.firma ?? lead.normalized_domain ?? lead.domain ?? "Lead";

  const canExportPdf =
    Boolean(lead.last_check_id && lead.report) && !lead.pending_check;
  const pdfTooltip = !lead.last_check_id
    ? "Kein Check vorhanden"
    : !lead.report
      ? "Kein Bericht vorhanden"
      : lead.pending_check
        ? "Check läuft noch"
        : undefined;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Update fehlgeschlagen");
    }
    return data;
  }

  function saveField(body: Record<string, unknown>, message: string) {
    startTransition(async () => {
      try {
        await patch(body);
        toast.success(message);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Fehler beim Speichern"
        );
      }
    });
  }

  async function deleteLead() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Löschen fehlgeschlagen"
        );
      }
      toast.success("Lead gelöscht");
      setDeleteOpen(false);
      router.push("/leads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    } finally {
      setDeleting(false);
    }
  }

  async function runRecheck() {
    toast.message("Prüfung läuft (~25s)");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/leads/${lead.id}/check`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Check fehlgeschlagen");
        toast.success(`Score: ${data.score ?? "—"}/100`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Check fehlgeschlagen");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="label-caps text-[10px]">Aktionen</h3>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() => saveField({ status: "qualified" }, "Als qualifiziert markiert")}
          >
            Als qualifiziert markieren
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => saveField({ status: "rejected" }, "Lead verworfen")}
          >
            Verwerfen
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => saveField({ status: "later" }, "Später markiert")}
          >
            Später prüfen
          </Button>
          <Button size="sm" variant="secondary" disabled={pending} onClick={runRecheck}>
            Re-Check durchführen
          </Button>
          <span title={pdfTooltip} className="inline-block w-full">
            <Button
              size="sm"
              className="w-full bg-[var(--accent)] text-white hover:opacity-90"
              disabled={pending || !canExportPdf}
              onClick={() => {
                window.open(
                  `/api/leads/${lead.id}/report-client.pdf`,
                  "_blank"
                );
              }}
            >
              Kundenbericht (PDF)
            </Button>
          </span>
          <span title={pdfTooltip} className="inline-block w-full">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={pending || !canExportPdf}
              onClick={() => {
                window.open(
                  `/api/leads/${lead.id}/report-internal.pdf`,
                  "_blank"
                );
              }}
            >
              Interner Bericht (PDF)
            </Button>
          </span>
        </div>
        <div className="space-y-1.5 pt-2">
          <Label className="text-xs">Status ändern</Label>
          <Select
            value={status}
            items={labeledSelectItems(LEAD_STATUSES)}
            onValueChange={(v) => {
              if (!v) return;
              setStatus(v);
              saveField({ status: v }, "Status aktualisiert");
            }}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Button
            type="button"
            size="sm"
            disabled={pending || deleting}
            className="w-full bg-red-600 text-white hover:bg-red-700"
            onClick={() => setDeleteOpen(true)}
          >
            Lead löschen
          </Button>
        </div>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={!deleting}>
          <DialogHeader>
            <DialogTitle>Lead löschen?</DialogTitle>
            <DialogDescription>
              Lead &apos;{leadLabel}&apos; wird endgültig gelöscht, inklusive aller
              Prüfungen und Berichte. Diese Aktion kann nicht rückgängig gemacht
              werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={deleteLead}
            >
              {deleting ? "Wird gelöscht…" : "Endgültig löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="space-y-2">
        <Label className="label-caps text-[10px]">Notiz</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => {
            if (note !== (lead.notiz ?? "")) {
              saveField({ note }, "Notiz gespeichert");
            }
          }}
          rows={4}
        />
      </section>

      <section className="space-y-2">
        <Label className="label-caps text-[10px]">Nächster Schritt</Label>
        <Textarea
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          onBlur={() => {
            if (nextStep !== (lead.naechster_schritt ?? "")) {
              saveField({ next_step: nextStep }, "Nächster Schritt gespeichert");
            }
          }}
          rows={3}
        />
      </section>

      <section className="space-y-3">
        <h3 className="label-caps text-[10px]">Meta</h3>
        <div className="space-y-1.5">
          <Label className="text-xs">Branche</Label>
          <Select
            value={industryId || "none"}
            items={refSelectItemsById(industries)}
            onValueChange={(v) => {
              const id = v === "none" ? null : v;
              setIndustryId(id ?? "");
              saveField({ industry_id: id }, "Branche aktualisiert");
            }}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Region</Label>
          <Select
            value={regionId || "none"}
            items={refSelectItemsById(regions)}
            onValueChange={(v) => {
              const id = v === "none" ? null : v;
              setRegionId(id ?? "");
              saveField({ region_id: id }, "Region aktualisiert");
            }}
            disabled={pending}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <dl className="space-y-1 text-xs text-[var(--text-secondary)]">
          <div>
            <dt className="inline font-medium">Quelle: </dt>
            <dd className="inline">{lead.source?.name ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

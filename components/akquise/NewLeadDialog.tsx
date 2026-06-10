"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createAkquiseLead } from "@/app/actions/akquise";
import { DuplicateWarning } from "@/components/leads/DuplicateWarning";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const INPUT_CLASS =
  "focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]";

export function NewLeadDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [firma, setFirma] = useState("");
  const [branche, setBranche] = useState("");
  const [region, setRegion] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notiz, setNotiz] = useState("");

  const reset = () => {
    setFirma("");
    setBranche("");
    setRegion("");
    setTelefon("");
    setEmail("");
    setWebsite("");
    setNotiz("");
  };

  const submit = () => {
    if (!firma.trim()) {
      toast.error("Firma ist ein Pflichtfeld");
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await createAkquiseLead({
          firma,
          branche,
          region,
          telefon,
          email,
          website,
          notiz,
        });
        toast.success("Lead angelegt");
        reset();
        setOpen(false);
        router.push(`/akquise/${id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Konnte nicht speichern.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[var(--accent-hover)]"
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden />
        Neuer Lead
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={!pending} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neuer Lead</DialogTitle>
            <DialogDescription>
              Wird automatisch dir zugewiesen und erscheint sofort in deiner Liste.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <label className="block space-y-1">
              <span className="label-caps">
                Firma <span className="text-[var(--accent)]">*</span>
              </span>
              <input
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                autoFocus
                className={INPUT_CLASS}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="label-caps">Branche</span>
                <input
                  value={branche}
                  onChange={(e) => setBranche(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block space-y-1">
                <span className="label-caps">Stadt</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="label-caps">Telefon</span>
                <input
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  inputMode="tel"
                  className={INPUT_CLASS}
                />
              </label>
              <label className="block space-y-1">
                <span className="label-caps">E-Mail</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  className={INPUT_CLASS}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="label-caps">Website</span>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="z. B. kanzlei-mueller.de"
                className={INPUT_CLASS}
              />
            </label>
            <DuplicateWarning
              domain={website}
              firma={firma}
              leadHrefPrefix="/akquise"
            />

            <label className="block space-y-1">
              <span className="label-caps">Notiz</span>
              <textarea
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                rows={3}
                className={INPUT_CLASS + " resize-none"}
              />
            </label>
          </div>

          <DialogFooter>
            <button
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
              className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
            >
              {pending ? "Speichert…" : "Lead anlegen"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

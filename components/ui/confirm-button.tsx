"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmButtonProps = {
  children: ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  title: string;
  description: string;
  confirmLabel?: string;
  successMessage?: string;
  destructive?: boolean;
  onConfirm: () => Promise<unknown>;
  onDone?: () => void;
};

export function ConfirmButton({
  children,
  triggerClassName,
  triggerLabel,
  title,
  description,
  confirmLabel = "Loeschen",
  successMessage,
  destructive = true,
  onConfirm,
  onDone,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      try {
        await onConfirm();
        if (successMessage) toast.success(successMessage);
        setOpen(false);
        onDone?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  const confirmClass = destructive
    ? "bg-red-500/90 text-white hover:bg-red-500"
    : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]";

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        onClick={() => setOpen(true)}
        className={triggerClassName}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={!pending} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

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
              onClick={run}
              className={
                "focus-ring rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] disabled:opacity-40 " +
                confirmClass
              }
            >
              {pending ? "..." : confirmLabel}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

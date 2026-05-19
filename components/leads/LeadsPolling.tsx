"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function LeadsPolling({ enabled }: { enabled: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [enabled, router]);

  if (!enabled) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
      <span>Checks laufen im Hintergrund – Liste aktualisiert sich alle 10s.</span>
      <Button variant="outline" size="sm" onClick={() => router.refresh()}>
        Jetzt aktualisieren
      </Button>
    </div>
  );
}

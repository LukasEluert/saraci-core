"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function SubscribeButton({ token }: { token: string }) {
  const [origin, setOrigin] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const httpsUrl = origin ? `${origin}/api/calendar/${token}` : "";
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={webcalUrl || "#"}
        className="focus-ring inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[var(--accent-hover)]"
      >
        <CalendarPlus className="size-4" strokeWidth={1.75} aria-hidden />
        Kalender abonnieren
      </a>
      <button
        type="button"
        disabled={!httpsUrl}
        onClick={() => {
          void navigator.clipboard.writeText(httpsUrl).then(() => {
            setCopied(true);
            toast.success("Link kopiert");
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="focus-ring inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        {copied ? (
          <Check className="size-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Copy className="size-4" strokeWidth={1.75} aria-hidden />
        )}
        Link kopieren
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Button } from "@/components/ui/button";

export function LeadReportSection({ markdown }: { markdown: string }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowRaw((v) => !v)}
        >
          {showRaw ? "Gerendert anzeigen" : "Roh-Markdown anzeigen"}
        </Button>
      </div>
      {showRaw ? (
        <pre className="overflow-auto rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-xs text-[var(--text-secondary)]">
          {markdown}
        </pre>
      ) : (
        <div className="markdown-body">
          <MarkdownBody source={markdown} />
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { SCORE_WEIGHTS, STANDARD_BRANCHEN } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Einstellungen",
};

export default async function EinstellungenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-6">
      <div className="space-y-2">
        <div className="label-caps">Account</div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">E-Mail</div>
          <div className="mt-1 font-mono text-sm text-[var(--text-primary)]">
            {user?.email ?? "—"}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LogoutButton />
            <Link
              href="/overview"
              className="label-caps focus-ring rounded-md border border-[var(--border)] bg-transparent px-3 py-[7px] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Zur Übersicht
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="label-caps">Score-Gewichtung (read-only)</div>
        <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead className="bg-[var(--surface-hover)]">
              <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:px-4 [&>th]:py-3">
                <th className="border-b border-[var(--border)]">Kriterium</th>
                <th className="border-b border-[var(--border)]">Punkte</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_WEIGHTS.map((w) => (
                <tr key={w.id} className="border-b border-[var(--border-subtle)] [&>td]:px-4 [&>td]:py-2">
                  <td className="text-[var(--text-secondary)]">{w.label}</td>
                  <td className="font-mono text-[12px] text-[var(--text-primary)]">{w.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <div className="label-caps">Standard-Branchen</div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">
            Vorausgefüllte Liste — als Orientierung für Lead-Erfassung und Pipeline.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STANDARD_BRANCHEN.map((b) => (
              <span
                key={b}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] text-[var(--text-secondary)]"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

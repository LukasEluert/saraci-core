import type { Metadata } from "next";
import Link from "next/link";
import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";
import { LogoutButton } from "@/components/LogoutButton";
import {
  listIndustriesSettings,
  listRegionsSettings,
  listScoreRulesSettings,
} from "@/lib/settings/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Einstellungen",
};

export const dynamic = "force-dynamic";

export default async function EinstellungenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [industries, regions, scoreRules] = await Promise.all([
    listIndustriesSettings(),
    listRegionsSettings(),
    listScoreRulesSettings(),
  ]);

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-6">
      <div>
        <div className="label-caps">Konfiguration</div>
        <h1 className="text-xl font-medium tracking-tight">Einstellungen</h1>
      </div>

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

      <SettingsWorkspace
        industries={industries}
        regions={regions}
        scoreRules={scoreRules}
      />
    </div>
  );
}

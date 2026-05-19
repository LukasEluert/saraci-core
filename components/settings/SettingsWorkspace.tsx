"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatKeywordsInput,
  formatPostalCodesInput,
} from "@/lib/settings/keywords";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SCORE_RULE_CATEGORIES,
  SCORE_RULE_SEVERITIES,
} from "@/lib/settings/constants";
import type {
  IndustrySetting,
  RegionSetting,
  ScoreRuleSetting,
} from "@/lib/settings/queries";
import { cn } from "@/lib/utils";

function ActiveToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (active: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        checked
          ? "border-green-500/40 bg-green-500/15 text-green-400"
          : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
        disabled && "opacity-50"
      )}
    >
      {checked ? "Aktiv" : "Inaktiv"}
    </button>
  );
}

function IndustriesTab({
  initial,
}: {
  initial: IndustrySetting[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  function patch(id: string, body: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/settings/industries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        if (data.industry) {
          setRows((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    ...data.industry,
                    keywords: Array.isArray(data.industry.keywords)
                      ? data.industry.keywords
                      : r.keywords,
                  }
                : r
            )
          );
        }
        toast.success("Branche gespeichert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  function create() {
    if (!newName.trim()) {
      toast.error("Name ist erforderlich.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/industries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Anlegen fehlgeschlagen");
        if (data.industry) {
          setRows((prev) =>
            [...prev, data.industry].sort((a, b) =>
              a.name.localeCompare(b.name, "de")
            )
          );
        }
        toast.success("Branche angelegt");
        setNewName("");
        setDialogOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Neue Branche
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    defaultValue={row.name}
                    disabled={pending}
                    className="max-w-xs"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== row.name) patch(row.id, { name: v });
                    }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                  {row.slug ?? "—"}
                </TableCell>
                <TableCell className="min-w-[220px]">
                  <Textarea
                    key={`${row.id}-${formatKeywordsInput(row.keywords)}`}
                    defaultValue={formatKeywordsInput(row.keywords)}
                    disabled={pending}
                    rows={2}
                    placeholder="keyword1, keyword2, …"
                    className="text-xs"
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      const prev = formatKeywordsInput(row.keywords);
                      if (next !== prev) {
                        patch(row.id, { keywords: next });
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ActiveToggle
                    checked={row.active}
                    disabled={pending}
                    onChange={(active) => patch(row.id, { active })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Branche</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="industry-name">Name</Label>
            <Input
              id="industry-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="z. B. Gastronomie"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="button" disabled={pending} onClick={create}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegionsTab({ initial }: { initial: RegionSetting[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
  });

  function patch(id: string, body: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/settings/regions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        if (data.region) {
          setRows((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    ...data.region,
                    lat:
                      data.region.lat != null
                        ? Number(data.region.lat)
                        : null,
                    lng:
                      data.region.lng != null
                        ? Number(data.region.lng)
                        : null,
                    postal_codes: Array.isArray(data.region.postal_codes)
                      ? data.region.postal_codes
                      : r.postal_codes,
                  }
                : r
            )
          );
        }
        toast.success("Region gespeichert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  function create() {
    if (!form.name.trim()) {
      toast.error("Name ist erforderlich.");
      return;
    }
    const lat = form.lat.trim() ? Number(form.lat) : undefined;
    const lng = form.lng.trim() ? Number(form.lng) : undefined;
    if (form.lat.trim() && Number.isNaN(lat)) {
      toast.error("Ungültige Latitude.");
      return;
    }
    if (form.lng.trim() && Number.isNaN(lng)) {
      toast.error("Ungültige Longitude.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/regions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            lat,
            lng,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Anlegen fehlgeschlagen");
        if (data.region) {
          const region = {
            ...data.region,
            lat: data.region.lat != null ? Number(data.region.lat) : null,
            lng: data.region.lng != null ? Number(data.region.lng) : null,
            postal_codes: Array.isArray(data.region.postal_codes)
              ? data.region.postal_codes
              : [],
          };
          setRows((prev) =>
            [...prev, region].sort((a, b) =>
              a.name.localeCompare(b.name, "de")
            )
          );
        }
        toast.success("Region angelegt");
        setForm({ name: "", lat: "", lng: "" });
        setDialogOpen(false);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Neue Region
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>PLZ</TableHead>
              <TableHead>Lat</TableHead>
              <TableHead>Lng</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    defaultValue={row.name}
                    disabled={pending}
                    className="max-w-xs"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== row.name) patch(row.id, { name: v });
                    }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                  {row.slug ?? "—"}
                </TableCell>
                <TableCell className="min-w-[180px]">
                  <Textarea
                    key={`${row.id}-${formatPostalCodesInput(row.postal_codes)}`}
                    defaultValue={formatPostalCodesInput(row.postal_codes)}
                    disabled={pending}
                    rows={2}
                    placeholder="76131, 76133, …"
                    className="font-mono text-xs"
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      const prev = formatPostalCodesInput(row.postal_codes);
                      if (next !== prev) {
                        patch(row.id, { postal_codes: next });
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={row.lat ?? ""}
                    disabled={pending}
                    className="w-28 font-mono text-xs"
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      const next = raw === "" ? null : Number(raw);
                      if (raw !== "" && Number.isNaN(next)) return;
                      if (next !== row.lat) patch(row.id, { lat: next });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    defaultValue={row.lng ?? ""}
                    disabled={pending}
                    className="w-28 font-mono text-xs"
                    onBlur={(e) => {
                      const raw = e.target.value.trim();
                      const next = raw === "" ? null : Number(raw);
                      if (raw !== "" && Number.isNaN(next)) return;
                      if (next !== row.lng) patch(row.id, { lng: next });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ActiveToggle
                    checked={row.active}
                    disabled={pending}
                    onChange={(active) => patch(row.id, { active })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="region-name">Name</Label>
              <Input
                id="region-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="region-lat">Lat</Label>
                <Input
                  id="region-lat"
                  value={form.lat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lat: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="region-lng">Lng</Label>
                <Input
                  id="region-lng"
                  value={form.lng}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lng: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="button" disabled={pending} onClick={create}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScoreRulesTab({ initial }: { initial: ScoreRuleSetting[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();

  function patch(id: string, body: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/settings/score-rules/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        if (data.rule) {
          setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...data.rule } : r))
          );
        }
        toast.success("Regel aktualisiert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  return (
    <div className="overflow-auto rounded-lg border border-[var(--border)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Kategorie</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Punkte</TableHead>
            <TableHead>Aktiv</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                {row.key}
              </TableCell>
              <TableCell>
                <Input
                  defaultValue={row.label}
                  disabled={pending}
                  className="min-w-[180px]"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== row.label) patch(row.id, { label: v });
                  }}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.category}
                  onValueChange={(v) => {
                    if (v && v !== row.category) {
                      patch(row.id, { category: v });
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCORE_RULE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.severity}
                  onValueChange={(v) => {
                    if (v && v !== row.severity) {
                      patch(row.id, { severity: v });
                    }
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCORE_RULE_SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={-50}
                  max={0}
                  defaultValue={row.points}
                  disabled={pending}
                  className="w-20 font-mono"
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isNaN(v) || v < -50 || v > 0) {
                      toast.error("Punkte müssen zwischen -50 und 0 liegen.");
                      return;
                    }
                    if (v !== row.points) patch(row.id, { points: v });
                  }}
                />
              </TableCell>
              <TableCell>
                <ActiveToggle
                  checked={row.active}
                  disabled={pending}
                  onChange={(active) => patch(row.id, { active })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SettingsWorkspace({
  industries,
  regions,
  scoreRules,
}: {
  industries: IndustrySetting[];
  regions: RegionSetting[];
  scoreRules: ScoreRuleSetting[];
}) {
  return (
    <Tabs defaultValue="industries" className="w-full">
      <TabsList>
        <TabsTrigger value="industries">Branchen</TabsTrigger>
        <TabsTrigger value="regions">Regionen</TabsTrigger>
        <TabsTrigger value="score-rules">Score-Regeln</TabsTrigger>
      </TabsList>
      <TabsContent value="industries" className="mt-4">
        <IndustriesTab initial={industries} />
      </TabsContent>
      <TabsContent value="regions" className="mt-4">
        <RegionsTab initial={regions} />
      </TabsContent>
      <TabsContent value="score-rules" className="mt-4">
        <ScoreRulesTab initial={scoreRules} />
      </TabsContent>
    </Tabs>
  );
}

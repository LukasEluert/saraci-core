"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DuplicateWarning } from "@/components/leads/DuplicateWarning";
import { refSelectItemsById } from "@/lib/leads/selectItems";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RefItem = { id: string; name: string; slug: string | null };

export function NewLeadTabs({
  industries,
  regions,
}: {
  industries: RefItem[];
  regions: RefItem[];
}) {
  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList>
        <TabsTrigger value="single">Einzeln</TabsTrigger>
        <TabsTrigger value="bulk">Bulk</TabsTrigger>
        <TabsTrigger value="csv">CSV</TabsTrigger>
      </TabsList>
      <TabsContent value="single">
        <SingleTab industries={industries} regions={regions} />
      </TabsContent>
      <TabsContent value="bulk">
        <BulkTab industries={industries} regions={regions} />
      </TabsContent>
      <TabsContent value="csv">
        <CsvTab />
      </TabsContent>
    </Tabs>
  );
}

function RefSelects({
  industries,
  regions,
  industryId,
  regionId,
  onIndustry,
  onRegion,
}: {
  industries: RefItem[];
  regions: RefItem[];
  industryId: string;
  regionId: string;
  onIndustry: (v: string) => void;
  onRegion: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Branche (optional)</Label>
        <Select
          value={industryId || "none"}
          items={refSelectItemsById(industries)}
          onValueChange={(v) => onIndustry(!v || v === "none" ? "" : v)}
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
        <Label>Region (optional)</Label>
        <Select
          value={regionId || "none"}
          items={refSelectItemsById(regions)}
          onValueChange={(v) => onRegion(!v || v === "none" ? "" : v)}
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
    </div>
  );
}

function SingleTab({
  industries,
  regions,
}: {
  industries: RefItem[];
  regions: RefItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [regionId, setRegionId] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      toast.message("Prüfung läuft (~25s)");
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            company_name: company || undefined,
            industry_id: industryId || undefined,
            region_id: regionId || undefined,
            run_check: true,
          }),
        });
        const data = await res.json();
        if (res.status === 409) {
          toast.error("Lead existiert bereits");
          router.push(`/leads/${data.lead_id}`);
          return;
        }
        if (!res.ok) throw new Error(data.error ?? "Fehler");
        toast.success(
          `Lead angelegt${data.score != null ? ` – Score: ${data.score}/100` : ""}`
        );
        router.push(`/leads/${data.lead_id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Einzelne URL</CardTitle>
        <CardDescription>Lead anlegen und Website sofort prüfen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">Website-URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://beispiel.de"
              required
            />
            <DuplicateWarning domain={url} firma={company} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Firmenname (optional)</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Aus URL abgeleitet, wenn leer"
            />
          </div>
          <RefSelects
            industries={industries}
            regions={regions}
            industryId={industryId}
            regionId={regionId}
            onIndustry={setIndustryId}
            onRegion={setRegionId}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Prüfe Website… (~25s)" : "Lead anlegen und prüfen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BulkTab({
  industries,
  regions,
}: {
  industries: RefItem[];
  regions: RefItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [regionId, setRegionId] = useState("");

  const urls = useMemo(
    () =>
      text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 50),
    [text]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (urls.length === 0) return;

    startTransition(async () => {
      toast.message(`Lege ${urls.length} Leads an…`);
      const leadIds: string[] = [];

      for (const url of urls) {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            industry_id: industryId || undefined,
            region_id: regionId || undefined,
            run_check: false,
          }),
        });
        const data = await res.json();
        if (res.status === 409) continue;
        if (!res.ok) {
          toast.error(`${url}: ${data.error ?? "Fehler"}`);
          continue;
        }
        leadIds.push(data.lead_id);
      }

      if (leadIds.length === 0) {
        toast.error("Keine neuen Leads angelegt");
        return;
      }

      await fetch("/api/leads/bulk-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: leadIds }),
      });

      toast.success(`${leadIds.length} Leads in Warteschlange`);
      router.push("/leads?pending=1");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk-URLs</CardTitle>
        <CardDescription>Eine URL pro Zeile, max. 50.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>URLs</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={"https://a.de\nhttps://b.de"}
            />
          </div>
          <RefSelects
            industries={industries}
            regions={regions}
            industryId={industryId}
            regionId={regionId}
            onIndustry={setIndustryId}
            onRegion={setRegionId}
          />
          <Button type="submit" disabled={pending || urls.length === 0}>
            {pending
              ? "Importiere…"
              : `${urls.length} Lead${urls.length === 1 ? "" : "s"} anlegen und prüfen`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CsvTab() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [file, setFile] = useState<File | null>(null);

  function onFileChange(f: File | null) {
    setFile(f);
    if (!f) {
      setPreview([]);
      return;
    }
    f.text().then((text) => {
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase(),
      });
      setPreview(parsed.data.slice(0, 5));
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    startTransition(async () => {
      const form = new FormData();
      form.append("file", file);
      toast.message("Importiere CSV…");
      const res = await fetch("/api/leads/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Import fehlgeschlagen");
        return;
      }
      toast.success(`${data.imported} Leads importiert`);
      router.push("/leads?pending=1");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV-Import</CardTitle>
        <CardDescription>
          Format: url, company_name, industry, region (Slugs). Max. 100 Zeilen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-3 font-mono text-xs text-[var(--text-secondary)]">
          url,company_name,industry,region
          <br />
          https://example.com,Beispiel GmbH,restaurants,baden-baden
        </div>
        <div className="space-y-1.5">
          <Label>CSV-Datei</Label>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </div>
        {preview.length > 0 && (
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(preview[0]).map((k) => (
                    <TableHead key={k}>{k}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, i) => (
                  <TableRow key={i}>
                    {Object.values(row).map((v, j) => (
                      <TableCell key={j} className="text-xs">
                        {v}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <form onSubmit={submit}>
          <Button type="submit" disabled={pending || !file}>
            {pending ? "Importiere…" : "CSV importieren"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

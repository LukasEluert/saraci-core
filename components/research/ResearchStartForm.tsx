"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { refSelectItemsBySlug } from "@/lib/leads/selectItems";

type RefItem = { id: string; name: string; slug: string | null };

export function ResearchStartForm({
  industries,
  regions,
}: {
  industries: RefItem[];
  regions: RefItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [industrySlug, setIndustrySlug] = useState("");
  const [regionSlug, setRegionSlug] = useState("");
  const [radiusKm, setRadiusKm] = useState("10");
  const [maxResults, setMaxResults] = useState("30");

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!industrySlug || !regionSlug) {
      toast.error("Bitte Branche und Region wählen.");
      return;
    }

    startTransition(async () => {
      toast.message("Suche läuft... (~10–30s)");
      try {
        const res = await fetch("/api/research/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            industry_slug: industrySlug,
            region_slug: regionSlug,
            radius_km: Number(radiusKm),
            max_results: Number(maxResults),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Recherche fehlgeschlagen"
          );
        }
        router.push(`/research/${data.job_id}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Recherche fehlgeschlagen"
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neue Recherche</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Branche</Label>
            <Select
              value={industrySlug}
              items={refSelectItemsBySlug(industries)}
              onValueChange={(v) => v && setIndustrySlug(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Branche wählen" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((i) => (
                  <SelectItem key={i.id} value={i.slug ?? i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Region</Label>
            <Select
              value={regionSlug}
              items={refSelectItemsBySlug(regions)}
              onValueChange={(v) => v && setRegionSlug(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region wählen" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.slug ?? r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="radius">Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max">Max. Ergebnisse</Label>
              <Input
                id="max"
                type="number"
                min={1}
                max={100}
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Suche läuft... (~10–30s)" : "Recherche starten"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

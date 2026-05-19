"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES, POTENTIAL_OPTIONS } from "@/lib/leads/constants";

export function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`/leads?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const status = searchParams.get("status") ?? "";
  const potential = searchParams.get("potential") ?? "";
  const q = searchParams.get("q") ?? "";
  const scoreMin = searchParams.get("score_min") ?? "";
  const scoreMax = searchParams.get("score_max") ?? "";

  return (
    <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-1.5">
        <Label className="label-caps text-[10px]">Status</Label>
        <Select
          value={status || "all"}
          onValueChange={(v) =>
            updateParams({ status: v === "all" ? null : v })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="label-caps text-[10px]">Potenzial</Label>
        <Select
          value={potential || "all"}
          onValueChange={(v) =>
            updateParams({ potential: v === "all" ? null : v })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {POTENTIAL_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="label-caps text-[10px]">Score min</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={scoreMin}
          onChange={(e) => updateParams({ score_min: e.target.value || null })}
          placeholder="0"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="label-caps text-[10px]">Score max</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={scoreMax}
          onChange={(e) => updateParams({ score_max: e.target.value || null })}
          placeholder="100"
        />
      </div>

      <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
        <Label className="label-caps text-[10px]">Suche</Label>
        <Input
          value={q}
          onChange={(e) => updateParams({ q: e.target.value || null })}
          placeholder="Firma oder Domain"
        />
      </div>
    </div>
  );
}

const CATEGORY_KEYS = [
  "tech",
  "performance",
  "seo",
  "design",
  "content",
  "legal",
  "conversion",
] as const;

function barWidth(points: number): string {
  return `${Math.min((Math.abs(points) / 30) * 100, 100)}%`;
}

function categoryBarClass(points: number): string {
  if (points === 0) return "bg-neutral-700";
  if (points < 0) return "bg-red-500";
  return "bg-neutral-700";
}

function finalScoreBarClass(score: number): string {
  if (score <= 40) return "bg-red-500";
  if (score <= 70) return "bg-yellow-500";
  return "bg-green-500";
}

function formatLabel(key: string): string {
  if (key === "total_deductions") return "Total deductions";
  if (key === "final_score") return "Final score";
  return key;
}

function getBarStyle(
  key: string,
  points: number
): { className: string; width: string } {
  if (key === "final_score") {
    return {
      className: finalScoreBarClass(points),
      width: `${Math.min(Math.max(points, 0), 100)}%`,
    };
  }

  if (key === "total_deductions") {
    return {
      className: "bg-red-500",
      width: barWidth(points),
    };
  }

  return {
    className: categoryBarClass(points),
    width: points === 0 ? "8%" : barWidth(points),
  };
}

export function ScoreBreakdown({
  breakdown,
}: {
  breakdown: Record<string, number> | null;
}) {
  if (!breakdown || Object.keys(breakdown).length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">Kein Breakdown.</p>
    );
  }

  const orderedKeys: string[] = [
    ...CATEGORY_KEYS.filter((k) => k in breakdown),
    ...(breakdown.total_deductions !== undefined ? ["total_deductions"] : []),
    ...(breakdown.final_score !== undefined ? ["final_score"] : []),
  ];

  return (
    <div className="space-y-3">
      {orderedKeys.map((category) => {
        const points = breakdown[category] ?? 0;
        const { className, width } = getBarStyle(category, points);

        return (
          <div key={category}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">
                {formatLabel(category)}
              </span>
              <span className="font-mono tabular-nums">{points}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated-2)]">
              <div
                className={`h-full rounded-full ${className}`}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated-2)]">
        <Icon className="size-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
        {description}
      </p>
      <Link
        href={actionHref}
        className={cn(buttonVariants(), "mt-6")}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

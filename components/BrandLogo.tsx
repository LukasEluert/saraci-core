import Link from "next/link";
import { cn } from "@/lib/utils";

const markSizes = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
} as const;

const textSizes = {
  sm: "text-[13px]",
  md: "text-sm",
  lg: "text-base",
} as const;

export function BrandLogo({
  size = "md",
  showWordmark = true,
  linked = false,
  href = "/overview",
  className,
}: {
  size?: keyof typeof markSizes;
  showWordmark?: boolean;
  linked?: boolean;
  href?: string;
  className?: string;
}) {
  const content = (
    <span
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logomark.svg"
        alt=""
        aria-hidden
        className={cn(markSizes[size], "shrink-0")}
      />
      {showWordmark ? (
        <span
          className={cn(
            "truncate font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--text-primary)]",
            textSizes[size]
          )}
        >
          SARACI CORE
        </span>
      ) : null}
    </span>
  );

  if (linked) {
    return (
      <Link href={href} className="inline-flex min-w-0 items-center outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

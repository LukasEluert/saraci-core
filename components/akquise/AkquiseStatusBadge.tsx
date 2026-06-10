import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";
import {
  AKQUISE_STATUS_LABELS,
  AKQUISE_STATUS_STYLES,
} from "@/lib/akquise/constants";
import type { AkquiseStatus } from "@/lib/akquise/types";

export function AkquiseStatusBadge({ status }: { status: AkquiseStatus }) {
  return (
    <span className={cn(BADGE_BASE, AKQUISE_STATUS_STYLES[status] ?? AKQUISE_STATUS_STYLES.neu)}>
      {AKQUISE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

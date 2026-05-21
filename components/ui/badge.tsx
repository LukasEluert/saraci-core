import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { BADGE_BASE } from "@/lib/ui/badge-styles"

const badgeVariants = cva(
  cn(
    BADGE_BASE,
    "transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3"
  ),
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-[var(--border)] bg-[var(--bg-elevated-2)] text-[var(--text-secondary)]",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-400",
        outline:
          "border-[var(--border)] text-[var(--text-secondary)]",
        ghost: "border-transparent text-[var(--text-tertiary)]",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }

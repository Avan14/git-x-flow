import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
        secondary:
          "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
        destructive:
          "border-transparent bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
        success:
          "border-transparent bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
        warning:
          "border-transparent bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]",
        outline:
          "border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
        // Achievement type badges
        first_contribution:
          "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pr_merged:
          "border-transparent bg-purple-500/10 text-purple-400 border-purple-500/20",
        issue_resolved:
          "border-transparent bg-sky-500/10 text-sky-400 border-sky-500/20",
        popular_repo:
          "border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20",
        maintainer:
          "border-transparent bg-pink-500/10 text-pink-400 border-pink-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

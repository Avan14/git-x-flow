import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)]",
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "neutral" | "primary" | "soft" | "success" | "warning" | "danger";

const styles: Record<Variant, string> = {
  neutral: "border border-border bg-surface text-muted",
  primary: "bg-primary text-primary-foreground",
  soft: "border border-primary-border bg-primary-soft text-primary",
  success: "border border-success-border bg-success-bg text-success",
  warning: "border border-warning-border bg-warning-bg text-warning",
  danger: "border border-danger-border bg-danger-bg text-danger",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "muted" | "danger" | "green" | "outlineOnDark";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border bg-background text-foreground hover:bg-surface",
  ghost: "bg-transparent text-foreground hover:bg-surface",
  muted: "bg-transparent text-muted hover:bg-surface hover:text-foreground",
  danger: "bg-danger text-white hover:bg-danger/90",
  green: "bg-green text-green-ink hover:bg-green-hover",
  outlineOnDark: "border border-white/25 bg-transparent text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-9 w-9",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  to,
  ...rest
}: CommonProps & { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link to={to} className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonAsLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </a>
  );
}
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Logo({
  className,
  children,
  tone = "light",
}: {
  className?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em]",
        tone === "dark" ? "text-white" : "text-foreground",
        className,
      )}
    >
      <span
        className={cx(
          "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md text-[14px] font-bold",
          tone === "dark" ? "bg-white text-night" : "bg-foreground text-background",
        )}
      >
        F
      </span>
      Faython{" "}
      <span className={cx("font-medium", tone === "dark" ? "text-white/60" : "text-muted")}>
        Scholar
      </span>
      {children}
    </span>
  );
}
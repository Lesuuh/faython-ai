import { cx } from "@/lib/cx";

export function Spinner({
  size = 18,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span role={label ? "status" : undefined} className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cx(
          "inline-block animate-spin rounded-full border-2 border-current/20 border-t-current",
          className,
        )}
        style={{ width: size, height: size }}
      />
      {label && <span className="text-sm text-muted">{label}</span>}
    </span>
  );
}
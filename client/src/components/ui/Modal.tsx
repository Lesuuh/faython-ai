import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className={cx(
        "m-auto w-[calc(100%-2rem)] rounded-lg border border-border bg-background p-6 shadow-lg backdrop:bg-foreground/40",
        width,
      )}
    >
      <h2 className="text-lg font-bold tracking-[-0.01em]">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-6 flex justify-end gap-2.5">{footer}</div>}
    </dialog>
  );
}
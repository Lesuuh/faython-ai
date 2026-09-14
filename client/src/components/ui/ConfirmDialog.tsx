import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onClose();
        }
      }}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="
        m-auto
        w-[calc(100%-2rem)]
        max-w-md
        rounded-xl
        border
        border-border/70
        bg-card
        p-0
        text-card-foreground
        shadow-2xl
        backdrop:bg-black/60
        backdrop:backdrop-blur-[2px]
      "
    >
      <div className="p-6">
        <div className="space-y-2">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold tracking-tight"
          >
            {title}
          </h2>

          <p
            id="confirm-dialog-description"
            className="text-sm leading-6 text-muted-foreground"
          >
            {description}
          </p>
        </div>

        <div className="mt-7 flex justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy && <Spinner size={15} />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

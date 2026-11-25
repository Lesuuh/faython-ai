import { useState, type ReactElement } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function useSignOut(): {
  requestSignOut: () => void;
  signOutDialog: ReactElement;
} {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function confirmSignOut() {
    setBusy(true);
    try {
      await signOut();
      setOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  const signOutDialog = (
    <ConfirmDialog
      open={open}
      onClose={() => {
        if (!busy) setOpen(false);
      }}
      onConfirm={() => void confirmSignOut()}
      title="Sign out of Faython?"
      description="You'll need to sign in with Google again to reach your projects, files and tokens. This device will be signed out."
      confirmLabel="Sign out"
      danger
      busy={busy}
    />
  );

  return { requestSignOut: () => setOpen(true), signOutDialog };
}

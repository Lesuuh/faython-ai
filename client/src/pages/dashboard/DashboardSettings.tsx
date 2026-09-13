import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useUpdateSettings } from "@/lib/hooks";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DashboardSettings() {
  const { appUser, signOut } = useAuth();
  const updateSettings = useUpdateSettings();
  const navigate = useNavigate();
  const notificationsOn = appUser?.notificationsOn ?? true;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggleNotifications(value: boolean) {
    try {
      await updateSettings.mutateAsync({ notificationsOn: value });
      toast.success(value ? "Notifications enabled." : "Notifications disabled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update settings.");
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api.deleteAccount();
      await signOut();
      toast.success("Account deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account.");
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your preferences."
      />

      <div className="mb-5 rounded-lg border border-border bg-background p-6 sm:p-8">
        <h3 className="text-base font-bold tracking-[-0.02em]">Email notifications</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Receive occasional updates about Faython and new features.
        </p>
        <label className="mt-4 flex items-center gap-2.5 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsOn}
            onChange={(e) => toggleNotifications(e.target.checked)}
            className="h-4 w-4 accent-[--primary]"
          />
          Notifications on
        </label>
      </div>

      <div className="rounded-lg border border-danger-border bg-background p-6 sm:p-8">
        <h3 className="mb-1.5 text-base font-bold text-danger">Danger zone</h3>
        <p className="mb-4 max-w-[60ch] text-[13px] leading-relaxed text-muted">
          Deleting your account removes your profile and all saved topics permanently.
        </p>
        <Button variant="danger" onClick={() => setConfirmingDelete(true)}>Delete account</Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={deleteAccount}
        title="Delete your account?"
        description="This permanently removes your profile and all saved topics. This can't be undone and your projects will be lost."
        confirmLabel="Delete my account"
        danger
        busy={deleting}
      />
    </>
  );
}
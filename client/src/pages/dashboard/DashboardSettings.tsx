import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useUpdateSettings } from "@/lib/hooks";
import { api } from "@/lib/api";

export function DashboardSettings() {
  const { appUser, signOut } = useAuth();
  const updateSettings = useUpdateSettings();
  const navigate = useNavigate();
  const notificationsOn = appUser?.notificationsOn ?? true;

  async function toggleNotifications(value: boolean) {
    try {
      await updateSettings.mutateAsync({ notificationsOn: value });
      toast.success(value ? "Notifications enabled." : "Notifications disabled.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update settings.");
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete your account and ALL of your data? This is permanent.")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;
    try {
      await api.deleteAccount();
      await signOut();
      toast.success("Account deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account.");
    }
  }

  return (
    <>
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Settings</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">Manage your preferences.</p>

      <div className="rounded-lg border border-border bg-background p-8" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Email notifications</h3>
        <p className="text-muted text-[13px]" style={{ marginBottom: "0.75rem" }}>
          Receive occasional updates about Faython and new features.
        </p>
        <label className="flex items-center gap-2.5" style={{ justifyContent: "flex-start", cursor: "pointer", gap: "0.6rem" }}>
          <input
            type="checkbox"
            checked={notificationsOn}
            onChange={(e) => toggleNotifications(e.target.checked)}
          />
          Notifications on
        </label>
      </div>

      <div className="rounded-lg border border-danger-border bg-background p-6">
        <h3 className="mb-1.5 text-base text-danger">Danger zone</h3>
        <p className="mb-3.5 max-w-[60ch] text-sm leading-[1.65] text-muted">Deleting your account removes your profile and all saved topics permanently.</p>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-danger text-white hover:brightness-95 disabled:opacity-45 disabled:cursor-not-allowed" onClick={deleteAccount}>
          Delete account
        </button>
      </div>
    </>
  );
}
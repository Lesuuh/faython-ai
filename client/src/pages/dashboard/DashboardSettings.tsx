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
      <div className="dash-title">Settings</div>
      <p className="dash-sub">Manage your preferences.</p>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Email notifications</h3>
        <p className="muted text-sm" style={{ marginBottom: "0.75rem" }}>
          Receive occasional updates about Faython and new features.
        </p>
        <label className="row" style={{ justifyContent: "flex-start", cursor: "pointer", gap: "0.6rem" }}>
          <input
            type="checkbox"
            checked={notificationsOn}
            onChange={(e) => toggleNotifications(e.target.checked)}
          />
          Notifications on
        </label>
      </div>

      <div className="danger-zone">
        <h3>Danger zone</h3>
        <p>Deleting your account removes your profile and all saved topics permanently.</p>
        <button className="btn btn-danger" onClick={deleteAccount}>
          Delete account
        </button>
      </div>
    </>
  );
}
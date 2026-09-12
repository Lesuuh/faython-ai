import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile } from "@/lib/hooks";

export function DashboardProfile() {
  const { appUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(appUser?.name || "");
  const [email, setEmail] = useState(appUser?.email || "");

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name, email });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    }
  }

  return (
    <>
      <div className="dash-title">Profile</div>
      <p className="dash-sub">Update your personal information.</p>

      <div className="resp-grid" style={{ marginBottom: 0 }}>
        <form onSubmit={saveProfile} className="card">
          <h3 style={{ marginBottom: "1rem" }}>Account details</h3>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Member since</label>
            <input value={appUser ? new Date(appUser.createdAt).toLocaleDateString() : ""} disabled />
          </div>
          <button className="btn btn-primary" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <span className="spinner" /> : "Save changes"}
          </button>
        </form>

        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Security</h3>
          <p className="muted text-sm" style={{ marginBottom: "0.75rem" }}>
            Passwords and sign-in are managed securely by Faython's authentication provider.
          </p>
          <Link to="/forgot-password" className="btn btn-outline">
            Reset password
          </Link>
        </div>
      </div>
    </>
  );
}
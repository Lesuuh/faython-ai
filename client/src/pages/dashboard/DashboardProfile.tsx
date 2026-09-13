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
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Profile</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">Update your personal information.</p>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]" style={{ marginBottom: 0 }}>
        <form onSubmit={saveProfile} className="rounded-lg border border-border bg-background p-8">
          <h3 style={{ marginBottom: "1rem" }}>Account details</h3>
          <div className="mb-5 grid gap-1.5">
            <label className="text-[13px] font-semibold text-foreground" htmlFor="name">Full name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
              className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
            />
          </div>
          <div className="mb-5 grid gap-1.5">
            <label className="text-[13px] font-semibold text-foreground" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]" />
          </div>
          <div className="mb-5 grid gap-1.5">
            <label className="text-[13px] font-semibold text-foreground">Member since</label>
            <input value={appUser ? new Date(appUser.createdAt).toLocaleDateString() : ""} disabled className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]" />
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : "Save changes"}
          </button>
        </form>

        <div className="rounded-lg border border-border bg-background p-8">
          <h3 style={{ marginBottom: "1rem" }}>Security</h3>
          <p className="text-muted text-[13px]" style={{ marginBottom: "0.75rem" }}>
            Passwords and sign-in are managed securely by Faython's authentication provider.
          </p>
          <Link to="/forgot-password" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed">
            Reset password
          </Link>
        </div>
      </div>
    </>
  );
}
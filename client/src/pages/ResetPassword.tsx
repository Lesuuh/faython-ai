import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase redirects here with the recovery session in the URL hash; supabase-js
  // picks it up so we can update the password.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setReady(Boolean(s));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw new Error(err.message);
      toast.success("Password updated. Please sign in.");
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!supabaseConfigured) {
    return (
      <AuthLayout title="Reset not available" subtitle="Authentication is not configured yet.">
        <p className="text-muted text-[13px]">
          Set up Supabase and the recovery link will work here.{" "}
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title="Loading…" subtitle="Connecting to your recovery session.">
        <div className="flex justify-center p-8">
          <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-muted text-[13px]">
          Open the full link from your email, or{" "}
          <Link to="/forgot-password">request a new one</Link>.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a new password for your account.">
      {error && <div className="mb-4 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-foreground">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
        </div>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="confirm" className="text-[13px] font-semibold text-foreground">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
          {confirm && password !== confirm && <span className="text-danger text-xs">Passwords do not match.</span>}
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" disabled={loading}>
          {loading ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <p className="text-[13px] text-muted">
          Set up Supabase and the recovery link will work here.{" "}
          <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout title="Loading…" subtitle="Connecting to your recovery session.">
        <div className="flex justify-center p-8">
          <Spinner size={22} />
        </div>
        <p className="text-[13px] text-muted">
          Open the full link from your email, or{" "}
          <Link to="/forgot-password" className="font-semibold text-primary underline underline-offset-[3px]">
            request a new one
          </Link>
          .
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a new password for your account.">
      {error && (
        <div className="mb-5 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-5 grid gap-1.5">
          <Field label="New password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        <div className="mb-5 grid gap-1.5">
          <Field
            label="Confirm new password"
            htmlFor="confirm"
            error={confirm && password !== confirm ? "Passwords do not match." : null}
          >
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner size={16} /> : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export function VerifyEmail() {
  const [state, setState] = useState<"pending" | "done" | "error">("pending");

  useEffect(() => {
    if (!supabaseConfigured) {
      setState("error");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "done" : "error");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setState(s ? "done" : "error");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your email address.">
      {state === "pending" && (
        <div className="loader-row">
          <span className="spinner" />
        </div>
      )}
      {state === "done" && (
        <div className="form-success">
          Your email is verified. You're all set — sign in to continue.
        </div>
      )}
      {state === "error" && (
        <div className="form-error">
          This confirmation link is invalid or expired. Please request a new one from your inbox.
        </div>
      )}
      <p className="auth-alt">
        <Link to="/login">Go to sign in</Link>
      </p>
    </AuthLayout>
  );
}
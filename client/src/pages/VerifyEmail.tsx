import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { Spinner } from "@/components/ui/Spinner";

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
        <div className="flex justify-center p-8">
          <Spinner size={22} />
        </div>
      )}
      {state === "done" && (
        <div className="rounded-md border border-success-border bg-success-bg px-4 py-3.5 text-[13px] leading-relaxed text-success">
          Your email is verified. You're all set — sign in to continue.
        </div>
      )}
      {state === "error" && (
        <div className="rounded-md border border-danger-border bg-danger-bg px-4 py-3.5 text-[13px] leading-relaxed text-danger">
          This confirmation link is invalid or expired. Please request a new one from your inbox.
        </div>
      )}
      <p className="mt-6 text-center text-[13px] text-muted">
        <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">
          Go to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
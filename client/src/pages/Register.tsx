import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export function Register() {
  const { signUp, session, demoMode, configured, isGoogleConfigured } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

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
      await signUp(name, email, password);
      if (session) {
        toast.success("Account created. Welcome to Faython!");
        navigate("/dashboard", { replace: true });
      } else {
        setCheckEmail(true);
        toast.success("Account created. Check your email to confirm.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <AuthLayout title="Confirm your email" subtitle="One more step.">
        <div className="rounded-md border border-success-border bg-success-bg px-4 py-3.5 text-[13px] leading-relaxed text-success">
          We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account,
          then sign in.
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start generating research topics for free.">
      {demoMode && (
        <div className="mb-5 rounded-md border border-warning-border bg-warning-bg px-4 py-3.5 text-[13px] leading-relaxed text-warning">
          Preview build — creating an account sets up a local demo session, so treat it as a
          sandbox. Your data won't be stored on a real server.
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-5 grid gap-1.5">
          <Field label="Full name" htmlFor="name">
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Okonkwo"
            />
          </Field>
        </div>
        <div className="mb-5 grid gap-1.5">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
            />
          </Field>
        </div>
        <div className="mb-5 grid gap-1.5">
          <Field
            label="Password"
            htmlFor="password"
            hint="Use at least 8 characters."
          >
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
            label="Confirm password"
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
          {loading ? <Spinner size={16} /> : "Create account"}
        </Button>
      </form>

      {configured && isGoogleConfigured && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton />
        </>
      )}

      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { consumeAuthRedirect, setAuthRedirect } from "@/lib/auth-redirect";

export function Login() {
  const { signIn, demoMode, isGoogleConfigured, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from || consumeAuthRedirect() || "/";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your research.">
      {demoMode && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-md border border-warning-border bg-warning-bg px-4 py-3.5 text-[13px] leading-relaxed text-warning">
          <span>
            Preview build — sign in with the demo account:{" "}
            <code className="rounded-sm bg-background/60 px-1.5 py-0.5 font-mono">{DEMO_EMAIL}</code>{" "}
            / <code className="rounded-sm bg-background/60 px-1.5 py-0.5 font-mono">{DEMO_PASSWORD}</code>
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
            }}
          >
            Fill demo details
          </Button>
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} noValidate>
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
        <div className="mb-4 grid gap-1.5">
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </div>
        <div className="mb-5 flex justify-end">
          <Link to="/forgot-password" className="text-[13px] text-muted transition-colors hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner size={16} /> : "Sign in"}
        </Button>
      </form>

      {configured && isGoogleConfigured && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.1em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton onBeforeRedirect={() => setAuthRedirect(from)} />
        </>
      )}

      <p className="mt-6 text-center text-[13px] text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary underline underline-offset-[3px]">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
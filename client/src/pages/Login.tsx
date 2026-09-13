import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { signIn, demoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

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
    <AuthLayout title="Welcome back" subtitle="Sign in to generate your next research topic.">
      {demoMode && (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-warning-border bg-warning-bg px-4 py-3.5 text-sm text-warning" style={{ marginBottom: "1.25rem" }}>
          Preview mode — Supabase isn't connected yet, so any email and password will let you in.
        </div>
      )}
      {error && <div className="mb-4 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="email" className="text-[13px] font-semibold text-foreground">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
        </div>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-foreground">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
        </div>
        <div className="flex items-center gap-2.5" style={{ justifyContent: "flex-end", marginBottom: "1rem" }}>
          <Link to="/forgot-password" className="text-muted text-[13px]">
            Forgot password?
          </Link>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" disabled={loading}>
          {loading ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : "Sign in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.1em] text-muted-foreground [&::before]:flex-1 [&::before]:h-px [&::before]:bg-border [&::after]:flex-1 [&::after]:h-px [&::after]:bg-border">or</div>
      <GoogleButton />

      <p className="mt-6 text-center text-[13px] text-muted">
        Don't have an account? <Link to="/register" className="font-semibold text-primary underline underline-offset-[3px]">Create one</Link>
      </p>
    </AuthLayout>
  );
}
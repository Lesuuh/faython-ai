import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { useAuth } from "@/context/AuthContext";

export function Register() {
  const { signUp, session, demoMode } = useAuth();
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
        <div className="mb-4 rounded-md border border-success-border bg-success-bg px-4 py-3 text-[13px] text-success">
          We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account,
          then sign in.
        </div>
        <p className="mt-6 text-center text-[13px] text-muted">
          <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">Back to sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start generating research topics for free.">
      {demoMode && (
        <div className="mb-4 flex items-start gap-2.5 rounded-md border border-warning-border bg-warning-bg px-4 py-3.5 text-sm text-warning" style={{ marginBottom: "1.25rem" }}>
          Preview mode — Supabase isn't connected yet, so any details will create a demo account.
        </div>
      )}
      {error && <div className="mb-4 rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="name" className="text-[13px] font-semibold text-foreground">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Okonkwo"
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
          <span className="text-muted text-xs">Use at least 8 characters.</span>
        </div>
        <div className="mb-5 grid gap-1.5">
          <label htmlFor="confirm" className="text-[13px] font-semibold text-foreground">Confirm password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          />
          {confirm && password !== confirm && <span className="text-danger text-xs">Passwords do not match.</span>}
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" disabled={loading}>
          {loading ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : "Create account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.1em] text-muted-foreground [&::before]:flex-1 [&::before]:h-px [&::before]:bg-border [&::after]:flex-1 [&::after]:h-px [&::after]:bg-border">or</div>
      <GoogleButton />

      <p className="mt-6 text-center text-[13px] text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
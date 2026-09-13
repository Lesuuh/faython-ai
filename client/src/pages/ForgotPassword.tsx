import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthContext";

export function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a link to choose a new password.">
      {sent ? (
        <div className="mb-4 rounded-md border border-success-border bg-success-bg px-4 py-3 text-[13px] text-success">
          If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          Check your inbox (and spam folder). The link expires in 1 hour.
        </div>
      ) : (
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
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" disabled={loading || !email}>
            {loading ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered it? <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
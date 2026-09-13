import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

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
        <div className="rounded-md border border-success-border bg-success-bg px-4 py-3.5 text-[13px] leading-relaxed text-success">
          If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          Check your inbox (and spam folder). The link expires in 1 hour.
        </div>
      ) : (
        <form onSubmit={onSubmit}>
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
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? <Spinner size={16} /> : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-[13px] text-muted">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-primary underline underline-offset-[3px]">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { consumeAuthRedirect } from "@/lib/auth-redirect";
import { Logo } from "@/components/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { googleIcon } from "@/components/googleIcon";

const CONFIRM_MS = 1600;
const SWAP_MS = 900;

export function AuthTransition() {
  const { user, justSignedIn, signingOut, finishSignIn, finishSignOut } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const mode: "signin" | "signout" | null = justSignedIn
    ? "signin"
    : signingOut
      ? "signout"
      : null;

  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "there";
  const email = user?.email || "";

  useEffect(() => {
    setDone(false);
    if (!mode) return;

    const swap = window.setTimeout(() => setDone(true), CONFIRM_MS);
    const finish = window.setTimeout(
      () => {
        if (mode === "signin") {
          const to = consumeAuthRedirect() || "/";
          toast.success(`Signed in as ${email || name}`, {
            description: "Welcome back to Faython.",
          });
          finishSignIn();
          navigate(to, { replace: true });
        } else {
          toast.success("Signed out", {
            description: "Your session has ended.",
          });
          finishSignOut();
          navigate("/login", { replace: true });
        }
      },
      CONFIRM_MS + SWAP_MS,
    );

    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(finish);
    };
  }, [mode, email, name, finishSignIn, finishSignOut, navigate]);

  if (!mode) return null;

  const signingIn = mode === "signin";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <Logo />
      <div
        className={
          done
            ? "flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success"
            : "flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted"
        }
      >
        {done ? <Check size={26} strokeWidth={3} /> : <Spinner size={22} />}
      </div>
      <div className="text-center">
        <p className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
          {done
            ? signingIn
              ? "You're signed in"
              : "You're signed out"
            : signingIn
              ? "Finishing sign-in…"
              : "Signing you out…"}
        </p>
        <p className="mt-1.5 text-[14px] text-muted">
          {done
            ? signingIn
              ? "Taking you to your workspace…"
              : "Redirecting you to sign in…"
            : signingIn
              ? "Confirming your Google account"
              : "Ending your session securely"}
        </p>
        {signingIn && email && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-muted">
            {googleIcon()}
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

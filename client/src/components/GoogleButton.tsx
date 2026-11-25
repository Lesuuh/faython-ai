import { useState } from "react";
import { toast } from "sonner";
// import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { googleIcon } from "@/components/googleIcon";
import { useAuth } from "@/hooks/useAuth";

export function GoogleButton() {
  const { signInWithGoogle } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  let googleConfigured = true;

  if (!googleConfigured) {
    return (
      <p className="rounded-md border border-warning-border bg-warning-bg px-3 py-2.5 text-center text-xs leading-relaxed text-muted">
        Google sign-in is unavailable. Configure the Supabase URL and anon key
        to enable OAuth.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={redirecting}
      onClick={async () => {
        setRedirecting(true);
        try {
          await signInWithGoogle();
        } catch (err) {
          setRedirecting(false);
          toast.error(
            err instanceof Error ? err.message : "Google sign-in failed",
          );
        }
      }}
    >
      {redirecting ? <Spinner size={16} /> : googleIcon()}
      Continue with Google
    </Button>
  );
}

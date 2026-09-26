import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { googleIcon } from "@/components/googleIcon";

export function GoogleButton({ onBeforeRedirect }: { onBeforeRedirect?: () => void }) {
  const { googleConfigured, signInWithGoogle } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  if (!googleConfigured) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={redirecting}
      onClick={async () => {
        setRedirecting(true);
        onBeforeRedirect?.();
        try {
          await signInWithGoogle();
        } catch (err) {
          setRedirecting(false);
          toast.error(err instanceof Error ? err.message : "Google sign-in failed");
        }
      }}
    >
      {redirecting ? <Spinner size={16} /> : googleIcon()}
      Continue with Google
    </Button>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { googleIcon } from "@/components/googleIcon";

export function GoogleButton() {
  const { configured, isGoogleConfigured } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  const available = configured && isGoogleConfigured;

  if (!available) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={redirecting}
      onClick={async () => {
        setRedirecting(true);
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
          });
          if (error) throw new Error(error.message);
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
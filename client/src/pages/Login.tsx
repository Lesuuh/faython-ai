import { useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";
import { consumeAuthRedirect, setAuthRedirect } from "@/lib/auth-redirect";

export function Login() {
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ||
    consumeAuthRedirect() ||
    "/";

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with Google to continue your research."
    >
      <GoogleButton onBeforeRedirect={() => setAuthRedirect(from)} />
    </AuthLayout>
  );
}

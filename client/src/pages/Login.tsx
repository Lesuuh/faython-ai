import { AuthLayout } from "@/components/AuthLayout";
import { GoogleButton } from "@/components/GoogleButton";

export function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with Google to continue your research."
    >
      <GoogleButton />
    </AuthLayout>
  );
}

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile } from "@/lib/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Field, Input } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";

export function DashboardProfile() {
  const { appUser } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(appUser?.name || "");
  const [email, setEmail] = useState(appUser?.email || "");

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ name, email });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Update your personal information."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-lg border border-border bg-background p-6 sm:p-8">
          <h3 className="mb-5 text-base font-bold tracking-[-0.02em]">Account details</h3>
          <div className="grid gap-4">
            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                required
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Member since" htmlFor="since">
              <Input
                id="since"
                value={appUser ? new Date(appUser.createdAt).toLocaleDateString() : ""}
                disabled
              />
            </Field>
          </div>
          <Button className="mt-5" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>

        <div className="rounded-lg border border-border bg-background p-6 sm:p-8">
          <h3 className="mb-3 text-base font-bold tracking-[-0.02em]">Security</h3>
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Passwords and sign-in are managed securely by Faython's authentication provider.
          </p>
          <ButtonLink to="/forgot-password" variant="secondary">
            Reset password
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
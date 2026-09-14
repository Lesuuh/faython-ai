import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, LogOut } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Label, Select } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import {
  REFERENCING_STYLES,
  loadProfile,
  saveProfile,
  type AcademicLevel,
  type ResearchProfile,
} from "@/lib/profile-store";

export function Settings() {
  const { user, appUser, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<ResearchProfile>(() => loadProfile());

  const name =
    user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "Student";
  const email = appUser?.email || user?.email || "";

  function set<K extends keyof ResearchProfile>(key: K, value: ResearchProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function setChapterName(index: number, value: string) {
    setProfile((p) => {
      const names = [...p.chapterNames] as ResearchProfile["chapterNames"];
      names[index] = value;
      return { ...p, chapterNames: names };
    });
  }

  function handleSave() {
    saveProfile(profile);
    toast.success("Research settings saved");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Settings"
          description="Tell Faython about your context so generated chapters match your level and course."
        />

        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
              <BookOpen size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.01em]">Research profile</h2>
              <p className="text-xs text-muted">
                These details are added as context when generating chapters.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="University / institution" htmlFor="university">
              <Input
                id="university"
                value={profile.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="e.g. University of Lagos"
              />
            </Field>
            <Field label="Program / course" htmlFor="course">
              <Input
                id="course"
                value={profile.course}
                onChange={(e) => set("course", e.target.value)}
                placeholder="e.g. B.Sc. Computer Science"
              />
            </Field>
            <Field label="Academic level" htmlFor="level">
              <Select
                id="level"
                value={profile.level}
                onChange={(e) => set("level", e.target.value as AcademicLevel)}
              >
                <option value="">Not specified</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="phd">PhD</option>
              </Select>
            </Field>
            <Field label="Referencing style" htmlFor="referencing-style">
              <Select
                id="referencing-style"
                value={profile.referencingStyle}
                onChange={(e) => set("referencingStyle", e.target.value)}
              >
                {REFERENCING_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-6">
            <Label>Chapter structure</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.chapterNames.map((chapterName, i) => (
                <Input
                  key={i}
                  value={chapterName}
                  onChange={(e) => setChapterName(i, e.target.value)}
                  placeholder={`Chapter ${i + 1}`}
                  aria-label={`Chapter ${i + 1} name`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save settings</Button>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-[15px] font-bold tracking-[-0.01em]">Account</h2>
          {loading ? null : user ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{name}</div>
                <div className="truncate text-xs text-muted">{email}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => void signOut()}>
                <LogOut size={14} /> Sign out
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              You're browsing as a guest.{" "}
              <ButtonLink to="/login" variant="secondary" size="sm" className="ml-1">
                Sign in
              </ButtonLink>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, FileText, History, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTopicsMeta, useTopics, useUsage } from "@/lib/hooks";
import { useProjectProfile } from "@/lib/project-profile";
import { FREE_CHAPTERS_PER_DAY, FREE_TOPICS_PER_DAY } from "@/lib/limits";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardHome() {
  const { user, appUser } = useAuth();
  const { data: meta } = useTopicsMeta();
  const { data: recent, isLoading } = useTopics({ page: 1, limit: 5 });
  const { data: usageData } = useUsage();
  const { profile } = useProjectProfile();

  const total = meta?.counts.all ?? 0;
  const saved = meta?.counts.saved ?? 0;
  const usage = usageData?.usage ?? { topics: 0, chapterOne: 0 };
  const displayName = user?.user_metadata?.full_name || appUser?.name || "Student";
  const chips = [
    profile.university && `University: ${profile.university}`,
    profile.course && `Course: ${profile.course}`,
    profile.level && `Level: ${profile.level}`,
    profile.referencingStyle && `Style: ${profile.referencingStyle}`,
  ].filter(Boolean) as string[];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${displayName.split(" ")[0]}`}
        description="Your research activity at a glance. Start a project whenever you're ready."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={total} icon={History} hint="Generated topic sets" />
        <StatCard
          label="Topics today"
          value={`${usage.topics}/${FREE_TOPICS_PER_DAY}`}
          icon={FileText}
          hint="Free generations, resets daily"
        />
        <StatCard
          label="Chapter One today"
          value={`${usage.chapterOne}/${FREE_CHAPTERS_PER_DAY}`}
          icon={Layers}
          hint="Free generations, resets daily"
        />
        <StatCard label="Saved" value={saved} icon={Bookmark} hint="Topics you've bookmarked" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-background p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-primary">
          <FileText size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Ready to research?</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
            Say what you're interested in — or upload a photo of your assignment. Faython turns it
            into scoped topics, writes Chapter One free, and unlocks the rest per project.
          </p>
        </div>
        <ButtonLink to="/generate-topics?new=1" className="shrink-0">
          Start a project <ArrowRight size={15} />
        </ButtonLink>
      </div>

      {chips.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-8 text-base font-bold tracking-[-0.02em]">Recent activity</h2>

      {isLoading && (
        <div className="grid gap-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
      )}

      {recent && recent.items.length === 0 && (
        <EmptyState
          eyebrow="No activity yet"
          title="Your projects will live here"
          body="When you generate a topic set, it's saved here as a project you can reopen any time."
          actions={
            <ButtonLink to="/generate-topics?new=1" size="sm">
              Start your first project
            </ButtonLink>
          }
        />
      )}

      {recent && recent.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {recent.items.map((t) => (
            <Link
              key={t.id}
              to={`/project/${t.id}`}
              className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary-border hover:bg-primary-soft/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{t.prompt}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {t.reply.slice(0, 220)}
                    {t.reply.length > 220 ? "…" : ""}
                  </p>
                </div>
                <ArrowRight size={16} className="mt-1 shrink-0 text-muted" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={t.chapterCount === 5 ? "primary" : "soft"}>
                  {t.chapterCount === 5 ? "Complete" : `${t.chapterCount ?? 0}/5 chapters`}
                </Badge>
                {t.level && <Badge>{t.level}</Badge>}
                {t.discipline && <Badge>{t.discipline}</Badge>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
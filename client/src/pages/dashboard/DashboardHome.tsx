import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTopicsMeta, useTopics, useUsage } from "@/lib/hooks";
import { useProjectProfile } from "@/lib/project-profile";
import { EmptyState } from "@/components/EmptyState";
import { History, Bookmark, Lock, ArrowRight, FileText, ChevronRight } from "lucide-react";

const FREE_TOPICS_PER_DAY = 3;

export function DashboardHome() {
  const { user, appUser } = useAuth();
  const { data: meta } = useTopicsMeta();
  const { data: recent } = useTopics({ page: 1, limit: 5 });
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
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Welcome back, {displayName.split(" ")[0]}</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">
        Here's your research activity at a glance. Start a project whenever you're ready.
      </p>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-muted text-xs font-medium uppercase tracking-[0.06em]">Projects</span>
            <span className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-foreground">
              <History size={15} />
            </span>
          </div>
          <div className="text-[28px] font-bold tracking-[-0.03em]">{total}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-muted text-xs font-medium uppercase tracking-[0.06em]">Free topics today</span>
            <span className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-foreground">
              <FileText size={15} />
            </span>
          </div>
          <div className="text-[28px] font-bold tracking-[-0.03em]">
            {usage.topics}
            <span className="text-muted text-[13px]" style={{ fontWeight: 500 }}>
              {" "}
              / {FREE_TOPICS_PER_DAY}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-muted text-xs font-medium uppercase tracking-[0.06em]">Saved</span>
            <span className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-foreground">
              <Bookmark size={15} />
            </span>
          </div>
          <div className="text-[28px] font-bold tracking-[-0.03em]">{saved}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-muted text-xs font-medium uppercase tracking-[0.06em]">Chapters written</span>
            <span className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-foreground">
              <Lock size={15} />
            </span>
          </div>
          <div className="text-[28px] font-bold tracking-[-0.03em]" style={{ fontSize: 20, letterSpacing: "-0.01em", marginTop: 8 }}>
            Free plan
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-8" style={{ marginBottom: "28px" }}>
        <div className="flex items-center gap-2.5" style={{ alignItems: "flex-start", gap: "16px" }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: "6px", letterSpacing: "-0.01em" }}>Ready to research?</h3>
            <p className="text-muted text-[13px]" style={{ maxWidth: 620, marginBottom: 0 }}>
              Say what you're interested in — or upload a photo of your assignment. Faython turns it
              into scoped topics, writes Chapter One free, and unlocks the rest per project.
            </p>
          </div>
          <Link
            to="/generate-topics"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed"
            style={{ flexShrink: 0 }}
          >
            Start a project <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2" style={{ marginBottom: "24px" }}>
          {chips.map((c) => (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-[5px] text-xs font-medium whitespace-nowrap text-foreground" key={c}>
              {c}
            </span>
          ))}
        </div>
      )}

      <h3 style={{ margin: "0 0 14px", letterSpacing: "-0.01em" }}>Recent activity</h3>
      {recent && recent.items.length === 0 && (
        <EmptyState
          eyebrow="No activity yet"
          title="Your projects will live here"
          body="When you generate a topic set, it's saved here as a project you can reopen any time."
          actions={
            <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
              Start your first project
            </Link>
          }
        />
      )}
      {recent && recent.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {recent.items.map((t) => (
            <div className="rounded-lg border border-border bg-background p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-sm" key={t.id}>
              <div className="flex items-start justify-between gap-4">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="mb-2 text-xs font-medium text-muted" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                    {t.prompt.slice(0, 120)}
                    {t.prompt.length > 120 ? "…" : ""}
                  </span>
                  <div className="text-sm leading-[1.7] whitespace-pre-wrap text-foreground" style={{ whiteSpace: "pre-wrap", maxHeight: 140, overflow: "hidden" }}>
                    {t.reply.slice(0, 360)}
                    {t.reply.length > 360 ? "\n…" : ""}
                  </div>
                </div>
                <Link to={`/project/${t.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" style={{ flexShrink: 0 }}>
                  Open <ChevronRight size={14} />
                </Link>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted">
                <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground">
                  {t.chapterCount === 5 ? "Complete" : `${t.chapterCount ?? 0}/5 chapters`}
                </span>
                {t.level && <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">{t.level}</span>}
                {t.discipline && <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">{t.discipline}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
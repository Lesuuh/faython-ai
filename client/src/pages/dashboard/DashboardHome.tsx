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
      <div className="dash-title">Welcome back, {displayName.split(" ")[0]}</div>
      <p className="dash-sub">
        Here's your research activity at a glance. Start a project whenever you're ready.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-head">
            <span className="label">Projects</span>
            <span className="stat-icon">
              <History size={15} />
            </span>
          </div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="label">Free topics today</span>
            <span className="stat-icon">
              <FileText size={15} />
            </span>
          </div>
          <div className="value">
            {usage.topics}
            <span className="muted text-sm" style={{ fontWeight: 500 }}>
              {" "}
              / {FREE_TOPICS_PER_DAY}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="label">Saved</span>
            <span className="stat-icon">
              <Bookmark size={15} />
            </span>
          </div>
          <div className="value">{saved}</div>
        </div>
        <div className="stat-card">
          <div className="stat-head">
            <span className="label">Chapters written</span>
            <span className="stat-icon">
              <Lock size={15} />
            </span>
          </div>
          <div className="value" style={{ fontSize: 20, letterSpacing: "-0.01em", marginTop: 8 }}>
            Free plan
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "28px" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: "16px" }}>
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
            <p className="muted text-sm" style={{ maxWidth: 620, marginBottom: 0 }}>
              Say what you're interested in — or upload a photo of your assignment. Faython turns it
              into scoped topics, writes Chapter One free, and unlocks the rest per project.
            </p>
          </div>
          <Link
            to="/generate-topics"
            className="btn btn-primary"
            style={{ flexShrink: 0 }}
          >
            Start a project <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="profile-summary" style={{ marginBottom: "24px" }}>
          {chips.map((c) => (
            <span className="profile-chip" key={c}>
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
            <Link to="/generate-topics" className="btn btn-primary btn-sm">
              Start your first project
            </Link>
          }
        />
      )}
      {recent && recent.items.length > 0 && (
        <div className="topic-list">
          {recent.items.map((t) => (
            <div className="topic-card" key={t.id}>
              <div className="topic-head">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="topic-prompt" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                    {t.prompt.slice(0, 120)}
                    {t.prompt.length > 120 ? "…" : ""}
                  </span>
                  <div className="topic-reply" style={{ whiteSpace: "pre-wrap", maxHeight: 140, overflow: "hidden" }}>
                    {t.reply.slice(0, 360)}
                    {t.reply.length > 360 ? "\n…" : ""}
                  </div>
                </div>
                <Link to={`/project/${t.id}`} className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                  Open <ChevronRight size={14} />
                </Link>
              </div>
              <div className="topic-meta">
                <span className="badge badge-primary">
                  {t.chapterCount === 5 ? "Complete" : `${t.chapterCount ?? 0}/5 chapters`}
                </span>
                {t.level && <span className="badge badge-neutral">{t.level}</span>}
                {t.discipline && <span className="badge badge-neutral">{t.discipline}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
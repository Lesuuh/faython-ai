import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  useTopicDetail,
  useTopicMessages,
  useInitiatePayment,
  useUsage,
  chapterTitle,
} from "@/lib/hooks";
import { extractTopicItems } from "@/lib/hooks";
import { useProjectProfile } from "@/lib/project-profile";

const FREE_CHAPTERS_PER_DAY = 3;

export function Project() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, refetch } = useTopicDetail(id);
  const { data: messagesData, isLoading: messagesLoading } = useTopicMessages(id);
  const { data: usageData } = useUsage();
  const initiate = useInitiatePayment();
  const { profile } = useProjectProfile();

  const [paying, setPaying] = useState(false);

  if (isLoading) {
    return (
      <div className="loader-row" style={{ minHeight: "60vh" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <p>Couldn't load this project.</p>
        <button className="btn btn-outline btn-sm mt-2" onClick={() => refetch()}>Retry</button>
        <Link to="/dashboard" className="btn btn-ghost btn-sm mt-2">Back to dashboard</Link>
      </div>
    );
  }

  const { topic } = data;
  const generatedChapters = new Map(topic.chapters.map((c) => [c.chapterNumber, c]));
  const unlocked = (topic.entitlement?.unlockedChapters ?? 0) >= 5;
  const usage = usageData?.usage ?? { topics: 0, chapterOne: 0 };
  const chapterOneRemaining = Math.max(0, FREE_CHAPTERS_PER_DAY - usage.chapterOne);
  const items = extractTopicItems(topic.reply);
  const profileChips = [
    profile.university && `University: ${profile.university}`,
    profile.course && `Course: ${profile.course}`,
    profile.level && `Level: ${profile.level}`,
    profile.referencingStyle && `Style: ${profile.referencingStyle}`,
  ].filter(Boolean) as string[];

  async function onUnlock() {
    setPaying(true);
    try {
      const result = await initiate.mutateAsync(id);
      window.location.href = result.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment.");
      setPaying(false);
    }
  }

  return (
    <div className="chat-layout">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <Link to="/" className="dash-brand" style={{ margin: 0 }}>
            <span className="logo">F</span>
            Faython <span className="muted">Scholar</span>
          </Link>
          <span />
        </div>
      </header>

      <main className="container" style={{ padding: "2rem 1.5rem", maxWidth: 860 }}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="row" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
            <div className="ic">
              <BookOpen size={20} />
            </div>
            <div className="grow">
              <h2 style={{ marginBottom: "0.35rem" }}>{topic.prompt}</h2>
              <p className="muted text-sm" style={{ marginBottom: "0.5rem" }}>
                Level: {topic.level || "Any"} · Discipline: {topic.discipline || "Any"} · {new Date(topic.createdAt).toLocaleString()}
              </p>
              <div className="topic-reply" style={{ whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>
                {items.length > 0
                  ? items.map((item, i) => (
                      <div key={i} style={{ marginBottom: "0.35rem" }}>
                        {i + 1}. {item}
                      </div>
                    ))
                  : topic.reply}
              </div>
              {profileChips.length > 0 && (
                <div className="profile-summary" style={{ marginTop: "14px" }}>
                  {profileChips.map((c) => (
                    <span className="profile-chip" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row" style={{ alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ margin: 0 }}>Chapters</h3>
          {unlocked ? (
            <span className="badge badge-primary" style={{ marginLeft: "auto" }}>
              Unlocked
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ marginLeft: "auto" }}>
              Free · Ch.1
            </span>
          )}
        </div>

        <div className="chapter-list">
          {[1, 2, 3, 4, 5].map((num) => {
            const ch = generatedChapters.get(num);
            const isOne = num === 1;
            const available = isOne || unlocked;
            return (
              <div key={num} className={`chapter-row ${!available ? "chapter-locked" : ""}`}>
                <div className="chapter-num">{num}</div>
                <div className="grow">
                  <strong>{chapterTitle(num)}</strong>
                  <div className="muted text-xs">
                    {ch
                      ? `Generated ${new Date(ch.generatedAt).toLocaleString()}`
                      : available
                        ? isOne
                          ? `Free (${chapterOneRemaining} left today)`
                          : "Unlocked — ready to generate"
                        : "Locked · included in the one-time unlock"}
                  </div>
                </div>
                {ch ? (
                  <Link to={`/project/${id}/chapter/${num}`} className="btn btn-outline btn-sm">
                    <CheckCircle2 size={14} /> View <ChevronRight size={14} />
                  </Link>
                ) : available ? (
                  <Link to={`/project/${id}/chapter/${num}`} className="btn btn-primary btn-sm">
                    <Sparkles size={14} /> {isOne ? "Generate" : "Write"}
                  </Link>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={onUnlock} disabled={paying}>
                    {paying ? <span className="spinner" /> : <Unlock size={14} />} Unlock ₦500
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!unlocked && (
          <div className="paywall-banner">
            <Lock size={16} />
            <div className="grow">
              <strong>Unlock Chapters Two to Five</strong>
              <div className="muted text-sm">
                One-time payment of ₦500 for this project. You'll keep everything forever.
              </div>
            </div>
            <button className="btn btn-primary" onClick={onUnlock} disabled={paying}>
              {paying ? <span className="spinner" /> : <Unlock size={15} />} Pay now
            </button>
          </div>
        )}

        <h3 style={{ margin: "1.5rem 0 0.75rem" }}>Conversation</h3>
        <div className="card">
          {messagesLoading && (
            <div className="loader-row">
              <span className="spinner" />
            </div>
          )}
          {messagesData && messagesData.messages.length === 0 && (
            <p className="muted text-sm">No conversation saved for this project.</p>
          )}
          {messagesData?.messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "USER" ? "project-msg project-msg-user" : "project-msg project-msg-ai"}
            >
              <span className="msg-role">{m.role === "USER" ? "You" : "Faython"}</span>
              <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
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
      <div className="flex justify-center p-8" style={{ minHeight: "60vh" }}>
        <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center px-4 py-12 text-center" style={{ minHeight: "60vh" }}>
        <p className="text-[15px]">Couldn't load this project.</p>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm mt-2" onClick={() => refetch()}>Retry</button>
        <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm mt-2">Back to dashboard</Link>
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
    <div className="flex min-h-[100vh] flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-[12px]">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5 flex items-center justify-between gap-6 h-[68px]">
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <Link to="/" className="mb-6 flex items-center gap-2.5 text-base font-medium tracking-[-0.02em]" style={{ margin: 0 }}>
            <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm bg-foreground text-[14px] font-bold text-background">F</span>
            Faython <span className="text-muted">Scholar</span>
          </Link>
          <span />
        </div>
      </header>

      <main className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5" style={{ padding: "2rem 1.5rem", maxWidth: 860 }}>
        <div className="rounded-lg border border-border bg-background p-8" style={{ marginBottom: "1.5rem" }}>
          <div className="flex items-center gap-2.5" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
            <div className="inline-flex items-center justify-center rounded-sm border border-border bg-surface text-foreground w-10 h-10 flex-shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <h2 style={{ marginBottom: "0.35rem" }}>{topic.prompt}</h2>
              <p className="text-muted text-[13px]" style={{ marginBottom: "0.5rem" }}>
                Level: {topic.level || "Any"} · Discipline: {topic.discipline || "Any"} · {new Date(topic.createdAt).toLocaleString()}
              </p>
              <div className="text-sm leading-[1.7] whitespace-pre-wrap text-foreground" style={{ whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>
                {items.length > 0
                  ? items.map((item, i) => (
                      <div key={i} style={{ marginBottom: "0.35rem" }}>
                        {i + 1}. {item}
                      </div>
                    ))
                  : topic.reply}
              </div>
              {profileChips.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginTop: "14px" }}>
                  {profileChips.map((c) => (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-[5px] text-xs font-medium whitespace-nowrap text-foreground" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5" style={{ alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ margin: 0 }}>Chapters</h3>
          {unlocked ? (
            <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground" style={{ marginLeft: "auto" }}>
              Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted" style={{ marginLeft: "auto" }}>
              Free · Ch.1
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4, 5].map((num) => {
            const ch = generatedChapters.get(num);
            const isOne = num === 1;
            const available = isOne || unlocked;
            return (
              <div
                key={num}
                className={`flex items-center gap-3.5 rounded-md border border-border p-4 transition-colors duration-150 ${available ? "bg-background" : "bg-surface opacity-85"}`}
              >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-[13px] font-bold ${available ? "border border-primary-border bg-primary-soft text-primary" : "border border-border bg-surface text-muted"}`}>{num}</div>
                <div className="flex-1">
                  <strong>{chapterTitle(num)}</strong>
                  <div className="text-muted text-xs">
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
                  <Link to={`/project/${id}/chapter/${num}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
                    <CheckCircle2 size={14} /> View <ChevronRight size={14} />
                  </Link>
                ) : available ? (
                  <Link to={`/project/${id}/chapter/${num}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
                    <Sparkles size={14} /> {isOne ? "Generate" : "Write"}
                  </Link>
                ) : (
                  <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" onClick={onUnlock} disabled={paying}>
                    {paying ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : <Unlock size={14} />} Unlock ₦500
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!unlocked && (
          <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-primary-border bg-primary-soft p-5">
            <Lock size={16} />
            <div className="flex-1">
              <strong>Unlock Chapters Two to Five</strong>
              <div className="text-muted text-[13px]">
                One-time payment of ₦500 for this project. You'll keep everything forever.
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed" onClick={onUnlock} disabled={paying}>
              {paying ? <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /> : <Unlock size={15} />} Pay now
            </button>
          </div>
        )}

        <h3 style={{ margin: "1.5rem 0 0.75rem" }}>Conversation</h3>
        <div className="rounded-lg border border-border bg-background p-8">
          {messagesLoading && (
            <div className="flex justify-center p-8">
              <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
          )}
          {messagesData && messagesData.messages.length === 0 && (
            <p className="text-muted text-[13px]">No conversation saved for this project.</p>
          )}
          {messagesData?.messages.map((m) => (
            <div
              key={m.id}
              className="mb-2.5 grid gap-1 rounded-md border border-border bg-surface px-4 py-3.5 text-sm leading-[1.65]"
            >
              <span className="text-muted text-[11px] font-semibold uppercase tracking-[0.06em]">{m.role === "USER" ? "You" : "Faython"}</span>
              <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
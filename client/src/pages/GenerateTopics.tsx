import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Send,
  ImagePlus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { topicKeys, useUsage } from "@/lib/hooks";
import {
  buildResearchContext,
  LEVELS,
  REFERENCING_STYLES,
  useProjectProfile,
  type ProjectProfile,
} from "@/lib/project-profile";

type Message = {
  role: "user" | "assistant";
  text: string;
  imagePreview?: string;
  topicId?: string;
};

const suggestions = [
  "My department: Computer Science; Level: Postgraduate; Interest: Improving the student portal UI; Location: Rivers State University",
  "Generate undergraduate Accounting research topics with a focus on small business taxation.",
  "Nursing postgraduate topics on telehealth and patient outcomes in Nigeria.",
];

const FREE_TOPICS_PER_DAY = 3;

export function GenerateTopics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: usageData } = useUsage();

  const firstName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { profile, update } = useProjectProfile();

  const usage = usageData?.usage ?? { topics: 0, chapterOne: 0 };
  const remaining = Math.max(0, FREE_TOPICS_PER_DAY - usage.topics);
  const atLimit = remaining <= 0;

  const profileChips = [
    profile.university && `University: ${profile.university}`,
    profile.level && `Level: ${profile.level}`,
    profile.course && `Course: ${profile.course}`,
    profile.referencingStyle && `Style: ${profile.referencingStyle}`,
  ].filter(Boolean);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function composePrompt(raw: string): string {
    const context = buildResearchContext(profile);
    return context ? `${raw}\n${context}` : raw;
  }

  async function runChat(payload: { text?: string; file?: File }) {
    setLoading(true);
    const rawText = payload.text || (payload.file ? "Review this assignment and suggest research topics." : "");
    const text = composePrompt(rawText);
    const userMsg: Message = payload.file
      ? {
          role: "user",
          text,
          imagePreview: payload.file.type.startsWith("image/")
            ? URL.createObjectURL(payload.file)
            : undefined,
        }
      : { role: "user", text };
    setMessages((m) => [...m, userMsg]);

    try {
      const result = await api.generateTopic({
        prompt: text,
        file: payload.file,
        level: profile.level || undefined,
        discipline: profile.course.trim() || undefined,
      });
      setMessages((m) => [...m, { role: "assistant", text: result.reply, topicId: result.topicId }]);
      qc.invalidateQueries({ queryKey: topicKeys.all });
      qc.invalidateQueries({ queryKey: ["user", "usage"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit() {
    if (loading) return;
    if (!input.trim() && !image) return;
    if (atLimit) {
      toast.error("You've used today's free topic limit. Come back tomorrow!");
      return;
    }
    const payload = { text: input.trim() || undefined, file: image?.file };
    setInput("");
    setImage(null);
    void runChat(payload);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB.");
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
  }

  return (
    <div className="flex min-h-[100vh] flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-[12px]">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5 flex items-center justify-between gap-6 h-[68px]" style={{ justifyItems: "center" }}>
          <Link to="/" className="mb-6 flex items-center gap-2.5 text-base font-medium tracking-[-0.02em]" style={{ margin: 0 }}>
            <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm bg-foreground text-[14px] font-bold text-background">F</span>
            Faython <span className="text-muted">Scholar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
              Dashboard
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" onClick={() => navigate("/dashboard/history")}>
              History
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2.5" style={{ gap: "0.5rem" }}>
          <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" style={{ paddingLeft: "0.25rem" }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <span className="text-muted text-[13px]" style={{ marginLeft: "auto" }}>
            Signed in as {firstName.split(" ")[0]}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-background" style={{ marginBottom: "12px" }}>
          <div className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5 select-none" onClick={() => setDetailsOpen((v) => !v)}>
            <div className="flex items-center gap-2.5" style={{ gap: "10px" }}>
              <Settings2 size={16} style={{ color: "var(--muted)" }} />
              <h3 style={{ margin: 0 }}>Project details</h3>
              <span className="text-muted-foreground text-xs">Course · Level · University · Referencing style · Chapters</span>
            </div>
            <div className="flex items-center gap-2.5" style={{ gap: "12px" }}>
              {!detailsOpen && profileChips.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ display: "none" }} />
              )}
              <ChevronDown
                size={16}
                style={{ color: "var(--muted)", transform: detailsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
              />
            </div>
          </div>

          {!detailsOpen && profileChips.length > 0 && (
            <div className="flex flex-wrap gap-2" style={{ padding: "0 20px 14px" }}>
              {profileChips.map((c) => (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-[5px] text-xs font-medium whitespace-nowrap text-foreground" key={c}>
                  {c}
                </span>
              ))}
            </div>
          )}

          {detailsOpen && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 border-t border-border p-5">
              <div className="grid gap-1.5 col-span-full">
                <label htmlFor="faython-university" className="text-[13px] font-semibold text-foreground">University / school</label>
                <input
                  id="faython-university"
                  className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
                  value={profile.university}
                  onChange={(e) => update({ university: e.target.value })}
                  placeholder="e.g. University of Port Harcourt"
                />
                <span className="text-muted text-xs">The AI writes with your school's context in mind.</span>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="faython-course" className="text-[13px] font-semibold text-foreground">Course of study</label>
                <input
                  id="faython-course"
                  className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
                  value={profile.course}
                  onChange={(e) => update({ course: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="faython-level" className="text-[13px] font-semibold text-foreground">Academic level</label>
                <select
                  id="faython-level"
                  className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
                  value={profile.level}
                  onChange={(e) => update({ level: e.target.value as ProjectProfile["level"] })}
                >
                  <option value="">Select level</option>
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="faython-style" className="text-[13px] font-semibold text-foreground">Referencing style</label>
                <select
                  id="faython-style"
                  className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
                  value={profile.referencingStyle}
                  onChange={(e) => update({ referencingStyle: e.target.value })}
                >
                  {REFERENCING_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s} edition
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5 col-span-full">
                <label className="text-[13px] font-semibold text-foreground">Chapter structure</label>
                <div className="grid gap-2">
                  {profile.chapterNames.map((name, idx) => (
                    <div className="flex items-center gap-2.5" key={idx} style={{ gap: "10px" }}>
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-[13px] font-bold text-primary">{idx + 1}</span>
                      <input
                        className="rounded-md border border-border bg-background px-3.5 py-3 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
                        value={name}
                        onChange={(e) =>
                          update({
                            chapterNames: profile.chapterNames.map((c, i) =>
                              i === idx ? e.target.value : c,
                            ) as ProjectProfile["chapterNames"],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-[550] whitespace-nowrap text-foreground" style={{ marginBottom: "12px" }}>
          <BookOpen size={14} /> Topics today:{" "}
          <strong>
            {usage.topics}/{FREE_TOPICS_PER_DAY}
          </strong>
          {remaining > 0 ? (
            <span className="text-muted"> · {remaining} left</span>
          ) : (
            <span style={{ color: "var(--danger)" }}> · daily limit reached</span>
          )}
        </div>

        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-2" aria-live="polite">
          {messages.length === 0 && !loading && (
            <div className="mx-auto flex max-w-[620px] flex-1 flex-col items-start justify-center px-4 py-8 text-left">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                <BookOpen size={24} />
              </div>
              <h3 className="mb-2 text-[22px] font-bold tracking-[-0.02em] text-foreground">Start your project</h3>
              <p className="text-muted mb-6 max-w-[52ch] leading-[1.7]">
                Set your course, level, university and referencing style in Project details — then
                give Faython your research interest in a sentence, or as a photo of your assignment.
                You'll get scoped topic suggestions you can open as a project.
              </p>
              <div className="mb-1 flex flex-wrap gap-2" style={{ marginTop: "1.25rem", justifyContent: "center" }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="rounded-full border border-border bg-background px-3.5 py-2 text-[13px] text-muted transition-[border-color,color,background] duration-150 hover:border-primary hover:text-primary"
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "assistant"
                  ? "max-w-[82%] rounded-lg px-[18px] py-3.5 text-sm leading-[1.65] whitespace-pre-wrap break-words self-start rounded-bl-sm border border-border bg-surface text-foreground"
                  : "max-w-[82%] rounded-lg px-[18px] py-3.5 text-sm leading-[1.65] whitespace-pre-wrap break-words self-end rounded-br-sm bg-primary text-primary-foreground"
              }
            >
              {m.imagePreview && <img src={m.imagePreview} alt="Uploaded prompt" className="mb-2 block max-h-[180px] max-w-full rounded-md" />}
              <span style={{ whiteSpace: m.role === "user" ? "normal" : "pre-wrap" }}>{m.text}</span>
              {m.role === "assistant" && m.topicId && (
                <button
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-3 py-2 text-[13px] text-primary transition-[background] duration-150 hover:bg-primary-soft"
                  onClick={() => navigate(`/project/${m.topicId}`)}
                >
                  <ArrowRight size={14} /> Open project
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-[5px] self-start px-2 py-1 text-[14px] text-muted">
              Faython is thinking
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-2.5 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]">
          {image && (
            <div className="mb-2 flex items-center gap-2.5 rounded-md bg-surface p-2 text-[13px] text-muted">
              <img src={image.url} alt="Selected" className="h-11 w-11 rounded-sm object-cover" />
              <span className="flex-1">Image attached</span>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed p-[7px] leading-none"
                onClick={() => setImage(null)}
                aria-label="Remove image"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              className="min-h-11 max-h-[140px] flex-1 resize-none border-none bg-transparent px-2.5 py-2 text-[15px] text-foreground outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask Faython to generate your research topic..."
              disabled={atLimit && !image}
            />
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed p-[11px] leading-none"
              onClick={handleSubmit}
              disabled={loading || (!input.trim() && !image) || atLimit}
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </div>
          <div className="flex items-center gap-1 border-t border-border pt-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
            <button className="inline-flex items-center gap-1.5 rounded-sm border-none bg-transparent p-2 text-[13px] text-muted hover:bg-surface hover:text-foreground" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} /> Image
            </button>
            <span className="flex-1" />
            <span className="text-muted text-xs">Text · Image prompts</span>
          </div>
        </div>
      </main>
    </div>
  );
}
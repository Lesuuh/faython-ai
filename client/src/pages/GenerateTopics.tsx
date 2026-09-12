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
    <div className="chat-layout">
      <header className="navbar">
        <div className="container navbar-inner" style={{ justifyItems: "center" }}>
          <Link to="/" className="dash-brand" style={{ margin: 0 }}>
            <span className="logo">F</span>
            Faython <span className="muted">Scholar</span>
          </Link>
          <div className="navbar-actions">
            <Link to="/dashboard" className="btn btn-outline btn-sm">
              Dashboard
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard/history")}>
              History
            </button>
          </div>
        </div>
      </header>

      <main className="chat-main">
        <div className="row" style={{ gap: "0.5rem" }}>
          <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ paddingLeft: "0.25rem" }}>
            <ArrowLeft size={15} /> Back
          </Link>
          <span className="muted text-sm" style={{ marginLeft: "auto" }}>
            Signed in as {firstName.split(" ")[0]}
          </span>
        </div>

        <div className="detail-panel" style={{ marginBottom: "12px" }}>
          <div className="detail-panel-head" onClick={() => setDetailsOpen((v) => !v)}>
            <div className="row" style={{ gap: "10px" }}>
              <Settings2 size={16} style={{ color: "var(--muted)" }} />
              <h3 style={{ margin: 0 }}>Project details</h3>
              <span className="hint">Course · Level · University · Referencing style · Chapters</span>
            </div>
            <div className="row" style={{ gap: "12px" }}>
              {!detailsOpen && profileChips.length > 0 && (
                <div className="profile-summary" style={{ display: "none" }} />
              )}
              <ChevronDown
                size={16}
                style={{ color: "var(--muted)", transform: detailsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
              />
            </div>
          </div>

          {!detailsOpen && profileChips.length > 0 && (
            <div className="profile-summary" style={{ padding: "0 20px 14px" }}>
              {profileChips.map((c) => (
                <span className="profile-chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
          )}

          {detailsOpen && (
            <div className="detail-form">
              <div className="field field--wide">
                <label htmlFor="faython-university">University / school</label>
                <input
                  id="faython-university"
                  value={profile.university}
                  onChange={(e) => update({ university: e.target.value })}
                  placeholder="e.g. University of Port Harcourt"
                />
                <span className="hint">The AI writes with your school's context in mind.</span>
              </div>
              <div className="field">
                <label htmlFor="faython-course">Course of study</label>
                <input
                  id="faython-course"
                  value={profile.course}
                  onChange={(e) => update({ course: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="field">
                <label htmlFor="faython-level">Academic level</label>
                <select
                  id="faython-level"
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
              <div className="field">
                <label htmlFor="faython-style">Referencing style</label>
                <select
                  id="faython-style"
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
              <div className="field field--wide">
                <label>Chapter structure</label>
                <div className="chapter-name-inputs">
                  {profile.chapterNames.map((name, idx) => (
                    <div className="row" key={idx} style={{ gap: "10px" }}>
                      <span className="chapter-num">{idx + 1}</span>
                      <input
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

        <div className="usage-pill" style={{ marginBottom: "12px" }}>
          <BookOpen size={14} /> Topics today:{" "}
          <strong>
            {usage.topics}/{FREE_TOPICS_PER_DAY}
          </strong>
          {remaining > 0 ? (
            <span className="muted"> · {remaining} left</span>
          ) : (
            <span style={{ color: "var(--danger)" }}> · daily limit reached</span>
          )}
        </div>

        <div ref={scrollRef} className="chat-scroll" aria-live="polite">
          {messages.length === 0 && !loading && (
            <div className="empty-chat">
              <div className="ic">
                <BookOpen size={24} />
              </div>
              <h3>Start your project</h3>
              <p>
                Set your course, level, university and referencing style in Project details — then
                give Faython your research interest in a sentence, or as a photo of your assignment.
                You'll get scoped topic suggestions you can open as a project.
              </p>
              <div className="chat-suggestions" style={{ marginTop: "1.25rem", justifyContent: "center" }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
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
            <div key={i} className={m.role === "assistant" ? "msg msg-ai" : "msg msg-user"}>
              {m.imagePreview && <img src={m.imagePreview} alt="Uploaded prompt" />}
              <span style={{ whiteSpace: m.role === "user" ? "normal" : "pre-wrap" }}>{m.text}</span>
              {m.role === "assistant" && m.topicId && (
                <button
                  className="save-btn"
                  onClick={() => navigate(`/project/${m.topicId}`)}
                >
                  <ArrowRight size={14} /> Open project
                </button>
              )}
            </div>
          ))}

          {loading && (
            <div className="typing">
              Faython is thinking
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
        </div>

        <div className="chat-inputbar">
          {image && (
            <div className="chat-preview">
              <img src={image.url} alt="Selected" />
              <span className="grow">Image attached</span>
              <button
                className="btn btn-ghost btn-icon-sm"
                onClick={() => setImage(null)}
                aria-label="Remove image"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
          <div className="chat-row">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask Faython to generate your research topic..."
              disabled={atLimit && !image}
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={handleSubmit}
              disabled={loading || (!input.trim() && !image) || atLimit}
              aria-label="Send"
            >
              <Send size={17} />
            </button>
          </div>
          <div className="chat-tools">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
            <button onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} /> Image
            </button>
            <span className="spacer" />
            <span className="muted text-xs">Text · Image prompts</span>
          </div>
        </div>
      </main>
    </div>
  );
}
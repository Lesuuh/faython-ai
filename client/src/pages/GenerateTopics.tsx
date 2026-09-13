import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Send,
  ImagePlus,
  Trash2,
  ArrowRight,
  BookOpen,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
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
import { FREE_TOPICS_PER_DAY } from "@/lib/limits";
import { ProductHeader } from "@/components/ProductHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { cx } from "@/lib/cx";

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

const CHAT_KEY_PREFIX = "faython:chat-";
const MAX_PREVIEW_BYTES = 1024 * 1024;

function loadChat(key: string): Message[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Message =>
        Boolean(m) &&
        typeof m === "object" &&
        ((m as Message).role === "user" || (m as Message).role === "assistant") &&
        typeof (m as Message).text === "string",
    );
  } catch {
    return [];
  }
}

export function GenerateTopics() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: usageData } = useUsage();
  const [searchParams, setSearchParams] = useSearchParams();

  const chatKey = `${CHAT_KEY_PREFIX}${user?.id || "anon"}`;
  const fresh = searchParams.get("new") === "1";
  const [messages, setMessages] = useState<Message[]>(() => (fresh ? [] : loadChat(chatKey)));
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{ file: File; url: string; dataUrl?: string } | null>(null);
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
  ].filter(Boolean) as string[];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!fresh) return;
    try {
      window.localStorage.removeItem(chatKey);
    } catch {
      // storage unavailable — the in-memory conversation is already empty
    }
    setSearchParams({}, { replace: true });
  }, [fresh, chatKey, setSearchParams]);

  useEffect(() => {
    try {
      const persisted = messages.map((m) => ({
        role: m.role,
        text: m.text,
        topicId: m.topicId,
        ...(m.imagePreview && !m.imagePreview.startsWith("blob:") ? { imagePreview: m.imagePreview } : {}),
      }));
      window.localStorage.setItem(chatKey, JSON.stringify(persisted));
    } catch {
      // storage full or unavailable — conversation stays in memory only
    }
  }, [chatKey, messages]);

  function composePrompt(raw: string): string {
    const context = buildResearchContext(profile);
    return context ? `${raw}\n${context}` : raw;
  }

  async function runChat(payload: { text?: string; file?: File; imagePreview?: string }) {
    setLoading(true);
    const rawText = payload.text || (payload.file ? "Review this assignment and suggest research topics." : "");
    const text = composePrompt(rawText);
    const userMsg: Message = payload.file
      ? {
          role: "user",
          text: rawText,
          imagePreview: payload.file.type.startsWith("image/")
            ? payload.imagePreview || URL.createObjectURL(payload.file)
            : undefined,
        }
      : { role: "user", text: rawText };
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
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
    const payload = { text: input.trim() || undefined, file: image?.file, imagePreview: image?.dataUrl };
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
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/") && file.size <= MAX_PREVIEW_BYTES) {
      const reader = new FileReader();
      reader.onload = () =>
        setImage({
          file,
          url,
          dataUrl: typeof reader.result === "string" ? reader.result : undefined,
        });
      reader.readAsDataURL(file);
      return;
    }
    setImage({ file, url });
  }

  return (
    <div className="flex h-[100dvh] min-h-[520px] flex-col">
<ProductHeader
        back={{ to: "/dashboard", label: "Dashboard" }}
        right={
          <div className="flex items-center gap-2">
            <Badge
              variant={atLimit ? "warning" : "neutral"}
              className={cx(atLimit && "border-warning-border bg-warning-bg text-warning")}
            >
              <BookOpen size={13} />
              {atLimit
                ? "Daily topic limit reached"
                : `${remaining} of ${FREE_TOPICS_PER_DAY} free topics left today`}
            </Badge>
            <Button
              size="sm"
              variant={detailsOpen ? "secondary" : "muted"}
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Project details</span>
              <ChevronDown
                size={14}
                className={cx("transition-transform duration-150", detailsOpen && "rotate-180")}
              />
            </Button>
          </div>
        }
      />

      {detailsOpen && (
        <section className="border-b border-border bg-background" aria-label="Project details">
          <div className="mx-auto w-full max-w-[760px] px-5 py-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="University / school" htmlFor="faython-university" className="sm:col-span-2">
                <Input
                  id="faython-university"
                  value={profile.university}
                  onChange={(e) => update({ university: e.target.value })}
                  placeholder="e.g. University of Port Harcourt"
                />
              </Field>
              <Field label="Course of study" htmlFor="faython-course">
                <Input
                  id="faython-course"
                  value={profile.course}
                  onChange={(e) => update({ course: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </Field>
              <Field label="Academic level" htmlFor="faython-level">
                <Select
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
                </Select>
              </Field>
              <Field label="Referencing style" htmlFor="faython-style">
                <Select
                  id="faython-style"
                  value={profile.referencingStyle}
                  onChange={(e) => update({ referencingStyle: e.target.value })}
                >
                  {REFERENCING_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Chapter structure"
                htmlFor="faython-chapter-1"
                className="sm:col-span-2"
                hint="The generated chapters follow these headings. Edit them to match your department's format."
              >
                <div className="grid gap-2">
                  {profile.chapterNames.map((name, idx) => (
                    <div className="flex items-center gap-2.5" key={idx}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-[13px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <Input
                        id={idx === 0 ? "faython-chapter-1" : undefined}
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
              </Field>
            </div>
          </div>
        </section>
      )}

      {profileChips.length > 0 && !detailsOpen && (
        <div className="mx-auto w-full max-w-[760px] px-5 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <SlidersHorizontal size={12} className="shrink-0" />
            {profileChips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col overflow-hidden px-5 pt-5 sm:px-6">
        {/* Messages */}
        <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto pb-3" aria-live="polite">
          {messages.length === 0 && !loading && (
            <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center justify-center px-2 pb-10 text-center">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary-border bg-primary-soft text-primary">
                <Sparkles size={22} />
              </span>
              <h2 className="text-[22px] font-bold tracking-[-0.02em]">
                What are you researching today?
              </h2>
              <p className="mt-2 mb-7 max-w-[46ch] leading-[1.7] text-muted">
                Tell Faython your research interest in a sentence, or upload a photo of your
                assignment. You'll get scoped topic suggestions you can open as a project.
              </p>
              <div className="grid w-full gap-2.5 text-left">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 text-[13px] leading-[1.5] text-muted transition-colors hover:border-primary hover:text-foreground"
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                  >
                    <span className="line-clamp-2">{s}</span>
                    <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex w-full items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                  <Sparkles size={14} />
                </span>
                <div className="min-w-0 max-w-[calc(100%-2.25rem)] rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3 text-[14px] leading-[1.7] break-words whitespace-pre-wrap text-foreground">
                  {m.text}
                  {m.topicId && (
                    <span className="mt-3 inline-flex">
                      <ButtonLink to={`/project/${m.topicId}`} variant="secondary" size="sm">
                        Open project <ArrowRight size={14} />
                      </ButtonLink>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div key={i} className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-[14px] leading-[1.7] break-words text-primary-foreground">
                {m.imagePreview && (
                  <img
                    src={m.imagePreview}
                    alt="Uploaded assignment"
                    className="mb-2 block max-h-[160px] max-w-full rounded-md"
                  />
                )}
                <span style={{ whiteSpace: "normal" }}>{m.text}</span>
              </div>
            ),
          )}

          {loading && (
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                <Sparkles size={14} />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                <span className="ml-1.5 text-sm text-muted">Faython is thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 pb-5">
          <div className="rounded-xl border border-border bg-background p-2 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(24_208_112/0.16)]">
            {image && (
              <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-surface px-2.5 py-1.5 text-[13px] text-muted">
                <img src={image.url} alt="Selected assignment" className="h-9 w-9 rounded-sm object-cover" />
                <span className="flex-1 truncate">Image attached</span>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
                  onClick={() => setImage(null)}
                  aria-label="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
            <div className="flex items-end gap-1.5">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach an image"
                title="Attach an image"
              >
                <ImagePlus size={18} />
              </button>
              <textarea
                ref={textareaRef}
                className="max-h-[140px] min-h-10 flex-1 resize-none border-none bg-transparent px-1 py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Describe your research area, or upload an assignment photo…"
                disabled={atLimit && !image}
              />
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
                onClick={handleSubmit}
                disabled={loading || (!input.trim() && !image) || atLimit}
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-1.5 pt-1.5 text-[11px] text-muted-foreground">
              <span className="flex-1">Enter to send · Shift + Enter for a new line</span>
              {!atLimit && <span>{remaining} free generations left today</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
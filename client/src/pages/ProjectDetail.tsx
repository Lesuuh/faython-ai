import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  Download,
  Lightbulb,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Markdown } from "@/components/Markdown";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import {
  askProject,
  generateProjectChapter,
  generationCost,
  resolveIntent,
  useGenerationGuard,
  type GenerationPass,
  type Intent,
} from "@/lib/generation";
import { deductTokens } from "@/lib/token-store";
import { exportProjectDocx } from "@/lib/export";
import {
  chapterMessages,
  intakeSummary,
  type MessageKind,
  type Project,
  type ProjectMessage,
} from "@/lib/project-store";
import { uid } from "@/lib/ids";
import { cx } from "@/lib/cx";

const DISCLAIMER =
  "Faython Scholar uses AI to generate research content. Always review generated chapters before submission.";

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProject();
  const project = projects.find((p) => p.id === projectId) ?? null;

  if (!project) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-bold tracking-[-0.01em]">Project not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            It may have been deleted, or it belongs to another account.
          </p>
          <Link
            to="/projects"
            className="mt-5 inline-block text-[13px] font-semibold text-primary underline underline-offset-[3px]"
          >
            Back to my projects
          </Link>
        </div>
      </main>
    );
  }

  return <ProjectThread key={project.id} project={project} />;
}

function ProjectThread({ project }: { project: Project }) {
  const { selectProject, setChapter, addMessage, renameProject } = useProject();
  const { user } = useAuth();
  const preflight = useGenerationGuard();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string>("");
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const composerRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  /** Live thread — the store updates as replies land, this keeps sends in order. */
  const threadRef = useRef<ProjectMessage[]>(project.messages);

  useEffect(() => {
    threadRef.current = project.messages;
  }, [project.messages]);

  useEffect(() => {
    selectProject(project.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [project.messages.length, busy]);

  const summary = intakeSummary(project.intake);
  const written = chapterMessages(project.messages);
  const writtenNumbers = new Set(written.map((m) => m.chapterNumber));
  const doneCount = project.chapters.filter((c) => c.state === "done" && c.content).length;

  function scrollToChapter(n: number) {
    document.getElementById(`msg-ch-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function push(kind: MessageKind, content: string, chapterNumber?: number) {
    const message: ProjectMessage = {
      id: uid(),
      role: kind === "question" ? "user" : "assistant",
      kind,
      content,
      createdAt: new Date().toISOString(),
      ...(chapterNumber ? { chapterNumber } : {}),
    };
    threadRef.current = [...threadRef.current, message];
    addMessage(project.id, message);
    return message;
  }

  async function runIntent(text: string, intent: Intent) {
    const pass = preflight(intent.kind === "chapter" ? "chapter" : "ask");
    if (!pass) return;

    setBusy(true);
    setError("");
    const chapter =
      intent.kind === "chapter"
        ? project.chapters.find((c) => c.number === intent.chapterNumber)
        : undefined;

    try {
      if (intent.kind === "chapter") {
        const number = intent.chapterNumber;
        setBusyLabel(`Writing chapter ${number}…`);
        if (chapter) setChapter(project.id, number, { state: "generating" });

        const content = await generateProjectChapter(project, number);

        setChapter(project.id, number, {
          content,
          state: "done",
          updatedAt: new Date().toISOString(),
        });
        push("chapter", content, number);
        spend(pass, "chapter", `Chapter ${number}`);
        window.setTimeout(() => scrollToChapter(number), 80);
      } else {
        setBusyLabel("Faython is thinking…");
        push("question", text);
        const reply = await askProject(project, text, threadRef.current);
        push("answer", reply);
        spend(pass, "ask", "Project question");
      }
    } catch (err) {
      if (chapter) setChapter(project.id, chapter.number, { state: chapter.content ? "done" : "error" });
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
      setBusyLabel("");
      window.setTimeout(() => composerRef.current?.focus(), 40);
    }
  }

  function spend(pass: GenerationPass, kind: "chapter" | "ask", label: string) {
    try {
      deductTokens(pass.userId, pass.planId, pass.cost, kind, label);
    } catch {
      /* balance was already verified in preflight */
    }
  }

  function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setInput("");
    setError("");
    const intent = resolveIntent(message, project);
    if (intent.kind === "answer") push("question", message);
    void runIntent(message, intent);
  }

  function chip(number: number) {
    const exists = writtenNumbers.has(number);
    send(exists ? `Redo chapter ${number}` : `Write chapter ${number}`);
  }

  return (
    <>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-5 py-6 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> My Projects
          </Link>

          <header className="mt-4">
            {renaming ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  renameProject(project.id, titleInput);
                  setRenaming(false);
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  autoFocus
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-[15px] font-semibold text-foreground outline-none focus:border-primary"
                  aria-label="Project title"
                />
                <Button size="sm" type="submit">
                  Save
                </Button>
                <Button size="sm" variant="muted" onClick={() => setRenaming(false)}>
                  Cancel
                </Button>
              </form>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold leading-tight tracking-[-0.02em] text-foreground">
                    {project.title}
                  </h1>
                  {summary.length > 0 && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                      {summary.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="muted"
                    title="Rename project"
                    onClick={() => {
                      setTitleInput(project.title);
                      setRenaming(true);
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      exportProjectDocx(project, { userId: user?.id });
                      toast.success("Project exported as a document");
                    }}
                  >
                    <Download size={14} /> Export
                  </Button>
                </div>
              </div>
            )}

            {project.suggestions.length > 0 && (
              <details className="mt-4 rounded-lg border border-border bg-surface px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-foreground">
                  <Lightbulb size={14} className="text-primary" />
                  Topic options considered ({project.suggestions.length})
                </summary>
                <ul className="mt-3 grid gap-2">
                  {project.suggestions.map((s) => (
                    <li
                      key={s.id}
                      className={cx(
                        "rounded-md border px-3 py-2 text-[13px] leading-relaxed",
                        s.title === project.title
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-border bg-background text-muted",
                      )}
                    >
                      {s.title}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {written.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Chapters
                </span>
                {project.chapters.map((c) => {
                  const has = writtenNumbers.has(c.number);
                  return (
                    <button
                      key={c.number}
                      type="button"
                      onClick={() => scrollToChapter(c.number)}
                      className={cx(
                        "rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
                        has
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border bg-surface text-muted hover:text-foreground",
                      )}
                    >
                      {c.number}
                    </button>
                  );
                })}
                <span className="ml-1 text-[12px] text-muted-foreground">
                  {doneCount} of {project.chapters.length} written
                </span>
              </div>
            )}
          </header>

          <div className="mt-6 grid gap-6 pb-2">
            {project.messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
                <Sparkles size={20} className="mx-auto text-muted-foreground" />
                <p className="mt-3 text-[14px] font-semibold text-foreground">Nothing written yet</p>
                <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-muted">
                  Ask for a chapter below — “write chapter one”, “next chapter” — or just type a
                  question about your scope, objectives or methods.
                </p>
              </div>
            )}

            {project.messages.map((m) => {
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-surface-strong px-4 py-2.5 text-[14px] leading-[1.65] break-words whitespace-pre-wrap text-foreground">
                      {m.content}
                    </div>
                  </div>
                );
              }

              if (m.kind === "chapter") {
                return (
                  <div
                    key={m.id}
                    id={`msg-ch-${m.chapterNumber}`}
                    className="flex scroll-mt-6 items-start gap-3"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                      <Sparkles size={14} />
                    </span>
                    <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface p-4 sm:p-5">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="soft">Chapter {m.chapterNumber}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => chip(m.chapterNumber ?? 1)}
                          disabled={busy}
                        >
                          <RefreshCw size={13} /> Regenerate
                        </Button>
                      </div>
                      <Markdown text={m.content} />
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                    <Sparkles size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Markdown text={m.content} />
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                <span className="ml-1.5 text-[13px] text-muted">
                  {busyLabel || "Faython is thinking…"}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {project.chapters.map((c) => {
              const has = writtenNumbers.has(c.number);
              return (
                <button
                  key={c.number}
                  type="button"
                  onClick={() => chip(c.number)}
                  disabled={busy}
                  className={cx(
                    "rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-50",
                    has
                      ? "border-border bg-surface text-muted hover:text-foreground"
                      : "border-primary/40 bg-primary-soft text-primary",
                  )}
                >
                  {has ? `Redo ${c.number}` : `Chapter ${c.number}`}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-surface p-1.5 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(157_140_255/0.18)]">
            <div className="flex items-center gap-1">
              <input
                ref={composerRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Write chapter two, redo chapter 1, or ask about your scope…"
                aria-label="Message Faython"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
              >
                {busy ? <Spinner size={16} /> : <ArrowUp size={17} />}
              </button>
            </div>
          </div>

          <div className="mt-2.5 px-1 text-center">
            {error && (
              <p role="alert" className="text-[12px] leading-[1.6] text-danger">
                {error}
              </p>
            )}
            <p className="text-[11px] leading-[1.6] text-muted-foreground">
              {generationCost("chapter").toLocaleString()} tokens per chapter ·{" "}
              {generationCost("ask").toLocaleString()} per question · {DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

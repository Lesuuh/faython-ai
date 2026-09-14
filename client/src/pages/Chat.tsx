import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, ChevronDown, ArrowUp, Check, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { titleFromPrompt, uid, type ChatMessage, type ChatMode } from "@/lib/chat-store";
import { buildResearchContext, loadProfile } from "@/lib/profile-store";
import { loadBilling } from "@/lib/billing-store";
import { TOKEN_COSTS } from "@/lib/pricing";
import { canAfford, deductTokens } from "@/lib/token-store";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Markdown } from "@/components/Markdown";
import { cx } from "@/lib/cx";

const MODES: { value: ChatMode; label: string }[] = [
  { value: "topics", label: "Generate Topic" },
  { value: "chapter", label: "Generate Chapter" },
];

const DISCLAIMER =
  "Faython Scholar uses AI to generate research content. Always review generated chapters before submission.";

export function Chat() {
  const { active, activeId, addConversation, appendMessage, patchMessage, removeMessage } =
    useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<ChatMode>("topics");
  const [modeOpen, setModeOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState<{ convId: string; msgId: string } | null>(null);

  const streamingRef = useRef(false);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const threadRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (streamingRef.current) return;
    const onPointerDown = (e: PointerEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setModeOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setModeOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMode("topics");
      setChapterNumber(1);
      setInput("");
    }
    setHint("");
    setError("");
    window.setTimeout(() => composerRef.current?.focus(), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, active?.messages, streaming?.msgId]);

  function selectMode(value: ChatMode) {
    setMode(value);
    setHint("");
    if (value === "topics") {
      setChapterNumber(1);
      setModeOpen(false);
    } else {
      if (active) {
        const lastChapter = [...active.messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.chapterNumber !== undefined);
        if (lastChapter?.chapterNumber !== undefined) setChapterNumber(lastChapter.chapterNumber);
      }
    }
  }

  async function generateAssistant(
    conv: { id: string; title: string; messages: ChatMessage[] },
    req: { mode: ChatMode; chapterNumber?: number; prompt?: string },
  ) {
    if (streamingRef.current) return;
    const cost = req.mode === "topics" ? TOKEN_COSTS.topics : TOKEN_COSTS.chapter;
    const userId = user?.id ?? "guest";
    const planId = loadBilling(userId).planId;
    if (!canAfford(userId, planId, cost)) {
      toast.error("Not enough tokens", {
        action: { label: "View plans", onClick: () => navigate("/billing") },
      });
      return;
    }
    streamingRef.current = true;
    setError("");

    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      mode: req.mode,
      content: "",
      ...(req.mode === "chapter" && req.chapterNumber !== undefined
        ? { chapterNumber: req.chapterNumber }
        : {}),
      createdAt: new Date().toISOString(),
    };

    appendMessage(conv.id, assistantMsg);
    setStreaming({ convId: conv.id, msgId: assistantMsg.id });

    let fullText = "";
    try {
      if (req.mode === "topics") {
        const res = await api.generateTopic({ prompt: req.prompt ?? "" });
        fullText = res.reply;
      } else {
        const firstUser = conv.messages.find((m) => m.role === "user")?.content ?? conv.title;
        const lastTopicsReply =
          [...conv.messages].reverse().find((m) => m.role === "assistant" && m.mode === "topics")
            ?.content ?? "";
        const previousChapters = conv.messages
          .filter(
            (m) =>
              m.role === "assistant" && m.mode === "chapter" && m.chapterNumber !== undefined && m.content,
          )
          .map((m) => `[Chapter ${m.chapterNumber}]\n${m.content}`);
        const profile = loadProfile();
        const contextBlock = buildResearchContext(profile);
        const prompt = contextBlock ? `${firstUser}\n\n${contextBlock}` : firstUser;
        const res = await api.generateChapter(conv.id, req.chapterNumber ?? 1, {
          topicTitle: conv.title,
          prompt,
          reply: lastTopicsReply,
          previousChapters,
        });
        fullText = res.content;
      }
    } catch (err) {
      removeMessage(conv.id, assistantMsg.id);
      setStreaming(null);
      streamingRef.current = false;
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return;
    }

    const kind = req.mode === "topics" ? "topics" : "chapter";
    const note = req.mode === "topics" ? "Topic generation" : `Chapter ${req.chapterNumber ?? 1}`;
    try { deductTokens(userId, planId, cost, kind, note); } catch { /* already checked */ }

    await new Promise<void>((resolve) => {
      let i = 0;
      const STEP = 5;
      const TICK = 28;
      const t = window.setInterval(() => {
        i = Math.min(fullText.length, i + STEP);
        patchMessage(conv.id, assistantMsg.id, fullText.slice(0, i));
        if (i >= fullText.length) {
          window.clearInterval(t);
          resolve();
        }
      }, TICK);
    });

    setStreaming(null);
    streamingRef.current = false;
  }

  async function handleSubmit() {
    if (streamingRef.current) return;
    const text = input.trim();
    if (!text) return;

    if (mode === "chapter" && !active) {
      setHint(
        "Chapter generation needs an existing conversation — pick one from Recent chats, then choose a chapter.",
      );
      return;
    }
    setHint("");

    const cost = mode === "topics" ? TOKEN_COSTS.topics : TOKEN_COSTS.chapter;
    const userId = user?.id ?? "guest";
    const planId = loadBilling(userId).planId;
    if (!canAfford(userId, planId, cost)) {
      toast.error("Not enough tokens", {
        action: { label: "View plans", onClick: () => navigate("/billing") },
      });
      return;
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      mode,
      content: text,
      ...(mode === "chapter" ? { chapterNumber } : {}),
      createdAt: new Date().toISOString(),
    };

    let conv: { id: string; title: string; messages: ChatMessage[] };
    if (active) {
      conv = active;
      appendMessage(conv.id, userMsg);
    } else {
      conv = addConversation(titleFromPrompt(text));
      appendMessage(conv.id, userMsg);
    }

    setInput("");
    setModeOpen(false);
    window.setTimeout(() => composerRef.current?.focus(), 60);
    void generateAssistant(conv, { mode, chapterNumber, prompt: text });
  }

  function regenerateChapter(msg: ChatMessage) {
    if (streamingRef.current || !active) return;
    void generateAssistant(active, {
      mode: "chapter",
      chapterNumber: msg.chapterNumber,
    });
  }

  function renderComposer() {
    const modeLabel = mode === "topics" ? "Generate Topic" : `Chapter ${chapterNumber}`;
    const busy = streaming !== null;
    return (
      <div className="w-full">
        <div className="rounded-xl border border-border bg-surface p-1.5 shadow-sm transition-[border-color,box-shadow] duration-150 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(157_140_255/0.18)]">
          <div className="flex items-center gap-1">
            <div className="relative shrink-0" ref={dropRef}>
              <button
                type="button"
                onClick={() => {
                  const open = !modeOpen;
                  if (open && dropRef.current) {
                    const rect = dropRef.current.getBoundingClientRect();
                    setOpenUp(window.innerHeight - rect.bottom < 300);
                  }
                  setModeOpen(open);
                }}
                aria-haspopup="listbox"
                aria-expanded={modeOpen}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
              >
                <span className="whitespace-nowrap">{modeLabel}</span>
                <ChevronDown
                  size={14}
                  className={cx("transition-transform duration-150", modeOpen && "rotate-180")}
                />
              </button>
              {modeOpen && (
                <div
                  role="listbox"
                  className={cx(
                    "absolute left-0 z-20 w-52 rounded-lg border border-border bg-background p-1 text-left shadow-md",
                    openUp ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
                  )}
                >
                  {MODES.map((m) => {
                    const selected = m.value === mode;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectMode(m.value)}
                        className={cx(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors hover:bg-surface",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {m.label}
                        {selected && <Check size={14} />}
                      </button>
                    );
                  })}
                  {mode === "chapter" && (
                    <>
                      <div className="mx-3 my-1 h-px bg-border" />
                      {[1, 2, 3, 4, 5].map((n) => {
                        const selected = n === chapterNumber;
                        return (
                          <button
                            key={n}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setChapterNumber(n);
                              setModeOpen(false);
                            }}
                            className={cx(
                              "flex w-full items-center justify-between rounded-md px-3 py-2 text-[13px] font-medium transition-colors hover:bg-surface",
                              selected ? "text-primary" : "text-foreground",
                            )}
                          >
                            Chapter {n}
                            {selected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px shrink-0 bg-border" />

            <input
              ref={composerRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (hint) setHint("");
              }}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="What's your research topic or field of study?"
              aria-label="Your research topic or field of study"
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={busy || !input.trim()}
              aria-label="Submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? <Spinner size={16} /> : <ArrowUp size={17} />}
            </button>
          </div>
        </div>

        <div className="mt-2.5 px-1 text-center">
          {hint && <p className="text-[12px] leading-[1.6] text-muted-foreground">{hint}</p>}
          {error && (
            <p role="alert" className="text-[12px] leading-[1.6] text-danger">
              {error}
            </p>
          )}
          <p className="text-[11px] leading-[1.6] text-muted-foreground">{DISCLAIMER}</p>
        </div>
      </div>
    );
  }

  function renderMessage(m: ChatMessage) {
    if (m.role === "user") {
      return (
        <div key={m.id} className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-surface-strong px-4 py-2.5 text-[14px] leading-[1.65] break-words whitespace-pre-wrap text-foreground">
            {m.content}
          </div>
        </div>
      );
    }

    const isStreamingThis = streaming?.msgId === m.id;

    return (
      <div key={m.id} className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
          <Sparkles size={14} />
        </span>
        <div className="min-w-0 flex-1">
          {isStreamingThis && m.content === "" ? (
            <div className="flex items-center gap-1.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
              <span className="ml-1.5 text-[13px] text-muted">Faython is thinking…</span>
            </div>
          ) : (
            <>
              {m.content !== "" && (
                <div
                  className={cx(
                    m.mode === "chapter" && "rounded-xl border border-border bg-surface p-4 sm:p-5",
                  )}
                >
                  {m.mode === "topics" && (
                    <Badge variant="primary" className="mb-3">
                      Idea
                    </Badge>
                  )}
                  {m.chapterNumber && (
                    <Badge variant="soft" className="mb-3">
                      Chapter {m.chapterNumber}
                    </Badge>
                  )}
                  <Markdown text={m.content} />
                  {m.chapterNumber && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <Button variant="ghost" size="sm" onClick={() => regenerateChapter(m)}>
                        <RefreshCw size={13} /> Regenerate
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {active ? (
        <>
          <main
            ref={threadRef}
            id="chat-thread"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[720px] px-5 py-6 sm:px-6 lg:px-8">
              <div className="grid gap-6">{active.messages.map(renderMessage)}</div>
            </div>
          </main>
          <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[720px]">{renderComposer()}</div>
          </div>
        </>
      ) : (
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-6">
          <div className="w-full max-w-[640px] text-center">
            <h1 className="text-[clamp(1.9rem,5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.03em]">
              Meet Faython Scholar,
              <br className="hidden sm:block" /> your AI research assistant
            </h1>
            <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-[1.7] text-muted">
              Tell us your research interest, and Faython will suggest scoped topics to build your
              project around. Open a saved conversation from Recent chats, or browse your projects
              and documents from the sidebar.
            </p>
            <div className="mx-auto mt-8 max-w-[560px]">{renderComposer()}</div>
          </div>
        </main>
      )}
    </>
  );
}
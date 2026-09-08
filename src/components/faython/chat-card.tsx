import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Plus, Send, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/faython-official-logo.png.asset.json";


type Msg = {
  role: "user" | "assistant";
  text: string;
  image?: string | undefined;
  audio?: boolean | undefined;
};

const suggestions = [
  "My department: Computer Science; Level: Post-graduate; Interest: Improve User Interface (UI) student portal; Location: Rivers State University",
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ChatCard() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(payload: {
    text?: string | undefined;
    imagePreview?: string | undefined;
    imageFile?: File | undefined;
    audioFile?: File | undefined;
  }) {
    setLoading(true);
    setMessages((m) => [
      ...m,
      {
        role: "user",
        text: payload.text ?? (payload.audioFile ? "Voice prompt" : "Image prompt"),
        image: payload.imagePreview,
        audio: Boolean(payload.audioFile),
      },
    ]);
    try {
      let res: Response;
      if (payload.audioFile || payload.imageFile) {
        const form = new FormData();
        if (payload.audioFile) {
          form.append("type", "audio");
          form.append("audio", payload.audioFile, payload.audioFile.name);
        } else if (payload.imageFile) {
          form.append("type", "image");
          form.append("image", payload.imageFile, payload.imageFile.name);
        }
        if (payload.text) form.append("message", payload.text);
        res = await fetch("/api/n8n", { method: "POST", body: form });
      } else {
        res = await fetch("/api/n8n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", message: payload.text }),
        });
      }
      if (res.status === 429) throw new Error("Too many requests right now — please retry shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please top up to continue.");
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Faython could not respond. Please try again.");
      }
      const data = (await res.json()) as { reply: string };

      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!input.trim() && !imageFile) return;
    const payload = {
      text: input.trim() || undefined,
      imagePreview: image ?? undefined,
      imageFile: imageFile ?? undefined,
    };
    setInput("");
    setImage(null);
    setImageFile(null);
    void send(payload);
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: mime });
        if (!blob.size) return;
        const ext = mime.includes("webm") ? "webm" : "m4a";
        const file = new File([blob], `voice.${ext}`, { type: mime });
        void send({ text: input.trim() || undefined, audioFile: file });
        setInput("");
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microphone access is required for voice prompts.");
    }
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please upload an image under 8MB.");
      return;
    }
    setImageFile(file);
    setImage(await fileToDataUrl(file));
  }


  return (
    <div
      id="chat"
      className="glass-panel relative flex min-h-0 w-full flex-1 flex-col rounded-[28px] p-4 sm:p-6"
    >
      <div
        aria-hidden
        className="btn-glow pointer-events-none absolute -inset-px -z-10 rounded-[30px] opacity-20 blur-2xl"
      />
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-full">
            <img src={logoAsset.url} alt="Faython logo" className="size-full object-cover" />
          </span>

            <div>
            <p className="text-sm font-semibold">Faython | Scholar</p>
            <p className="text-xs text-muted-foreground">Research topic generator</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground">
          Beta
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-2xl bg-background/60 p-4 text-sm"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Hello 👋 I’m Faython. Tell me your department, academic level, Research interest, and
              Location (optional) and I’ll generate researchable project topics in seconds.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground"
                  : "max-w-full whitespace-pre-wrap text-foreground"
              }
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Uploaded prompt"
                  loading="lazy"
                  className="mb-2 max-h-40 rounded-xl object-cover"
                />
              )}
              {m.audio ? "🎙️ Voice prompt sent" : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Faython is thinking…
          </p>
        )}
      </div>

      {image && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border p-2">
          <img src={image} alt="Selected preview" className="size-14 rounded-xl object-cover" />
          <p className="flex-1 text-xs text-muted-foreground">Image attached</p>
          <button
            type="button"
            onClick={() => {
              setImage(null);
              setImageFile(null);
            }}
            aria-label="Remove image"
            className="rounded-lg p-2 hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 shrink-0">
        <label htmlFor="faython-prompt" className="sr-only">
          Ask Faython | Scholar
        </label>
        <div className="group relative flex items-end gap-2 rounded-[28px] border border-accent/40 bg-foreground/[0.05] p-2 backdrop-blur-xl transition-all duration-300 focus-within:border-accent/70 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_18%,transparent),0_18px_50px_-20px_color-mix(in_oklab,var(--accent)_60%,transparent)] dark:bg-background/50 sm:gap-3 sm:p-2.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach an image prompt"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-accent/50 hover:text-foreground"
          >
            <Plus className="size-5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />

          <textarea
            id="faython-prompt"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
            }}
            rows={1}
            placeholder={
              recording
                ? "Recording… tap the mic to send"
                : "Ask Faython to generate your research topic..."
            }
            className="max-h-40 min-h-10 flex-1 resize-none self-center bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />

          <button
            type="button"
            onClick={toggleRecording}
            aria-label={recording ? "Stop recording" : "Record voice prompt"}
            className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-200 hover:scale-105 hover:border-accent/50 hover:text-foreground ${
              recording ? "recording-ring border-destructive text-destructive" : ""
            }`}
          >
            {recording ? <Square className="size-4" /> : <Mic className="size-5" />}
          </button>

          <Button
            type="submit"
            disabled={loading || (!input.trim() && !image)}
            aria-label="Send prompt"
            className="btn-glow size-10 shrink-0 rounded-full p-0 transition-transform duration-200 hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
          </Button>
        </div>
      </form>

    </div>
  );
}

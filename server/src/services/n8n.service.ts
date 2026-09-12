import { config } from "../config/index.js";
import { serverError } from "../lib/errors.js";

type N8nEnvelope = {
  ok?: boolean;
  success?: boolean;
  data?: unknown;
  reply?: unknown;
  output?: unknown;
  error?: string;
};

export type TopicGenInput = {
  action: "topics";
  prompt: string;
  imageDataUrl?: string;
  level?: string;
  discipline?: string;
};

export type ChapterGenInput = {
  action: "chapter";
  topicId: string;
  chapterNumber: number;
  topicTitle: string;
  prompt: string;
  reply: string;
  previousChapters: string[];
};

function pickResult(json: N8nEnvelope): string | null {
  for (const key of ["reply", "output", "data"]) {
    const v = json[key as keyof N8nEnvelope];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

async function callN8n(input: TopicGenInput | ChapterGenInput): Promise<string> {
  const isTopics = input.action === "topics";
  const url = isTopics ? config.n8n.topicsWebhookUrl : config.n8n.chapterWebhookUrl;
  if (!url) {
    throw serverError(
      `n8n is not configured (set N8N_${isTopics ? "TOPICS" : "CHAPTER"}_WEBHOOK_URL)`,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.n8n.timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.n8n.webhookSecret
          ? { "X-Faython-Secret": config.n8n.webhookSecret }
          : {}),
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (res.status === 429) throw serverError("n8n rate limit hit — retry shortly.");
    if (res.status === 402) throw serverError("AI credits exhausted — please top up.");

    const raw = await res.text();

    if (!res.ok) {
      let detail: string | undefined;
      try {
        const parsed = JSON.parse(raw) as { error?: string | { message?: string } };
        detail =
          typeof parsed.error === "string"
            ? parsed.error
            : typeof parsed.error?.message === "string"
              ? parsed.error.message
              : undefined;
      } catch {
        // keep raw
      }
      throw serverError(`Generation workflow failed (${res.status}): ${detail || raw.slice(0, 200)}`);
    }

    let json: N8nEnvelope;
    try {
      json = JSON.parse(raw) as N8nEnvelope;
    } catch {
      // n8n may return raw text
      if (raw.trim()) return raw.trim();
      throw serverError("Generation workflow returned an empty response.");
    }

    const reply = pickResult(json) ?? (typeof json.error === "string" ? json.error : null);
    if (!reply) throw serverError("Generation workflow returned an empty response.");
    return reply;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw serverError("Generation workflow timed out — please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const n8n = {
  async generateTopics(prompt: string, opts?: { imageDataUrl?: string; level?: string; discipline?: string }) {
    return callN8n({
      action: "topics",
      prompt,
      ...(opts?.imageDataUrl ? { imageDataUrl: opts.imageDataUrl } : {}),
      ...(opts?.level ? { level: opts.level } : {}),
      ...(opts?.discipline ? { discipline: opts.discipline } : {}),
    });
  },

  async generateChapter(input: {
    topicId: string;
    chapterNumber: number;
    topicTitle: string;
    prompt: string;
    reply: string;
    previousChapters: string[];
  }) {
    return callN8n({ action: "chapter", ...input });
  },
};
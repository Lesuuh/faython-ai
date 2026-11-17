import { config } from "../config/index.js";
import { serverError } from "../lib/errors.js";

/** Payload the topics workflow expects. */
export type TopicsPayload = {
  action: "topics";
  prompt: string;
  imageDataUrl?: string;
  level?: string;
  discipline?: string;
};

/** Payload the chapter workflow expects. `topicId` is the caller's conversation id. */
export type ChapterPayload = {
  action: "chapter";
  topicId: string;
  chapterNumber: number;
  topicTitle: string;
  prompt: string;
  reply: string;
  previousChapters: string[];
};

/** Payload the project Q&A workflow expects. */
export type ChatPayload = {
  action: "chat";
  topicId: string;
  topicTitle: string;
  prompt: string;
};

type N8nEnvelope = {
  data?: unknown;
  reply?: unknown;
  output?: unknown;
  error?: string;
};

function pickResult(json: N8nEnvelope): string | null {
  for (const key of ["reply", "output", "data"] as const) {
    const value = json[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

const WEBHOOK_ENV: Record<TopicsPayload["action"] | ChapterPayload["action"] | ChatPayload["action"], string> = {
  topics: "N8N_TOPICS_WEBHOOK_URL",
  chapter: "N8N_CHAPTER_WEBHOOK_URL",
  chat: "N8N_CHAT_WEBHOOK_URL",
};

function webhookUrl(action: keyof typeof WEBHOOK_ENV): string {
  return {
    topics: config.n8n.topicsWebhookUrl,
    chapter: config.n8n.chapterWebhookUrl,
    chat: config.n8n.chatWebhookUrl,
  }[action];
}

async function callN8n(payload: TopicsPayload | ChapterPayload | ChatPayload): Promise<string> {
  const url = webhookUrl(payload.action);
  if (!url) {
    throw serverError(`n8n is not configured (set ${WEBHOOK_ENV[payload.action]})`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.n8n.timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.n8n.webhookSecret ? { "X-Faython-Secret": config.n8n.webhookSecret } : {}),
      },
      body: JSON.stringify(payload),
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
      throw serverError(
        `Generation workflow failed (${res.status}): ${detail || raw.slice(0, 200)}`,
      );
    }

    let json: N8nEnvelope;
    try {
      json = JSON.parse(raw) as N8nEnvelope;
    } catch {
      // n8n may return raw text
      if (raw.trim()) return raw.trim();
      throw serverError("Generation workflow returned an empty response.");
    }

    const result = pickResult(json) ?? (typeof json.error === "string" ? json.error : null);
    if (!result) throw serverError("Generation workflow returned an empty response.");
    return result;
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
  /** Topic ideas from an interest. */
  generateTopics(
    prompt: string,
    opts?: { imageDataUrl?: string; level?: string; discipline?: string },
  ): Promise<string> {
    return callN8n({
      action: "topics",
      prompt,
      ...(opts?.imageDataUrl ? { imageDataUrl: opts.imageDataUrl } : {}),
      ...(opts?.level ? { level: opts.level } : {}),
      ...(opts?.discipline ? { discipline: opts.discipline } : {}),
    });
  },

  /** One chapter, written in the context of its project. */
  generateChapter(input: Omit<ChapterPayload, "action">): Promise<string> {
    return callN8n({ action: "chapter", ...input });
  },

  /** Ask a question about a project. */
  generateChat(input: Omit<ChatPayload, "action">): Promise<string> {
    return callN8n({ action: "chat", ...input });
  },
};

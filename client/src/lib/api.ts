import { getAccessToken } from "./auth-token";
import { demoMode } from "./supabase";
import { mock } from "./mock";
import type { ProjectIntake } from "./project-store";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const body = (await res.json()) as { error?: string; code?: string };
      if (body.error) message = body.error;
      code = body.code;
    } catch {
      // no json body
    }
    throw new ApiError(res.status, message, code);
  }

  return res.json() as Promise<T>;
}

/** All three generators resolve to generated markdown in `text`. */
export type GeneratedText = { text: string };

/**
 * Transport failures and 5xx (server down, n8n workflow not configured, timeout)
 * fall back to sample content so the UI stays usable. 4xx are real answers —
 * "not enough credits", bad input, unauthorized — and are surfaced as-is.
 */
async function requestOrDemo<T>(
  path: string,
  demo: () => Promise<T>,
  init?: RequestInit,
): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && err.status < 500) throw err;
    console.warn(`[api] ${path} unavailable — serving demo data instead.`, err);
    return demo();
  }
}

export type ChapterRef = { number: number; title: string; content: string };
export type MessageRef = { role: "user" | "assistant"; content: string };

/** POST /api/topics — intake in, a list of scoped topic ideas out. */
export type TopicsRequest = { intake: ProjectIntake };

/** POST /api/chapters/:projectId/:chapterNumber — write or refine one chapter. */
export type ChapterRequest = {
  projectId: string;
  chapterNumber: number;
  title: string;
  chapterTitle?: string;
  intake: ProjectIntake;
  previousChapters: ChapterRef[];
  instruction?: string;
};

/** POST /api/projects/ask — question answering inside a project. */
export type AskRequest = {
  projectId: string;
  title: string;
  intake: ProjectIntake;
  chapters: ChapterRef[];
  question: string;
  history: MessageRef[];
};

export const api = {
  generateTopics(input: TopicsRequest): Promise<GeneratedText> {
    if (demoMode) return mock.generateTopics().then((text) => ({ text }));
    return requestOrDemo(
      "/api/topics",
      () => mock.generateTopics().then((text) => ({ text })),
      { method: "POST", body: JSON.stringify(input) },
    );
  },

  generateChapter(input: ChapterRequest): Promise<GeneratedText> {
    const { projectId, chapterNumber, ...context } = input;
    if (demoMode) {
      return mock.generateChapter(chapterNumber).then((text) => ({ text }));
    }
    return requestOrDemo(
      `/api/chapters/${encodeURIComponent(projectId)}/${chapterNumber}`,
      () => mock.generateChapter(chapterNumber).then((text) => ({ text })),
      { method: "POST", body: JSON.stringify(context) },
    );
  },

  askProject(input: AskRequest): Promise<GeneratedText> {
    if (demoMode) return mock.askProject(input.question).then((text) => ({ text }));
    return requestOrDemo(
      "/api/projects/ask",
      () => mock.askProject(input.question).then((text) => ({ text })),
      { method: "POST", body: JSON.stringify(input) },
    );
  },
};

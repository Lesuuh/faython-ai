import { getAccessToken } from "./auth-token";
import { demoMode } from "./supabase";
import { mock } from "./mock";
import type { ChatResult, User } from "./types";

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

export type ChapterContext = {
  topicTitle?: string;
  prompt?: string;
  reply?: string;
  previousChapters?: string[];
};

export type ChapterResult = {
  chapterNumber: number;
  content: string;
};

export const api = {
  me: () => (demoMode ? mock.me() : request<{ user: User }>("/api/user/me")),

  // chat
  generateTopic: (input: { prompt?: string; file?: File; level?: string; discipline?: string }) => {
    if (demoMode) return mock.generateTopic();
    if (input.file) {
      const form = new FormData();
      if (input.prompt) form.append("prompt", input.prompt);
      if (input.level) form.append("level", input.level);
      if (input.discipline) form.append("discipline", input.discipline);
      form.append("file", input.file);
      return request<ChatResult>("/api/chat", { method: "POST", body: form });
    }
    return request<ChatResult>("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        prompt: input.prompt,
        level: input.level,
        discipline: input.discipline,
      }),
    });
  },

  // chapters
  generateChapter: async (topicId: string, chapterNumber: number, context?: ChapterContext) => {
    if (demoMode) {
      const r = await mock.generateChapter(topicId, chapterNumber);
      return { chapterNumber, content: r.chapter.content };
    }
    return request<ChapterResult>(`/api/chapters/${topicId}/${chapterNumber}`, {
      method: "POST",
      body: JSON.stringify(context ?? {}),
    });
  },
};
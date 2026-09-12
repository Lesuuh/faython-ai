import { getAccessToken } from "./auth-token";
import { demoMode } from "./supabase";
import { mock } from "./mock";
import type {
  ChapterResult,
  ChatResult,
  DailyUsage,
  InitiatePaymentResult,
  Message,
  Payment,
  Topic,
  TopicDetail,
  TopicsMeta,
  TopicsResponse,
  User,
} from "./types";

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

export const api = {
  // user
  me: () => (demoMode ? mock.me() : request<{ user: User }>("/api/user/me")),
  usage: () => (demoMode ? mock.usage() : request<{ usage: DailyUsage }>("/api/user/usage")),
  updateProfile: (data: { name?: string; email?: string }) =>
    demoMode ? mock.updateProfile(data) : request<{ user: User }>("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateSettings: (data: { notificationsOn?: boolean }) =>
    demoMode ? mock.updateSettings(data) : request<{ user: User }>("/api/user/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAccount: () => (demoMode ? mock.deleteAccount() : request<{ ok: boolean }>("/api/user", { method: "DELETE" })),

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

  // topics
  topics: (params: {
    filter?: "all" | "saved";
    level?: string;
    discipline?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    if (demoMode) return mock.topics({ page: params.page, limit: params.limit });
    const qs = new URLSearchParams();
    if (params.filter && params.filter !== "all") qs.set("filter", params.filter);
    if (params.level) qs.set("level", params.level);
    if (params.discipline) qs.set("discipline", params.discipline);
    if (params.q) qs.set("q", params.q);
    qs.set("page", String(params.page || 1));
    qs.set("limit", String(params.limit || 20));
    return request<TopicsResponse>(`/api/topics?${qs.toString()}`);
  },
  topicsMeta: () => (demoMode ? mock.topicsMeta() : request<TopicsMeta>("/api/topics/meta")),
  topicDetail: (id: string) => (demoMode ? mock.topicDetail(id) : request<TopicDetail>(`/api/topics/${id}`)),
  topicMessages: (id: string) =>
    demoMode ? mock.topicMessages(id) : request<{ messages: Message[] }>(`/api/topics/${id}/messages`),
  setSaved: (id: string, saved: boolean) =>
    demoMode ? mock.setSaved(id, saved) : request<{ topic: Topic }>(`/api/topics/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ saved }),
    }),
  deleteTopic: (id: string) =>
    demoMode ? mock.deleteTopic() : request<{ ok: boolean }>(`/api/topics/${id}`, { method: "DELETE" }),
  clearTopics: () => (demoMode ? mock.clearTopics() : request<{ ok: boolean }>("/api/topics", { method: "DELETE" })),

  // chapters
  generateChapterOne: (topicId: string) =>
    demoMode
      ? mock.generateChapterOne(topicId)
      : request<ChapterResult>(`/api/chapters/${topicId}/one`, { method: "POST" }),
  generateChapter: (topicId: string, chapterNumber: number) =>
    demoMode
      ? mock.generateChapter(topicId, chapterNumber)
      : request<ChapterResult>(`/api/chapters/${topicId}/${chapterNumber}`, { method: "POST" }),

  // payments
  initiatePayment: (topicId: string) =>
    demoMode
      ? mock.initiatePayment(topicId)
      : request<InitiatePaymentResult>("/api/payments/initiate", {
          method: "POST",
          body: JSON.stringify({ topicId }),
        }),
  verifyPayment: (reference: string) =>
    demoMode
      ? mock.verifyPayment(reference)
      : request<{ status: string; payment: Payment; entitlement: unknown }>("/api/payments/verify", {
          method: "POST",
          body: JSON.stringify({ reference }),
        }),
  paymentHistory: () =>
    demoMode ? mock.paymentHistory() : request<{ payments: Payment[] }>("/api/payments/history"),
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TopicsResponse, Topic, TopicInputType } from "@/lib/types";
import { DEFAULT_CHAPTER_NAMES, getProjectProfile } from "@/lib/project-profile";

export const topicKeys = {
  all: ["topics"] as const,
  list: (params: unknown) => ["topics", "list", params] as const,
  meta: ["topics", "meta"] as const,
  detail: (id: string) => ["topics", "detail", id] as const,
  messages: (id: string) => ["topics", "messages", id] as const,
};

export const userKeys = {
  me: ["user", "me"] as const,
  usage: ["user", "usage"] as const,
};

export const paymentKeys = {
  history: ["payments", "history"] as const,
};

// ------- user -------
export function useMe() {
  return useQuery({ queryKey: userKeys.me, queryFn: api.me, staleTime: 60_000 });
}

export function useUsage() {
  return useQuery({ queryKey: userKeys.usage, queryFn: api.usage, staleTime: 30_000 });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => qc.setQueryData(userKeys.me, () => ({ user: data.user })),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: (data) => qc.setQueryData(userKeys.me, () => ({ user: data.user })),
  });
}

// ------- topics -------
export function useTopics(params: {
  filter?: "all" | "saved";
  level?: string;
  discipline?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const query = {
    filter: params.filter || "all",
    level: params.level || "",
    discipline: params.discipline || "",
    q: params.q || "",
    page: params.page || 1,
    limit: params.limit || 20,
  };
  return useQuery({
    queryKey: topicKeys.list(query),
    queryFn: () => api.topics(query),
  });
}

export function useTopicsMeta() {
  return useQuery({ queryKey: topicKeys.meta, queryFn: api.topicsMeta });
}

export function useTopicDetail(id: string) {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => api.topicDetail(id),
    enabled: Boolean(id),
  });
}

export function useTopicMessages(id: string) {
  return useQuery({
    queryKey: topicKeys.messages(id),
    queryFn: () => api.topicMessages(id),
    enabled: Boolean(id),
  });
}

export function useSetSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) => api.setSaved(id, saved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTopic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

export function useClearTopics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.clearTopics(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

// ------- chapters -------
export function useGenerateChapterOne(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.generateChapterOne(topicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.detail(topicId) });
      qc.invalidateQueries({ queryKey: userKeys.usage });
    },
  });
}

export function useGenerateChapter(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterNumber: number) => api.generateChapter(topicId, chapterNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: topicKeys.detail(topicId) });
    },
  });
}

// ------- payments -------
export function useInitiatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.initiatePayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.history });
    },
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.verifyPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.history });
      qc.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
}

export function usePaymentHistory() {
  return useQuery({ queryKey: paymentKeys.history, queryFn: api.paymentHistory });
}

// ------- helpers -------
export function extractTopicItems(reply: string): string[] {
  return reply
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^(\d+[.)]?|[-*]|#+\s*)\s*/, "").trim())
    .filter((l) => l.length > 0);
}

export function inputTypeLabel(t: TopicInputType): string {
  return t === "IMAGE" ? "Image" : "Text";
}

export function chapterTitle(num: number): string {
  const fallback: string[] = [
    "",
    ...DEFAULT_CHAPTER_NAMES,
    `Chapter ${num}`,
  ];
  const custom = getProjectProfile().chapterNames;
  const customized = custom && custom[num - 1] && custom[num - 1] !== DEFAULT_CHAPTER_NAMES[num - 1];
  return customized ? custom[num - 1] : fallback[num] || `Chapter ${num}`;
}

export type { TopicsResponse, Topic }; export type { TopicInputType };
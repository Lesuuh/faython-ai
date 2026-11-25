export type Role = "STUDENT" | "ADMIN";
export type TopicInputType = "TEXT" | "IMAGE";
export type MessageRole = "USER" | "AI";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Topic {
  id: string;
  userId: string;
  prompt: string;
  inputType: TopicInputType;
  level: string | null;
  discipline: string | null;
  reply: string;
  saved: boolean;
  createdAt: string;
  chapterCount?: number;
}

export interface TopicDetail {
  topic: Topic & {
    chapters: Chapter[];
    entitlement: { unlockedChapters: number } | null;
  };
}

export interface TopicsResponse {
  items: Topic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopicsMeta {
  levels: string[];
  disciplines: string[];
  counts: { all: number; saved: number };
}

export interface Message {
  id: string;
  topicId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  topicId: string;
  chapterNumber: number;
  content: string;
  generatedAt: string;
}

export interface ChapterResult {
  chapter: Chapter;
  cached: boolean;
}

export interface Entitlement {
  id: string;
  topicId: string;
  unlockedChapters: number;
  source: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  topicId: string | null;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  topic?: { id: string; prompt: string } | null;
}

export interface InitiatePaymentResult {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface DailyUsage {
  topics: number;
  chapterOne: number;
}

export interface ChatResult {
  topicId: string;
  reply: string;
  inputType: TopicInputType;
  createdAt: string;
  usage: DailyUsage;
}
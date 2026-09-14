export type ChatRole = "user" | "assistant";
export type ChatMode = "topics" | "chapter";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  mode: ChatMode;
  content: string;
  chapterNumber?: number;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const LEGACY_KEY = "faython:conversations";

export function conversationsKey(userId: string | null): string | null {
  return userId ? `faython:conversations:${userId}` : null;
}

function adoptLegacyIfAbsent(key: string): string | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
    if (raw === null) {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        try {
          window.localStorage.setItem(key, legacy);
          window.localStorage.removeItem(LEGACY_KEY);
        } catch {
          // storage unavailable — keep legacy key
        }
        return legacy;
      }
    }
  } catch {
    // ignore
  }
  return raw;
}

export function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function titleFromPrompt(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 52 ? `${clean.slice(0, 50).trim()}…` : clean;
}

export function slugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return slug || "conversation";
}

export function loadConversations(userId: string | null): Conversation[] {
  const key = conversationsKey(userId);
  if (!key || !userId) return [];
  const raw = adoptLegacyIfAbsent(key);
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as Conversation[]).filter(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        Array.isArray(c.messages),
    );
  } catch {
    return [];
  }
}

export function persistConversations(userId: string | null, list: Conversation[]): void {
  const key = conversationsKey(userId);
  if (!key || !userId) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // storage unavailable — conversations stay in memory only
  }
}

export function createConversation(title: string, firstMessage?: ChatMessage): Conversation {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: firstMessage ? [firstMessage] : [],
  };
}
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

const CONVERSATIONS_KEY = "faython:conversations";

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

export function loadConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
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

export function persistConversations(list: Conversation[]): void {
  try {
    window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
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
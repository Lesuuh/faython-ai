import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  createConversation,
  loadConversations,
  persistConversations,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-store";
import { useAuth } from "./AuthContext";

type ChatContextValue = {
  conversations: Conversation[];
  activeId: string | null;
  active: Conversation | null;
  selectConversation: (id: string | null) => void;
  newConversation: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addConversation: (title: string) => Conversation;
  appendMessage: (convId: string, msg: ChatMessage) => void;
  patchMessage: (convId: string, msgId: string, content: string) => void;
  removeMessage: (convId: string, msgId: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(user?.id ?? null),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(loadConversations(userId));
    setActiveId(null);
  }, [userId]);

  useEffect(() => {
    persistConversations(userId, conversations);
  }, [userId, conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  function selectConversation(id: string | null) {
    setActiveId(id);
  }

  function newConversation() {
    setActiveId(null);
  }

  function deleteConversation(id: string) {
    setConversations((list) => list.filter((c) => c.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }

  function renameConversation(id: string, title: string) {
    const next = title.trim();
    if (!next) return;
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, title: next } : c)));
  }

  function addConversation(title: string) {
    const conv = createConversation(title);
    setConversations((list) => [conv, ...list]);
    setActiveId(conv.id);
    return conv;
  }

  function appendMessage(convId: string, msg: ChatMessage) {
    setConversations((list) =>
      list.map((c) =>
        c.id === convId
          ? { ...c, updatedAt: new Date().toISOString(), messages: [...c.messages, msg] }
          : c,
      ),
    );
  }

  function patchMessage(convId: string, msgId: string, content: string) {
    setConversations((list) =>
      list.map((c) =>
        c.id === convId
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, content } : m)) }
          : c,
      ),
    );
  }

  function removeMessage(convId: string, msgId: string) {
    setConversations((list) =>
      list.map((c) =>
        c.id === convId ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) } : c,
      ),
    );
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeId,
        active,
        selectConversation,
        newConversation,
        deleteConversation,
        renameConversation,
        addConversation,
        appendMessage,
        patchMessage,
        removeMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
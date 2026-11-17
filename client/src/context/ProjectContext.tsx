import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createProject,
  loadProjects,
  persistProjects,
  type Project,
  type ProjectChapter,
  type ProjectIntake,
  type ProjectMessage,
  type TopicSuggestion,
} from "@/lib/project-store";
import { useAuth } from "./AuthContext";

type ProjectContextValue = {
  projects: Project[];
  activeId: string | null;
  active: Project | null;
  selectProject: (id: string | null) => void;
  addProject: (input: {
    title: string;
    intake: ProjectIntake;
    suggestions: TopicSuggestion[];
    chapterNames?: string[];
  }) => Project;
  updateProject: (id: string, updater: (project: Project) => Project) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, title: string) => void;
  setChapter: (projectId: string, number: number, patch: Partial<ProjectChapter>) => void;
  addMessage: (projectId: string, message: ProjectMessage) => void;
  addFile: (projectId: string, file: { name: string; type: string; size: string; uploadedAt?: string }) => void;
  deleteFile: (projectId: string, fileId: string) => void;
  setInstructions: (projectId: string, text: string) => void;
  addDocument: (projectId: string, document: {
    id?: string;
    title: string;
    type: string;
    content: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    wordCount?: number;
  }) => void;
  deleteDocument: (projectId: string, documentId: string) => void;
  renameConversation: (projectId: string, conversationId: string, title: string) => void;
  addConversation: (projectId: string, title?: string) => void;
  deleteConversation: (projectId: string, conversationId: string) => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [projects, setProjects] = useState<Project[]>(() => loadProjects(userId));
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(loadProjects(userId));
    setActiveId(null);
  }, [userId]);

  useEffect(() => {
    persistProjects(userId, projects);
  }, [userId, projects]);

  const active = useMemo(
    () => projects.find((p) => p.id === activeId) ?? null,
    [projects, activeId],
  );

  function patchProject(id: string, patch: (project: Project) => Project) {
    setProjects((list) =>
      list.map((p) =>
        p.id === id
          ? { ...patch(p), updatedAt: new Date().toISOString() }
          : p,
      ),
    );
  }

  function addProject(input: Parameters<typeof createProject>[0]) {
    const project = createProject(input);
    setProjects((list) => [project, ...list]);
    setActiveId(project.id);
    return project;
  }

  function updateProject(id: string, updater: (project: Project) => Project) {
    setProjects((list) =>
      list.map((project) => (project.id === id ? { ...updater(project), updatedAt: new Date().toISOString() } : project)),
    );
  }

  function deleteProject(id: string) {
    setProjects((list) => list.filter((p) => p.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }

  function renameProject(id: string, title: string) {
    const next = title.trim();
    if (!next) return;
    patchProject(id, (p) => (p.title === next ? p : { ...p, title: next }));
  }

  function setChapter(projectId: string, number: number, patch: Partial<ProjectChapter>) {
    patchProject(projectId, (p) => ({
      ...p,
      chapters: p.chapters.map((c) => (c.number === number ? { ...c, ...patch } : c)),
    }));
  }

  function addMessage(projectId: string, message: ProjectMessage) {
    patchProject(projectId, (p) => ({ ...p, messages: [...p.messages, message] }));
  }

  function addFile(projectId: string, file: { name: string; type: string; size: string; uploadedAt?: string }) {
    const now = new Date().toISOString();
    patchProject(projectId, (p) => ({
      ...p,
      files: [
        ...(p.files ?? []),
        {
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: file.uploadedAt ?? now,
          isDummy: true,
        },
      ],
      activity: [
        ...(p.activity ?? []),
        { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-activity`, type: "file_added", message: `Uploaded ${file.name}`, createdAt: now },
      ],
    }));
  }

  function deleteFile(projectId: string, fileId: string) {
    patchProject(projectId, (p) => ({
      ...p,
      files: (p.files ?? []).filter((file) => file.id !== fileId),
    }));
  }

  function setInstructions(projectId: string, text: string) {
    const trimmed = text.trim();
    patchProject(projectId, (p) => ({
      ...p,
      instructions: trimmed
        ? [
            {
              id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
              text: trimmed,
              updatedAt: new Date().toISOString(),
            },
          ]
        : [],
      activity: [
        ...(p.activity ?? []),
        { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-instr`, type: "instructions_updated", message: "Updated project instructions", createdAt: new Date().toISOString() },
      ],
    }));
  }

  function addDocument(
    projectId: string,
    document: {
      id?: string;
      title: string;
      type: string;
      content: string;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
      wordCount?: number;
    },
  ) {
    const now = new Date().toISOString();
    patchProject(projectId, (p) => ({
      ...p,
      documents: [
        ...(p.documents ?? []),
        {
          id: document.id ?? (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`),
          title: document.title,
          type: document.type,
          content: document.content,
          status: document.status ?? "saved",
          createdAt: document.createdAt ?? now,
          updatedAt: document.updatedAt ?? now,
          wordCount: document.wordCount,
        },
      ],
      activity: [
        ...(p.activity ?? []),
        { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-doc`, type: "document_saved", message: `Saved ${document.title}`, createdAt: now },
      ],
    }));
  }

  function deleteDocument(projectId: string, documentId: string) {
    patchProject(projectId, (p) => ({
      ...p,
      documents: (p.documents ?? []).filter((document) => document.id !== documentId),
    }));
  }

  function renameConversation(projectId: string, conversationId: string, title: string) {
    const next = title.trim();
    if (!next) return;
    patchProject(projectId, (p) => ({
      ...p,
      conversations: (p.conversations ?? []).map((conversation) =>
        conversation.id === conversationId ? { ...conversation, title: next, updatedAt: new Date().toISOString() } : conversation,
      ),
    }));
  }

  function addConversation(projectId: string, title?: string) {
    const now = new Date().toISOString();
    const nextTitle = title?.trim() || `Conversation ${((new Date().getTime() % 10000) + 1).toString()}`;
    patchProject(projectId, (p) => ({
      ...p,
      conversations: [
        ...(p.conversations ?? []),
        {
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
          title: nextTitle,
          messages: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
      activeConversationId: p.activeConversationId ?? null,
      activity: [
        ...(p.activity ?? []),
        { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-conv`, type: "conversation_started", message: `Started a new conversation: ${nextTitle}`, createdAt: now },
      ],
    }));
  }

  function deleteConversation(projectId: string, conversationId: string) {
    patchProject(projectId, (p) => {
      const conversations = (p.conversations ?? []).filter((conversation) => conversation.id !== conversationId);
      return {
        ...p,
        conversations,
        activeConversationId: conversations.length > 0 ? conversations[0].id : null,
      };
    });
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeId,
        active,
        selectProject: setActiveId,
        addProject,
        updateProject,
        deleteProject,
        renameProject,
        setChapter,
        addMessage,
        addFile,
        deleteFile,
        setInstructions,
        addDocument,
        deleteDocument,
        renameConversation,
        addConversation,
        deleteConversation,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}

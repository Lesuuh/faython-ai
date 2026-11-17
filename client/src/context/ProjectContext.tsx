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
  deleteProject: (id: string) => void;
  renameProject: (id: string, title: string) => void;
  setChapter: (projectId: string, number: number, patch: Partial<ProjectChapter>) => void;
  addMessage: (projectId: string, message: ProjectMessage) => void;
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

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeId,
        active,
        selectProject: setActiveId,
        addProject,
        deleteProject,
        renameProject,
        setChapter,
        addMessage,
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

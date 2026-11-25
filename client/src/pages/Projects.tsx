import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Copy,
  Download,
  FolderOpen,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportProjectDocx } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/hooks/useAuth";
import { intakeSummary, type Project } from "@/lib/project-store";

function chapterCount(project: Project): number {
  return project.chapters.filter((c) => c.state === "done" && c.content).length;
}

export function Projects() {
  const { projects, deleteProject, renameProject, updateProject } =
    useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "alphabetical">("updated");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = [...projects].filter((project) => {
      if (!query) return true;
      const haystack =
        `${project.title} ${project.researchTopic ?? ""} ${project.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });

    return list.sort((a, b) => {
      if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [projects, search, sortBy]);

  function startRename(project: Project) {
    setEditingId(project.id);
    setTitleInput(project.title);
  }

  function saveRename(id: string) {
    renameProject(id, titleInput);
    setEditingId(null);
  }

  function openProject(project: Project) {
    navigate(`/projects/${project.id}`);
  }

  function duplicateProject(project: Project) {
    const now = new Date().toISOString();
    const copy: Project = {
      ...project,
      id: `${project.id}-copy-${Date.now()}`,
      title: `${project.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      messages: [],
      instructions: project.instructions ?? [],
      files: project.files ?? [],
      documents: project.documents ?? [],
      activity: [
        {
          id: `${Date.now()}-activity`,
          type: "project_created",
          message: "Duplicated project",
          createdAt: now,
        },
        ...(project.activity ?? []),
      ],
      conversations: (project.conversations ?? []).map((conversation) => ({
        ...conversation,
        id: `${conversation.id}-copy-${Date.now()}`,
        messages: [...(conversation.messages ?? [])],
      })),
      activeConversationId: (project.conversations ?? [])[0]?.id ?? null,
    };
    updateProject(project.id, (current) => current);
    const nextProjects = [copy, ...projects];
    localStorage.setItem(
      `faython:projects:${user?.id ?? "guest"}`,
      JSON.stringify(nextProjects),
    );
    toast.success("Project duplicated");
  }

  function archiveProject(project: Project) {
    updateProject(project.id, (current) => ({
      ...current,
      status: current.status === "archived" ? "active" : "archived",
    }));
    toast.success(
      project.status === "archived" ? "Project restored" : "Project archived",
    );
  }

  function exportProject(project: Project) {
    exportProjectDocx(project, { userId: user?.id });
    toast.success("Project exported as a document");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Project deleted");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[980px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Projects"
          description="A dedicated research workspace for your academic projects, chats, files and saved documents."
          actions={
            <ButtonLink to="/new" variant="primary" size="sm">
              Create Project
            </ButtonLink>
          }
        />

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects"
              className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "updated" | "alphabetical")
            }
            className="h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="updated">Sort: recently updated</option>
            <option value="alphabetical">Sort: alphabetical</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <FolderOpen size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.01em]">
              No projects match your search
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Create a new research project or adjust your search to find an
              existing workspace.
            </p>
            <ButtonLink to="/new" variant="primary" className="mt-6">
              Start a project
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {filtered.map((project) => {
              const editing = editingId === project.id;
              const done = chapterCount(project);
              const summary = intakeSummary(project.intake)
                .slice(0, 3)
                .join(" · ");
              const conversationCount = project.conversations?.length ?? 1;
              const docCount = project.documents?.length ?? 0;

              return (
                <div
                  key={project.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            saveRename(project.id);
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            autoFocus
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                            className="h-9 w-full max-w-[320px] rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            aria-label="Project title"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => saveRename(project.id)}
                          >
                            Save
                          </Button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openProject(project)}
                          className="block max-w-full truncate text-left text-[16px] font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {project.title}
                        </button>
                      )}

                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                        {project.description ||
                          project.researchTopic ||
                          summary ||
                          "No research description yet."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Updated {formatDate(project.updatedAt)}</span>
                        <span>{conversationCount} conversations</span>
                        <span>{docCount} documents</span>
                        <span>{done} chapters written</span>
                        {project.status === "archived" && (
                          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted">
                            Archived
                          </span>
                        )}
                      </div>
                    </div>

                    {!editing && (
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openProject(project)}
                        >
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => startRename(project)}
                          title="Rename project"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => duplicateProject(project)}
                          title="Duplicate project"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => archiveProject(project)}
                          title="Archive project"
                        >
                          <Archive size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => exportProject(project)}
                          title="Export DOCX"
                        >
                          <Download size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => setDeleteTarget(project)}
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete project?"
        description="This permanently deletes the project and all of its chapter data. This action can't be undone."
        confirmLabel="Delete project"
        danger
      />
    </main>
  );
}

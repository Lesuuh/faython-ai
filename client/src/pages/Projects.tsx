import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Download, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportProjectDocx } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { intakeSummary, type Project } from "@/lib/project-store";

function chapterCount(project: Project): number {
  return project.chapters.filter((c) => c.state === "done" && c.content).length;
}

export function Projects() {
  const { projects, deleteProject, renameProject } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const sorted = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function startRename(project: Project) {
    setEditingId(project.id);
    setTitleInput(project.title);
  }

  function saveRename(id: string) {
    renameProject(id, titleInput);
    setEditingId(null);
  }

  function openChapters(project: Project) {
    navigate(`/projects/${project.id}`);
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
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="My Projects"
          description="Each project holds its topic, its intake details and the chapters you've generated."
          actions={
            <ButtonLink to="/new" variant="primary" size="sm">
              New project
            </ButtonLink>
          }
        />

        {sorted.length === 0 ? (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <FolderOpen size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.01em]">No projects yet</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Answer a few questions about your department and Faython will propose scoped topics
              for you to choose from.
            </p>
            <ButtonLink to="/new" variant="primary" className="mt-6">
              Start a project
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {sorted.map((project) => {
              const editing = editingId === project.id;
              const done = chapterCount(project);
              const summary = intakeSummary(project.intake).slice(0, 3).join(" · ");
              return (
                <div
                  key={project.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
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
                            className="h-9 w-full max-w-[280px] rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                            aria-label="Project title"
                          />
                          <Button size="sm" variant="secondary" onClick={() => saveRename(project.id)}>
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="muted"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel rename"
                          >
                            <X size={14} />
                          </Button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openChapters(project)}
                          className="block max-w-full truncate text-left text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {project.title}
                        </button>
                      )}
                      {summary && <p className="mt-1 truncate text-xs text-muted">{summary}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {done} chapter{done === 1 ? "" : "s"} · updated {formatDate(project.updatedAt)}
                      </p>
                    </div>

                    {!editing && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button size="sm" variant="muted" onClick={() => startRename(project)} title="Rename">
                          <Pencil size={14} />
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
        description="This permanently deletes the project and all of its chapters. This action can't be undone."
        confirmLabel="Delete project"
        danger
      />
    </main>
  );
}

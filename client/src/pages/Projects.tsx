import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Download, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportConversationDocx } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import type { Conversation } from "@/lib/chat-store";

function countChapters(conv: Conversation): number {
  const numbers = new Set<number>();
  for (const m of conv.messages) {
    if (m.role === "assistant" && m.mode === "chapter" && m.chapterNumber) numbers.add(m.chapterNumber);
  }
  return numbers.size;
}

export function Projects() {
  const { conversations, deleteConversation, renameConversation, selectConversation } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  function startRename(conv: Conversation) {
    setEditingId(conv.id);
    setTitleInput(conv.title);
  }

  function saveRename(id: string) {
    renameConversation(id, titleInput);
    setEditingId(null);
  }

  function openProject(conv: Conversation) {
    selectConversation(conv.id);
    navigate("/");
  }

  function exportProject(conv: Conversation) {
    exportConversationDocx(conv, { userId: user?.id });
    toast.success("Project exported as a document");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteConversation(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Project deleted");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="My Projects"
          description="Every conversation is a project. Open it in the chat to keep working, or export it as a document."
        />

        {sorted.length === 0 ? (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <FolderOpen size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.01em]">No projects yet</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Start a conversation in the chat — that becomes your project. Topics and chapters you
              generate are saved there automatically.
            </p>
            <ButtonLink to="/" variant="primary" className="mt-6">
              Start a project
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {sorted.map((conv) => {
              const editing = editingId === conv.id;
              const chapterCount = countChapters(conv);
              return (
                <div
                  key={conv.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      {editing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            saveRename(conv.id);
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
                          <Button size="sm" variant="secondary" onClick={() => saveRename(conv.id)}>
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
                          onClick={() => openProject(conv)}
                          className="block max-w-full truncate text-left text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {conv.title}
                        </button>
                      )}
                      <p className="mt-1 text-xs text-muted">
                        {chapterCount} chapter{chapterCount === 1 ? "" : "s"} ·{" "}
                        {conv.messages.length} message{conv.messages.length === 1 ? "" : "s"} ·
                        updated {formatDate(conv.updatedAt)}
                      </p>
                    </div>

                    {!editing && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button size="sm" variant="muted" onClick={() => startRename(conv)} title="Rename">
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => exportProject(conv)}
                          title="Export DOCX"
                        >
                          <Download size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="muted"
                          onClick={() => setDeleteTarget(conv)}
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
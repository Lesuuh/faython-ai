import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { exportConversationDocx } from "@/lib/export";
import { formatDate } from "@/lib/format";
import { deleteFile, loadFiles, type ExportedFile } from "@/lib/file-store";
import { loadConversations } from "@/lib/chat-store";

export function Files() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [files, setFiles] = useState<ExportedFile[]>(() => loadFiles(userId));
  const [deleteTarget, setDeleteTarget] = useState<ExportedFile | null>(null);

  useEffect(() => {
    setFiles(loadFiles(userId));
  }, [userId]);

  function download(file: ExportedFile) {
    const conv = loadConversations(userId).find((c) => c.id === file.refId);
    if (!conv) {
      toast.error("Source conversation no longer exists.");
      return;
    }
    exportConversationDocx(conv, { record: false, userId });
    toast.success("Document downloaded");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteFile(userId, deleteTarget.id);
    setDeleteTarget(null);
    setFiles(loadFiles(userId));
    toast.success("File removed from history");
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Files & Documents"
          description="Documents you've exported from your projects. Re-download them any time."
        />

        {files.length === 0 ? (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <FileText size={22} />
            </span>
            <h2 className="mt-5 text-lg font-bold tracking-[-0.01em]">No documents yet</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Export a project from the chat header and it will show up here.
            </p>
            <ButtonLink to="/" variant="primary" className="mt-6">
              Back to chat
            </ButtonLink>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText size={17} className="shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{f.name}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Badge variant={f.kind === "project" ? "success" : "neutral"}>
                        {f.kind === "project" ? "Project" : "Conversation"}
                      </Badge>
                      <span>{formatDate(f.exportedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button variant="muted" size="sm" onClick={() => download(f)}>
                    <Download size={13} /> Download
                  </Button>
                  <Button
                    variant="muted"
                    size="sm"
                    onClick={() => setDeleteTarget(f)}
                    aria-label="Remove from history"
                    title="Remove from history"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove file?"
        description="This removes the document from your history. Any downloaded copy you saved is unaffected."
        confirmLabel="Remove"
        danger
      />
    </main>
  );
}
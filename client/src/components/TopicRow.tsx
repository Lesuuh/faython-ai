import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Trash2, Copy, ExternalLink } from "lucide-react";
import { useSetSaved, useDeleteTopic, inputTypeLabel, extractTopicItems, type Topic } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function TopicRow({ topic, showItems }: { topic: Topic; showItems?: boolean }) {
  const setSaved = useSetSaved();
  const deleteTopic = useDeleteTopic();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const items = extractTopicItems(topic.reply);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(topic.reply);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <div className="group flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface/60">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground" title={topic.prompt}>
            {topic.prompt}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {new Date(topic.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {topic.chapterCount != null && <span>{topic.chapterCount}/5 chapters</span>}
            {topic.saved && (
              <span className="inline-flex items-center gap-1">
                <BookmarkCheck size={11} className="text-primary" /> Saved
              </span>
            )}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          <Badge>{topic.level || "Level unknown"}</Badge>
          <Badge>{topic.discipline || "Discipline unknown"}</Badge>
          <Badge>{inputTypeLabel(topic.inputType)}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Link
            to={`/project/${topic.id}`}
            aria-label="Open project"
            title="Open project"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ExternalLink size={15} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopy}
            aria-label="Copy"
            title="Copy"
            className="text-muted"
          >
            <Copy size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSaved.mutate({ id: topic.id, saved: !topic.saved })}
            aria-label={topic.saved ? "Unsave" : "Save"}
            title={topic.saved ? "Unsave" : "Save"}
            className="text-muted"
          >
            {topic.saved ? <BookmarkCheck size={15} className="text-primary" /> : <Bookmark size={15} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete"
            title="Delete"
            disabled={deleteTopic.isPending}
            className="text-danger hover:bg-danger-bg"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {showItems && items.length > 0 ? (
        <p className="line-clamp-1 text-[13px] text-muted">
          <span className="font-medium text-foreground">Topics:</span> {items[0]}
          {items.length > 1 && ` · +${items.length - 1} more`}
        </p>
      ) : (
        <p className="line-clamp-1 text-[13px] text-muted">{topic.reply}</p>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => {
          deleteTopic.mutate(topic.id);
          setConfirmingDelete(false);
        }}
        title="Delete this topic set?"
        description="This removes the topic and its chapters. This can't be undone."
        confirmLabel="Delete"
        danger
        busy={deleteTopic.isPending}
      />
    </div>
  );
}
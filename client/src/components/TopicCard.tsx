import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Trash2, Copy, ExternalLink } from "lucide-react";
import { useSetSaved, useDeleteTopic, inputTypeLabel, extractTopicItems, type Topic } from "@/lib/hooks";

export function TopicCard({ topic, compact }: { topic: Topic; compact?: boolean }) {
  const setSaved = useSetSaved();
  const deleteTopic = useDeleteTopic();

  const items = extractTopicItems(topic.reply);

  const onSave = () => {
    setSaved.mutate({ id: topic.id, saved: !topic.saved });
  };

  const onDelete = () => {
    if (!confirm("Delete this topic set?")) return;
    deleteTopic.mutate(topic.id);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(topic.reply);
      toast.success("Copied to clipboard.");
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="mb-2 text-xs font-medium text-muted" style={{ fontWeight: 600, color: "var(--fg)" }}>
            {topic.prompt}
          </div>
          {!compact && (
            <div className="text-sm leading-[1.7] whitespace-pre-wrap text-foreground">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div key={i} style={{ marginBottom: "0.4rem" }}>
                    {i + 1}. {item}
                  </div>
                ))
              ) : (
                <div style={{ whiteSpace: "pre-wrap" }}>{topic.reply}</div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-shrink-0 gap-1">
          <Link className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed p-[7px] leading-none" to={`/project/${topic.id}`} aria-label="Open project">
            <ExternalLink size={15} />
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed p-[7px] leading-none" onClick={onCopy} aria-label="Copy">
            <Copy size={15} />
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed p-[7px] leading-none" onClick={onSave} aria-label={topic.saved ? "Unsave" : "Save"}>
            {topic.saved ? <BookmarkCheck size={15} style={{ color: "var(--primary)" }} /> : <Bookmark size={15} />}
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed p-[7px] leading-none" onClick={onDelete} aria-label="Delete" disabled={deleteTopic.isPending}>
            <Trash2 size={15} style={{ color: "var(--danger)" }} />
          </button>
        </div>
      </div>
      {compact && (
        <div className="text-sm leading-[1.7] whitespace-pre-wrap text-foreground" style={{ whiteSpace: "pre-wrap", maxHeight: 140, overflow: "hidden" }}>
          {topic.reply.slice(0, 300)}
          {topic.reply.length > 300 ? "\n…" : ""}
        </div>
      )}
      <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-muted">
        <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground">{topic.level || "Level unknown"}</span>
        <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">{topic.discipline || "Discipline unknown"}</span>
        <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">{inputTypeLabel(topic.inputType)}</span>
        <span className="text-xs" style={{ alignSelf: "center" }}>
          {new Date(topic.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
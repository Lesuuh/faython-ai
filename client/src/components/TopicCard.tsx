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
    <div className="topic-card">
      <div className="topic-head">
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="topic-prompt" style={{ fontWeight: 600, color: "var(--fg)" }}>
            {topic.prompt}
          </div>
          {!compact && (
            <div className="topic-reply">
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
        <div className="topic-actions">
          <Link className="btn btn-ghost btn-icon-sm" to={`/project/${topic.id}`} aria-label="Open project">
            <ExternalLink size={15} />
          </Link>
          <button className="btn btn-ghost btn-icon-sm" onClick={onCopy} aria-label="Copy">
            <Copy size={15} />
          </button>
          <button className="btn btn-ghost btn-icon-sm" onClick={onSave} aria-label={topic.saved ? "Unsave" : "Save"}>
            {topic.saved ? <BookmarkCheck size={15} style={{ color: "var(--primary)" }} /> : <Bookmark size={15} />}
          </button>
          <button className="btn btn-ghost btn-icon-sm" onClick={onDelete} aria-label="Delete" disabled={deleteTopic.isPending}>
            <Trash2 size={15} style={{ color: "var(--danger)" }} />
          </button>
        </div>
      </div>
      {compact && (
        <div className="topic-reply" style={{ whiteSpace: "pre-wrap", maxHeight: 140, overflow: "hidden" }}>
          {topic.reply.slice(0, 300)}
          {topic.reply.length > 300 ? "\n…" : ""}
        </div>
      )}
      <div className="topic-meta">
        <span className="badge badge-primary">{topic.level || "Level unknown"}</span>
        <span className="badge badge-neutral">{topic.discipline || "Discipline unknown"}</span>
        <span className="badge badge-neutral">{inputTypeLabel(topic.inputType)}</span>
        <span className="text-xs" style={{ alignSelf: "center" }}>
          {new Date(topic.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTopics, useTopicsMeta, useClearTopics } from "@/lib/hooks";
import { TopicCard } from "@/components/TopicCard";
import { EmptyState } from "@/components/EmptyState";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export function DashboardHistory() {
  const [filter, setFilter] = useState("");
  const [level, setLevel] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<number | null>(null);

  const { data: meta } = useTopicsMeta();
  const { data, isLoading, isError, refetch } = useTopics({
    filter: filter as "all" | "saved",
    level,
    discipline,
    q: debouncedQ,
    page,
    limit: 10,
  });

  const clearTopics = useClearTopics();

  return (
    <>
      <div className="dash-title">Topic history</div>
      <p className="dash-sub">Every topic set you've generated, searchable and deletable.</p>

      <div className="filters">
        <input
          placeholder="Search prompts & topics…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            debounceRef.current = window.setTimeout(() => setDebouncedQ(e.target.value), 400);
          }}
          style={{ minWidth: 220, flex: 1 }}
        />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="saved">Saved only</option>
        </select>
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">Any level</option>
          {meta?.levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select value={discipline} onChange={(e) => { setDiscipline(e.target.value); setPage(1); }}>
          <option value="">Any discipline</option>
          {meta?.disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {data && data.total > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (confirm("Clear ALL topic history? This cannot be undone.")) clearTopics.mutate();
            }}
            disabled={clearTopics.isPending}
            style={{ marginLeft: "auto" }}
          >
            <Trash2 size={14} /> Clear all
          </button>
        )}
      </div>

      {isLoading && (
        <div className="loader-row"><span className="spinner" /></div>
      )}
      {isError && (
        <EmptyState
          eyebrow="Something went wrong"
          title="Couldn't load your history"
          body="Check your connection and try loading it again."
          actions={
            <button className="btn btn-outline btn-sm" onClick={() => refetch()}>
              Retry
            </button>
          }
        />
      )}
      {data && data.items.length === 0 && (
        <EmptyState
          eyebrow="No topics yet"
          title="Your history is empty"
          body="Generate your first set of topics and they'll show up here — ready to search, save and open as projects."
          actions={
            <Link to="/generate-topics" className="btn btn-primary btn-sm">
              Generate topics
            </Link>
          }
        />
      )}

      <div className="topic-list">
        {data?.items.map((t) => <TopicCard key={t.id} topic={t} />)}
      </div>

      {data && data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm muted" style={{ alignSelf: "center" }}>
            Page {page} of {data.totalPages}
          </span>
          <button className="btn btn-outline btn-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
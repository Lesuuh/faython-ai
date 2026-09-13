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
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Topic history</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">Every topic set you've generated, searchable and deletable.</p>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <input
          placeholder="Search prompts & topics…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            debounceRef.current = window.setTimeout(() => setDebouncedQ(e.target.value), 400);
          }}
          className="rounded-sm border border-border bg-background px-3 py-[9px] text-[13px] text-foreground outline-none transition-[border-color] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]"
          style={{ minWidth: 220, flex: 1 }}
        />
        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="rounded-sm border border-border bg-background px-3 py-[9px] text-[13px] text-foreground outline-none transition-[border-color] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]">
          <option value="">All</option>
          <option value="saved">Saved only</option>
        </select>
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="rounded-sm border border-border bg-background px-3 py-[9px] text-[13px] text-foreground outline-none transition-[border-color] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]">
          <option value="">Any level</option>
          {meta?.levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select value={discipline} onChange={(e) => { setDiscipline(e.target.value); setPage(1); }} className="rounded-sm border border-border bg-background px-3 py-[9px] text-[13px] text-foreground outline-none transition-[border-color] duration-150 focus:border-primary focus:shadow-[0_0_0_3px_rgb(109_92_231/0.12)]">
          <option value="">Any discipline</option>
          {meta?.disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {data && data.total > 0 && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm"
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
        <div className="flex justify-center p-8"><span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /></div>
      )}
      {isError && (
        <EmptyState
          eyebrow="Something went wrong"
          title="Couldn't load your history"
          body="Check your connection and try loading it again."
          actions={
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" onClick={() => refetch()}>
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
            <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
              Generate topics
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {data?.items.map((t) => <TopicCard key={t.id} topic={t} />)}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-[13px] text-muted" style={{ alignSelf: "center" }}>
            Page {page} of {data.totalPages}
          </span>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
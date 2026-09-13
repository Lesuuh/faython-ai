import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Search, Trash2 } from "lucide-react";
import { useTopics, useTopicsMeta, useClearTopics } from "@/lib/hooks";
import { TopicRow } from "@/components/TopicRow";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DashboardHistory() {
  const [filter, setFilter] = useState("");
  const [level, setLevel] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [confirmingClear, setConfirmingClear] = useState(false);
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

  const hasFilters = Boolean(filter || level || discipline || debouncedQ);

  const resetFilters = () => {
    setFilter("");
    setLevel("");
    setDiscipline("");
    setQ("");
    setDebouncedQ("");
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Topic history"
        description="Every topic set you've generated, searchable and deletable."
      />

      <div className="mb-6 rounded-lg border border-border bg-background p-2.5 sm:p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                  if (debounceRef.current) window.clearTimeout(debounceRef.current);
                  debounceRef.current = window.setTimeout(() => setDebouncedQ(e.target.value), 400);
                }}
                placeholder="Search prompts & topics…"
                className="pl-9"
                aria-label="Search topics"
              />
            </div>
            {data && data.total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingClear(true)}
                disabled={clearTopics.isPending}
                className="shrink-0 text-muted hover:bg-danger-bg hover:text-danger"
              >
                <Trash2 size={14} /> <span className="hidden sm:inline">Clear all</span>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="w-auto">
              <option value="">All topics</option>
              <option value="saved">Saved only</option>
            </Select>
            <Select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="w-auto">
              <option value="">Any level</option>
              {meta?.levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
            <Select value={discipline} onChange={(e) => { setDiscipline(e.target.value); setPage(1); }} className="w-auto">
              <option value="">Any discipline</option>
              {meta?.disciplines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw size={13} /> Reset
              </Button>
            )}
            {data && (
              <span className="ml-auto text-[13px] text-muted-foreground">
                {data.total} {data.total === 1 ? "project set" : "project sets"}
              </span>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="px-4 py-4">
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
      )}
      {isError && (
        <EmptyState
          eyebrow="Something went wrong"
          title="Couldn't load your history"
          body="Check your connection and try loading it again."
          actions={
            <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
          }
        />
      )}
      {data && data.items.length === 0 && (
        <EmptyState
          eyebrow={hasFilters ? "No matches" : "No topics yet"}
          title={hasFilters ? "Nothing matches those filters" : "Your history is empty"}
          body={hasFilters
            ? "Try a different search or reset the filters to see everything."
            : "Generate your first set of topics and they'll show up here — ready to search, save and open as projects."}
          actions={
            hasFilters
              ? <Button variant="secondary" size="sm" onClick={resetFilters}>Reset filters</Button>
              : <ButtonLink to="/generate-topics?new=1" size="sm">Generate topics</ButtonLink>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
          {data.items.map((t) => <TopicRow key={t.id} topic={t} />)}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="self-center text-[13px] text-muted">Page {page} of {data.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        onConfirm={() => {
          clearTopics.mutate();
          setConfirmingClear(false);
        }}
        title="Clear ALL topic history?"
        description="This removes every generated topic set. This can't be undone."
        confirmLabel="Clear everything"
        danger
        busy={clearTopics.isPending}
      />
    </>
  );
}
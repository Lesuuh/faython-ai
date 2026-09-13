import { useTopics } from "@/lib/hooks";
import { TopicRow } from "@/components/TopicRow";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSaved() {
  const { data, isLoading } = useTopics({ filter: "saved", page: 1, limit: 50 });

  return (
    <>
      <PageHeader
        title="Saved topics"
        description="Your collection of research topics, ready when you are."
      />

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
      {data && data.items.length === 0 && (
        <EmptyState
          eyebrow="Nothing saved yet"
          title="Your saved topics will live here"
          body="You haven't saved any topics yet. Grab the ones you like from the chat."
          actions={
            <ButtonLink to="/generate-topics?new=1" size="sm">Generate topics</ButtonLink>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-4 text-[13px] text-muted-foreground">
            {data.total} {data.total === 1 ? "saved topic set" : "saved topic sets"}
          </p>
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
            {data.items.map((t) => <TopicRow key={t.id} topic={t} showItems />)}
          </div>
        </>
      )}
    </>
  );
}
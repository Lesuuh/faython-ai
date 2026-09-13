import { useTopics } from "@/lib/hooks";
import { TopicCard } from "@/components/TopicCard";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";

export function DashboardSaved() {
  const { data, isLoading } = useTopics({ filter: "saved", page: 1, limit: 50 });

  return (
    <>
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Saved topics</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">Your collection of research topics, ready when you are.</p>

      {isLoading && (
        <div className="flex justify-center p-8"><span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" /></div>
      )}
      {data && data.items.length === 0 && (
        <div className="rounded-lg border border-border bg-background p-8" style={{ textAlign: "center" }}>
          <Bookmark size={28} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
          <p className="text-muted text-[13px]">
            You haven't saved any topics yet. Grab the ones you like from the chat.
          </p>
          <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm mt-2">
            Generate topics
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data?.items.map((t) => <TopicCard key={t.id} topic={t} />)}
      </div>
    </>
  );
}
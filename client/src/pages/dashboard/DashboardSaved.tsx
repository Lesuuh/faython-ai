import { useTopics } from "@/lib/hooks";
import { TopicCard } from "@/components/TopicCard";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";

export function DashboardSaved() {
  const { data, isLoading } = useTopics({ filter: "saved", page: 1, limit: 50 });

  return (
    <>
      <div className="dash-title">Saved topics</div>
      <p className="dash-sub">Your collection of research topics, ready when you are.</p>

      {isLoading && (
        <div className="loader-row"><span className="spinner" /></div>
      )}
      {data && data.items.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <Bookmark size={28} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
          <p className="muted text-sm">
            You haven't saved any topics yet. Grab the ones you like from the chat.
          </p>
          <Link to="/generate-topics" className="btn btn-primary btn-sm mt-2">
            Generate topics
          </Link>
        </div>
      )}

      <div className="topic-list">
        {data?.items.map((t) => <TopicCard key={t.id} topic={t} />)}
      </div>
    </>
  );
}
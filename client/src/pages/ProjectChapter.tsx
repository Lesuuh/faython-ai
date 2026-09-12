import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lock, Unlock, RefreshCw } from "lucide-react";
import { useTopicDetail, useGenerateChapter, useGenerateChapterOne, chapterTitle } from "@/lib/hooks";

export function ProjectChapter() {
  const { id = "", chapterNum = "1" } = useParams();
  const num = Number(chapterNum);
  const { data, isLoading } = useTopicDetail(id);
  const gen = useGenerateChapter(id);
  const genOne = useGenerateChapterOne(id);
  const requested = useRef(false);

  const topic = data?.topic;
  const chapter = topic?.chapters.find((c) => c.chapterNumber === num);
  const unlocked = (topic?.entitlement?.unlockedChapters ?? 0) >= 5;
  const allowed = num === 1 || unlocked;
  const pending = num === 1 ? genOne.isPending : gen.isPending;

  const run = (opts?: { onError?: (err: Error) => void }) => {
    requested.current = true;
    if (num === 1) genOne.mutate(undefined, opts);
    else gen.mutate(num, opts);
  };

  useEffect(() => {
    if (!topic || chapter || !allowed || requested.current) return;
    run({ onError: (err) => toast.error(err.message || "Could not generate chapter.") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, chapter, allowed, num]);

  if (isLoading) {
    return (
      <div className="loader-row" style={{ minHeight: "60vh" }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to={`/project/${id}`} className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} /> Project
          </Link>
          <span className="dash-brand" style={{ margin: 0 }}>
            <span className="logo">F</span>
            Chapter {num}
          </span>
          <span />
        </div>
      </header>

      <main className="container" style={{ padding: "2rem 1.5rem", maxWidth: 800 }}>
        <p className="section-eyebrow" style={{ marginBottom: "0.25rem" }}>
          Chapter {num}
        </p>
        <h1 style={{ fontSize: "1.7rem", marginBottom: "1.25rem" }}>{chapterTitle(num)}</h1>

        {!allowed && (
          <div className="paywall-banner">
            <Lock size={16} />
            <div className="grow">
              <strong>This chapter is locked</strong>
              <div className="muted text-sm">Unlock Chapters Two to Five for this project.</div>
            </div>
            <Link to={`/project/${id}`} className="btn btn-primary">
              <Unlock size={15} /> Unlock
            </Link>
          </div>
        )}

        {allowed && pending && (
          <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div className="loader-row">
              <span className="spinner" />
            </div>
            <p className="muted text-sm" style={{ marginTop: "0.75rem" }}>
              Writing Chapter {num} — this can take up to a minute…
            </p>
          </div>
        )}

        {allowed && !pending && chapter && (
          <>
            <article className="chapter-content card">
              {chapter.content.split("\n").map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : null,
              )}
            </article>
            <div className="row" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  run({ onError: (err) => toast.error(err.message || "Could not regenerate.") })
                }
              >
                <RefreshCw size={14} /> Regenerate
              </button>
              <Link to={`/project/${id}`} className="btn btn-ghost btn-sm">
                Back to project
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
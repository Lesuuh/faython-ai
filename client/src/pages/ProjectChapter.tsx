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
      <div className="flex justify-center p-8" style={{ minHeight: "60vh" }}>
        <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100vh] flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-[12px]">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5 flex items-center justify-between gap-6 h-[68px]">
          <Link to={`/project/${id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
            <ArrowLeft size={15} /> Project
          </Link>
          <span className="mb-6 flex items-center gap-2.5 text-base font-medium tracking-[-0.02em]" style={{ margin: 0 }}>
            <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm bg-foreground text-[14px] font-bold text-background">F</span>
            Chapter {num}
          </span>
          <span />
        </div>
      </header>

      <main className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5" style={{ padding: "2rem 1.5rem", maxWidth: 800 }}>
        <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4" style={{ marginBottom: "0.25rem" }}>
          Chapter {num}
        </p>
        <h1 style={{ fontSize: "1.7rem", marginBottom: "1.25rem" }}>{chapterTitle(num)}</h1>

        {!allowed && (
          <div className="mt-5 flex items-center gap-3.5 rounded-lg border border-primary-border bg-primary-soft p-5">
            <Lock size={16} />
            <div className="flex-1">
              <strong>This chapter is locked</strong>
              <div className="text-muted text-[13px]">Unlock Chapters Two to Five for this project.</div>
            </div>
            <Link to={`/project/${id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed">
              <Unlock size={15} /> Unlock
            </Link>
          </div>
        )}

        {allowed && pending && (
          <div className="rounded-lg border border-border bg-background p-8" style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div className="flex justify-center p-8">
              <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <p className="text-muted text-[13px]" style={{ marginTop: "0.75rem" }}>
              Writing Chapter {num} — this can take up to a minute…
            </p>
          </div>
        )}

        {allowed && !pending && chapter && (
          <>
            <article className="text-foreground text-[15px] leading-[1.8] rounded-lg border border-border bg-background p-8">
              {chapter.content.split("\n").map((line, i) =>
                line.trim() ? <p key={i} className="mb-3.5">{line}</p> : null,
              )}
            </article>
            <div className="flex items-center gap-2.5" style={{ marginTop: "1rem" }}>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm"
                onClick={() =>
                  run({ onError: (err) => toast.error(err.message || "Could not regenerate.") })
                }
              >
                <RefreshCw size={14} /> Regenerate
              </button>
              <Link to={`/project/${id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
                Back to project
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
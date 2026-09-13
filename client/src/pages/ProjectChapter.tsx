import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lock, RefreshCw, Unlock } from "lucide-react";
import { useTopicDetail, useGenerateChapter, useGenerateChapterOne, chapterTitle } from "@/lib/hooks";
import { ProductHeader } from "@/components/ProductHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

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
    run({ onError: (err) => toast.error(err.message || "Could not generate chapter. Try again.") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, chapter, allowed, num]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <ProductHeader back={{ to: `/project/${id}`, label: "Project" }} />
        <main className="mx-auto w-full max-w-[800px] flex-1 px-5 py-6 sm:px-6 sm:py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-72 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ProductHeader
        back={{ to: `/project/${id}`, label: "Project" }}
        right={
          <ButtonLink to="/generate-topics?new=1" variant="muted" size="sm" className="hidden sm:inline-flex">
            New topic
          </ButtonLink>
        }
      />

      <main className="mx-auto w-full max-w-[800px] flex-1 px-5 py-6 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Chapter {num}
          </p>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em]">{chapterTitle(num)}</h1>
        </div>

        {!allowed && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-primary-border bg-primary-soft p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Lock size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">This chapter is locked</div>
              <div className="mt-0.5 text-[13px] text-muted">
                Unlock Chapters Two to Five for this project to write it.
              </div>
            </div>
            <ButtonLink to={`/project/${id}`} size="sm">
              <Unlock size={14} /> Unlock
            </ButtonLink>
          </div>
        )}

        {allowed && pending && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background px-4 py-16 text-center">
            <Spinner size={26} />
            <p className="mt-4 text-sm text-muted">
              Writing Chapter {num} — this can take up to a minute…
            </p>
          </div>
        )}

        {allowed && !pending && chapter && (
          <>
            <article className="rounded-lg border border-border bg-background p-6 text-[15px] leading-[1.8] text-foreground sm:p-8">
              {chapter.content.split("\n").map((line, i) =>
                line.trim() ? (
                  <p key={i} className="mb-3.5 last:mb-0">
                    {line}
                  </p>
                ) : null,
              )}
            </article>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Button
                variant="secondary"
                onClick={() =>
                  run({ onError: (err) => toast.error(err.message || "Could not regenerate. Try again.") })
                }
              >
                {pending ? <Spinner size={15} /> : <RefreshCw size={14} />} Regenerate
              </Button>
              <ButtonLink to={`/project/${id}`} variant="muted">
                <ArrowLeft size={14} /> Back to project
              </ButtonLink>
              {chapterNum === "1" && (
                <Link to={`/project/${id}/chapter/2`} className="ml-auto text-sm font-medium text-primary hover:underline">
                  Next: {chapterTitle(2)}
                </Link>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
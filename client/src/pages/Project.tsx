import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, Lock, Sparkles, Unlock } from "lucide-react";
import {
  useTopicDetail,
  useTopicMessages,
  useInitiatePayment,
  useUsage,
  chapterTitle,
  extractTopicItems,
} from "@/lib/hooks";
import { useProjectProfile } from "@/lib/project-profile";
import { FREE_CHAPTERS_PER_DAY, UNLOCK_PRICE } from "@/lib/limits";
import { ProductHeader } from "@/components/ProductHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { cx } from "@/lib/cx";

export function Project() {
  const { id = "" } = useParams();
  const { data, isLoading, isError, refetch } = useTopicDetail(id);
  const { data: messagesData, isLoading: messagesLoading } = useTopicMessages(id);
  const { data: usageData } = useUsage();
  const initiate = useInitiatePayment();
  const { profile } = useProjectProfile();

  const [paying, setPaying] = useState(false);

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="flex flex-col items-center px-4 py-16 text-center">
          <p className="text-[15px] font-medium">Couldn't load this project.</p>
          <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
          <div className="mt-5 flex gap-2.5">
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
            <ButtonLink to="/dashboard" variant="muted">
              Back to dashboard
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  const { topic } = data;
  const generatedChapters = new Map(topic.chapters.map((c) => [c.chapterNumber, c]));
  const unlocked = (topic.entitlement?.unlockedChapters ?? 0) >= 5;
  const usage = usageData?.usage ?? { topics: 0, chapterOne: 0 };
  const chapterOneRemaining = Math.max(0, FREE_CHAPTERS_PER_DAY - usage.chapterOne);
  const items = extractTopicItems(topic.reply);
  const profileChips = [
    profile.university && `University: ${profile.university}`,
    profile.course && `Course: ${profile.course}`,
    profile.level && `Level: ${profile.level}`,
    profile.referencingStyle && `Style: ${profile.referencingStyle}`,
  ].filter(Boolean) as string[];

  async function onUnlock() {
    setPaying(true);
    try {
      const result = await initiate.mutateAsync(id);
      window.location.href = result.authorizationUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment. Try again.");
      setPaying(false);
    }
  }

  return (
    <Shell backLabel="Dashboard" backTo="/dashboard">
      {/* Topic */}
      <section className="card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border bg-surface text-foreground">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold leading-snug tracking-[-0.02em]">{topic.prompt}</h1>
            <p className="mt-1.5 text-[13px] text-muted">
              {topic.level || "Level: any"} · {topic.discipline || "Discipline: any"} ·{" "}
              {new Date(topic.createdAt).toLocaleString()}
            </p>
            <div className="mt-4 text-sm leading-[1.7] whitespace-pre-wrap text-foreground">
              {items.length > 0 ? (
                <ol className="grid gap-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="tabular-nums text-muted">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div>{topic.reply}</div>
              )}
            </div>
            {profileChips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profileChips.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chapters */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold tracking-[-0.02em]">Chapters</h2>
        <Badge variant={unlocked ? "primary" : "soft"}>
          {unlocked ? (
            <>
              <Unlock size={12} /> Unlocked
            </>
          ) : (
            "Ch. 1 free"
          )}
        </Badge>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {[1, 2, 3, 4, 5].map((num) => {
          const ch = generatedChapters.get(num);
          const isOne = num === 1;
          const available = isOne || unlocked;
          return (
            <div
              key={num}
              className={cx(
                "flex flex-wrap items-center gap-3 rounded-lg border p-4",
                available ? "border-border bg-background" : "border-border bg-surface",
              )}
            >
              <div
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[13px] font-bold",
                  available
                    ? "border border-primary-border bg-primary-soft text-primary"
                    : "border border-border bg-background text-muted",
                )}
              >
                {num}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{chapterTitle(num)}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {ch
                    ? `Generated ${new Date(ch.generatedAt).toLocaleString()}`
                    : available
                      ? isOne
                        ? `Free · ${chapterOneRemaining} left today`
                        : "Unlocked — ready to write"
                      : "Locked · included in the one-time unlock"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {ch ? (
                  <ButtonLink to={`/project/${id}/chapter/${num}`} variant="secondary" size="sm">
                    <CheckCircle2 size={14} /> View
                  </ButtonLink>
                ) : available ? (
                  <ButtonLink to={`/project/${id}/chapter/${num}`} size="sm">
                    <Sparkles size={14} /> {isOne ? "Generate" : "Write"}
                  </ButtonLink>
                ) : (
                  <Button size="sm" onClick={onUnlock} disabled={paying}>
                    {paying ? <Spinner size={14} /> : <Unlock size={14} />}
                    Unlock {UNLOCK_PRICE}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlock banner */}
      {!unlocked && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-lg border border-primary-border bg-primary-soft p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Lock size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Unlock Chapters Two to Five</div>
            <div className="mt-0.5 text-[13px] text-muted">
              One-time payment of {UNLOCK_PRICE} for this project. You'll keep everything forever.
            </div>
          </div>
          <Button onClick={onUnlock} disabled={paying}>
            {paying ? <Spinner size={15} /> : <Unlock size={15} />} Pay now
          </Button>
        </div>
      )}

      {/* Conversation */}
      <h2 className="mt-8 text-base font-bold tracking-[-0.02em]">Conversation</h2>
      <div className="mt-3 rounded-lg border border-border bg-background p-4 sm:p-6">
        {messagesLoading && (
          <div className="flex justify-center p-6">
            <Spinner size={22} />
          </div>
        )}
        {messagesData && messagesData.messages.length === 0 && (
          <p className="text-sm text-muted">No saved conversation for this project.</p>
        )}
        {messagesData?.messages.map((m) => (
          <div key={m.id} className="mb-2.5 rounded-md border border-border bg-surface px-4 py-3.5 text-sm leading-[1.65]">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              {m.role === "USER" ? "You" : "Faython"}
            </span>
            <span className="whitespace-pre-wrap">{m.content}</span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Shell({
  children,
  backLabel,
  backTo,
}: {
  children: React.ReactNode;
  backLabel?: string;
  backTo?: string;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ProductHeader
        {...(backLabel && backTo ? { back: { to: backTo, label: backLabel } } : {})}
        right={
          <ButtonLink to="/generate-topics?new=1" variant="muted" size="sm" className="hidden sm:inline-flex">
            New topic
          </ButtonLink>
        }
      />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-5 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
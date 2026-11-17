import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen, MessageSquare, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { chapterMessages, intakeSummary, scopeLabel } from "@/lib/project-store";
import { cx } from "@/lib/cx";

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function Home() {
  const { user, appUser } = useAuth();
  const { projects } = useProject();

  const name = user?.user_metadata?.full_name || appUser?.name || "";
  const first = name.trim().split(" ")[0];
  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[860px] px-5 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
          {first ? `Welcome back, ${first}` : "Welcome to Faython Scholar"}
        </h1>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">
          Every project is its own conversation. Set up the topic once, then write chapters and
          ask questions in the same thread.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <ButtonLink to="/new" size="lg">
            Start a new project <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink to="/projects" variant="muted" size="lg">
            <FolderOpen size={16} /> My Projects
          </ButtonLink>
        </div>

        {recent.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Jump back in
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {recent.map((p) => {
                const written = chapterMessages(p.messages).length;
                const total = p.chapters.length;
                const summary = intakeSummary(p.intake);
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={cx(
                      "group flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors",
                      "hover:border-primary-border hover:bg-primary-soft/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
                        {p.title}
                      </h3>
                      <ArrowRight
                        size={15}
                        className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>

                    {summary.length > 0 && (
                      <p className="mt-1.5 line-clamp-1 text-[13px] text-muted">
                        {scopeLabel(p.intake.scope)} · {summary[0] || p.intake.discipline}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3 text-[12px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquare size={13} /> {p.messages.length} message
                        {p.messages.length === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={13} /> {written}/{total} chapters
                      </span>
                      <span className="ml-auto">{relativeDate(p.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border px-5 py-10 text-center">
            <Sparkles size={20} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-[15px] font-semibold text-foreground">No projects yet</p>
            <p className="mx-auto mt-1.5 max-w-[48ch] text-[13px] leading-relaxed text-muted">
              Start a new project, answer a few questions about your scope, and Faython will
              propose topics you can build on.
            </p>
            <ButtonLink to="/new" variant="secondary" className="mt-5">
              Start a new project
            </ButtonLink>
          </div>
        )}
      </div>
    </main>
  );
}

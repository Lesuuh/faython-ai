import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  FileText,
  FolderOpen,
  Plus,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
// import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/context/ProjectContext";
import { loadAppSettings } from "@/lib/settings-store";
import { cx } from "@/lib/cx";
import { useAuth } from "@/hooks/useAuth";

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
  const { userSession, user } = useAuth();
  const { projects } = useProject();

  console.log(userSession);
  console.log(user);

  const name = loadAppSettings().general.displayName || user?.name || "";
  const first = name.trim().split(" ")[0];
  const recent = [...projects]
    .filter((project) => project.status !== "archived")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[900px] flex-col px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="mx-auto flex w-full max-w-[640px] flex-col items-center py-8 text-center sm:py-14">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
            <Sparkles size={21} />
          </span>
          <p className="mt-5 text-sm font-medium text-muted">
            {first
              ? `Welcome back, ${first}`
              : "Your academic research workspace"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
            What are you researching?
          </h1>
          <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted">
            Start a research project with Faython. Develop your topic, explore
            ideas and work on your chapters at your own pace.
          </p>
          <ButtonLink to="/new" size="lg" className="mt-7">
            <Plus size={17} /> Start a project
          </ButtonLink>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <FolderOpen size={15} /> Browse all projects
          </Link>
        </section>

        <section className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Recent projects
              </h2>
              <p className="mt-1 text-sm text-muted">
                Pick up where you left off.
              </p>
            </div>
            {projects.length > 0 && (
              <ButtonLink to="/projects" variant="muted" size="sm">
                View all <ArrowRight size={14} />
              </ButtonLink>
            )}
          </div>

          {recent.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {recent.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={cx(
                    "group flex min-h-[112px] flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-colors",
                    "hover:border-primary-border hover:bg-primary-soft/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {project.title}
                    </h3>
                    <ArrowRight
                      size={15}
                      className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText size={13} />
                      {project.documents?.length ?? 0} documents
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {relativeDate(project.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Your projects will appear here
              </p>
              <p className="mt-1 text-sm text-muted">
                Create a project to keep your research and conversations
                together.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

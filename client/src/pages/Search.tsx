import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, FileText, FolderOpen, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProject } from "@/context/ProjectContext";
import { formatDate } from "@/lib/format";
import type { Project } from "@/lib/project-store";

function projectSearchText(project: Project): string {
  return [
    project.title,
    project.description,
    project.researchTopic,
    project.institution,
    project.department,
    project.course,
    project.intake.discipline,
    project.intake.keywords,
    project.intake.scopeNotes,
    ...(project.conversations ?? []).flatMap((conversation) => [
      conversation.title,
      ...conversation.messages.map((message) => message.content),
    ]),
    ...(project.documents ?? []).flatMap((document) => [document.title, document.content]),
    ...(project.files ?? []).map((file) => file.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function Search() {
  const { projects } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);

  useEffect(() => {
    setInput(query);
  }, [query]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return projects.filter((project) => projectSearchText(project).includes(term));
  }, [projects, query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = input.trim();
    setSearchParams(next ? { q: next } : {});
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[820px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Search"
          description="Find projects, conversations, files and saved research documents."
        />
        <form onSubmit={submitSearch} role="search" className="mt-6 flex gap-2">
          <label htmlFor="project-search" className="sr-only">
            Search projects and research
          </label>
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="project-search"
              type="search"
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search projects, conversations, documents…"
              className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <Button type="submit" disabled={!input.trim()}>
            Search
          </Button>
        </form>

        <section className="mt-8" aria-live="polite">
          {!query.trim() ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <SearchIcon size={20} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Search your research workspace</p>
              <p className="mt-1 text-sm text-muted">
                Try a project title, topic, conversation, file name or document text.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <FolderOpen size={20} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">No results for “{query}”</p>
              <p className="mt-1 text-sm text-muted">Try another title or keyword.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-medium text-muted">
                {results.length} project{results.length === 1 ? "" : "s"} found
              </p>
              <div className="grid gap-3">
                {results.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary-border hover:bg-primary-soft/30 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-soft text-primary">
                        <FolderOpen size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="text-sm font-semibold text-foreground">{project.title}</span>
                          <ArrowRight
                            size={15}
                            className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </span>
                        <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-muted">
                          {project.description || project.researchTopic || project.intake.discipline}
                        </span>
                        <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Updated {formatDate(project.updatedAt)}</span>
                          <span>{project.conversations?.length ?? 0} conversations</span>
                          <span className="inline-flex items-center gap-1">
                            <FileText size={12} /> {project.documents?.length ?? 0} documents
                          </span>
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUp, BookOpen, Lightbulb, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { uid } from "@/lib/ids";
import { loadProfile, REFERENCING_STYLES } from "@/lib/profile-store";
import {
  intakeFromProfile,
  LEVEL_OPTIONS,
  SCOPE_OPTIONS,
  type ProjectIntake,
  type TopicSuggestion,
} from "@/lib/project-store";
import { cx } from "@/lib/cx";

const STARTER_IDEAS = [
  "Social media and student focus",
  "Renewable energy in residential buildings",
  "Employee motivation and productivity",
];

export function NewProject() {
  const { user } = useAuth();
  const { addProject } = useProject();
  const navigate = useNavigate();
  const userId = user?.id ?? null;

  const [intake, setIntake] = useState<ProjectIntake | null>(null);
  const [topic, setTopic] = useState("");
  const [contextOpen, setContextOpen] = useState(false);

  useEffect(() => {
    setIntake(intakeFromProfile(loadProfile(userId)));
  }, [userId]);

  if (!intake) return null;
  const currentIntake = intake;

  function set<K extends keyof ProjectIntake>(key: K, value: ProjectIntake[K]) {
    setIntake((current) => (current ? { ...current, [key]: value } : current));
  }

  function startProject() {
    const researchTopic = topic.trim();
    if (!researchTopic) return;

    const projectIntake: ProjectIntake = {
      ...currentIntake,
      keywords: currentIntake.keywords.trim() || researchTopic,
    };
    const ideas: TopicSuggestion[] = [
      { id: uid(), title: researchTopic, rationale: "" },
    ];
    const profile = loadProfile(userId);
    const project = addProject({
      title: researchTopic,
      intake: projectIntake,
      suggestions: ideas,
      chapterNames: profile.chapterNames,
    });

    toast.success("Your research workspace is ready");
    navigate(`/projects/${project.id}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      startProject();
    }
  }

  const hasContext = Boolean(
    intake.institution.trim() ||
      intake.department.trim() ||
      intake.discipline.trim() ||
      intake.scopeNotes.trim() ||
      intake.keywords.trim() ||
      intake.constraints.trim(),
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[860px] flex-col px-5 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-4">
          <Button
            variant="muted"
            size="sm"
            onClick={() => navigate("/")}
            className="-ml-2"
          >
            <BookOpen size={15} /> Home
          </Button>
        </div>

        <section className="mx-auto flex w-full max-w-[680px] flex-col items-center pt-5 text-center sm:pt-12">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary">
            <Sparkles size={24} />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
          </div>
          <p className="mt-6 text-sm font-medium text-primary">A fresh space for your next big idea</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">
            Let’s start with your research
          </h1>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted">
            Share a topic, a question, or even a rough idea. Faython will open a workspace where you
            can explore it and build your research step by step.
          </p>

          <div className="mt-8 w-full rounded-2xl border border-border bg-surface p-2 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgb(157_140_255/0.14)]">
            <label className="sr-only" htmlFor="research-topic">
              Describe your research idea
            </label>
            <textarea
              id="research-topic"
              autoFocus
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I’m interested in researching…"
              rows={3}
              className="min-h-[108px] w-full resize-y bg-transparent px-3 py-3 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setContextOpen(true)}
              >
                <Plus size={15} /> Add context
                {hasContext && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Context added" />
                )}
              </Button>
              <Button onClick={startProject} disabled={!topic.trim()}>
                Create workspace <ArrowUp size={15} />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Press Enter to create · Shift + Enter for a new line</p>
        </section>

        <section className="mx-auto mt-10 w-full max-w-[680px]">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-muted">
            <Lightbulb size={14} className="text-primary" />
            Need a spark? Try one of these
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {STARTER_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setTopic(idea)}
                className={cx(
                  "rounded-full border border-border bg-surface px-3.5 py-2 text-left text-xs text-muted transition-colors",
                  "hover:border-primary-border hover:bg-primary-soft/50 hover:text-foreground",
                )}
              >
                {idea}
              </button>
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        title="Add research context"
        description="Give Faython more details to tailor your workspace. You can leave any of these fields blank."
        width="max-w-2xl max-h-[85dvh] overflow-y-auto"
        footer={
          <>
            <Button variant="muted" onClick={() => setContextOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setContextOpen(false)}>
              Save context
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Institution" htmlFor="institution">
              <Input
                id="institution"
                value={intake.institution}
                onChange={(event) => set("institution", event.target.value)}
                placeholder="Your university"
              />
            </Field>
            <Field label="Department or programme" htmlFor="department">
              <Input
                id="department"
                value={intake.department}
                onChange={(event) => set("department", event.target.value)}
                placeholder="Your department"
              />
            </Field>
            <Field label="Academic level" htmlFor="level">
              <Select
                id="level"
                value={intake.level}
                onChange={(event) => set("level", event.target.value as ProjectIntake["level"])}
              >
                <option value="">Select level</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Field of study" htmlFor="discipline">
              <Input
                id="discipline"
                value={intake.discipline}
                onChange={(event) => set("discipline", event.target.value)}
                placeholder="e.g. Psychology"
              />
            </Field>
            <fieldset className="sm:col-span-2">
              <Label>Research scope</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {SCOPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => set("scope", option.value)}
                    aria-pressed={intake.scope === option.value}
                    className={cx(
                      "rounded-lg border px-3.5 py-3 text-left transition-colors",
                      intake.scope === option.value
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-background hover:border-muted-foreground/40",
                    )}
                  >
                    <span className="block text-[13px] font-semibold text-foreground">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <Field
              label="Scope details"
              htmlFor="scope-notes"
              hint="Population, location or timeframe, if known."
              className="sm:col-span-2"
            >
              <Textarea
                id="scope-notes"
                value={intake.scopeNotes}
                onChange={(event) => set("scopeNotes", event.target.value)}
                placeholder="e.g. Final-year students at my university, 2023–2026"
              />
            </Field>
            <Field label="Referencing style" htmlFor="referencing-style">
              <Select
                id="referencing-style"
                value={intake.referencingStyle}
                onChange={(event) => set("referencingStyle", event.target.value)}
              >
                {REFERENCING_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Keywords" htmlFor="keywords">
              <Input
                id="keywords"
                value={intake.keywords}
                onChange={(event) => set("keywords", event.target.value)}
                placeholder="Key concepts or terms"
              />
            </Field>
            <Field
              label="Constraints (optional)"
              htmlFor="constraints"
              hint="Method, data access or other requirements."
              className="sm:col-span-2"
            >
              <Textarea
                id="constraints"
                value={intake.constraints}
                onChange={(event) => set("constraints", event.target.value)}
                placeholder="e.g. Survey-based study, limited to 100 respondents"
              />
            </Field>
            <div className="flex justify-end sm:col-span-2">
              <p className="text-xs text-muted">
                {hasContext ? "Context is saved for this project." : "No context added yet."}
              </p>
            </div>
        </div>
      </Modal>
    </main>
  );
}

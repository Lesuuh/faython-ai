import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Lightbulb, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { generationCost, generationLabel, generateTopicIdeas, useGenerationGuard } from "@/lib/generation";
import { deductTokens } from "@/lib/token-store";
import { loadProfile, REFERENCING_STYLES } from "@/lib/profile-store";
import {
  intakeFromProfile,
  LEVEL_OPTIONS,
  SCOPE_OPTIONS,
  type ProjectIntake,
  type TopicSuggestion,
} from "@/lib/project-store";
import { cx } from "@/lib/cx";

type Step = "details" | "ideas";

export function NewProject() {
  const { user } = useAuth();
  const { addProject } = useProject();
  const preflight = useGenerationGuard();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("details");
  const [intake, setIntake] = useState<ProjectIntake | null>(null);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.id ?? null;

  useEffect(() => {
    setIntake(intakeFromProfile(loadProfile(userId)));
  }, [userId]);

  if (!intake) return null;

  function set<K extends keyof ProjectIntake>(key: K, value: ProjectIntake[K]) {
    setIntake((current) => (current ? { ...current, [key]: value } : current));
  }

  const missing = [
    !intake.institution.trim() && "institution",
    !intake.department.trim() && "department",
    !intake.level && "level",
    !intake.discipline.trim() && "discipline",
    !intake.keywords.trim() && "keywords",
  ].filter(Boolean) as string[];

  async function handleGenerate() {
    if (missing.length) {
      setError("Fill in the highlighted details before generating topics.");
      return;
    }
    const pass = preflight("topics");
    if (!pass) return;

    setBusy(true);
    setError("");
    try {
      const ideas = await generateTopicIdeas(intake as ProjectIntake);
      setSuggestions(ideas);
      setStep("ideas");
      try {
        deductTokens(pass.userId, pass.planId, pass.cost, "topics", generationLabel("topics"));
      } catch {
        /* already checked in preflight */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate topics. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleChoose(suggestion: TopicSuggestion) {
    const profile = loadProfile(userId);
    const project = addProject({
      title: suggestion.title,
      intake: intake as ProjectIntake,
      suggestions,
      chapterNames: profile.chapterNames,
    });
    toast.success("Project created", { description: suggestion.title });
    navigate(`/projects/${project.id}`);
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[720px] px-5 py-8 sm:px-6 lg:px-8">
        {step === "details" ? (
          <>
            <PageHeader
              title="Start a new project"
              description="Tell Faython about your academic context. The more precise this is, the tighter the topics and chapters."
            />

            <div className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Institution" htmlFor="institution">
                  <Input
                    id="institution"
                    value={intake.institution}
                    onChange={(e) => set("institution", e.target.value)}
                    placeholder="University of Port Harcourt"
                  />
                </Field>
                <Field label="Department / programme" htmlFor="department">
                  <Input
                    id="department"
                    value={intake.department}
                    onChange={(e) => set("department", e.target.value)}
                    placeholder="Computer Science"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Academic level" htmlFor="level">
                  <Select
                    id="level"
                    value={intake.level}
                    onChange={(e) =>
                      set("level", e.target.value as ProjectIntake["level"])
                    }
                  >
                    <option value="">Select level</option>
                    {LEVEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Field of study" htmlFor="discipline">
                  <Input
                    id="discipline"
                    value={intake.discipline}
                    onChange={(e) => set("discipline", e.target.value)}
                    placeholder="Environmental Health Science"
                  />
                </Field>
              </div>

              <fieldset>
                <Label>Scope of study</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SCOPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => set("scope", option.value)}
                      aria-pressed={intake.scope === option.value}
                      className={cx(
                        "rounded-lg border px-4 py-3 text-left transition-colors",
                        intake.scope === option.value
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-surface hover:border-muted-foreground/40",
                      )}
                    >
                      <span className="block text-[14px] font-semibold text-foreground">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Scope details"
                htmlFor="scopeNotes"
                hint="Population, place, or time frame you're working with."
              >
                <Textarea
                  id="scopeNotes"
                  value={intake.scopeNotes}
                  onChange={(e) => set("scopeNotes", e.target.value)}
                  placeholder="Final-year students of the Department, 2023–2026 cohort."
                />
              </Field>

              <Field
                label="Keywords / area of interest"
                htmlFor="keywords"
                hint="A few words. Faython builds the topic titles around these."
              >
                <Input
                  id="keywords"
                  value={intake.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="waste management, campus hostels, student behaviour"
                />
              </Field>

              <Field label="Referencing style" htmlFor="referencingStyle">
                <Select
                  id="referencingStyle"
                  value={intake.referencingStyle}
                  onChange={(e) => set("referencingStyle", e.target.value)}
                >
                  {REFERENCING_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Constraints (optional)"
                htmlFor="constraints"
                hint="Method limits, data you can access, page expectations."
              >
                <Textarea
                  id="constraints"
                  value={intake.constraints}
                  onChange={(e) => set("constraints", e.target.value)}
                  placeholder="Must be empirical. Survey of at most 120 respondents. No lab work."
                />
              </Field>

              {error && (
                <p role="alert" className="rounded-md border border-danger-border bg-danger-bg px-4 py-3 text-[13px] text-danger">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <Button onClick={() => void handleGenerate()} disabled={busy}>
                  {busy ? <Spinner size={16} /> : <Sparkles size={15} />}
                  {busy ? "Generating topics…" : "Generate topic ideas"}
                </Button>
                <span className="text-[12px] text-muted">
                  {generationCost("topics").toLocaleString()} tokens
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={14} /> Edit details
            </button>

            <PageHeader
              title="Pick a topic"
              description="These are scoped to the details you gave. Choose one and Faython sets up the project around it."
            />

            <div className="mt-8 grid gap-3">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-border bg-surface p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Lightbulb size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold leading-snug text-foreground">
                        {s.title}
                      </p>
                      {s.rationale && (
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                          {s.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={() => handleChoose(s)}>
                      Use this topic
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => void handleGenerate()} disabled={busy}>
                {busy ? <Spinner size={15} /> : <Sparkles size={15} />}
                Generate different topics
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

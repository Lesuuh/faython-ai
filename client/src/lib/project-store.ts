import { uid, slugify } from "./ids";
import {
  DEFAULT_PROFILE,
  type AcademicLevel,
  type ResearchProfile,
} from "./profile-store";

export type ProjectScope = "local" | "regional" | "national" | "international";

export const SCOPE_OPTIONS: { value: ProjectScope; label: string; hint: string }[] = [
  { value: "local", label: "Local / community", hint: "A campus, town or community" },
  { value: "regional", label: "State / region", hint: "A state or geopolitical zone" },
  { value: "national", label: "National", hint: "Country-wide data or policy" },
  { value: "international", label: "International", hint: "Cross-border or comparative" },
];

export const LEVEL_OPTIONS: { value: AcademicLevel; label: string }[] = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "phd", label: "PhD" },
];

/** Everything the model needs to scope a project. Captured once, per project. */
export type ProjectIntake = {
  institution: string;
  department: string;
  level: AcademicLevel;
  discipline: string;
  scope: ProjectScope;
  scopeNotes: string;
  referencingStyle: string;
  keywords: string;
  constraints: string;
};

export const EMPTY_INTAKE: ProjectIntake = {
  institution: "",
  department: "",
  level: "",
  discipline: "",
  scope: "local",
  scopeNotes: "",
  referencingStyle: DEFAULT_PROFILE.referencingStyle,
  keywords: "",
  constraints: "",
};

/** Prefill the intake from the student's saved profile. */
export function intakeFromProfile(profile: ResearchProfile): ProjectIntake {
  return {
    ...EMPTY_INTAKE,
    institution: profile.university,
    department: profile.course,
    level: profile.level,
    referencingStyle: profile.referencingStyle,
  };
}

export type TopicSuggestion = {
  id: string;
  title: string;
  rationale: string;
};

export type ChapterState = "idle" | "generating" | "done" | "error";

export type ProjectChapter = {
  number: number;
  title: string;
  content: string;
  state: ChapterState;
  instruction: string;
  updatedAt: string | null;
};

/** `question` is the student's message; the rest are Faython's replies. */
export type MessageKind = "question" | "answer" | "chapter";

export type ProjectMessage = {
  id: string;
  role: "user" | "assistant";
  kind: MessageKind;
  chapterNumber?: number;
  content: string;
  createdAt: string;
};

/** Latest message per chapter, oldest first — used for jump links and exports. */
export function chapterMessages(messages: ProjectMessage[]): ProjectMessage[] {
  const latest = new Map<number, ProjectMessage>();
  for (const m of messages) {
    if (m.kind === "chapter" && m.chapterNumber) latest.set(m.chapterNumber, m);
  }
  return [...latest.values()].sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0));
}

export type Project = {
  id: string;
  title: string;
  intake: ProjectIntake;
  suggestions: TopicSuggestion[];
  chapters: ProjectChapter[];
  messages: ProjectMessage[];
  createdAt: string;
  updatedAt: string;
};

export const CHAPTER_COUNT = 5;

export function blankChapters(names?: string[]): ProjectChapter[] {
  return Array.from({ length: CHAPTER_COUNT }, (_, i) => ({
    number: i + 1,
    title: names?.[i]?.trim() || DEFAULT_PROFILE.chapterNames[i],
    content: "",
    state: "idle" as ChapterState,
    instruction: "",
    updatedAt: null,
  }));
}

export function createProject(input: {
  title: string;
  intake: ProjectIntake;
  suggestions: TopicSuggestion[];
  chapterNames?: string[];
}): Project {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: input.title.trim(),
    intake: input.intake,
    suggestions: input.suggestions,
    chapters: blankChapters(input.chapterNames),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

const SCOPE_LABELS: Record<ProjectScope, string> = {
  local: "Local / community",
  regional: "State / region",
  national: "National",
  international: "International",
};

export const LEVEL_LABELS: Record<AcademicLevel, string> = {
  "": "",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  phd: "PhD",
};

export function scopeLabel(scope: ProjectScope): string {
  return SCOPE_LABELS[scope];
}

export function intakeSummary(intake: ProjectIntake): string[] {
  return [
    intake.institution.trim(),
    intake.department.trim(),
    LEVEL_LABELS[intake.level],
    intake.discipline.trim(),
    scopeLabel(intake.scope),
    intake.scopeNotes.trim(),
    intake.referencingStyle.trim(),
  ].filter(Boolean);
}

/** Chapter titles as one line, for prompts and headers. */
export function chapterPlan(chapters: ProjectChapter[]): string {
  return chapters.map((c) => `${c.number}. ${c.title}`).join(" · ");
}

export function generatedChapters(project: Project): ProjectChapter[] {
  return project.chapters.filter((c) => c.state === "done" && c.content);
}

export function projectFileName(project: Project): string {
  return slugify(project.title);
}

/**
 * Turns the model's free-text reply into selectable topic cards. Handles
 * "1. Title — why it works", "1) Title: why", "- Title — why" and bare titles.
 */
export function parseTopicSuggestions(text: string): TopicSuggestion[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const cleaned = lines
    .map((line) => line.replace(/^(\d+[.)]|[-*•])\s*/, "").trim())
    .filter((line) => line.length > 8);

  const suggestions = cleaned.map((line) => {
    const split = line.split(/\s+[—–:-]\s+/);
    const title = (split[0] || line).trim();
    const rationale = split.slice(1).join(" — ").trim();
    return { id: uid(), title, rationale };
  });

  if (suggestions.length) return suggestions.slice(0, 8);

  return [{ id: uid(), title: text.trim().slice(0, 120) || "Untitled topic", rationale: "" }];
}

/* ---------------------------------- storage --------------------------------- */

const LEGACY_KEY = "faython:conversations";

export function projectsKey(userId: string | null): string | null {
  return userId ? `faython:projects:${userId}` : null;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Project>;
  return typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.chapters);
}

/** Older projects stored assistant replies without a kind; infer it on read. */
function normalizeProject(project: Project): Project {
  const byContent = new Map(
    project.chapters.filter((c) => c.content).map((c) => [c.content, c.number]),
  );

  return {
    ...project,
    messages: (project.messages ?? []).map((m) => {
      if (m.kind) return m;
      const kind: MessageKind = m.role === "user" ? "question" : "answer";
      const chapterNumber = m.role === "assistant" ? byContent.get(m.content) : undefined;
      return { ...m, kind, ...(chapterNumber ? { chapterNumber } : {}) };
    }),
  };
}

export function loadProjects(userId: string | null): Project[] {
  const key = projectsKey(userId);
  if (!key) return [];

  let raw = readStorage(key);
  if (raw === null) {
    const legacy = readStorage(LEGACY_KEY);
    if (legacy !== null) {
      try {
        window.localStorage.setItem(key, legacy);
        window.localStorage.removeItem(LEGACY_KEY);
      } catch {
        // storage unavailable
      }
      raw = legacy;
    }
  }
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProject).map(normalizeProject);
  } catch {
    return [];
  }
}

export function persistProjects(userId: string | null, projects: Project[]): void {
  const key = projectsKey(userId);
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(projects));
  } catch {
    // storage unavailable — projects stay in memory only
  }
}

import { inferDiscipline, inferLevel } from "./infer.js";
import type { Intake } from "./schemas.js";

const SCOPE_TEXT: Record<Intake["scope"], string> = {
  local: "a single campus, community or town",
  regional: "one state or geopolitical zone",
  national: "country-wide data or policy",
  international: "cross-border or comparative data",
};

const LEVEL_TEXT: Record<string, string> = {
  undergraduate: "undergraduate",
  postgraduate: "postgraduate",
  phd: "PhD",
};

/** One line describing the academic context, reused by every workflow. */
export function describeIntake(intake: Intake): string {
  const parts = [
    intake.institution && `Institution: ${intake.institution}`,
    intake.department && `Department: ${intake.department}`,
    intake.level && LEVEL_TEXT[intake.level]
      ? `Level: ${LEVEL_TEXT[intake.level]}`
      : intake.level
        ? `Level: ${intake.level}`
        : "",
    intake.discipline && `Field: ${intake.discipline}`,
    `Scope: ${SCOPE_TEXT[intake.scope]}`,
    intake.scopeNotes && `Scope detail: ${intake.scopeNotes}`,
    intake.referencingStyle && `Referencing style: ${intake.referencingStyle}`,
    intake.keywords && `Interest: ${intake.keywords}`,
    intake.constraints && `Constraints: ${intake.constraints}`,
  ];
  return parts.filter(Boolean).join("\n");
}

/** Prompt for the topics workflow: intake in, a numbered list of topics out. */
export function buildTopicPrompt(intake: Intake): string {
  return [
    "Propose research project topics for the student described below.",
    "",
    describeIntake(intake),
    "",
    "Rules:",
    `- Match the academic level exactly (${LEVEL_TEXT[intake.level] || intake.level || "unspecified"}).`,
    `- Keep every topic inside the stated scope (${SCOPE_TEXT[intake.scope]}).`,
    "- Each topic must be researchable with the student's stated constraints.",
    "",
    "Return 6 topics, one per line, in this exact format:",
    "1. <topic title> — <one line on why it is doable and how it would be investigated>",
  ].join("\n");
}

/** Prompt for the chapter workflow, grounded in the project and earlier chapters. */
export function buildChapterPrompt(input: {
  topicTitle: string;
  intake: Intake;
  previousChapters: { number: number; title: string; content: string }[];
  instruction?: string;
  chapterTitle?: string;
}): string {
  const lines = [
    `Write a complete final-year project chapter.`,
    ``,
    `Project topic: ${input.topicTitle}`,
    input.chapterTitle ? `This chapter: ${input.chapterTitle}` : "",
    ``,
    describeIntake(input.intake),
  ].filter(Boolean);

  if (input.previousChapters.length) {
    lines.push(
      ``,
      `Chapters already accepted (stay consistent with them, do not repeat them):`,
      ...input.previousChapters.map(
        (c) => `--- Chapter ${c.number}: ${c.title} ---\n${c.content}`,
      ),
    );
  }

  if (input.instruction?.trim()) {
    lines.push(``, `Student's refinement request — apply it:`, input.instruction.trim());
  }

  lines.push(
    ``,
    `Write the chapter in Markdown with numbered sections and in-text citations in the stated referencing style. Return only the chapter.`,
  );

  return lines.join("\n");
}

/** Prompt for project Q&A. */
export function buildAskPrompt(input: {
  topicTitle: string;
  intake: Intake;
  chapters: { number: number; title: string; content: string }[];
  question: string;
  history: { role: string; content: string }[];
}): string {
  const lines = [
    `You are advising a student on this project. Answer the student's question directly and practically.`,
    ``,
    `Project topic: ${input.topicTitle}`,
    ``,
    describeIntake(input.intake),
  ];

  if (input.chapters.length) {
    lines.push(
      ``,
      `Chapters generated so far:`,
      ...input.chapters.map((c) => `- Chapter ${c.number}: ${c.title} (${c.content.length} chars)`),
    );
  }

  if (input.history.length) {
    lines.push(``, `Earlier in this conversation:`);
    for (const m of input.history) {
      lines.push(`${m.role === "user" ? "Student" : "You"}: ${m.content}`);
    }
  }

  lines.push(``, `Student's question: ${input.question.trim()}`, ``, `Answer:`);
  return lines.join("\n");
}

/** Level/discipline for the topics workflow, falling back to inference. */
export function resolveHints(intake: Intake, searchText: string) {
  return {
    level: (intake.level && LEVEL_TEXT[intake.level] ? intake.level : "") || inferLevel(searchText),
    discipline: intake.discipline || inferDiscipline(searchText),
  };
}

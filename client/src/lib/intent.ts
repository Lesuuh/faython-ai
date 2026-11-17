import type { Project } from "./project-store";

export type Intent =
  | { kind: "chapter"; chapterNumber: number; regenerate: boolean }
  | { kind: "answer" };

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
};

const REGENERATE_RE =
  /\b(regenerate|redo|re-?do|rewrite|again|another version|different version|try again)\b/i;
const CHAPTER_RE = /\b(chapter|ch)\b/i;

/**
 * The project thread is the interface, so a plain sentence has to be enough:
 * "write chapter two", "redo chapter 3", "next chapter". Anything that isn't
 * about a chapter is a question about the project.
 */
export function resolveIntent(text: string, project: Project): Intent {
  if (!CHAPTER_RE.test(text)) return { kind: "answer" };

  const regenerate = REGENERATE_RE.test(text);
  const digits = text.match(/\d+/);
  // "chapter two" and "the second chapter" both mean chapter 2.
  const after = text.match(
    /\b(?:chapter|ch)\s+(one|two|three|four|five|first|second|third|fourth|fifth)\b/i,
  );
  const before = text.match(
    /\b(one|two|three|four|five|first|second|third|fourth|fifth)\s+(?:\w+\s+){0,2}?(?:chapter|ch)\b/i,
  );
  const spoken = after?.[1] ?? before?.[1];

  const explicit = digits ? Number(digits[0]) : spoken ? NUMBER_WORDS[spoken.toLowerCase()] : undefined;

  const done = project.chapters.filter((c) => c.state === "done").map((c) => c.number);
  const lastDone = done.length ? Math.max(...done) : 0;
  const pending = project.chapters.find((c) => c.state !== "done");

  let chapterNumber = explicit;
  if (!chapterNumber) {
    if (/\bnext\b/i.test(text)) chapterNumber = Math.min(lastDone + 1, 5);
    else if (regenerate) chapterNumber = lastDone || pending?.number || 1;
    else chapterNumber = pending?.number ?? 1;
  }

  return {
    kind: "chapter",
    chapterNumber: Math.min(Math.max(chapterNumber, 1), 5),
    regenerate,
  };
}

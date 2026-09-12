import { useEffect, useState } from "react";

export type Level = "undergraduate" | "postgraduate" | "";

export type ChapterNames = [string, string, string, string, string];

export interface ProjectProfile {
  university: string;
  course: string;
  level: Level;
  referencingStyle: string;
  chapterNames: ChapterNames;
}

export const LEVELS: { value: Level; label: string }[] = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
];

export const REFERENCING_STYLES = ["APA", "MLA", "IEEE", "Chicago", "Harvard"];

export const DEFAULT_CHAPTER_NAMES: ChapterNames = [
  "Introduction",
  "Literature Review",
  "Methodology",
  "Results and Discussion",
  "Conclusion and Recommendations",
];

const STORAGE_KEY = "faython:projectProfile";

export function defaultProfile(): ProjectProfile {
  return {
    university: "",
    course: "",
    level: "",
    referencingStyle: "APA",
    chapterNames: [...DEFAULT_CHAPTER_NAMES],
  };
}

function loadProfile(): ProjectProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<ProjectProfile>;
    return {
      ...defaultProfile(),
      ...parsed,
      chapterNames:
        parsed.chapterNames && parsed.chapterNames.length === 5
          ? (parsed.chapterNames as ChapterNames)
          : [...DEFAULT_CHAPTER_NAMES],
    } satisfies ProjectProfile;
  } catch {
    return defaultProfile();
  }
}

export function useProjectProfile() {
  const [profile, setProfile] = useState<ProjectProfile>(loadProfile);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage unavailable — keep in-memory
    }
  }, [profile]);

  const update = (patch: Partial<ProjectProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  return { profile, update };
}

/** Plain quick-read for non-hooks contexts (e.g. server-side prose assembly). */
export function getProjectProfile(): ProjectProfile {
  return loadProfile();
}

/** Fold the project profile into a research brief the AI can act on. */
export function buildResearchContext(profile: ProjectProfile): string {
  const parts: string[] = [];
  if (profile.university.trim()) parts.push(`university: ${profile.university.trim()}`);
  if (profile.course.trim()) parts.push(`course of study: ${profile.course.trim()}`);
  if (profile.level) parts.push(`academic level: ${profile.level}`);
  if (profile.referencingStyle) parts.push(`referencing style: ${profile.referencingStyle}`);
  if (parts.length === 0) return "";
  return `Research context: ${parts.join("; ")}.`;
}
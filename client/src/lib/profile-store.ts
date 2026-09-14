export type AcademicLevel = "" | "undergraduate" | "postgraduate" | "phd";

export type ResearchProfile = {
  university: string;
  course: string;
  level: AcademicLevel;
  referencingStyle: string;
  chapterNames: [string, string, string, string, string];
};

export const REFERENCING_STYLES = [
  "APA (7th ed.)",
  "MLA (9th ed.)",
  "Harvard",
  "Chicago (17th ed.)",
  "IEEE",
  "Vancouver",
  "Other",
] as const;

export const DEFAULT_PROFILE: ResearchProfile = {
  university: "",
  course: "",
  level: "",
  referencingStyle: "APA (7th ed.)",
  chapterNames: [
    "Introduction",
    "Literature Review",
    "Methodology",
    "Findings and Discussion",
    "Conclusion",
  ],
};

const PROFILE_KEY = "faython:profile";

export function loadProfile(): ResearchProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<ResearchProfile>;
    const chapterNames =
      Array.isArray(parsed.chapterNames) && parsed.chapterNames.length === 5
        ? (parsed.chapterNames as [string, string, string, string, string])
        : DEFAULT_PROFILE.chapterNames;
    return { ...DEFAULT_PROFILE, ...parsed, chapterNames };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: ResearchProfile): void {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable — profile stays in memory only
  }
}

const LEVEL_LABELS: Record<AcademicLevel, string> = {
  "": "",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  phd: "PhD",
};

export function buildResearchContext(profile: ResearchProfile): string {
  const lines: string[] = [];
  if (profile.university.trim()) lines.push(`Institution: ${profile.university.trim()}`);
  if (profile.course.trim()) lines.push(`Program / course: ${profile.course.trim()}`);
  if (profile.level && LEVEL_LABELS[profile.level]) lines.push(`Academic level: ${LEVEL_LABELS[profile.level]}`);
  if (profile.referencingStyle.trim()) lines.push(`Referencing style: ${profile.referencingStyle.trim()}`);
  if (profile.chapterNames.some((n) => n.trim())) {
    lines.push(
      `Chapter plan: ${profile.chapterNames
        .map((n, i) => `${i + 1}. ${n.trim() || `Chapter ${i + 1}`}`)
        .join(" ")}`,
    );
  }
  return lines.length ? `Research context: ${lines.join(" · ")}` : "";
}
const LEVEL_PATTERNS: [RegExp, string][] = [
  [/\b(post-?graduate|master'?s|msc|ph\.?d|postgrad)\w*\b/, "postgraduate"],
  [/\b(under-?graduate|bsc|hnd|b\.?ed|b\.?tech)\w*\b/, "undergraduate"],
];

const DISCIPLINES: [string, string][] = [
  ["accounting", "Accounting"],
  ["computer science", "Computer Science"],
  ["nursing", "Nursing"],
  ["business", "Business"],
  ["economics", "Economics"],
  ["education", "Education"],
  ["engineering", "Engineering"],
  ["law", "Law"],
  ["medicine", "Medicine"],
  ["psychology", "Psychology"],
  ["mass communication", "Mass Communication"],
  ["marketing", "Marketing"],
  ["biology", "Biology"],
  ["chemistry", "Chemistry"],
  ["physics", "Physics"],
  ["political science", "Political Science"],
  ["sociology", "Sociology"],
  ["agriculture", "Agriculture"],
  ["public health", "Public Health"],
  ["artificial intelligence", "Artificial Intelligence"],
  ["fintech", "Finance"],
];

/**
 * Fallback for callers that don't send the student's academic level or
 * discipline (the client normally passes them from the saved profile).
 */
export function inferLevel(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [pattern, level] of LEVEL_PATTERNS) {
    if (pattern.test(t)) return level;
  }
  return undefined;
}

export function inferDiscipline(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [needle, label] of DISCIPLINES) {
    if (t.includes(needle)) return label;
  }
  return undefined;
}

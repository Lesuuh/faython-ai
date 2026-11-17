import { api, type ChapterRef, type MessageRef } from "@/lib/api";
import { TOKEN_COSTS, type PlanId } from "@/lib/pricing";
import { loadBilling } from "@/lib/billing-store";
import { canAfford } from "@/lib/token-store";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  generatedChapters,
  parseTopicSuggestions,
  type Project,
  type ProjectIntake,
  type ProjectMessage,
  type TopicSuggestion,
} from "@/lib/project-store";

/** The three things Faython can do inside a project. */
export type GenerationKind = "topics" | "chapter" | "ask";

export function generationCost(kind: GenerationKind): number {
  return TOKEN_COSTS[kind];
}

export function generationLabel(kind: GenerationKind, chapterNumber?: number): string {
  if (kind === "chapter") return `Chapter ${chapterNumber ?? 1}`;
  if (kind === "ask") return "Project question";
  return "Topic ideas";
}

/* ------------------------------ server calls ------------------------------ */

function chapterRefs(project: Project): ChapterRef[] {
  return generatedChapters(project).map((c) => ({
    number: c.number,
    title: c.title,
    content: c.content,
  }));
}

function messageRefs(messages: ProjectMessage[]): MessageRef[] {
  return messages
    .filter((m) => m.kind !== "chapter")
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content }));
}

/** Step 2 of the wizard: turn an intake into selectable topic ideas. */
export async function generateTopicIdeas(intake: ProjectIntake): Promise<TopicSuggestion[]> {
  const { text } = await api.generateTopics({ intake });
  return parseTopicSuggestions(text);
}

/** Write one chapter of the chosen topic. Pass `instruction` to refine a draft. */
export async function generateProjectChapter(
  project: Project,
  chapterNumber: number,
  opts?: { instruction?: string },
): Promise<string> {
  const chapter = project.chapters.find((c) => c.number === chapterNumber);
  const { text } = await api.generateChapter({
    projectId: project.id,
    chapterNumber,
    title: project.title,
    chapterTitle: chapter?.title,
    intake: project.intake,
    previousChapters: chapterRefs(project),
    instruction: opts?.instruction ?? chapter?.instruction ?? "",
  });
  return text;
}

/**
 * Ask about the project — scope, methods, structure, references. `history` lets
 * the caller pass the thread as it stands right now, including a question it
 * has just appended optimistically.
 */
export async function askProject(
  project: Project,
  question: string,
  history?: ProjectMessage[],
): Promise<string> {
  const { text } = await api.askProject({
    projectId: project.id,
    title: project.title,
    intake: project.intake,
    chapters: chapterRefs(project),
    question,
    history: messageRefs(history ?? project.messages),
  });
  return text;
}

/* ------------------------------- the gate -------------------------------- */

export type GenerationPass = { userId: string; planId: PlanId; cost: number };

/**
 * Pre-flight for anything that spends tokens: redirects signed-out users,
 * refuses when the plan can't afford it, and reports how much it will cost.
 * Returns null (after navigating) when the action must not run.
 */
export function useGenerationGuard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  return (kind: GenerationKind, chapterNumber?: number): GenerationPass | null => {
    if (authLoading) return null;

    if (!user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return null;
    }

    const cost = generationCost(kind);
    const billing = loadBilling(user.id);
    const planId = billing.planId;

    if (!canAfford(user.id, planId, cost)) {
      toast.error("Not enough AI credits", {
        description: `${generationLabel(kind, chapterNumber)} costs ${cost.toLocaleString()} tokens. Top up in Billing.`,
        action: { label: "Top up", onClick: () => navigate("/billing") },
      });
      return null;
    }

    return { userId: user.id, planId, cost };
  };
}

export { resolveIntent } from "@/lib/intent";
export type { Intent } from "@/lib/intent";

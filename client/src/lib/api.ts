import { authClient } from "../auth"; // adjust if your auth.ts lives elsewhere/
import { mock } from "./mock";
import type { Project, ProjectIntake } from "./project-store";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Empty string = same origin (works with a Vite proxy for /api).
// Set VITE_API_URL=http://localhost:4000 in .env if Express runs on its own port.
const API_URL: string = import.meta.env.VITE_API_URL ?? "";

/* -------------------------------------------------------------------------- */
/*  Errors                                                                    */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/* -------------------------------------------------------------------------- */
/*  Core request helpers                                                      */
/* -------------------------------------------------------------------------- */

/** Fetches a fresh Neon Auth token. Tokens expire (~15 min), so never cache this. */
async function getToken(): Promise<string | undefined> {
  try {
    const { data } = await authClient.getSession();
    return data?.session?.token;
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const hasJsonBody = init?.body != null && !(init.body instanceof FormData);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const body = (await res.json()) as {
        error?: string;
        message?: string;
        code?: string;
      };
      message = body.message ?? body.error ?? message;
      code = body.code;
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, message, code);
  }

  // DELETE and similar endpoints may return no content.
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/**
 * For generators only. Transport failures and 5xx (server down, workflow not
 * configured, timeout) fall back to sample content so the UI stays usable.
 * 4xx errors are real answers (unauthorized, bad input, not enough credits)
 * and are surfaced as-is.
 */
async function requestOrDemo<T>(
  path: string,
  demo: () => Promise<T>,
  init?: RequestInit,
): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (err) {
    if (err instanceof ApiError && err.status < 500) throw err;
    console.warn(`[api] ${path} unavailable, serving demo data instead.`, err);
    return demo();
  }
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ApiUser = {
  id: string;
  email?: string;
  name?: string;
};

// TODO: replace with your real project type (for example from ./project-store).
// export type Project = Project

export type CreateProjectInput = {
  title: string;
  intake: ProjectIntake;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export type ChapterRef = { number: number; title: string; content: string };
export type MessageRef = { role: "user" | "assistant"; content: string };

/** All three generators resolve to generated markdown in `text`. */
export type GeneratedText = { text: string };

/** POST /api/topics: intake in, a list of scoped topic ideas out. */
export type TopicsRequest = { intake: ProjectIntake };

/** POST /api/chapters/:projectId/:chapterNumber: write or refine one chapter. */
export type ChapterRequest = {
  projectId: string;
  chapterNumber: number;
  title: string;
  chapterTitle?: string;
  intake: ProjectIntake;
  previousChapters: ChapterRef[];
  instruction?: string;
};

/** POST /api/projects/ask: question answering inside a project. */
export type AskRequest = {
  projectId: string;
  title: string;
  intake: ProjectIntake;
  chapters: ChapterRef[];
  question: string;
  history: MessageRef[];
};

/* -------------------------------------------------------------------------- */
/*  API                                                                       */
/* -------------------------------------------------------------------------- */

export const api = {
  /* ----- Current user ----- */

  /** GET /api/me: the signed-in user, as verified by the Express middleware. */
  getMe(): Promise<{ user: ApiUser }> {
    return request("/api/me");
  },

  /* ----- Projects ----- */

  /** GET /api/projects */
  getProjects(): Promise<Project[]> {
    return request("/api/projects");
  },

  /** GET /api/projects/:id */
  getProject(id: string): Promise<Project> {
    return request(`/api/projects/${encodeURIComponent(id)}`);
  },

  /** POST /api/projects */
  createProject(input: CreateProjectInput): Promise<Project> {
    return request("/api/projects", json(input));
  },

  /** PATCH /api/projects/:id */
  updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return request(`/api/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  /** DELETE /api/projects/:id */
  deleteProject(id: string): Promise<void> {
    return request(`/api/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  /* ----- Generation ----- */

  generateTopics(input: TopicsRequest): Promise<GeneratedText> {
    const demo = () => mock.generateTopics().then((text) => ({ text }));
    // if (demoMode) return demo();
    return requestOrDemo("/api/topics", demo, json(input));
  },

  generateChapter(input: ChapterRequest): Promise<GeneratedText> {
    const { projectId, chapterNumber, ...context } = input;
    const demo = () =>
      mock.generateChapter(chapterNumber).then((text) => ({ text }));
    // if (demoMode) return demo();
    return requestOrDemo(
      `/api/chapters/${encodeURIComponent(projectId)}/${chapterNumber}`,
      demo,
      json(context),
    );
  },

  askProject(input: AskRequest): Promise<GeneratedText> {
    const demo = () =>
      mock.askProject(input.question).then((text) => ({ text }));
    // if (demoMode) return demo();
    return requestOrDemo("/api/projects/ask", demo, json(input));
  },
};

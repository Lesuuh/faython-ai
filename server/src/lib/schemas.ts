import { z } from "zod";

export const intakeSchema = z.object({
  institution: z.string().default(""),
  department: z.string().default(""),
  level: z.string().default(""),
  discipline: z.string().default(""),
  scope: z.enum(["local", "regional", "national", "international"]).default("local"),
  scopeNotes: z.string().default(""),
  referencingStyle: z.string().default(""),
  keywords: z.string().default(""),
  constraints: z.string().default(""),
});

export type Intake = z.infer<typeof intakeSchema>;

export const chapterRefSchema = z.object({
  number: z.number().int().min(1).max(5),
  title: z.string().default(""),
  content: z.string().default(""),
});

export const messageRefSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest } from "../lib/errors.js";
import { chapterRefSchema, intakeSchema, messageRefSchema } from "../lib/schemas.js";
import { buildAskPrompt } from "../lib/prompt.js";
import { n8n } from "../services/n8n.service.js";

const router = Router();

const bodySchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  intake: intakeSchema,
  chapters: z.array(chapterRefSchema).default([]),
  question: z.string().min(1),
  history: z.array(messageRefSchema).default([]),
});

// POST /api/projects/ask — question answering inside one project.
router.post(
  "/ask",
  asyncHandler(async (req, res) => {
    const body = validate(bodySchema)(req.body ?? {});
    const question = body.question.trim();
    if (!question) throw badRequest("Ask a question.");

    const text = await n8n.generateChat({
      topicId: body.projectId,
      topicTitle: body.title,
      prompt: buildAskPrompt({
        topicTitle: body.title,
        intake: body.intake,
        chapters: body.chapters,
        question,
        history: body.history,
      }),
    });

    res.status(200).json({ text });
  }),
);

export default router;

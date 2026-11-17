import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { n8n } from "../services/n8n.service.js";
import { chapterRefSchema, intakeSchema } from "../lib/schemas.js";
import { buildChapterPrompt } from "../lib/prompt.js";

const router = Router();

const paramsSchema = z.object({
  projectId: z.string().min(1),
  chapterNumber: z.coerce.number().int().min(1).max(5),
});

const bodySchema = z.object({
  title: z.string().min(1),
  intake: intakeSchema,
  previousChapters: z.array(chapterRefSchema).default([]),
  instruction: z.string().default(""),
  chapterTitle: z.string().default(""),
});

// POST /api/chapters/:projectId/:chapterNumber
// The client owns the project, so it sends the chapter's grounding with the request.
router.post(
  "/:projectId/:chapterNumber",
  asyncHandler(async (req, res) => {
    const { projectId, chapterNumber } = validate(paramsSchema)(req.params);
    const body = validate(bodySchema)(req.body ?? {});

    const text = await n8n.generateChapter({
      topicId: projectId,
      chapterNumber,
      topicTitle: body.title,
      prompt: buildChapterPrompt({
        topicTitle: body.title,
        intake: body.intake,
        previousChapters: body.previousChapters,
        instruction: body.instruction,
        chapterTitle: body.chapterTitle,
      }),
      reply: "",
      previousChapters: body.previousChapters.map((c) => c.content),
    });

    res.status(200).json({ chapterNumber, text });
  }),
);

export default router;

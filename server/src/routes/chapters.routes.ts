import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { n8n } from "../services/n8n.service.js";

const router = Router();

const paramsSchema = z.object({
  topicId: z.string().min(1),
  chapterNum: z.coerce.number().int().min(1).max(5),
});

const bodySchema = z.object({
  topicTitle: z.string().optional(),
  prompt: z.string().optional(),
  reply: z.string().optional(),
  previousChapters: z.array(z.string()).optional(),
});

// POST /api/chapters/:topicId/:chapterNum — generate a chapter (1-5) via n8n.
// Context (prompt/reply/previous chapters) is passed in the body by the caller.
router.post(
  "/:topicId/:chapterNum",
  asyncHandler(async (req, res) => {
    const { topicId, chapterNum } = validate(paramsSchema)(req.params);
    const body = validate(bodySchema)(req.body ?? {});

    const content = await n8n.generateChapter({
      topicId,
      chapterNumber: chapterNum,
      topicTitle: body.topicTitle || body.prompt || topicId,
      prompt: body.prompt || "",
      reply: body.reply || "",
      previousChapters: body.previousChapters || [],
    });

    res.status(200).json({ chapterNumber: chapterNum, content });
  }),
);

export default router;
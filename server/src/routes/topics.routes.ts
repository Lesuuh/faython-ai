import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest } from "../lib/errors.js";
import { intakeSchema } from "../lib/schemas.js";
import { buildTopicPrompt, resolveHints } from "../lib/prompt.js";
import { n8n } from "../services/n8n.service.js";

const router = Router();

const bodySchema = z.object({ intake: intakeSchema });

// POST /api/topics — an intake in, a numbered list of scoped topics out.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { intake } = validate(bodySchema)(req.body ?? {});

    const prompt = buildTopicPrompt(intake);
    if (!intake.keywords.trim() && !intake.discipline.trim()) {
      throw badRequest("Provide at least a field of study or keywords.");
    }

    const { level, discipline } = resolveHints(intake, `${intake.discipline} ${intake.keywords}`);

    const text = await n8n.generateTopics(prompt, {
      ...(level ? { level } : {}),
      ...(discipline ? { discipline } : {}),
    });

    res.status(200).json({ text });
  }),
);

export default router;

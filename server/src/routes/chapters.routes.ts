import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { requireTopicOwner, assertChapterAllowed } from "../middleware/entitlement.js";
import { n8n } from "../services/n8n.service.js";
import { assertWithinFreeLimit, incrementUsage, USAGE_ACTIONS } from "../services/usage.service.js";

const router = Router();

router.use(requireAuth);

// POST /api/chapters/:topicId/one — Chapter One (free, capped, calls n8n)
router.post(
  "/:topicId/one",
  requireTopicOwner,
  asyncHandler(async (req: AuthRequest, res) => {
    const topic = (req as AuthRequest & { ctx: { topic: { id: string; prompt: string; reply: string } } }).ctx.topic;
    const user = req.user;

    const existing = await prisma.chapter.findUnique({
      where: { topicId_chapterNumber: { topicId: topic.id, chapterNumber: 1 } },
    });
    if (existing) {
      return res.json({ chapter: existing, cached: true });
    }

    await assertWithinFreeLimit(user.id, USAGE_ACTIONS.chapterOne);

    const content = await n8n.generateChapter({
      topicId: topic.id,
      chapterNumber: 1,
      topicTitle: `${topic.prompt} — first topic line`,
      prompt: topic.prompt,
      reply: topic.reply,
      previousChapters: [],
    });

    const chapter = await prisma.chapter.create({
      data: { topicId: topic.id, chapterNumber: 1, content },
    });
    await incrementUsage(user.id, USAGE_ACTIONS.chapterOne);

    res.status(201).json({ chapter, cached: false });
  }),
);

// POST /api/chapters/:topicId/:chapterNum — Chapters 2–5 (requires entitlement, calls n8n)
router.post(
  "/:topicId/:chapterNum",
  requireTopicOwner,
  asyncHandler(async (req: AuthRequest, res) => {
    const { topicId, chapterNum } = validate(
      z.object({ topicId: z.string().cuid(), chapterNum: z.coerce.number().int().min(2).max(5) }),
    )(req.params);

    const ctx = (req as AuthRequest & { ctx: { topic: { id: string; prompt: string; reply: string; entitlement: { unlockedChapters: number } | null } } }).ctx;
    const topic = ctx.topic;
    const user = req.user;

    assertChapterAllowed(topic, chapterNum);

    const existing = await prisma.chapter.findUnique({
      where: { topicId_chapterNumber: { topicId, chapterNumber: chapterNum } },
    });
    if (existing) {
      return res.json({ chapter: existing, cached: true });
    }

    const previous = await prisma.chapter.findMany({
      where: { topicId, chapterNumber: { lt: chapterNum } },
      orderBy: { chapterNumber: "asc" },
    });
    const previousChapters = previous
      .sort((a, b) => a.chapterNumber - b.chapterNumber)
      .map((c) => `[Chapter ${c.chapterNumber}]\n${c.content}`);

    const content = await n8n.generateChapter({
      topicId,
      chapterNumber: chapterNum,
      topicTitle: topic.prompt,
      prompt: topic.prompt,
      reply: topic.reply,
      previousChapters,
    });

    const chapter = await prisma.chapter.create({
      data: { topicId, chapterNumber: chapterNum, content },
    });

    res.status(201).json({ chapter, cached: false });
  }),
);

export default router;
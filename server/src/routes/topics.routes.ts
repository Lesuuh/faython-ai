import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest, notFound } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// GET /api/topics?filter=all|saved&level=&discipline=&q=&page=&limit=
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { filter, level, discipline, q, page, limit } = validate(
      z.object({
        filter: z.enum(["all", "saved"]).optional(),
        level: z.string().optional(),
        discipline: z.string().optional(),
        q: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
    )(req.query);

    const where = {
      userId: req.user.id,
      ...(filter === "saved" ? { saved: true } : {}),
      ...(level ? { level } : {}),
      ...(discipline ? { discipline } : {}),
      ...(q
        ? {
            OR: [
              { prompt: { contains: q, mode: "insensitive" as const } },
              { reply: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { chapters: { select: { chapterNumber: true } } },
      }),
      prisma.topic.count({ where }),
    ]);

    res.json({
      items: items.map((t) => ({ ...t, chapterCount: t.chapters.length })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

// GET /api/topics/meta — distinct levels/disciplines + counts
router.get(
  "/meta",
  asyncHandler(async (req: AuthRequest, res) => {
    const [levels, disciplines, counts] = await Promise.all([
      prisma.topic.findMany({
        where: { userId: req.user.id, level: { not: null } },
        distinct: ["level"],
        select: { level: true },
      }),
      prisma.topic.findMany({
        where: { userId: req.user.id, discipline: { not: null } },
        distinct: ["discipline"],
        select: { discipline: true },
      }),
      prisma.topic.groupBy({
        by: ["saved"],
        where: { userId: req.user.id },
        _count: { _all: true },
      }),
    ]);

    const counted = Object.fromEntries(counts.map((c) => [String(c.saved), c._count._all]));
    res.json({
      levels: levels.map((l) => l.level).filter(Boolean),
      disciplines: disciplines.map((d) => d.discipline).filter(Boolean),
      counts: { all: counted["false"] || 0, saved: counted["true"] || 0 },
    });
  }),
);

// GET /api/topics/:id — single topic with chapter progress + entitlement
router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = validate(z.object({ id: z.string().cuid() }))(req.params);
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        chapters: true,
        entitlement: true,
      },
    });
    if (!topic || topic.userId !== req.user.id) throw notFound("Topic not found");
    res.json({ topic });
  }),
);

// GET /api/topics/:id/messages — full saved conversation for a topic
router.get(
  "/:id/messages",
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = validate(z.object({ id: z.string().cuid() }))(req.params);
    const topic = await prisma.topic.findUnique({ where: { id }, select: { userId: true } });
    if (!topic || topic.userId !== req.user.id) throw notFound("Topic not found");

    const messages = await prisma.message.findMany({
      where: { topicId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ messages });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = validate(z.object({ id: z.string().cuid() }))(req.params);
    const { saved } = validate(z.object({ saved: z.boolean().optional() }))(req.body);
    if (saved === undefined) throw badRequest("Nothing to update");

    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic || topic.userId !== req.user.id) throw notFound("Topic not found");

    const updated = await prisma.topic.update({ where: { id }, data: { saved } });
    res.json({ topic: updated });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = validate(z.object({ id: z.string().cuid() }))(req.params);
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic || topic.userId !== req.user.id) throw notFound("Topic not found");
    await prisma.topic.delete({ where: { id } });
    res.json({ ok: true });
  }),
);

router.delete(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.topic.deleteMany({ where: { userId: req.user.id } });
    res.json({ ok: true });
  }),
);

export default router;
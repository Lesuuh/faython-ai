import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { forbidden, notFound } from "../lib/errors.js";
import type { AuthRequest } from "./auth.js";

// Attaches the user's topic (with entitlement) to the request for chapter checkout.
export async function requireTopicOwner(req: Request, _res: Response, next: NextFunction) {
  try {
    const { topicId } = req.params as { topicId?: string };
    const user = (req as AuthRequest).user;
    if (!topicId) throw notFound("Topic not found");

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { entitlement: true },
    });
    if (!topic || topic.userId !== user.id) throw notFound("Topic not found");

    // Reuse a non-conflicting property that Express allows on request.
    (req as AuthRequest & { ctx: { topic: typeof topic } }).ctx = { topic };
    next();
  } catch (err) {
    next(err);
  }
}

export function assertChapterAllowed(topic: { entitlement: { unlockedChapters: number } | null }, chapterNumber: number): void {
  if (chapterNumber === 1) return;
  if (!topic.entitlement || topic.entitlement.unlockedChapters < chapterNumber) {
    throw forbidden("Chapters 2–5 are locked for this project. Pay to unlock.");
  }
}
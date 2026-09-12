import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { tooMany } from "../lib/errors.js";

export const USAGE_ACTIONS = {
  topics: "topics",
  chapterOne: "chapter_one",
} as const;

function dayKey(d = new Date()): Date {
  const d0 = new Date(d);
  d0.setHours(0, 0, 0, 0);
  return d0;
}

export async function getUsageCount(userId: string, action: string, date = new Date()): Promise<number> {
  const record = await prisma.generationUsage.findUnique({
    where: { userId_action_date: { userId, action, date: dayKey(date) } },
  });
  return record?.count ?? 0;
}

export async function incrementUsage(userId: string, action: string, date = new Date()): Promise<number> {
  const record = await prisma.generationUsage.upsert({
    where: { userId_action_date: { userId, action, date: dayKey(date) } },
    create: { userId, action, date: dayKey(date), count: 1 },
    update: { count: { increment: 1 } },
  });
  return record.count;
}

export async function assertWithinFreeLimit(userId: string, action: string) {
  const limit = action === USAGE_ACTIONS.topics ? config.freeTopicsPerDay : config.freeChaptersPerDay;
  const used = await getUsageCount(userId, action);
  if (used >= limit) {
    throw tooMany(`Daily free limit reached (${used}/${limit}). Please try again tomorrow.`);
  }
}

export async function getDailyUsage(userId: string) {
  const [topicsUsed, chaptersUsed] = await Promise.all([
    getUsageCount(userId, USAGE_ACTIONS.topics),
    getUsageCount(userId, USAGE_ACTIONS.chapterOne),
  ]);
  return {
    topics: { used: topicsUsed, limit: config.freeTopicsPerDay },
    chapterOne: { used: chaptersUsed, limit: config.freeChaptersPerDay },
  };
}
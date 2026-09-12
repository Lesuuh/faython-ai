import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest, notFound } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { publicUser } from "../lib/serialize.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { getDailyUsage } from "../services/usage.service.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw notFound("User not found");
    res.json({ user: publicUser(user) });
  }),
);

// GET /api/user/usage — today's free-tier usage
router.get(
  "/usage",
  asyncHandler(async (req: AuthRequest, res) => {
    const usage = await getDailyUsage(req.user.id);
    res.json({ usage });
  }),
);

router.patch(
  "/profile",
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, email } = validate(
      z.object({
        name: z.string().min(2).max(80).optional(),
        email: z.string().email().optional(),
      }),
    )(req.body);

    const data: { name?: string; email?: string } = {};
    if (name) data.name = name;
    if (email && email.toLowerCase() !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing && existing.id !== req.user.id) throw badRequest("Email is already in use");
      data.email = email.toLowerCase();
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: publicUser(user) });
  }),
);

router.post(
  "/change-password",
  asyncHandler(async (_req, res) => {
    // Password changes are handled by Supabase Auth (updateUser on the client).
    res.status(400).json({ error: "Use the reset-password flow instead." });
  }),
);

router.patch(
  "/settings",
  asyncHandler(async (req: AuthRequest, res) => {
    const { notificationsOn } = validate(
      z.object({ notificationsOn: z.boolean().optional() }),
    )(req.body);

    if (notificationsOn === undefined) throw badRequest("Nothing to update");
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { notificationsOn },
    });
    res.json({ user: publicUser(user) });
  }),
);

router.delete(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    // Supabase retains the auth record; delete app data here.
    await prisma.generationUsage.deleteMany({ where: { userId: req.user.id } });
    await prisma.payment.deleteMany({ where: { userId: req.user.id } });
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ ok: true });
  }),
);

export default router;
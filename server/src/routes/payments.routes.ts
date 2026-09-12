import { Router } from "express";
import express from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async.js";
import { validate } from "../lib/validate.js";
import { badRequest, notFound, conflict } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { config } from "../config/index.js";
import {
  generatePaystackReference,
  initializeTransaction,
  isPaystackConfigured,
  verifyTransactionStatus,
  verifyWebhookSignature,
} from "../services/paystack.service.js";

const router = Router();

// POST /api/payments/initiate — start Paystack checkout for a topic unlock
router.post(
  "/initiate",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { topicId } = validate(z.object({ topicId: z.string().cuid() }))(req.body);
    const user = req.user;

    if (!isPaystackConfigured()) throw badRequest("Payments are not configured yet.");

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic || topic.userId !== user.id) throw notFound("Topic not found");

    const entitlement = await prisma.entitlement.findUnique({ where: { topicId } });
    if (entitlement) throw conflict("This project is already unlocked.");

    const reference = generatePaystackReference();
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        topicId,
        reference,
        amount: config.chapterUnlockAmountKobo,
        status: "PENDING",
      },
    });

    const gateway = await initializeTransaction({
      email: user.email,
      amountKobo: config.chapterUnlockAmountKobo,
      reference,
      metadata: { userId: user.id, topicId, paymentId: payment.id },
    });

    res.json({
      authorizationUrl: gateway.authorization_url,
      reference,
      accessCode: gateway.access_code,
    });
  }),
);

// GET /api/payments/history — list past payments/unlocks
router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      include: { topic: { select: { id: true, prompt: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ payments });
  }),
);

// POST /api/payments/verify — confirm a payment by reference (after redirect)
router.post(
  "/verify",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const { reference } = validate(z.object({ reference: z.string().min(5) }))(req.body);
    if (!isPaystackConfigured()) throw badRequest("Payments are not configured yet.");

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { topic: true },
    });
    if (!payment || payment.userId !== req.user.id) throw notFound("Payment not found");
    if (payment.status === "SUCCESS") {
      const entitlement = await prisma.entitlement.findUnique({ where: { topicId: payment.topicId! } });
      return res.json({ status: "SUCCESS", payment, entitlement });
    }

    const status = await verifyTransactionStatus(reference);
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status === "SUCCESS" ? "SUCCESS" : "FAILED", paidAt: status === "SUCCESS" ? new Date() : null },
    });

    let entitlement = null;
    if (status === "SUCCESS" && payment.topicId) {
      entitlement = await prisma.entitlement.upsert({
        where: { topicId: payment.topicId },
        create: { userId: req.user.id, topicId: payment.topicId, unlockedChapters: 5 },
        update: { unlockedChapters: 5 },
      });
    }

    res.json({ status, payment: updated, entitlement });
  }),
);

// POST /api/payments/webhook — Paystack webhook, signature-verified
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const rawBody = (req.body as Buffer | object);
    // express.raw gives us a Buffer for the HMAC; fall back to JSON string for other content types
    const rawString = Buffer.isBuffer(rawBody)
      ? rawBody.toString("utf8")
      : JSON.stringify(rawBody ?? {});
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    if (!verifyWebhookSignature(rawString, signature)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawString) as {
      event?: string;
      data?: { reference?: string; status?: string; metadata?: { topicId?: string } };
    };

    if (event.event !== "charge.success" || !event.data?.reference) {
      return res.json({ received: true });
    }

    const reference = event.data.reference;
    const metaTopicId = event.data.metadata?.topicId;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === "SUCCESS") return res.json({ received: true });

    const topicId = metaTopicId || payment.topicId;

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date() },
      }),
      ...(topicId
        ? [
            prisma.entitlement.upsert({
              where: { topicId },
              create: { userId: payment.userId, topicId, unlockedChapters: 5 },
              update: { unlockedChapters: 5 },
            }),
          ]
        : []),
    ]);

    res.json({ received: true });
  }),
);

export default router;
import { createHmac, randomBytes } from "node:crypto";
import { config } from "../config/index.js";
import { serverError } from "../lib/errors.js";

const PAYSTACK_BASE = "https://api.paystack.co";

export function isPaystackConfigured(): boolean {
  return Boolean(config.paystack.secretKey);
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  if (!config.paystack.secretKey) return false;
  const hmac = createHmac("sha512", config.paystack.secretKey).update(rawBody).digest("hex");
  return hmac === signature;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  metadata: Record<string, string | number>;
}): Promise<{ authorization_url: string; reference: string; access_code: string }> {
  if (!isPaystackConfigured()) throw serverError("Payments are not configured yet.");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: config.paystack.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string; access_code?: string };
  } | null;

  if (!res.ok || !data?.status) {
    throw serverError(data?.message || "Failed to initialize payment.");
  }
  if (!data.data?.authorization_url || !data.data.reference) {
    throw serverError("Payment gateway returned an incomplete response.");
  }
  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
    access_code: data.data.access_code || "",
  };
}

export async function verifyTransactionStatus(reference: string): Promise<"SUCCESS" | "FAILED"> {
  if (!isPaystackConfigured()) throw serverError("Payments are not configured yet.");

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${config.paystack.secretKey}` },
  });
  const data = (await res.json().catch(() => null)) as {
    status?: boolean;
    data?: { status?: string };
  } | null;

  if (!res.ok || !data?.status) return "FAILED";
  return data.data?.status === "success" ? "SUCCESS" : "FAILED";
}

export function generatePaystackReference(): string {
  return `fay_${Date.now()}_${randomBytes(4).toString("hex")}`;
}
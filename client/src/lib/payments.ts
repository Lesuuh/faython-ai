import type { PlanId } from "./pricing";
import { type TopUpPack } from "./pricing";
import { addPayment, loadBilling, markPayment, newPayment, setBillingPlan } from "./billing-store";
import { applyPlanToTokens, applyTokenTopUp, getTokenBalance } from "./token-store";

export type CheckoutRequest =
  | { kind: "plan"; planId: PlanId; amount: number; description: string }
  | { kind: "topup"; pack: TopUpPack; amount: number; description: string };

export type CheckoutResult = {
  paymentId: string;
  balance: number;
};

export function applyCheckout(userId: string, req: CheckoutRequest): CheckoutResult {
  const payment = addPayment(userId, newPayment(req.description, req.amount));

  if (req.kind === "plan") {
    setBillingPlan(userId, req.planId);
    applyPlanToTokens(userId, req.planId);
  } else {
    applyTokenTopUp(userId, loadBilling(userId).planId, req.pack.tokens);
  }

  markPayment(userId, payment.id, "success");
  return { paymentId: payment.id, balance: getTokenBalance(userId, loadBilling(userId).planId) };
}
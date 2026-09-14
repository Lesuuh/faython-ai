import { uid } from "./chat-store";
import type { PlanId } from "./pricing";

export type BillStatus = "pending" | "success" | "failed";

export type BillPayment = {
  id: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  status: BillStatus;
  createdAt: string;
  paidAt?: string;
};

export type BillingState = {
  planId: PlanId;
  payments: BillPayment[];
};

function keyFor(userId: string): string {
  return `faython:billing:${userId}`;
}

function isPlanId(value: unknown): value is PlanId {
  return value === "free" || value === "pro" || value === "research";
}

export function loadBilling(userId: string): BillingState {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return { planId: "free", payments: [] };
    const parsed = JSON.parse(raw) as Partial<BillingState>;
    return {
      planId: isPlanId(parsed.planId) ? parsed.planId : "free",
      payments: Array.isArray(parsed.payments) ? (parsed.payments as BillPayment[]) : [],
    };
  } catch {
    return { planId: "free", payments: [] };
  }
}

function persist(userId: string, state: BillingState): void {
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(state));
  } catch {
    // storage unavailable — billing stays in memory only
  }
}

export function setBillingPlan(userId: string, planId: PlanId): void {
  const state = loadBilling(userId);
  persist(userId, { ...state, planId });
}

export function addPayment(userId: string, payment: BillPayment): BillPayment {
  const state = loadBilling(userId);
  persist(userId, { ...state, payments: [payment, ...state.payments].slice(0, 100) });
  return payment;
}

export function markPayment(userId: string, id: string, status: BillStatus): void {
  const state = loadBilling(userId);
  persist(userId, {
    ...state,
    payments: state.payments.map((p) =>
      p.id === id ? { ...p, status, paidAt: new Date().toISOString() } : p,
    ),
  });
}

export function newPayment(
  description: string,
  amount: number,
  currency = "USD",
): BillPayment {
  const now = new Date().toISOString();
  return {
    id: uid(),
    reference: `FYT-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`,
    description,
    amount,
    currency,
    status: "pending",
    createdAt: now,
  };
}
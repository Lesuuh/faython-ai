import { useEffect, useState } from "react";
import { uid } from "./ids";
import type { PlanId } from "./pricing";
import { planById } from "./pricing";

export type TokenEntryType = "grant" | "topup" | "usage";
export type TokenEntryKind = "topics" | "chapter" | "ask" | "plan" | "topup";

export type TokenEntry = {
  id: string;
  type: TokenEntryType;
  amount: number;
  kind?: TokenEntryKind;
  note?: string;
  createdAt: string;
};

export type TokenAccount = {
  balance: number;
  consumedThisPeriod: number;
  grantedThisPeriod: number;
  periodStart: string;
  ledger: TokenEntry[];
};

const TOKENS_EVENT = "faython:tokens";

function keyFor(userId: string): string {
  return `faython:tokens:${userId}`;
}

function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function loadAccount(userId: string, planId: PlanId): TokenAccount {
  const allowance = planById(planId).tokensPerMonth;
  const key = keyFor(userId);
  const current = monthKey();

  let acc: TokenAccount | null = null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TokenAccount>;
      if (
        parsed &&
        typeof parsed.balance === "number" &&
        typeof parsed.periodStart === "string"
      ) {
        acc = {
          balance: parsed.balance,
          consumedThisPeriod: parsed.consumedThisPeriod ?? 0,
          grantedThisPeriod: parsed.grantedThisPeriod ?? 0,
          periodStart: parsed.periodStart,
          ledger: Array.isArray(parsed.ledger) ? (parsed.ledger as TokenEntry[]) : [],
        };
      }
    }
  } catch {
    acc = null;
  }

  if (!acc) {
    acc = {
      balance: allowance,
      consumedThisPeriod: 0,
      grantedThisPeriod: allowance,
      periodStart: current,
      ledger: allowance > 0 ? [grantEntry(allowance, planId)] : [],
    };
    persist(key, acc);
  } else if (acc.periodStart !== current) {
    acc = {
      ...acc,
      balance: acc.balance + allowance,
      consumedThisPeriod: 0,
      grantedThisPeriod: allowance,
      periodStart: current,
      ledger: [...acc.ledger, grantEntry(allowance, planId)],
    };
    persist(key, acc);
  }

  return acc;
}

function grantEntry(amount: number, planId: PlanId): TokenEntry {
  return {
    id: uid(),
    type: "grant",
    amount,
    kind: "plan",
    note: `${planById(planId).name} monthly grant`,
    createdAt: new Date().toISOString(),
  };
}

function persist(key: string, acc: TokenAccount): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(acc));
  } catch {
    // storage unavailable — tokens stay in memory only
  }
}

function notifyTokensChanged(): void {
  try {
    window.dispatchEvent(new Event(TOKENS_EVENT));
  } catch {
    // no-op
  }
}

export function getTokenAccount(userId: string, planId: PlanId): TokenAccount {
  return loadAccount(userId, planId);
}

export function getTokenBalance(userId: string, planId: PlanId): number {
  return loadAccount(userId, planId).balance;
}

export function canAfford(userId: string, planId: PlanId, cost: number): boolean {
  return getTokenBalance(userId, planId) >= cost;
}

export function deductTokens(
  userId: string,
  planId: PlanId,
  cost: number,
  kind: TokenEntryKind,
  note: string,
): number {
  const acc = loadAccount(userId, planId);
  if (acc.balance < cost) throw new Error("Insufficient tokens");
  const entry: TokenEntry = {
    id: uid(),
    type: "usage",
    amount: -cost,
    kind,
    note,
    createdAt: new Date().toISOString(),
  };
  const next: TokenAccount = {
    ...acc,
    balance: acc.balance - cost,
    consumedThisPeriod: acc.consumedThisPeriod + cost,
    ledger: [...acc.ledger, entry],
  };
  persist(keyFor(userId), next);
  notifyTokensChanged();
  return next.balance;
}

function topupContribution(ledger: TokenEntry[]): number {
  return ledger.reduce((sum, e) => (e.type === "topup" ? sum + e.amount : sum), 0);
}

export function applyPlanToTokens(userId: string, planId: PlanId): void {
  const acc = loadAccount(userId, planId);
  const allowance = planById(planId).tokensPerMonth;
  const delta = allowance - acc.grantedThisPeriod;
  const entries = acc.ledger.slice();
  if (delta !== 0) {
    entries.push({
      id: uid(),
      type: "grant",
      amount: delta,
      kind: "plan",
      note: `${planById(planId).name} allowance update`,
      createdAt: new Date().toISOString(),
    });
  }
  const next: TokenAccount = {
    ...acc,
    balance: Math.max(topupContribution(acc.ledger), acc.balance + delta),
    grantedThisPeriod: allowance,
    ledger: entries,
  };
  persist(keyFor(userId), next);
  notifyTokensChanged();
}

export function applyTokenTopUp(userId: string, planId: PlanId, amount: number): void {
  const acc = loadAccount(userId, planId);
  const next: TokenAccount = {
    ...acc,
    balance: acc.balance + amount,
    ledger: [
      ...acc.ledger,
      {
        id: uid(),
        type: "topup",
        amount,
        kind: "topup",
        note: "Token top-up",
        createdAt: new Date().toISOString(),
      },
    ],
  };
  persist(keyFor(userId), next);
  notifyTokensChanged();
}

export function useTokenBalance(userId: string, planId: PlanId): number {
  const [balance, setBalance] = useState(() => getTokenBalance(userId, planId));

  useEffect(() => {
    const refresh = () => setBalance(getTokenBalance(userId, planId));
    refresh();
    window.addEventListener(TOKENS_EVENT, refresh);
    return () => window.removeEventListener(TOKENS_EVENT, refresh);
  }, [userId, planId]);

  return balance;
}
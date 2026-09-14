import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Check, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PaystackModal } from "@/components/PaystackModal";
import { useAuth } from "@/context/AuthContext";
import { loadBilling, setBillingPlan, type BillPayment, type BillingState } from "@/lib/billing-store";
import { applyCheckout, type CheckoutRequest } from "@/lib/payments";
import { PLANS, TOP_UP_PACKS, planById, type Plan } from "@/lib/pricing";
import { applyPlanToTokens, getTokenAccount, useTokenBalance } from "@/lib/token-store";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/cx";

const STATUS_STYLE: Record<BillPayment["status"], { badge: "success" | "warning" | "danger"; label: string }> = {
  success: { badge: "success", label: "Paid" },
  pending: { badge: "warning", label: "Pending" },
  failed: { badge: "danger", label: "Failed" },
};

export function Billing() {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [billing, setBilling] = useState<BillingState>(() => loadBilling(userId));
  const [checkout, setCheckout] = useState<CheckoutRequest | null>(null);

  useEffect(() => {
    setBilling(loadBilling(userId));
  }, [userId]);

  const planId = billing.planId;
  const plan = planById(planId);
  const balance = useTokenBalance(userId, planId);
  const account = getTokenAccount(userId, planId);
  const allowance = plan.tokensPerMonth;
  const usedPct = allowance
    ? Math.min(100, Math.round((account.consumedThisPeriod / allowance) * 100))
    : 0;

  function choosePlan(selected: Plan) {
    if (selected.id === planId) return;
    if (selected.priceMonthly === 0) {
      applyPlanToTokens(userId, selected.id);
      setBillingPlan(userId, selected.id);
      toast.success(`You're now on the ${selected.name} plan`);
      return;
    }
    setCheckout({
      kind: "plan",
      planId: selected.id,
      amount: selected.priceMonthly,
      description: `${selected.name} — monthly subscription`,
    });
  }

  function chooseTopUp(pack: (typeof TOP_UP_PACKS)[number]) {
    setCheckout({
      kind: "topup",
      pack,
      amount: pack.price,
      description: `One-time top-up of ${pack.tokens.toLocaleString()} tokens`,
    });
  }

  function handlePaid() {
    if (!checkout) return;
    applyCheckout(userId, checkout);
    setBilling(loadBilling(userId));
    setCheckout(null);
    toast.success(checkout.description);
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[860px] px-5 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Billing & Tokens"
          description="Every generation spends tokens. Pick a plan for a larger monthly allowance, or top up on the go."
        />

        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold tracking-[-0.01em]">{plan.name} plan</h2>
                <Badge variant="soft">{plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}/mo`}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {plan.tokensPerMonth.toLocaleString()} tokens refresh at the start of each month.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-[15px] font-bold text-foreground">
                <Zap size={15} className="text-primary" />
                {balance.toLocaleString()}
                <span className="text-xs font-medium text-muted">tokens left</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>Used this period</span>
              <span>
                {account.consumedThisPeriod.toLocaleString()} / {allowance.toLocaleString()} tokens
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className={cx("h-full rounded-full transition-all", usedPct >= 90 ? "bg-danger" : "bg-primary")}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Plans</h2>
          <p className="mt-1 text-sm text-muted">
            Monthly tokens are credited when a paid checkout completes.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => {
              const current = p.id === planId;
              return (
                <div
                  key={p.id}
                  className={cx(
                    "flex flex-col rounded-xl border bg-surface p-5",
                    p.highlight ? "border-primary" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold tracking-[-0.01em]">{p.name}</h3>
                    {current && <Badge variant="success">Current</Badge>}
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-[-0.02em]">
                      {p.priceMonthly === 0 ? "Free" : `$${p.priceMonthly}`}
                    </span>
                    {p.priceMonthly > 0 && (
                      <span className="text-sm text-muted"> /month</span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-muted">
                    {p.tokensPerMonth.toLocaleString()} tokens / month
                  </p>
                  <ul className="mt-4 grid gap-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
                        <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex-1" />
                  <Button
                    variant={current ? "secondary" : "primary"}
                    onClick={() => choosePlan(p)}
                    disabled={current}
                  >
                    {current ? "Current plan" : p.priceMonthly === 0 ? "Downgrade" : "Choose plan"}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Buy tokens</h2>
          <p className="mt-1 text-sm text-muted">Top-ups never expire and roll over each month.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {TOP_UP_PACKS.map((pack) => (
              <div
                key={pack.id}
                className="flex flex-col rounded-xl border border-border bg-surface p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-border bg-primary-soft text-primary">
                  <Zap size={16} />
                </span>
                <div className="mt-3 text-2xl font-bold tracking-[-0.02em]">
                  {pack.tokens.toLocaleString()}
                </div>
                <p className="text-[13px] text-muted">tokens · ${pack.price} one-time</p>
                <div className="mt-4 flex-1" />
                <Button variant="secondary" onClick={() => chooseTopUp(pack)}>
                  Buy tokens
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Billing history</h2>
          {billing.payments.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted">
              No payments yet — they'll appear here after your first checkout.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {billing.payments.map((p) => {
                const style = STATUS_STYLE[p.status];
                return (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {p.description}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {formatDate(p.createdAt)} · {p.reference}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {p.currency === "NGN" ? "₦" : "$"}
                        {p.currency === "NGN" ? (p.amount / 100).toFixed(2) : p.amount.toFixed(2)}
                      </span>
                      <Badge variant={style.badge}>{style.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <BadgeCheck size={14} className="shrink-0 text-primary" />
          Payments are handled by Paystack. In this preview, checkout is simulated and no real
          charge is made.
        </p>
      </div>

      {checkout && (
        <PaystackModal
          open={Boolean(checkout)}
          onClose={() => setCheckout(null)}
          title={checkout.kind === "plan" ? "Complete your plan" : "Buy tokens"}
          description={checkout.description}
          amount={checkout.amount}
          email={user?.email ?? ""}
          onSuccess={handlePaid}
        />
      )}
    </main>
  );
}
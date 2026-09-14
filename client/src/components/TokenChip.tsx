import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { loadBilling } from "@/lib/billing-store";
import { TOKEN_COSTS } from "@/lib/pricing";
import { useTokenBalance } from "@/lib/token-store";
import { cx } from "@/lib/cx";

export function TokenChip() {
  const { user } = useAuth();
  if (!user) return null;
  const userId = user.id;
  const planId = loadBilling(userId).planId;
  const balance = useTokenBalance(userId, planId);
  const low = balance < Math.min(TOKEN_COSTS.topics, TOKEN_COSTS.chapter);

  return (
    <Link
      to="/billing"
      aria-label={`${balance.toLocaleString()} tokens remaining`}
      title="Token balance — view plans"
      className={cx(
        "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[13px] font-semibold transition-colors",
        low
          ? "border-danger-border bg-danger-bg text-danger hover:bg-danger-bg/70"
          : "border-border bg-surface text-muted hover:bg-background hover:text-foreground",
      )}
    >
      <Zap size={13} />
      {balance.toLocaleString()}
    </Link>
  );
}
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { usePaymentHistory, useVerifyPayment } from "@/lib/hooks";
import type { PaymentStatus } from "@/lib/types";

function statusBadge(status: PaymentStatus) {
  if (status === "SUCCESS")
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground">
        <CheckCircle2 size={12} /> Paid
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-danger-border bg-danger-bg text-danger">
        <XCircle size={12} /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">
      <Clock size={12} /> Pending
    </span>
  );
}

export function DashboardPayments() {
  const { data, isLoading } = usePaymentHistory();
  const [searchParams, setSearchParams] = useSearchParams();
  const verify = useVerifyPayment();

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) return;
    verify
      .mutateAsync(reference)
      .then((res) => {
        if (res.status === "SUCCESS") toast.success("Payment confirmed. Chapters unlocked!");
        else toast.error("Payment was not successful.");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not verify payment."))
      .finally(() => {
        const next = new URLSearchParams(searchParams);
        next.delete("reference");
        next.delete("trxref");
        setSearchParams(next, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <>
      <div className="text-2xl font-bold tracking-[-0.02em] mb-1">Payments</div>
      <p className="text-muted text-sm mb-6 max-w-[62ch] leading-[1.65]">Your one-time project unlocks and payment history.</p>

      {reference && verify.isPending && (
        <div className="rounded-lg border border-border bg-background p-8" style={{ marginBottom: "1.25rem" }}>
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            <span className="text-[13px]">Confirming your payment…</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center p-8">
          <span className="inline-block h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
      )}

      {data && data.payments.length === 0 && (
        <div className="rounded-lg border border-border bg-background p-8" style={{ textAlign: "center" }}>
          <CreditCard size={28} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
          <p className="text-muted text-[13px]">
            No payments yet. Unlock a project to access Chapters Two to Five.
          </p>
          <Link to="/dashboard/history" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm mt-2">
            View my projects
          </Link>
        </div>
      )}

      {data && data.payments.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.payments.map((p) => (
            <div className="rounded-lg border border-border bg-background p-5 transition-[border-color,box-shadow] duration-150 hover:shadow-sm" key={p.id}>
              <div className="flex items-center gap-2.5" style={{ gap: "0.75rem", alignItems: "flex-start" }}>
                <div className="flex-1">
                  <div style={{ fontWeight: 600 }}>
                    {p.topic?.prompt || "Project unlock"}
                  </div>
                  <div className="text-muted text-xs" style={{ marginTop: "0.2rem" }}>
                    Ref: {p.reference} · {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>
                    {p.currency === "NGN" ? "₦" : ""}
                    {(p.amount / 100).toLocaleString()}
                  </div>
                  <div style={{ marginTop: "0.35rem" }}>{statusBadge(p.status)}</div>
                </div>
              </div>
              {p.status === "PENDING" && p.topic && (
                <div style={{ marginTop: "0.75rem" }}>
                  <Link to={`/project/${p.topic.id}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
                    Finish payment
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
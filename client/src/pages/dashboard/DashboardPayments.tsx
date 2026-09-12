import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { usePaymentHistory, useVerifyPayment } from "@/lib/hooks";
import type { PaymentStatus } from "@/lib/types";

function statusBadge(status: PaymentStatus) {
  if (status === "SUCCESS")
    return (
      <span className="badge badge-primary">
        <CheckCircle2 size={12} /> Paid
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="badge badge-danger">
        <XCircle size={12} /> Failed
      </span>
    );
  return (
    <span className="badge badge-neutral">
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
      <div className="dash-title">Payments</div>
      <p className="dash-sub">Your one-time project unlocks and payment history.</p>

      {reference && verify.isPending && (
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <div className="row">
            <span className="spinner" />
            <span className="text-sm">Confirming your payment…</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loader-row">
          <span className="spinner" />
        </div>
      )}

      {data && data.payments.length === 0 && (
        <div className="card" style={{ textAlign: "center" }}>
          <CreditCard size={28} style={{ color: "var(--primary)", marginBottom: "0.5rem" }} />
          <p className="muted text-sm">
            No payments yet. Unlock a project to access Chapters Two to Five.
          </p>
          <Link to="/dashboard/history" className="btn btn-primary btn-sm mt-2">
            View my projects
          </Link>
        </div>
      )}

      {data && data.payments.length > 0 && (
        <div className="topic-list">
          {data.payments.map((p) => (
            <div className="topic-card" key={p.id}>
              <div className="row" style={{ gap: "0.75rem", alignItems: "flex-start" }}>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>
                    {p.topic?.prompt || "Project unlock"}
                  </div>
                  <div className="muted text-xs" style={{ marginTop: "0.2rem" }}>
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
                  <Link to={`/project/${p.topic.id}`} className="btn btn-outline btn-sm">
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
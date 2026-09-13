import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { usePaymentHistory, useVerifyPayment } from "@/lib/hooks";
import type { PaymentStatus } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";

function statusBadge(status: PaymentStatus) {
  if (status === "SUCCESS") return <Badge variant="primary"><CheckCircle2 size={12} /> Paid</Badge>;
  if (status === "FAILED") return <Badge variant="danger"><XCircle size={12} /> Failed</Badge>;
  return <Badge><Clock size={12} /> Pending</Badge>;
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
      <PageHeader
        title="Payments"
        description="Your one-time project unlocks and payment history."
      />

      {reference && verify.isPending && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-border bg-background p-4 text-sm text-muted">
          <Spinner size={16} /> Confirming your payment…
        </div>
      )}

      {isLoading && (
        <div className="grid gap-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-20 w-full" />
          ))}
        </div>
      )}

      {data && data.payments.length === 0 && (
        <EmptyState
          eyebrow="No payments yet"
          title="Nothing here yet"
          body="Unlock a project to access Chapters Two to Five."
          actions={
            <ButtonLink to="/dashboard/history" size="sm">View my projects</ButtonLink>
          }
        />
      )}

      {data && data.payments.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.payments.map((p) => (
            <div className="rounded-lg border border-border bg-background p-5" key={p.id}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">
                    {p.topic?.prompt || "Project unlock"}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    Ref: {p.reference} · {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">
                    {p.currency === "NGN" ? "₦" : ""}
                    {(p.amount / 100).toLocaleString()}
                  </div>
                  <div className="mt-1.5">{statusBadge(p.status)}</div>
                </div>
              </div>
              {p.status === "PENDING" && p.topic && (
                <div className="mt-3">
                  <ButtonLink to={`/project/${p.topic.id}`} variant="secondary" size="sm">
                    Finish payment
                  </ButtonLink>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
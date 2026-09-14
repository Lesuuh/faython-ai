import { useState } from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export function PaystackModal({
  open,
  onClose,
  title,
  description,
  amount,
  email,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  amount: number;
  email: string;
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [payerEmail, setPayerEmail] = useState(email);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");

  function handlePay() {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1400);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handlePay} disabled={processing || !cardNumber.trim() || !expiry.trim()}>
            {processing ? <Spinner size={16} /> : <Lock size={14} />}
            {processing ? "Processing…" : `Pay $${amount.toFixed(2)}`}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-md border border-border bg-surface px-4 py-3">
        <div className="text-xs text-muted">Amount due</div>
        <div className="text-2xl font-bold tracking-[-0.02em]">${amount.toFixed(2)}</div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Preview checkout — no real charge is made.
        </p>
      </div>

      <div className="grid gap-4">
        <Field label="Email" htmlFor="gateway-email">
          <Input
            id="gateway-email"
            type="email"
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            disabled={processing}
          />
        </Field>
        <Field label="Card number" htmlFor="gateway-card">
          <Input
            id="gateway-card"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            disabled={processing}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expiry" htmlFor="gateway-expiry">
            <Input
              id="gateway-expiry"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              disabled={processing}
            />
          </Field>
          <Field label="CVV" htmlFor="gateway-cvv">
            <Input
              id="gateway-cvv"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              disabled={processing}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
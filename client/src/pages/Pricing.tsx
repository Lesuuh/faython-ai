import { Link } from "react-router-dom";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const freeFeatures = [
  "3 AI topic generations per day",
  "Chapter One (Introduction) — free, 3 per day",
  "Full conversation history per project",
  "Save, search & revisit projects",
];

const paidFeatures = [
  "Everything in Free",
  "Chapters Two to Five unlocked, one-time",
  "Literature Review, Methodology, Results & Conclusion",
  "Full 5-chapter project, yours to keep",
  "No subscription — pay once per project",
];

export function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="py-[72px] pb-[56px]">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5" style={{ textAlign: "center", maxWidth: 720 }}>
          <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground" style={{ marginBottom: "1.25rem" }}>
            Simple, honest pricing
          </span>
          <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1.02] max-w-[16ch] mb-6">Start free. Unlock your full project when you're ready.</h1>
          <p className="text-muted mb-8 max-w-[58ch] text-[17px] leading-[1.7]">
            Generate topics and your Chapter One for free. Pay once per project to unlock Chapters
            Two to Five — no subscriptions, no surprises.
          </p>
        </div>
      </section>

      <section className="py-20" id="plans">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[920px] mx-auto">
            <div className="relative flex flex-col rounded-lg border border-border bg-background p-8">
              <div className="mb-1 text-base font-medium">Free</div>
              <div className="mb-1 text-[40px] font-bold tracking-[-0.04em]">
                ₦0<span className="text-muted text-[13px] font-medium">/ forever</span>
              </div>
              <p className="text-muted text-[13px]">Perfect for getting started and exploring your topic.</p>
              <ul className="my-5 mb-6 grid gap-2.5 text-sm leading-[1.6]">
                {freeFeatures.map((f) => (
                  <li className="flex items-start gap-2.5" key={f}>
                    <Check size={15} style={{ color: "var(--primary)" }} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center"
              >
                Get started free
              </Link>
            </div>

            <div className="relative flex flex-col rounded-lg border border-border bg-background p-8 border-primary shadow-md">
              <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground absolute -top-[13px] left-1/2 -translate-x-1/2">
                Most popular
              </span>
              <div className="mb-1 text-base font-medium">Full Project Unlock</div>
              <div className="mb-1 text-[40px] font-bold tracking-[-0.04em]">
                ₦500<span className="text-muted text-[13px] font-medium">/ once per project</span>
              </div>
              <p className="text-muted text-[13px]">
                Unlock the complete 5-chapter project for any topic you're pursuing.
              </p>
              <ul className="my-5 mb-6 grid gap-2.5 text-sm leading-[1.6]">
                {paidFeatures.map((f) => (
                  <li className="flex items-start gap-2.5" key={f}>
                    <Check size={15} style={{ color: "var(--primary)" }} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center"
              >
                <Sparkles size={16} /> Unlock a project <ArrowRight size={16} />
              </Link>
              <p className="text-xs text-muted" style={{ textAlign: "center", marginTop: "0.75rem" }}>
                Paid securely via Paystack. One-time per project.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-8" style={{ marginTop: "2.5rem", textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>How unlocking works</h3>
            <p className="text-muted text-[13px]" style={{ maxWidth: 520, margin: "0 auto" }}>
              Generate a topic, write your Chapter One for free, then unlock the remaining chapters
              for that project once. You keep everything forever — even if you never pay again.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
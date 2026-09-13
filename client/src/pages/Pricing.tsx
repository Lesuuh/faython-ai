import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const freeFeatures = [
  "3 AI topic generations per day",
  "Chapter One (Introduction) — free, 3 per day",
  "Full conversation history per project",
  "Save, search & revisit projects",
];

const paidFeatures = [
  "Everything in Free",
  "Chapters Two to Five unlocked, one-time",
  "Literature Review, Methodology, Results and Discussion",
  "Full 5-chapter project, yours to keep",
  "No subscription — pay once per project",
];

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary">
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
          <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="py-16 sm:py-[72px]">
        <div className="mx-auto w-full max-w-[720px] px-5 text-center sm:px-6">
          <Badge variant="soft" className="mb-6">
            Simple, honest pricing
          </Badge>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
            Start free. Unlock your full project when you're ready.
          </h1>
          <p className="mx-auto mt-5 max-w-[58ch] text-[17px] leading-[1.7] text-muted">
            Generate topics and your Chapter One for free. Pay once per project to unlock Chapters
            Two to Five — no subscriptions, no surprises.
          </p>
        </div>
      </section>

      <section className="pb-20" id="plans">
        <div className="mx-auto w-full max-w-[920px] px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="card flex flex-col p-8">
              <div className="text-base font-medium">Free</div>
              <div className="mt-2 text-[40px] font-bold leading-none tracking-[-0.04em]">
                ₦0<span className="ml-1 align-middle text-[13px] font-medium text-muted">forever</span>
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Perfect for getting started and exploring your topic.
              </p>
              <ul className="my-6 grid gap-2.5 text-sm leading-[1.6]">
                {freeFeatures.map((f) => (
                  <FeatureItem key={f}>{f}</FeatureItem>
                ))}
              </ul>
              <ButtonLink to="/register" variant="secondary" className="mt-auto w-full">
                Create a free account
              </ButtonLink>
            </div>

            <div className="relative card flex flex-col border-primary p-8 shadow-md">
              <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
              <div className="text-base font-medium">Full project unlock</div>
              <div className="mt-2 text-[40px] font-bold leading-none tracking-[-0.04em]">
                ₦500
                <span className="ml-1 align-middle text-[13px] font-medium text-muted">once per project</span>
              </div>
              <p className="mt-3 text-[13px] text-muted">
                Unlock the complete 5-chapter project for any topic you're pursuing.
              </p>
              <ul className="my-6 grid gap-2.5 text-sm leading-[1.6]">
                {paidFeatures.map((f) => (
                  <FeatureItem key={f}>{f}</FeatureItem>
                ))}
              </ul>
              <ButtonLink to="/register" className="mt-auto w-full">
                Unlock a project <ArrowRight size={16} />
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-muted">
                Paid securely via Paystack. One-time, per project.
              </p>
            </div>
          </div>

          <div className="card mx-auto mt-10 max-w-[640px] p-8 text-center">
            <h3 className="mb-2 text-base font-semibold">How unlocking works</h3>
            <p className="mx-auto max-w-[520px] text-[13px] leading-relaxed text-muted">
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
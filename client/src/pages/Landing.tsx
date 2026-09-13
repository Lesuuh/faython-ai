import {
  ArrowRight,
  BookOpen,
  FileDown,
  Lock,
  MessageSquare,
  ScanText,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ButtonLink, ButtonAsLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const steps = [
  {
    number: "01",
    title: "State your topic or interest",
    body: "Type your final-year topic — or just a vague interest. No topic yet? Faython suggests 5–8 scoped options and you pick one.",
  },
  {
    number: "02",
    title: "Set up the project",
    body: "Enter your university and course, choose the standard five-chapter structure, and pick a referencing style — APA, MLA, IEEE, Chicago or Harvard.",
  },
  {
    number: "03",
    title: "Generate and refine Chapter One",
    body: "Faython writes the Introduction with mixed Nigerian and international citations. Chat to refine any section — every message is saved.",
  },
  {
    number: "04",
    title: "Unlock Chapters Two to Five",
    body: "A one-time Paystack payment unlocks the remaining chapters for that project only. Generate, refine, and export as DOCX whenever you're ready.",
  },
];

const features = [
  {
    icon: ScanText,
    title: "Topic from an interest or an image",
    body: "No topic yet? Describe your field or upload a photo of your lecturer's instructions — Faython returns researchable, scoped options.",
  },
  {
    icon: SlidersHorizontal,
    title: "Project-level control",
    body: "University, chapter structure and referencing style are set once per project and respected in every chapter it writes.",
  },
  {
    icon: MessageSquare,
    title: "Conversational refinement",
    body: "Every chapter is a live conversation. Ask Faython to tighten the problem statement or rework a section — the thread stays open.",
  },
  {
    icon: BookOpen,
    title: "Free Chapter One",
    body: "The Introduction is generated on the free plan, with citations drawn from Nigerian and international scholarly sources.",
  },
  {
    icon: Lock,
    title: "One-time chapter unlock",
    body: "Chapters Two to Five are granted per project through a verified Paystack payment — never a subscription, and it stays unlocked.",
  },
  {
    icon: FileDown,
    title: "DOCX export at any point",
    body: "Your finished and unlocked chapters compile into a Word document you can submit or extend offline.",
  },
];

const faqs = [
  {
    q: "What is Faython | Scholar?",
    a: "An AI research assistant for Nigerian university students. It turns a vague interest into a scoped final-year topic, writes your chapters structure by structure, and lets you refine any section by chatting with it.",
  },
  {
    q: "Who is it built for?",
    a: "Undergraduate and postgraduate students across disciplines — Accounting, Nursing, Computer Science, Education, Engineering, Law, the sciences and more. It understands Nigerian academic conventions.",
  },
  {
    q: "What is free?",
    a: "Topic generation and Chapter One are free, with a fair daily cap. A one-time, per-project payment unlocks Chapters Two to Five for that project only — a second project has its own unlock.",
  },
  {
    q: "How does the payment work?",
    a: "You pay once through Paystack. The unlock is confirmed server-side by Paystack's webhook and applied to that project's entitlement — never a client-side flag.",
  },
  {
    q: "Can I upload handwritten notes?",
    a: "Yes. A clear photo of handwritten notes, an assignment sheet or project instructions can be uploaded, and Faython reads it before responding.",
  },
  {
    q: "How do I get my project out?",
    a: "Export as DOCX at any point. You get every chapter that has been generated and unlocked so far.",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{children}</p>
  );
}

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar tone="dark" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-night pb-16 pt-20 sm:pb-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="dot-grid-dark absolute inset-0" />
          <div className="absolute inset-x-0 top-[-120px] mx-auto h-[460px] w-full max-w-[820px] [background:radial-gradient(closest-side,rgb(24_208_112/0.14),transparent_70%)]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-[760px] flex-col items-center px-5 text-center sm:px-6">
          <h1 className="max-w-[20ch] text-[clamp(2.5rem,6.2vw,4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white">
            Turn a rough idea into a finished research project, chapter by chapter.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[17px] leading-[1.7] text-white/70">
            Faython helps you pick a researchable topic, write your chapters one at a time, and
            refine each one by talking to it — the way you'd argue with a supervisor, but up at 2am.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/generate-topics?new=1" variant="green" size="lg">
              Start your project — it's free
            </ButtonLink>
            <ButtonAsAnchor href="#how-it-works" variant="outlineOnDark" size="lg">
              See how it works
            </ButtonAsAnchor>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            Free Chapter One · One-time per-project unlock
          </p>

          <div className="mt-12 w-full border-t border-white/10 pt-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Built for final-year students in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5">
              {["Accounting", "Nursing", "Computer Science", "Engineering", "Education", "Law"].map(
                (d) => (
                  <span key={d} className="text-[15px] font-semibold tracking-tight text-white/70">
                    {d}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Beta notice */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-5 py-4 text-center sm:px-6">
          <span className="flex items-center gap-2.5 text-[13px] leading-relaxed text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            Currently in beta — topic generation and Chapter One are free; Chapters Two to Five
            unlock per project.
          </span>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" id="how-it-works">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="max-w-[24ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            From a vague idea to a finished project
          </h2>
          <p className="mb-12 mt-3 max-w-[56ch] text-base leading-[1.7] text-muted">
            Four steps. Each chapter is generated, then refined through an ongoing conversation that
            is saved to your project.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="card relative overflow-hidden p-6">
                <span className="absolute inset-x-0 top-0 h-1 bg-green" aria-hidden="true" />
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-green">
                  Step {s.number}
                </p>
                <h3 className="mb-2 text-base font-medium tracking-[-0.01em]">{s.title}</h3>
                <p className="text-sm leading-[1.65] text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface py-20" id="features">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
          <SectionLabel>Features</SectionLabel>
          <h2 className="max-w-[24ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Structured, verifiable, yours
          </h2>
          <p className="mb-12 mt-3 max-w-[56ch] text-base leading-[1.7] text-muted">
            The tooling follows the format Nigerian universities expect and leaves you in control of
            every section.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-8">
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-primary">
                  <f.icon size={18} />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-[-0.01em]">{f.title}</h3>
                <p className="text-sm leading-[1.65] text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" id="faq">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
          <SectionLabel>FAQ</SectionLabel>
<h2 className="max-w-[24ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
          Common questions
        </h2>
          <p className="mb-8 mt-3 text-base leading-[1.7] text-muted">
            A few notes on scope, cost and how the cloud handoff works.
          </p>
          <div className="grid gap-2.5 lg:grid-cols-2">
            {faqs.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>
                  {f.q}
                  <ChevronDownIcon />
                </summary>
                <div className="faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-surface py-20" id="pricing">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="max-w-[24ch] text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Free to write the first third. One payment for the rest.
          </h2>
          <p className="mb-12 mt-3 max-w-[56ch] text-base leading-[1.7] text-muted">
            Topic generation, Chapter One and refining are free within a daily cap. Chapters Two to
            Five unlock for a single project when a one-time Paystack payment is confirmed.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card flex flex-col p-8">
              <h3 className="text-base font-semibold">Free</h3>
              <p className="mt-1 text-sm text-muted">Everything you need to start — capped daily.</p>
              <ul className="my-6 grid gap-2.5 text-sm leading-[1.6]">
                <CheckItem>Topic or interest to scoped suggestions</CheckItem>
                <CheckItem>Chapter One generation and chat refinement</CheckItem>
                <CheckItem>DOCX export of what's unlocked</CheckItem>
              </ul>
              <ButtonLink to="/register" variant="secondary" className="mt-auto w-full">
                Start free
              </ButtonLink>
            </div>
            <div className="card relative flex flex-col overflow-hidden border-primary bg-background p-8 shadow-md">
              <span
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green via-green/70 to-green/40"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">Full project</h3>
                <Badge variant="primary">Most popular</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">One-time per-project unlock, confirmed by Paystack.</p>
              <ul className="my-6 grid gap-2.5 text-sm leading-[1.6]">
                <CheckItem>Chapters Two to Five generation and refinement</CheckItem>
                <CheckItem>Citation-following content in your referencing style</CheckItem>
                <CheckItem>Unlimited DOCX export of the finished project</CheckItem>
              </ul>
              <ButtonLink to="/pricing" className="mt-auto w-full">
                See pricing <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* About & contact */}
      <section className="py-20" id="about">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="card p-8">
              <h3 className="mb-2 text-base font-semibold">About Faython</h3>
              <p className="text-sm leading-[1.7] text-muted">
                Faython | Scholar is an AI-powered academic research assistant developed by CogniTech
                Integrated Solution (CIS), headquartered in Port Harcourt, Rivers State, Nigeria. It
                is in beta and focuses on research topic generation and chapter writing for Nigerian
                university projects.
              </p>
              <Badge variant="soft" className="mt-4">
                Currently in beta
              </Badge>
            </div>
            <div className="card p-8">
              <h3 className="mb-2 text-base font-semibold">Contact CIS</h3>
              <p className="mb-5 text-sm leading-[1.7] text-muted">
                CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <ButtonAsAnchor href="mailto:cognitechsolutions.official@gmail.com" variant="secondary" size="sm">
                  cognitechsolutions.official@gmail.com
                </ButtonAsAnchor>
                <ButtonAsAnchor
                  href="https://wa.me/2349157612026"
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                  size="sm"
                >
                  +234-915-7612-026
                </ButtonAsAnchor>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckMark />
      <span>{children}</span>
    </li>
  );
}

function CheckMark() {
  return (
    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary">
      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" aria-hidden="true">
        <path d="M2.5 6.5l2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" className="chevron text-muted">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ButtonAsAnchor({
  href,
  children,
  variant = "secondary" as const,
  size = "md" as const,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: "secondary" | "primary" | "green" | "outlineOnDark";
  size?: "sm" | "md" | "lg";
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <ButtonAsLink href={href} variant={variant} size={size} {...rest}>
      {children}
    </ButtonAsLink>
  );
}
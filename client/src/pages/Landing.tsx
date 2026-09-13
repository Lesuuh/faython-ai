import {
  ArrowRight,
  BookOpen,
  FileDown,
  Lock,
  MessageSquare,
  ScanText,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const steps = [
  {
    number: "01",
    title: "State your topic or interest",
    body: "Type your final-year topic — or just a vague interest. If you don't have a topic, Faython suggests 5–8 scoped options and you pick one.",
  },
  {
    number: "02",
    title: "Set up the project",
    body: "Enter your university, choose the standard five-chapter structure, and pick a referencing style — APA, MLA, IEEE, Chicago or Harvard.",
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

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <section className="pt-24 pb-20">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4" style={{ marginBottom: "24px" }}>
            An AI research assistant for Nigerian final-year students
          </p>
          <h1 className="text-[clamp(2.75rem,7vw,4.5rem)] font-bold tracking-[-0.04em] leading-[1.02] max-w-[16ch] mb-6">
            From a rough interest to a defended project.
          </h1>
          <p className="text-muted mb-8 max-w-[58ch] text-[17px] leading-[1.7]">
            Faython | Scholar helps you pick a researchable topic, build your chapters one at a
            time, and refine each one by talking to it — Chapter One free, the rest behind a
            single per-project payment.
          </p>
          <div className="flex flex-wrap gap-3 mb-16">
            <Link
              to="/generate-topics"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-4 py-4 text-[15px] rounded-md font-semibold"
            >
              Start a project <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-4 py-4 text-[15px] rounded-md font-semibold"
            >
              How it works
            </a>
          </div>
          <div className="grid gap-px auto-rows-fr border border-border bg-border rounded-lg overflow-hidden">
            <div className="bg-background p-6">
              <strong className="block text-[28px] font-bold tracking-[-0.03em] mb-1">5</strong>
              <span className="text-muted text-[13px]">Standard chapters</span>
            </div>
            <div className="bg-background p-6">
              <strong className="block text-[28px] font-bold tracking-[-0.03em] mb-1">5</strong>
              <span className="text-muted text-[13px]">Referencing styles</span>
            </div>
            <div className="bg-background p-6">
              <strong className="block text-[28px] font-bold tracking-[-0.03em] mb-1">₦0</strong>
              <span className="text-muted text-[13px]">To generate Chapter One</span>
            </div>
            <div className="bg-background p-6">
              <strong className="block text-[28px] font-bold tracking-[-0.03em] mb-1">1</strong>
              <span className="text-muted text-[13px]">Per-project unlock fee</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border" id="how-it-works">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4">How it works</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-3">From a vague idea to a finished project</h2>
          <p className="text-muted max-w-[56ch] text-base mb-12 leading-[1.7]">
            Four steps. Each chapter is generated, then refined through an ongoing conversation that
            is saved to your project.
          </p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {steps.map((s) => (
              <div className="relative rounded-lg border border-border bg-background p-8 pl-[72px]" key={s.number}>
                <span className="absolute left-8 top-8 flex h-[22px] w-[22px] items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-primary text-xs font-bold tracking-[0.04em]">
                  {s.number}
                </span>
                <h3 className="mb-2 text-base font-medium tracking-[-0.01em]">{s.title}</h3>
                <p className="text-muted text-sm leading-[1.65]">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5" style={{ marginTop: "32px" }}>
            <Link
              to="/generate-topics"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Start your project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20" id="features">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4">Features</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-3">Structured, verifiable, yours</h2>
          <p className="text-muted max-w-[56ch] text-base mb-12 leading-[1.7]">
            The tooling is unintrusive — it follows the format Nigerian universities expect and
            leaves you in control of every section.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-border bg-border rounded-lg overflow-hidden">
            {features.map((f) => (
              <div className="bg-background p-8 min-h-[200px]" key={f.title}>
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-primary-border bg-primary-soft text-primary">
                  <f.icon size={18} />
                </div>
                <h3 className="text-base font-semibold tracking-[-0.01em] mb-2">{f.title}</h3>
                <p className="text-muted text-sm leading-[1.65]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border" id="faq">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5" style={{ maxWidth: 720 }}>
          <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4">FAQ</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-3">Common questions</h2>
          <p className="text-muted max-w-[56ch] text-base mb-12 leading-[1.7]">A few notes on scope, cost and how the cloud handoff works.</p>
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="py-20" id="pricing">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <p className="text-muted text-xs uppercase tracking-[0.16em] font-semibold mb-4">Pricing</p>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-3">Free to write the first third. One payment for the rest.</h2>
          <p className="text-muted max-w-[56ch] text-base mb-12 leading-[1.7]">
            Topic generation, Chapter One and refining are free within a daily cap. Chapters Two to
            Five unlock for a single project when a one-time Paystack payment is confirmed.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <div className="rounded-lg border border-border bg-background p-8">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Free</h3>
              <p className="text-muted" style={{ marginBottom: "20px" }}>
                Everything you need to start — capped daily.
              </p>
              <ul className="my-5 mb-6 grid gap-2.5 text-sm leading-[1.6]">
                <li className="flex items-start gap-2.5">Topic or interest to scoped suggestions</li>
                <li className="flex items-start gap-2.5">Chapter One generation and chat refinement</li>
                <li className="flex items-start gap-2.5">DOCX export of what's unlocked</li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center"
              >
                Start free
              </Link>
            </div>
            <div className="rounded-lg border border-border bg-background p-8">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Full project</h3>
              <p className="text-muted" style={{ marginBottom: "20px" }}>
                One-time per-project unlock, confirmed by Paystack.
              </p>
              <ul className="my-5 mb-6 grid gap-2.5 text-sm leading-[1.6]">
                <li className="flex items-start gap-2.5">Chapters Two to Five generation and refinement</li>
                <li className="flex items-start gap-2.5">Citation-following content in your referencing style</li>
                <li className="flex items-start gap-2.5">Unlimited DOCX export of the finished project</li>
              </ul>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border" id="about">
        <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <div className="rounded-lg border border-border bg-background p-8">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>About Faython</h3>
              <p className="text-muted">
                Faython | Scholar is an AI-powered academic research assistant developed by
                CogniTech Integrated Solution (CIS), headquartered in Port Harcourt, Rivers State,
                Nigeria. It is in beta and focuses on research topic generation and chapter writing
                for Nigerian university projects.
              </p>
              <span className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted" style={{ marginTop: "16px", padding: "6px 14px" }}>
                Currently in Beta
              </span>
            </div>
            <div className="rounded-lg border border-border bg-background p-8">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Contact CIS</h3>
              <p className="text-muted" style={{ marginBottom: "20px" }}>
                CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
              </p>
              <div className="flex items-center gap-2.5" style={{ flexWrap: "wrap" }}>
                <a className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed" href="mailto:cognitechsolutions.official@gmail.com">
                  cognitechsolutions.official@gmail.com
                </a>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed"
                  href="https://wa.me/2349157612026"
                  target="_blank"
                  rel="noreferrer"
                >
                  +234-915-7612-026
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
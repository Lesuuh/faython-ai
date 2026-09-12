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
    <div className="screen">
      <Navbar />

      <section className="hero">
        <div className="container">
          <p className="section-eyebrow" style={{ marginBottom: "24px" }}>
            An AI research assistant for Nigerian final-year students
          </p>
          <h1>From a rough interest to a defended project.</h1>
          <p className="lead">
            Faython | Scholar helps you pick a researchable topic, build your chapters one at a
            time, and refine each one by talking to it — Chapter One free, the rest behind a
            single per-project payment.
          </p>
          <div className="hero-cta">
            <Link to="/generate-topics" className="btn btn-primary btn-lg">
              Start a project <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              How it works
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>5</strong>
              <span>Standard chapters</span>
            </div>
            <div>
              <strong>5</strong>
              <span>Referencing styles</span>
            </div>
            <div>
              <strong>₦0</strong>
              <span>To generate Chapter One</span>
            </div>
            <div>
              <strong>1</strong>
              <span>Per-project unlock fee</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <p className="section-eyebrow">How it works</p>
          <h2>From a vague idea to a finished project</h2>
          <p className="section-sub">
            Four steps. Each chapter is generated, then refined through an ongoing conversation that
            is saved to your project.
          </p>
          <div className="steps">
            {steps.map((s) => (
              <div className="step" key={s.number}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: "32px" }}>
            <Link to="/generate-topics" className="btn btn-primary">
              Start your project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <p className="section-eyebrow">Features</p>
          <h2>Structured, verifiable, yours</h2>
          <p className="section-sub">
            The tooling is unintrusive — it follows the format Nigerian universities expect and
            leaves you in control of every section.
          </p>
          <div className="grid-3">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="ic">
                  <f.icon size={18} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="section-eyebrow">FAQ</p>
          <h2>Common questions</h2>
          <p className="section-sub">A few notes on scope, cost and how the cloud handoff works.</p>
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <p className="section-eyebrow">Pricing</p>
          <h2>Free to write the first third. One payment for the rest.</h2>
          <p className="section-sub">
            Topic generation, Chapter One and refining are free within a daily cap. Chapters Two to
            Five unlock for a single project when a one-time Paystack payment is confirmed.
          </p>
          <div className="resp-grid">
            <div className="card">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Free</h3>
              <p className="muted" style={{ marginBottom: "20px" }}>
                Everything you need to start — capped daily.
              </p>
              <ul className="plan-list">
                <li>Topic or interest to scoped suggestions</li>
                <li>Chapter One generation and chat refinement</li>
                <li>DOCX export of what's unlocked</li>
              </ul>
              <Link to="/register" className="btn btn-outline btn-block">
                Start free
              </Link>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Full project</h3>
              <p className="muted" style={{ marginBottom: "20px" }}>
                One-time per-project unlock, confirmed by Paystack.
              </p>
              <ul className="plan-list">
                <li>Chapters Two to Five generation and refinement</li>
                <li>Citation-following content in your referencing style</li>
                <li>Unlimited DOCX export of the finished project</li>
              </ul>
              <Link to="/pricing" className="btn btn-primary btn-block">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="about">
        <div className="container">
          <div className="resp-grid">
            <div className="card">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>About Faython</h3>
              <p className="muted">
                Faython | Scholar is an AI-powered academic research assistant developed by
                CogniTech Integrated Solution (CIS), headquartered in Port Harcourt, Rivers State,
                Nigeria. It is in beta and focuses on research topic generation and chapter writing
                for Nigerian university projects.
              </p>
              <span className="badge badge-neutral" style={{ marginTop: "16px", padding: "6px 14px" }}>
                Currently in Beta
              </span>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "8px", letterSpacing: "-0.02em" }}>Contact CIS</h3>
              <p className="muted" style={{ marginBottom: "20px" }}>
                CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
              </p>
              <div className="row" style={{ flexWrap: "wrap" }}>
                <a className="btn btn-outline" href="mailto:cognitechsolutions.official@gmail.com">
                  cognitechsolutions.official@gmail.com
                </a>
                <a
                  className="btn btn-outline"
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
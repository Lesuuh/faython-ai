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
    <div className="screen">
      <Navbar />

      <section className="hero hero-sm">
        <div className="container" style={{ textAlign: "center", maxWidth: 720 }}>
          <span className="badge badge-primary" style={{ marginBottom: "1.25rem" }}>
            Simple, honest pricing
          </span>
          <h1>Start free. Unlock your full project when you're ready.</h1>
          <p className="lead">
            Generate topics and your Chapter One for free. Pay once per project to unlock Chapters
            Two to Five — no subscriptions, no surprises.
          </p>
        </div>
      </section>

      <section className="section" id="plans">
        <div className="container">
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-name">Free</div>
              <div className="plan-price">
                ₦0<span className="plan-period">/ forever</span>
              </div>
              <p className="muted text-sm">Perfect for getting started and exploring your topic.</p>
              <ul className="plan-list">
                {freeFeatures.map((f) => (
                  <li key={f}>
                    <Check size={15} style={{ color: "var(--primary)" }} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-outline btn-block">
                Get started free
              </Link>
            </div>

            <div className="pricing-card pricing-featured">
              <span className="badge badge-primary">Most popular</span>
              <div className="plan-name">Full Project Unlock</div>
              <div className="plan-price">
                ₦500<span className="plan-period">/ once per project</span>
              </div>
              <p className="muted text-sm">
                Unlock the complete 5-chapter project for any topic you're pursuing.
              </p>
              <ul className="plan-list">
                {paidFeatures.map((f) => (
                  <li key={f}>
                    <Check size={15} style={{ color: "var(--primary)" }} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary btn-block">
                <Sparkles size={16} /> Unlock a project <ArrowRight size={16} />
              </Link>
              <p className="text-xs muted" style={{ textAlign: "center", marginTop: "0.75rem" }}>
                Paid securely via Paystack. One-time per project.
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: "2.5rem", textAlign: "center", maxWidth: 640, marginInline: "auto" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>How unlocking works</h3>
            <p className="muted text-sm" style={{ maxWidth: 520, margin: "0 auto" }}>
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
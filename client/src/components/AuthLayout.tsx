import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
  features,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle: string;
  features?: string[];
}) {
  const items =
    features ||
    [
      "Scoped topic suggestions from an interest",
      "Chapter One generation, free",
      "Per-project chapter unlock",
      "DOCX export of what's unlocked",
    ];

  return (
    <div className="auth-screen">
      <aside className="auth-aside">
        <div>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em" }}
          >
            <span style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
              F
            </span>
            Faython <span className="muted">Scholar</span>
          </Link>

          <h1 style={{ marginTop: "80px" }}>
            {eyebrow || "Your final-year project, built one chapter at a time."}
          </h1>
          <p className="auth-intro">
            Turn a vague interest into a scoped topic, generate your chapters with citations in
            your chosen referencing style, and refine each one by talking to Faython.
          </p>

          <div className="auth-features">
            {items.map((f) => (
              <div className="auth-feature" key={f}>
                <span className="auth-check">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="auth-footnote">
          CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
        </p>
      </aside>

      <div className="auth-card-wrap">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
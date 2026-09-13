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
    <div className="grid min-h-screen max-w-7xl mx-auto bg-background grid-cols-1 lg:grid-cols-[5fr_6fr]">
      <aside className="hidden lg:flex flex-col justify-between border-r border-border bg-surface px-18 py-14">
        <div>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em" }}
          >
            <span style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", background: "var(--primary)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
              F
            </span>
            Faython <span className="text-muted">Scholar</span>
          </Link>

          <h1
            style={{ marginTop: "80px" }}
            className="text-[2.5rem] font-bold tracking-[-0.04em] leading-[1.08] max-w-[14ch] mb-4"
          >
            {eyebrow || "Your final-year project, built one chapter at a time."}
          </h1>
          <p className="text-muted max-w-[40ch] leading-[1.7] mb-10">
            Turn a vague interest into a scoped topic, generate your chapters with citations in
            your chosen referencing style, and refine each one by talking to Faython.
          </p>

          <div className="grid gap-4">
            {items.map((f) => (
              <div className="flex items-center gap-3 text-sm text-foreground" key={f}>
                <span className="inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[11px] font-bold">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-xs leading-[1.6]">
          CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
        </p>
      </aside>

      <div className="flex items-center justify-center bg-background px-5 py-10 lg:px-10 lg:py-14">
        <div className="w-full max-w-[400px] rounded-lg border border-border bg-background p-10">
          <h2 className="mb-2 text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          <p className="mb-7 text-muted text-[14px] leading-[1.6]">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
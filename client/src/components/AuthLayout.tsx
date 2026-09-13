import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

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
    <div className="mx-auto grid min-h-screen w-full max-w-[1100px] grid-cols-1 lg:grid-cols-[5fr_6fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface px-12 py-12 lg:flex">
        <div className="dot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <Link to="/" aria-label="Faython home">
            <Logo />
          </Link>

          <h1 className="mt-14 max-w-[15ch] text-[2.4rem] font-bold leading-[1.06] tracking-[-0.04em]">
            {eyebrow || "Your final-year project, built one chapter at a time."}
          </h1>
          <p className="mb-10 mt-4 max-w-[42ch] leading-[1.7] text-muted">
            Turn a vague interest into a scoped topic, generate your chapters with citations in your
            chosen referencing style, and refine each one by talking to Faython.
          </p>

          <ul className="grid gap-3.5">
            {items.map((f) => (
              <li className="flex items-center gap-3 text-sm" key={f}>
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs leading-[1.6] text-muted-foreground">
          CogniTech Integrated Solution (CIS) — Port Harcourt, Rivers State, Nigeria.
        </p>
      </aside>

      <div className="flex items-center justify-center bg-background px-5 py-10 lg:px-12 lg:py-14">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Link to="/" aria-label="Faython home">
              <Logo />
            </Link>
          </div>
          <h2 className="text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          <p className="mb-7 mt-1.5 text-[14px] leading-[1.6] text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
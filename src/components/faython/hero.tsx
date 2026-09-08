import { ArrowRight, Mail, Phone, Sparkle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div aria-hidden className="aurora-bg pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="btn-glow float-slow pointer-events-none absolute -top-20 right-1/4 -z-10 size-72 rounded-full opacity-20 blur-3xl"
      />
      <div className="mx-auto max-w-3xl px-5 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkle className="size-3.5 text-primary" aria-hidden />
            Your AI-Powered Academic Research Assistant
          </span>
          <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Get <span className="gradient-text">High-Quality Research Assistance</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Faython | Scholar helps Undergraduate and Postgraduate students discover relevant,
            researchable, and academically sound project topics across multiple disciplines.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="btn-glow h-12 rounded-2xl px-7">
              <Link to="/generate-topics">
                Start Generating Topics <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-border bg-background/70 px-7"
            >
              <a href="#how-it-works">Learn More</a>
            </Button>
          </div>
          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
            {[
              ["Disciplines", "40+"],
              ["Avg. response", "<10s"],
              ["Input modes", "3"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

    </section>
  );
}

export function ContactFooter() {
  return (
    <>
      <section id="contact" className="mx-auto max-w-4xl px-5 pb-12">
        <Reveal>
          <article className="glass-panel rounded-3xl p-8 text-center sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              CogniTech Integrated Solution (CIS)
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Port Harcourt, Rivers State, Nigeria
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:cognitechsolutions.official@gmail.com"
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                <Mail className="size-4" aria-hidden />
                cognitechsolutions.official@gmail.com
              </a>
              <a
                href="https://wa.me/2349157612026"
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                <Phone className="size-4" aria-hidden />
                +234-915-7612-026
              </a>
            </div>
          </article>
        </Reveal>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row">
          <div className="text-center sm:text-left">
            <p>© 2026 CogniTech Integrated Solution (CIS)</p>
            <p className="mt-1">Built with ❤️ for university students.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6">
            <a href="#faq" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              Terms of Service
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

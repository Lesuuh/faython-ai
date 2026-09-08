import {
  BookOpen,
  Brain,
  GraduationCap,
  ImageIcon,
  Lock,
  Mic,
  Smartphone,
  Sparkle,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./reveal";

const steps = [
  {
    n: "01",
    title: "Describe your research interest",
    body: "Type your department and level, speak a voice note, or upload a photo of your assignment sheet or handwritten notes.",
  },
  {
    n: "02",
    title: "Faython understands your request",
    body: "The AI interprets your discipline, academic level, scope and context to reason like a supervisor reviewing a proposal.",
  },
  {
    n: "03",
    title: "Receive high-quality topics instantly",
    body: "Get researchable, academically sound topics with clear scope so you can defend your choice with confidence.",
  },
];

const features = [
  { icon: Sparkle, title: "AI Research Topic Generation", body: "Original, defensible topics tailored to your field of study." },
  { icon: BookOpen, title: "Undergraduate Topics", body: "Scoped for final-year projects that can be completed in one semester." },
  { icon: GraduationCap, title: "Postgraduate Topics", body: "Deeper, gap-driven topics suitable for MSc, MBA and PhD research." },
  { icon: Mic, title: "Voice Prompt Support", body: "Record a voice note and let Faython transcribe and reason on it." },
  { icon: ImageIcon, title: "Image Prompt Support", body: "Upload lecturer instructions, handwritten notes or screenshots." },
  { icon: Brain, title: "Smart Academic Understanding", body: "Understands disciplines, methodology fit and researchability." },
  { icon: Zap, title: "Fast AI Responses", body: "Topic suggestions delivered in seconds, not days of searching." },
  { icon: Smartphone, title: "Mobile Friendly", body: "Designed mobile-first so you can research from anywhere on campus." },
  { icon: Lock, title: "Secure Experience", body: "Your prompts and uploads are processed securely and never sold." },
];

const faqs = [
  {
    q: "What is Faython?",
    a: "Faython | Scholar is an AI-powered academic research assistant built by CogniTech Integrated Solution (CIS). It helps university students generate relevant, researchable project topics in seconds.",
  },
  {
    q: "Who can use Faython?",
    a: "Undergraduate and postgraduate students across disciplines — from Accounting and Nursing to Computer Science, Education and Engineering. Supervisors and lecturers also use it to shortlist project ideas.",
  },
  {
    q: "Does Faython write complete research projects?",
    a: "Not yet. Faython Beta specialises in research topic generation only. Chapter One to Chapter Five, literature review, methodology, proposals, seminar reports and data analysis arrive in Faython Version 2.0.",
  },
  {
    q: "Can I upload handwritten notes?",
    a: "Yes. Upload a clear photo of handwritten notes, an assignment sheet or project instructions and Faython will read it before generating topics.",
  },
  {
    q: "Can I send voice messages?",
    a: "Yes. Tap the microphone, describe your research interest in your own words, and Faython will respond with topic suggestions.",
  },
];

export function Sections() {
  return (
    <>
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">How it works</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            From a vague idea to a defensible topic in three steps
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <article className="glass-panel h-full rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1.5">
                <span className="gradient-text text-4xl font-semibold">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Features</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to choose the right research topic
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <article className="group glass-panel h-full rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5">
                <span className="btn-glow flex size-11 items-center justify-center rounded-2xl">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <Reveal>
          <article className="glass-panel rounded-3xl p-8 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <Sparkle className="size-3.5" aria-hidden /> Faython Notice
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Currently in Beta</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Faython currently specializes in Research Topic Generation only.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Additional academic research features including Chapter One through Chapter Five,
              Literature Review, Research Methodology, Research Proposal, Seminar Reports, Data
              Analysis, and Complete Research Project Writing will be available in Faython Version
              2.0.
            </p>
          </article>
        </Reveal>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="glass-panel h-full rounded-3xl p-8">
              <h2 className="text-2xl font-semibold tracking-tight">About Faython</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Faython | Scholar is an AI-powered academic research assistant developed by CIS. It
                helps university students simplify the research topic selection process through
                Artificial Intelligence.
              </p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="glass-panel h-full rounded-3xl p-8">
              <h2 className="text-2xl font-semibold tracking-tight">About CIS</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                CogniTech Integrated Solution (CIS) is a technology solutions provider headquartered
                in Port Harcourt, Rivers State, Nigeria. CIS specializes in:
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {[
                  "Artificial Intelligence",
                  "Digital Transformation",
                  "Business Process Automation",
                  "Software Development",
                  "Educational Research Assistance",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="btn-glow size-1.5 rounded-full" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <Accordion type="single" collapsible className="glass-panel mt-10 rounded-3xl px-6">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
    </>
  );
}

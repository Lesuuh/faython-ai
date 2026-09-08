import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import logoAsset from "@/assets/faython-official-logo.png.asset.json";


const links = [
  { label: "Home", href: "/#home" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled ? "glass-panel mx-4 md:mx-auto" : "bg-transparent"
        }`}
      >
        <a href="/#home" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-full">
            <img src={logoAsset.url} alt="Faython logo" className="size-full object-cover" />
          </span>

          <span className="text-base">
            Faython
            <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Beta
            </span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="transition-colors hover:text-foreground focus-visible:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="btn-glow hidden rounded-xl px-5 sm:inline-flex">
            <Link to="/generate-topics">Start Generating Topics</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-xl border border-border md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>


      {open && (
        <div className="glass-panel mx-4 mt-2 rounded-2xl p-4 md:hidden">
          <ul className="grid gap-1 text-sm font-medium">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 hover:bg-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button asChild className="btn-glow mt-3 w-full rounded-xl">
            <Link to="/generate-topics" onClick={() => setOpen(false)}>
              Start Generating Topics
            </Link>

          </Button>
        </div>
      )}
    </header>
  );
}

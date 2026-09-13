export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-10">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-start justify-between gap-6 px-5 text-[13px] leading-[1.6] text-muted sm:px-6">
        <div>
          © {new Date().getFullYear()} CogniTech Integrated Solution (CIS)
          <span className="mt-1 block text-muted-foreground">
            Faython | Scholar — an AI research assistant for Nigerian university students.
          </span>
        </div>
        <nav className="flex gap-6">
          <a href="/#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="/#about" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
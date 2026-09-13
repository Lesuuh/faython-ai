export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface py-12">
      <div className="w-full max-w-[1200px] mx-auto px-6 max-sm:px-5 flex flex-wrap items-start justify-between gap-6 text-[13px] leading-[1.6] text-muted">
        <div>
          © {new Date().getFullYear()} CogniTech Integrated Solution (CIS)
          <span style={{ display: "block", marginTop: "4px", color: "var(--muted-foreground)" }}>
            Faython | Scholar — an AI research assistant for Nigerian university students.
          </span>
        </div>
        <nav className="flex gap-6">
          <a href="/#faq" className="hover:text-foreground">Privacy</a>
          <a href="/#faq" className="hover:text-foreground">Terms</a>
          <a href="/#about" className="hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
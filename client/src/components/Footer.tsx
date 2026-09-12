export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          © {new Date().getFullYear()} CogniTech Integrated Solution (CIS)
          <span style={{ display: "block", marginTop: "4px", color: "var(--muted-foreground)" }}>
            Faython | Scholar — an AI research assistant for Nigerian university students.
          </span>
        </div>
        <nav className="footer-links">
          <a href="/#faq">Privacy</a>
          <a href="/#faq">Terms</a>
          <a href="/#about">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "faython-theme";

type Theme = "light" | "dark";

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  // Avoid hydration mismatch: render a placeholder until mounted.
  if (!mounted) {
    return (
      <span
        aria-hidden
        className={`inline-flex size-10 items-center justify-center rounded-xl border border-border ${className ?? ""}`}
      />
    );
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background/70 text-foreground transition-colors hover:bg-secondary ${className ?? ""}`}
    >
      {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}

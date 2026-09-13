import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, PlusCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

export type NavbarTone = "light" | "dark";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar({ tone = "light" }: { tone?: NavbarTone }) {
  const { user, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const dark = tone === "dark";

  const name =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    appUser?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    null;

  const isLoggedIn = !!user;

  const onLogout = async () => {
    setMenuOpen(false);
    setNavOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b backdrop-blur-[10px]",
        dark ? "border-white/10 bg-night/80" : "border-border bg-background/90",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-6">
        <Link to="/" onClick={() => setNavOpen(false)} aria-label="Faython home">
          <Logo tone={tone} />
        </Link>

        <nav
          className={cx(
            "hidden items-center gap-6 text-sm font-medium md:flex",
            dark ? "text-white/70" : "text-muted",
          )}
          aria-label="Main"
        >
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={cx(
                "transition-colors",
                dark ? "hover:text-white" : "hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={cx(
              "inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors md:hidden",
              dark
                ? "border-white/15 bg-transparent text-white hover:bg-white/10"
                : "border-border bg-background text-foreground hover:bg-surface",
            )}
            onClick={() => setNavOpen((v) => !v)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {isLoggedIn ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                className={cx(
                  "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                  dark
                    ? "border-white/15 bg-transparent text-white hover:bg-white/10"
                    : "border-border bg-background text-foreground hover:bg-surface",
                )}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground">
                  {name?.charAt(0).toUpperCase() || "F"}
                </span>
                {name || user?.email}
              </button>

              {menuOpen && (
                <div
                  className={cx(
                    "absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] rounded-md border p-1.5 shadow-lg",
                    dark
                      ? "border-white/10 bg-night-surface"
                      : "border-border bg-background",
                  )}
                >
                  <Link
                    to="/dashboard"
                    className={cx(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      dark ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link
                    to="/generate-topics?new=1"
                    className={cx(
                      "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      dark ? "text-white hover:bg-white/10" : "text-foreground hover:bg-surface",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <PlusCircle size={15} /> New topic
                  </Link>
                  <div
                    className={cx(
                      "my-1 border-t",
                      dark ? "border-white/10" : "border-border",
                    )}
                  />
                  <button
                    type="button"
                    className={cx(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors",
                      dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-foreground",
                    )}
                    onClick={onLogout}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink
                to="/login"
                variant={dark ? "outlineOnDark" : "muted"}
                size="sm"
              >
                Sign in
              </ButtonLink>
              <ButtonLink to="/register" variant={dark ? "green" : "primary"} size="sm">
                Get started
              </ButtonLink>
            </div>
          )}
        </div>
      </div>

      {navOpen && (
        <nav
          id="mobile-nav"
          className={cx("border-t md:hidden", dark ? "border-white/10 bg-night" : "bg-background border-border")}
          aria-label="Mobile"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-3">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={cx(
                  "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                  dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-foreground",
                )}
                onClick={() => setNavOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className={cx("my-2 border-t", dark ? "border-white/10" : "border-border")} />
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={cx(
                    "rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                  onClick={() => setNavOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/generate-topics?new=1"
                  className={cx(
                    "rounded-md px-3 py-3 text-sm font-semibold transition-colors",
                    dark ? "text-green hover:bg-white/10" : "text-primary hover:bg-primary-soft",
                  )}
                  onClick={() => setNavOpen(false)}
                >
                  New topic
                </Link>
                <button
                  type="button"
                  className={cx(
                    "rounded-md px-3 py-3 text-left text-sm font-medium transition-colors",
                    dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                  onClick={onLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 py-1">
                <ButtonLink
                  to="/login"
                  variant={dark ? "outlineOnDark" : "secondary"}
                  onClick={() => setNavOpen(false)}
                >
                  Sign in
                </ButtonLink>
                <ButtonLink to="/register" variant={dark ? "green" : "primary"} onClick={() => setNavOpen(false)}>
                  Get started
                </ButtonLink>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
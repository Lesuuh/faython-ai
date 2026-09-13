import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, appUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const name =
    user?.user_metadata?.full_name ||
    appUser?.name ||
    user?.email?.split("@")[0] ||
    "";

  const isLoggedIn = !!user;

  const onLogout = async () => {
    setMenuOpen(false);
    setNavOpen(false);

    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-[12px]">
      <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center justify-between gap-6 px-6 max-sm:px-5">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-base font-medium tracking-[-0.02em]"
          onClick={() => setNavOpen(false)}
        >
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm bg-foreground text-[14px] font-bold text-background">
            F
          </span>
          Faython <span className="text-muted">Scholar</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a href="/#how-it-works" className="hover:text-foreground">
            How it works
          </a>

          <a href="/#features" className="hover:text-foreground">
            Features
          </a>

          <a href="/#faq" className="hover:text-foreground">
            FAQ
          </a>

          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground hover:bg-surface md:hidden"
            onClick={() => setNavOpen((value) => !value)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop Account */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface-strong"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                {name.length > 24 ? `${name.slice(0, 22)}…` : name}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[216px] rounded-md border border-border bg-white p-1.5 shadow-lg">
                  {/* User Info */}
                  <div className="px-3 py-2.5">
                    <strong className="text-sm">{name || user?.email}</strong>

                    <div className="mt-0.5 text-xs text-muted">
                      {user?.email}
                    </div>
                  </div>

                  <div className="my-1 border-t border-border" />

                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center justify-center rounded-md px-[18px] py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {/* New Topic */}
                  <Link
                    to="/generate-topics"
                    className="flex w-full items-center justify-center rounded-md border border-primary-border bg-primary-soft px-[18px] py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-soft-strong"
                    onClick={() => setMenuOpen(false)}
                  >
                    New topic
                  </Link>

                  {/* Sign Out */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md px-[18px] py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                    onClick={onLogout}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Auth Buttons */
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md px-[18px] py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-[18px] py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {navOpen && (
        <div className="border-t border-border bg-white md:hidden">
          <nav className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4">
            <a
              href="/#how-it-works"
              className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
              onClick={() => setNavOpen(false)}
            >
              How it works
            </a>

            <a
              href="/#features"
              className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
              onClick={() => setNavOpen(false)}
            >
              Features
            </a>

            <a
              href="/#faq"
              className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
              onClick={() => setNavOpen(false)}
            >
              FAQ
            </a>

            <Link
              to="/pricing"
              className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
              onClick={() => setNavOpen(false)}
            >
              Pricing
            </Link>

            <div className="my-2 border-t border-border" />

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setNavOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  to="/generate-topics"
                  className="rounded-md bg-primary-soft px-3 py-3 text-center text-sm font-medium text-primary hover:bg-primary-soft-strong"
                  onClick={() => setNavOpen(false)}
                >
                  New topic
                </Link>

                <button
                  type="button"
                  className="rounded-md px-3 py-3 text-left text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={onLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-3 text-sm font-medium text-muted hover:bg-surface hover:text-foreground"
                  onClick={() => setNavOpen(false)}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="rounded-md bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                  onClick={() => setNavOpen(false)}
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

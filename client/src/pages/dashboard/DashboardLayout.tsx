import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Bookmark,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/history", label: "History", icon: History },
  { to: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout() {
  const { user, appUser, signOut } = useAuth();
  const navigate = useNavigate();

  const name =
    user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "Student";
  const email = appUser?.email || user?.email || "demo@faython.local";

  const onLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-surface lg:flex">
      <a href="#dashboard-main" className="skip-link">
        Skip to content
      </a>

      <aside className="border-b border-border bg-background p-4 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:w-64 lg:min-h-[100dvh] lg:flex-col lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" aria-label="Faython home">
            <Logo />
          </Link>
          <ButtonLink to="/generate-topics?new=1" size="sm" className="lg:hidden">
            New topic
          </ButtonLink>
        </div>

        <ButtonLink to="/generate-topics?new=1" className="mt-6 hidden w-full lg:inline-flex">
          <PlusCircle size={15} /> New topic
        </ButtonLink>

        <nav
          className="mt-5 flex gap-1 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible"
          aria-label="Dashboard"
        >
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cx(
                  "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface hover:text-foreground",
                )
              }
            >
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 lg:mt-auto">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{name}</div>
            <div className="truncate text-xs text-muted">{email}</div>
          </div>
          <Button
            variant="muted"
            size="sm"
            onClick={onLogout}
            className="shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} />
            <span className="lg:hidden">Sign out</span>
          </Button>
        </div>
      </aside>

      <main id="dashboard-main" className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
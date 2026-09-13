import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Bookmark,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const location = useLocation();

  const name = user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "";
  const current = nav.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
  )?.label;

  const onLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-[100vh]">
      <aside className="sticky top-0 flex h-screen w-[260px] flex-shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-background p-4 max-lg:static max-lg:h-auto max-lg:w-full max-lg:border-r-0 max-lg:border-b max-lg:border-border max-lg:p-4">
        <Link to="/" className="mb-6 flex items-center gap-2.5 text-base font-medium tracking-[-0.02em]">
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-sm bg-foreground text-[14px] font-bold text-background">F</span>
          Faython
        </Link>

        <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" style={{ marginBottom: "20px" }}>
          <PlusCircle size={15} /> New topic
        </Link>

        <nav className="flex flex-col gap-0.5 max-lg:flex-row max-lg:overflow-x-auto">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-sm p-2.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-foreground${
                  isActive ? " bg-primary-soft font-semibold text-primary" : ""
                }`
              }
            >
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
          <div className="px-2 pb-2 text-xs leading-[1.5] text-muted">
            <strong>{name || "Student"}</strong>
            <div className="text-muted">{appUser?.email || user?.email || "demo@faython.local"}</div>
            <div className="mt-2 inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border border-border bg-surface text-muted">Free plan</div>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:opacity-45 disabled:cursor-not-allowed w-full justify-center" onClick={onLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-surface">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background px-8 py-3.5 max-lg:px-5">
          <div className="flex items-center gap-2.5 text-sm font-medium text-muted">
            <Link to="/" style={{ color: "inherit" }}>
              Faython
            </Link>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
            <strong className="text-foreground font-medium">{current || "Dashboard"}</strong>
          </div>
          <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">
            <PlusCircle size={15} /> New topic
          </Link>
        </div>
        <div className="p-8 max-w-[980px] max-lg:p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
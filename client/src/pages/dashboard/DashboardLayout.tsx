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
    <div className="dash-layout">
      <aside className="dash-side">
        <Link to="/" className="dash-brand">
          <span className="logo">F</span>
          Faython
        </Link>

        <Link to="/generate-topics" className="btn btn-primary btn-block" style={{ marginBottom: "20px" }}>
          <PlusCircle size={15} /> New topic
        </Link>

        <nav className="dash-nav">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-side-foot">
          <div className="user-meta">
            <strong>{name || "Student"}</strong>
            <div className="muted">{appUser?.email || user?.email || "demo@faython.local"}</div>
            <div className="badge badge-neutral mt-2">Free plan</div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={onLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div className="dash-crumb">
            <Link to="/" style={{ color: "inherit" }}>
              Faython
            </Link>
            <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
            <strong>{current || "Dashboard"}</strong>
          </div>
          <Link to="/generate-topics" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> New topic
          </Link>
        </div>
        <div className="dash-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
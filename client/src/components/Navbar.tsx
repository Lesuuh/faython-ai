import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, appUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const name = user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "";

  const onLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="dash-brand" style={{ margin: 0 }}>
          <span className="logo">F</span>
          Faython <span className="muted">Scholar</span>
        </Link>

        <nav className="navbar-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#faq">FAQ</a>
          <Link to="/pricing">Pricing</Link>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-outline btn-icon"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
              >
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  {name.slice(0, 1).toUpperCase() || "·"}
                </span>
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-lg)",
                    minWidth: 216,
                    padding: "6px",
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: "10px 12px" }}>
                    <strong style={{ fontSize: "14px" }}>{name || user?.email}</strong>
                    <div className="muted text-xs" style={{ marginTop: "2px" }}>
                      {user?.email}
                    </div>
                  </div>
                  <div
                    style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }}
                  />
                  <Link
                    to="/dashboard"
                    className="btn btn-ghost btn-block"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/generate-topics"
                    className="btn btn-soft btn-block"
                    onClick={() => setMenuOpen(false)}
                  >
                    New topic
                  </Link>
                  <button className="btn btn-ghost btn-block" onClick={onLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
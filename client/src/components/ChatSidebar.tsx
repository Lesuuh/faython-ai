import { useEffect, useState, type ComponentType, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileText,
  FolderOpen,
  LogOut,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { TokenChip } from "@/components/TokenChip";
import { loadAppSettings } from "@/lib/settings-store";
import { useSignOut } from "@/components/SignOutDialog";
import { cx } from "@/lib/cx";
import type { Project } from "@/lib/project-store";
import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";

const itemBase =
  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors";
const itemActive = "bg-primary-soft text-primary";
const itemIdle = "text-muted hover:bg-surface hover:text-foreground";

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(itemBase, active ? itemActive : itemIdle)}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  to,
  end,
}: {
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  to: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cx(itemBase, isActive ? itemActive : itemIdle)}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

export function ChatSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { projects, activeId, selectProject, deleteProject } = useProject();
  const { user, appUser, loading } = useAuth();
  const { requestSignOut, signOutDialog } = useSignOut();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [accountOpen, setAccountOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(loadAppSettings);

  useEffect(() => {
    const refresh = () => setAppSettings(loadAppSettings());
    window.addEventListener("faython:settings", refresh);
    return () => window.removeEventListener("faython:settings", refresh);
  }, []);

  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const startActive = location.pathname === "/new";
  const name =
    appSettings.general.displayName ||
    user?.user_metadata?.full_name ||
    appUser?.name ||
    user?.email?.split("@")[0] ||
    "Student";
  const email = appUser?.email || user?.email || "";

  function handleStartNew() {
    navigate("/new");
    onCloseMobile();
  }

  function handleSelect(id: string) {
    selectProject(id);
    navigate(`/projects/${id}`);
    onCloseMobile();
  }

  function handleDelete(id: string) {
    deleteProject(id);
    setDeleteTarget(null);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(`/search${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
    onCloseMobile();
  }

  function closeAccountMenu() {
    setAccountOpen(false);
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:transition-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-5">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="text-left"
            aria-label="Faython home"
          >
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="px-3" aria-label="Primary">
          <SidebarItem
            icon={PlusCircle}
            label="Start new"
            active={startActive}
            onClick={handleStartNew}
          />
          <SidebarLink icon={FolderOpen} label="My Projects" to="/projects" end />
          <SidebarLink icon={FileText} label="Files & Documents" to="/files" end />
        </nav>

        <form onSubmit={submitSearch} className="px-3 pt-3" role="search">
          <label htmlFor="sidebar-project-search" className="sr-only">
            Search projects
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="sidebar-project-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearch("");
              }}
              placeholder="Search projects"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-10 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Search projects"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-border px-3 pt-4">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent projects
          </p>
          {!user ? (
            <div className="grid gap-2 px-3 py-2">
              <p className="text-[13px] text-muted-foreground">
                Sign in to see your projects.
              </p>
              <ButtonLink
                to="/login"
                variant="secondary"
                size="sm"
                state={{ from: location.pathname }}
                className="w-full"
              >
                Sign in
              </ButtonLink>
            </div>
          ) : recent.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="grid gap-1">
              {recent.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    className={cx(
                      "group flex min-w-0 items-center gap-1 overflow-hidden rounded-md pr-1 transition-colors",
                      isActive ? "bg-primary-soft" : "hover:bg-background",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(c.id)}
                      className={cx(
                        "flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                        isActive ? "text-primary" : "text-muted hover:text-foreground",
                      )}
                    >
                      <Sparkles size={15} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      aria-label="Delete project"
                      title="Delete project"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border px-3 py-4">
          <div className="mt-3">
            {loading ? null : user ? (
              <div className="relative">
                {accountOpen && (
                  <div
                    className="absolute inset-x-0 bottom-full z-30 mb-2 rounded-xl border border-border bg-background p-2 shadow-xl"
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className="border-b border-border px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                      {email && <p className="mt-0.5 truncate text-xs text-muted">{email}</p>}
                      <div className="mt-2">
                        <TokenChip />
                      </div>
                    </div>
                    <NavLink
                      to="/settings"
                      role="menuitem"
                      onClick={closeAccountMenu}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <Settings size={16} /> Settings
                    </NavLink>
                    <a
                      href="mailto:cognitechsolutions.official@gmail.com?subject=Faython%20support"
                      role="menuitem"
                      onClick={closeAccountMenu}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <CircleHelp size={16} /> Get help
                    </a>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeAccountMenu();
                        setLearnMoreOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
                    >
                      <BookOpen size={16} /> Learn more
                    </button>
                    <NavLink
                      to="/billing"
                      role="menuitem"
                      onClick={closeAccountMenu}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
                    >
                      <CreditCard size={16} /> Upgrade plan
                    </NavLink>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeAccountMenu();
                        requestSignOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-bg"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-background"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                    {email && <span className="block truncate text-xs text-muted">{email}</span>}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cx("shrink-0 text-muted transition-transform", accountOpen && "rotate-180")}
                  />
                </button>
              </div>
            ) : (
              <ButtonLink
                to="/login"
                variant="secondary"
                state={{ from: location.pathname }}
                className="w-full"
              >
                Sign in
              </ButtonLink>
            )}
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete project?"
        description="This deletes the project, its chapters and the whole conversation. This action can't be undone."
        confirmLabel="Delete"
        danger
      />

      <Modal
        open={learnMoreOpen}
        onClose={() => setLearnMoreOpen(false)}
        title="About Faython Scholar"
        description="Faython is an AI-powered academic research workspace. Organise projects, explore research ideas, develop chapters, and keep your conversations and documents together."
        footer={
          <Button onClick={() => setLearnMoreOpen(false)}>
            Done
          </Button>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          Use project instructions and academic context to guide your work. Review generated content
          carefully, and verify any claims or references before relying on them.
        </p>
      </Modal>

      {signOutDialog}
    </>
  );
}
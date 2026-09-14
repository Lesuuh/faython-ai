import { useState, type ComponentType } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, FolderOpen, FileText, Settings, CreditCard, LogOut, X, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cx } from "@/lib/cx";
import type { Conversation } from "@/lib/chat-store";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

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
  const { conversations, activeId, selectConversation, newConversation, deleteConversation } =
    useChat();
  const { user, appUser, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  const recent = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const startActive = location.pathname === "/" && !activeId;
  const name =
    user?.user_metadata?.full_name || appUser?.name || user?.email?.split("@")[0] || "Student";
  const email = appUser?.email || user?.email || "";

  function handleStartNew() {
    newConversation();
    navigate("/");
    onCloseMobile();
  }

  function handleSelect(id: string) {
    selectConversation(id);
    navigate("/");
    onCloseMobile();
  }

  function handleDelete(id: string) {
    deleteConversation(id);
    setDeleteTarget(null);
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
          <button
            type="button"
            onClick={handleStartNew}
            className="text-left"
            aria-label="Faython home"
          >
            <Logo />
          </button>
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
          <SidebarLink icon={CreditCard} label="Billing & Tokens" to="/billing" end />
        </nav>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-border px-3 pt-4">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Recent chats
          </p>
          {!user ? (
            <div className="grid gap-2 px-3 py-2">
              <p className="text-[13px] text-muted-foreground">
                Sign in to see your saved conversations.
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
            <p className="px-3 py-2 text-[13px] text-muted-foreground">No conversations yet.</p>
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
                      aria-label="Delete chat"
                      title="Delete chat"
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
          <SidebarLink icon={Settings} label="Settings" to="/settings" end />
          <div className="mt-3">
            {loading ? null : user ? (
              <div className="flex items-center justify-between gap-3 rounded-md px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{name}</div>
                  {email && <div className="truncate text-xs text-muted">{email}</div>}
                </div>
                <Button
                  variant="muted"
                  size="sm"
                  onClick={() => void signOut()}
                  aria-label="Sign out"
                  title="Sign out"
                  className="shrink-0"
                >
                  <LogOut size={15} />
                </Button>
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
        title="Delete conversation?"
        description="This deletes the conversation and all of its messages. This action can't be undone."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
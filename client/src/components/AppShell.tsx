import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Download, Menu, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { exportConversationDocx } from "@/lib/export";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChatSidebar } from "@/components/ChatSidebar";
import { TokenChip } from "@/components/TokenChip";

function headerTitle(pathname: string): string | null {
  if (pathname === "/") return null;
  if (pathname === "/projects") return "My Projects";
  if (pathname === "/files") return "Files & Documents";
  if (pathname === "/billing") return "Billing & Tokens";
  if (pathname === "/settings") return "Settings";
  return null;
}

function ShellHeader({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { active, renameConversation } = useChat();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const label = headerTitle(location.pathname);

  function startEdit() {
    if (!active) return;
    setTitleInput(active.title);
    setEditing(true);
  }

  function saveTitle() {
    if (active && titleInput.trim()) renameConversation(active.id, titleInput);
    setEditing(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-5 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        {label ? (
          <span className="truncate text-[15px] font-semibold text-foreground">{label}</span>
        ) : active ? (
          editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveTitle();
              }}
              className="flex min-w-0 max-w-[320px] flex-1 items-center"
            >
              <input
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                aria-label="Conversation title"
              />
            </form>
          ) : (
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={startEdit}
                className="min-w-0 truncate text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
                title="Rename conversation"
              >
                {active.title}
              </button>
              <button
                type="button"
                onClick={startEdit}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Rename conversation"
              >
                <Pencil size={14} />
              </button>
            </div>
          )
        ) : (
          <div className="lg:hidden">
            <Link to="/" aria-label="Faython home">
              <Logo />
            </Link>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {label === null && active && !editing && (
          <Button variant="secondary" size="sm" onClick={() => exportConversationDocx(active)}>
            <Download size={14} />
            <span className="hidden sm:inline">Export DOCX</span>
          </Button>
        )}
        {!loading && <TokenChip />}
        {!loading && !user && (
          <ButtonLink
            to="/login"
            variant="secondary"
            size="sm"
            state={{ from: location.pathname }}
          >
            Sign in
          </ButtonLink>
        )}
      </div>
    </header>
  );
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ChatProvider>
      <div className="flex h-[100dvh] min-h-[520px] flex-col bg-background lg:flex-row">
        <ChatSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ShellHeader onOpenMobile={() => setMobileOpen(true)} />
          <Outlet />
        </div>
      </div>
    </ChatProvider>
  );
}
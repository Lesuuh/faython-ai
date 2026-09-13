import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function ProductHeader({
  back,
  right,
}: {
  back?: { to: string; label: string };
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-[10px]">
      <div className="mx-auto grid h-16 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-6">
        <div className="flex min-w-0 items-center">
          {back && (
            <ButtonLink to={back.to} variant="muted" size="sm" className="-ml-2 px-2">
              <ArrowLeft size={15} />
              <span className="max-w-[9rem] truncate">{back.label}</span>
            </ButtonLink>
          )}
        </div>
        <Link to="/" aria-label="Faython home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex min-w-0 items-center justify-end gap-1.5">{right}</div>
      </div>
    </header>
  );
}
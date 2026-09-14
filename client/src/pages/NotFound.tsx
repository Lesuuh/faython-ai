import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center">
      <Link to="/" aria-label="Faython home">
        <Logo />
      </Link>
      <h1 className="mt-8 text-[26px] font-bold tracking-[-0.02em]">
        404 — page not found
      </h1>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">
        The link may be outdated, or the page may have moved. Let's get you back on track.
      </p>
      <ButtonLink to="/" className="mt-6">
        Go home
      </ButtonLink>
    </div>
  );
}
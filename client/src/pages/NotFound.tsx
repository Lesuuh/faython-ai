import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <EmptyState
          eyebrow="404 — page not found"
          title="This page doesn't exist"
          body="The link may be outdated, or the page may have moved. Let's get you back on track."
          actions={
            <>
              <ButtonLink to="/">Go home</ButtonLink>
              <ButtonLink to="/generate-topics?new=1" variant="secondary">
                Generate topics
              </ButtonLink>
            </>
          }
        />
      </main>
    </div>
  );
}
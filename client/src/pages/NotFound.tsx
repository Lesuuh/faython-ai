import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/EmptyState";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div style={{ margin: "auto", width: "100%", maxWidth: 480, padding: "1rem" }}>
        <EmptyState
          eyebrow="404 — page not found"
          title="This page doesn't exist"
          body="The link may be outdated, or the page may have moved. Let's get you back on track."
          actions={
            <>
              <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">Go home</Link>
              <Link to="/generate-topics" className="inline-flex items-center justify-center gap-2 rounded-md border border-transparent px-[18px] py-3 text-sm font-medium leading-tight tracking-tight transition-[background,border-color,color,box-shadow] duration-150 whitespace-nowrap select-none bg-background text-foreground border-border hover:bg-surface disabled:opacity-45 disabled:cursor-not-allowed px-3.5 py-2 text-[13px] rounded-sm">Generate topics</Link>
            </>
          }
        />
      </div>
    </div>
  );
}
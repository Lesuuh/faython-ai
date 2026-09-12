import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/EmptyState";

export function NotFound() {
  return (
    <div className="screen">
      <Navbar />
      <div style={{ margin: "auto", width: "100%", maxWidth: 480, padding: "1rem" }}>
        <EmptyState
          eyebrow="404 — page not found"
          title="This page doesn't exist"
          body="The link may be outdated, or the page may have moved. Let's get you back on track."
          actions={
            <>
              <Link to="/" className="btn btn-primary btn-sm">Go home</Link>
              <Link to="/generate-topics" className="btn btn-outline btn-sm">Generate topics</Link>
            </>
          }
        />
      </div>
    </div>
  );
}
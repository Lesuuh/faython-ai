import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/faython/navbar";
import { ContactFooter, Hero } from "@/components/faython/hero";
import { Sections } from "@/components/faython/sections";

const title = "Faython | Scholar — AI Research Topic Generator for Students";
const description =
  "Generate researchable undergraduate and postgraduate project topics in seconds with Faython | Scholar, the AI academic research assistant by CogniTech Integrated Solution.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <Hero />
      <Sections />
      <ContactFooter />
      <Toaster position="top-center" />
    </main>
  );
}

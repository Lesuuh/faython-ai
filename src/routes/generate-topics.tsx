import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/faython/navbar";
import { ChatCard } from "@/components/faython/chat-card";

const title = "Faython | Scholar — Generate Research Topics";
const description =
  "Use Faython | Scholar to generate researchable undergraduate and postgraduate project topics from your department, level, interest and location.";

export const Route = createFileRoute("/generate-topics")({
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
  component: GenerateTopics,
});

function GenerateTopics() {
  return (
    <main className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Navbar />
      <section className="relative flex min-h-screen flex-1 flex-col overflow-hidden px-3 pt-24 pb-3 sm:px-5 sm:pt-28 sm:pb-5">
        <div aria-hidden className="aurora-bg pointer-events-none absolute inset-0 -z-10" />
        <h1 className="sr-only">Faython | Scholar — Generate Research Topics</h1>
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <ChatCard />
        </div>
      </section>
      <Toaster position="top-center" />
    </main>
  );
}

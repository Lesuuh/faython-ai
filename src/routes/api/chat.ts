import { createFileRoute } from "@tanstack/react-router";

type Body = {
  text?: string;
  image?: string;
  audio?: { data: string; format: string };
};

const SYSTEM = `You are Faython | Scholar, an AI academic research assistant built by CogniTech Integrated Solution (CIS).
You specialise ONLY in generating high-quality, researchable academic project topics for undergraduate and postgraduate university students.
Rules:
- Return 5-8 numbered topics unless the user asks otherwise.
- Each topic must be specific, researchable, and academically sound; add a short one-line justification or suggested scope.
- Note the discipline and academic level you assumed if the user did not state them.
- If asked to write chapters, literature reviews, methodology or full projects, politely explain that this arrives in Faython Version 2.0 and offer topics instead.
- Use clean markdown-free plain text with numbered lines. Be concise and professional.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing API key", { status: 500 });

        const content: unknown[] = [];
        if (body.text?.trim()) content.push({ type: "text", text: body.text.trim() });
        if (body.image) content.push({ type: "image_url", image_url: { url: body.image } });
        if (body.audio)
          content.push({
            type: "input_audio",
            input_audio: { data: body.audio.data, format: body.audio.format },
          });
        if (content.length === 0) return new Response("Empty prompt", { status: 400 });
        if (!body.text?.trim())
          content.unshift({
            type: "text",
            text: "Generate research topics based on this attachment.",
          });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content },
            ],
          }),
        });

        if (!res.ok) {
          const detail = await res.text();
          return new Response(JSON.stringify({ error: detail.slice(0, 400) }), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        return new Response(
          JSON.stringify({ reply: data.choices?.[0]?.message?.content ?? "" }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});

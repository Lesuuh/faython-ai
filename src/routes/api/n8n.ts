import { createFileRoute } from "@tanstack/react-router";

const PROD_WEBHOOK_URL = "https://cognitech.app.n8n.cloud/webhook/faython-scholar";
const TEST_WEBHOOK_URL = "https://cognitech.app.n8n.cloud/webhook-test/faython-scholar";

// Try the live workflow first; fall back to the test URL while the workflow is
// still in "Execute workflow" listening mode.
async function postToN8n(init: RequestInit): Promise<Response> {
  const prod = await fetch(PROD_WEBHOOK_URL, init);
  if (prod.status !== 404) return prod;
  return fetch(TEST_WEBHOOK_URL, init);
}

export const Route = createFileRoute("/api/n8n")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "";
        let res: Response;

        try {
          if (contentType.includes("multipart/form-data")) {
            const incoming = await request.formData();
            const type = String(incoming.get("type") ?? "");
            const file = incoming.get(type === "audio" ? "audio" : "image");
            if (!type || !(file instanceof File)) {
              return new Response(JSON.stringify({ error: "Missing file" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
            const out = new FormData();
            out.append("type", type);
            out.append(type, file, file.name || (type === "audio" ? "voice.webm" : "image.png"));
            const message = incoming.get("message");
            if (typeof message === "string" && message.trim()) out.append("message", message.trim());
            res = await postToN8n({ method: "POST", body: out });
          } else {
            const body = (await request.json()) as { message?: string };
            const message = body.message?.trim();
            if (!message) {
              return new Response(JSON.stringify({ error: "Empty message" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
            res = await postToN8n({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "text", message }),
            });
          }
        } catch {
          return new Response(JSON.stringify({ error: "Webhook unreachable" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
          });
        }


        const raw = await res.text();
        if (!res.ok) {
          let detail = raw.slice(0, 400);
          try {
            const parsed = JSON.parse(raw) as { message?: unknown };
            if (typeof parsed.message === "string") detail = parsed.message;
          } catch {
            // keep raw text
          }
          return new Response(
            JSON.stringify({ error: `n8n workflow error: ${detail || res.status}` }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }


        let reply = raw;
        try {
          const parsed = JSON.parse(raw) as unknown;
          const pick = (v: unknown): string | undefined => {
            if (typeof v === "string") return v;
            if (Array.isArray(v)) return pick(v[0]);
            if (v && typeof v === "object") {
              const o = v as Record<string, unknown>;
              for (const k of ["reply", "output", "message", "text", "answer", "response", "data"]) {
                const found = pick(o[k]);
                if (found) return found;
              }
            }
            return undefined;
          };
          reply = pick(parsed) ?? raw;
        } catch {
          // keep raw text
        }

        return new Response(JSON.stringify({ reply: reply || "No response from Faython." }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

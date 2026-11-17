import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // n8n orchestration (Express -> n8n webhook -> Gemini -> response)
  n8n: {
    topicsWebhookUrl: process.env.N8N_TOPICS_WEBHOOK_URL || "",
    chapterWebhookUrl: process.env.N8N_CHAPTER_WEBHOOK_URL || "",
    chatWebhookUrl: process.env.N8N_CHAT_WEBHOOK_URL || "",
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || "",
    timeoutMs: Number(process.env.N8N_TIMEOUT_MS || 90_000),
  },
};

export const isProd = config.nodeEnv === "production";
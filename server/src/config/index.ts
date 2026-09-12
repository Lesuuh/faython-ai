import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // Empty until a Supabase Postgres URL is provided in the environment.
  databaseUrl: process.env.DATABASE_URL || "",

  // Supabase Auth — access-token JWTs are verified with the project's JWT secret.
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    jwtSecret: process.env.SUPABASE_JWT_SECRET || "",
  },

  // n8n orchestration (Express -> n8n webhook -> Gemini -> response)
  n8n: {
    topicsWebhookUrl: process.env.N8N_TOPICS_WEBHOOK_URL || "",
    chapterWebhookUrl: process.env.N8N_CHAPTER_WEBHOOK_URL || "",
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || "",
    timeoutMs: Number(process.env.N8N_TIMEOUT_MS || 90_000),
  },

  // free-tier limits
  freeTopicsPerDay: Number(process.env.FREE_TOPICS_PER_DAY || 3),
  freeChaptersPerDay: Number(process.env.FREE_CHAPTERS_PER_DAY || 3),

  // Paystack
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL || "http://localhost:5173/dashboard/payments",
  },
  chapterUnlockAmountKobo: Number(process.env.CHAPTER_UNLOCK_AMOUNT_KOBO || 500_00), // ₦500
};

export const isProd = config.nodeEnv === "production";

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabase.url && config.supabase.jwtSecret);
}
import { app } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./lib/prisma.js";

async function main() {
  app.listen(config.port, () => {
    console.log(`[api] Faython | Scholar server running on http://localhost:${config.port}`);
  });

  // Best-effort DB connection: don't crash if DATABASE_URL isn't configured yet.
  try {
    await prisma.$connect();
    console.log("[db] connected");
  } catch (err) {
    console.warn(
      "[db] could not connect — database-dependent endpoints will fail until DATABASE_URL is set.",
      err instanceof Error ? err.message.split("\n")[0] : err,
    );
  }
}

main();
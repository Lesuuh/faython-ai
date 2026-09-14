import { app } from "./app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log(`[api] Faython | Scholar server running on http://localhost:${config.port}`);
});
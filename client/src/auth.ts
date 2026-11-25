import { createAuthClient } from "@neon/auth";
import { BetterAuthReactAdapter } from "@neon/auth/react/adapters";

console.log("Auth URL:", import.meta.env.VITE_NEON_AUTH_BASE_URL);
export const authClient = createAuthClient(import.meta.env.VITE_NEON_AUTH_BASE_URL, {
  adapter: BetterAuthReactAdapter({ fetchOptions: { credentials: "include" } }),
});

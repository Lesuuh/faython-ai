import { Router } from "express";
import { asyncHandler } from "../lib/async.js";
import { config, isSupabaseConfigured } from "../config/index.js";

const router = Router();

// GET /api/auth/config — tells the client whether Supabase Auth is wired up.
router.get(
  "/config",
  asyncHandler(async (_req, res) => {
    res.json({
      isSupabase: true,
      supabaseConfigured: isSupabaseConfigured(),
      supabaseUrl: config.supabase.url,
    });
  }),
);

export default router;
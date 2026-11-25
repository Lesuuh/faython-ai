import net from "node:net";
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

import express from "express";
import helmet from "helmet";
import cors from "cors";

import { config } from "./config/index.js";
import topicsRoutes from "./routes/topics.routes.js";
import chaptersRoutes from "./routes/chapters.routes.js";
import projectsRoutes from "./routes/projects.routes.js";

import { requireAuth } from "./middleware/auth.middleware.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import { AuthRequest } from "./types/authTypes.js";
import type { Response, Request } from "express";

export const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "faython-scholar",
    time: new Date().toISOString(),
  });
});

// Authentication
app.get("/api/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Application routes
app.use("/api/topics", topicsRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/projects", projectsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

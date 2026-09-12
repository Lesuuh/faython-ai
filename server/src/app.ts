import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import topicsRoutes from "./routes/topics.routes.js";
import chaptersRoutes from "./routes/chapters.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import userRoutes from "./routes/user.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

export const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "faython-scholar", time: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/user", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
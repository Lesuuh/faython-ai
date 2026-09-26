import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config/index.js";
import chatRoutes from "./routes/chat.routes.js";
import chaptersRoutes from "./routes/chapters.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

export const app = express();

// app.set("trust proxy", 1);

// app.use(helmet());
// app.use(
//   cors({
//     origin: config.clientUrl,
//     credentials: true,
//   }),
// );

// app.use(express.json({ limit: "12mb" }));
// app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "faython-scholar",
    time: new Date().toISOString(),
  });
});

app.use("/api/chat", chatRoutes);
app.use("/api/chapters", chaptersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

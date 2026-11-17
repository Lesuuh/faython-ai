import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config/index.js";
import topicsRoutes from "./routes/topics.routes.js";
import chaptersRoutes from "./routes/chapters.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
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

// Required by both generation routes: they read JSON bodies.
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "faython-scholar",
    time: new Date().toISOString(),
  });
});

app.use("/api/topics", topicsRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/projects", projectsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { gmbRouter } from "./routes/gmb";
import { gmbLiveRouter } from "./routes/gmbLive";
import { authRouter } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Mount auth routes
  app.use("/api/auth", authRouter);

  // Mount GMB routes
  app.use("/api", gmbRouter);
  app.use("/api", gmbLiveRouter);

  return app;
}

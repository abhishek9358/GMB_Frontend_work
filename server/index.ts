import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAccounts } from "./routes/accounts";
import { handleAuthGoogle, handleAuthCallback } from "./routes/auth";
import { gmbRouter } from "./routes/gmb";
import { gmbLiveRouter } from "./routes/gmbLive";

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
  app.get("/api/accounts", handleAccounts);

  // Auth routes
  app.get("/auth/google", handleAuthGoogle);
  app.get("/auth/callback", handleAuthCallback);

  // Mount GMB routes
  app.use("/api", gmbRouter);
  app.use("/api", gmbLiveRouter);

  return app;
}

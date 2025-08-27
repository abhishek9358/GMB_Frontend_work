import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getBusinessDetails,
  updateBusinessProfile,
  patchBusinessProfile,
  getBusinessReviewsRoute,
  getBusinessPhotosRoute,
  getBusinessPostsRoute
} from "./routes/businessProfile";

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
  // Note: /api/accounts is proxied to the GMB backend on port 3001

  // GMB Business Profile Management routes
  app.get("/api/business/:locationName/details", getBusinessDetails);
  app.put("/api/business/:locationName/update", updateBusinessProfile);
  app.patch("/api/business/:locationName/patch", patchBusinessProfile);
  app.get("/api/business/:locationName/reviews", getBusinessReviewsRoute);
  app.get("/api/business/:locationName/photos", getBusinessPhotosRoute);
  app.get("/api/business/:locationName/posts", getBusinessPostsRoute);

  return app;
}

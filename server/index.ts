import express from "express";
import { createServer } from "http";
import path from "path";
import serveStatic from "serve-static";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite"; // Only used in dev mode

const isDev = process.env.NODE_ENV !== "production";
const app = express();
const httpServer = createServer(app);

async function main() {
  if (isDev) {
    await setupVite(app, httpServer); // Vite middleware for dev
  } else {
    const root = path.resolve(__dirname, "../client/dist");
    app.use(serveStatic(root));
    app.use("*", (req, res) => {
      res.sendFile(path.resolve(root, "index.html"));
    });
  }

  // 👇 THIS IS CORRECTLY PASSING BOTH app AND httpServer
  await registerRoutes(app, httpServer);

  const port = process.env.PORT || 5000;
  httpServer.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

main();

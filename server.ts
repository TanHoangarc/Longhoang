import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { downloadAndSaveImgbb } from "./server/saveImgbb";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Explicitly serve /img directly from public/img
  app.use("/img", express.static(path.join(process.cwd(), "public", "img")));

  // API route to download & save ImgBB images to public/img
  app.post("/api/save-imgbb", async (req, res) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: "Missing or invalid 'urls' array in request body" });
      }

      const results = await Promise.all(
        urls.map((u: string) => downloadAndSaveImgbb(u))
      );

      const mapping: Record<string, string> = {};
      results.forEach((r) => {
        if (r.success && r.localPath) {
          mapping[r.url] = r.localPath;
        }
      });

      return res.json({
        success: true,
        mapping,
        results,
        savedCount: results.filter((r) => r.success).length,
      });
    } catch (err: any) {
      console.error("[API Error /api/save-imgbb]", err);
      return res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize Firebase for server
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

// Memory cache for rapid image serving
const imageCache = new Map<string, { buffer: Buffer; contentType: string }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Upload image endpoint: Saves image to Firebase Firestore and returns real URL
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { id, name, contentType, base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "Missing image base64 data" });
      }

      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const type = contentType || "image/jpeg";
      const cleanName = (name || "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
      const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
      const imageId = id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const fileNameWithExt = `${imageId}.${ext}`;

      // 1. Save to in-memory cache for immediate 0ms retrieval
      const buffer = Buffer.from(cleanBase64, "base64");
      imageCache.set(imageId, { buffer, contentType: type });

      // 2. Persist to Firebase Firestore 'images' collection
      try {
        await setDoc(doc(db, "images", imageId), {
          id: imageId,
          name: cleanName,
          contentType: type,
          base64: cleanBase64,
          size: buffer.length,
          createdAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("[Server] Firestore save warning:", dbErr);
      }

      // Determine full public URL
      const forwardedProto = req.headers["x-forwarded-proto"];
      const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto || req.protocol || "http");
      const host = req.get("host") || `localhost:${PORT}`;
      const baseUrl = process.env.APP_URL || `${proto}://${host}`;
      const realUrl = `${baseUrl}/api/images/${fileNameWithExt}`;
      const relativeUrl = `/api/images/${fileNameWithExt}`;

      return res.status(200).json({
        success: true,
        id: imageId,
        name: cleanName,
        url: realUrl,
        relativeUrl,
      });
    } catch (err: any) {
      console.error("[Server] Error uploading image:", err);
      return res.status(500).json({ error: err?.message || "Failed to upload image" });
    }
  });

  // Serve image endpoint: Retrieves image binary directly from Firebase Firestore or memory cache
  app.get("/api/images/:id", async (req, res) => {
    try {
      const rawParam = req.params.id;
      // Strip any file extension to get the raw document id
      const docId = rawParam.replace(/\.[a-zA-Z0-9]+$/, "");

      // 1. Check in-memory cache
      const cached = imageCache.get(docId);
      if (cached) {
        res.setHeader("Content-Type", cached.contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Content-Disposition", "inline");
        return res.status(200).send(cached.buffer);
      }

      // 2. Query Firebase Firestore
      const docSnap = await getDoc(doc(db, "images", docId));
      if (!docSnap.exists()) {
        return res.status(404).json({ error: "Hình ảnh không tồn tại trên hệ thống" });
      }

      const data = docSnap.data();
      const rawBase64 = data.base64 || "";
      const cleanBase64 = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
      const contentType = data.contentType || "image/jpeg";
      const buffer = Buffer.from(cleanBase64, "base64");

      // Cache for future requests
      imageCache.set(docId, { buffer, contentType });

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Content-Disposition", "inline");
      return res.status(200).send(buffer);
    } catch (err: any) {
      console.error("[Server] Error serving image:", err);
      return res.status(500).json({ error: "Lỗi khi tải hình ảnh từ Firebase" });
    }
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

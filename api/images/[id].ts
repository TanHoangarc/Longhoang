import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// In-memory cache for serverless execution reuse
const memoryCache = new Map<string, { buffer: Buffer; contentType: string }>();

export default async function handler(req: any, res: any) {
  try {
    const rawParam =
      (req.query?.id as string) ||
      (req.url ? req.url.split("?")[0].split("/").pop() : "") ||
      "";
    const docId = rawParam.replace(/\.[a-zA-Z0-9]+$/, "");

    if (!docId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Missing image id" }));
    }

    // 1. Check serverless instance memory cache
    const cached = memoryCache.get(docId);
    if (cached) {
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.statusCode = 200;
      return res.end(cached.buffer);
    }

    // 2. Query Firebase Firestore
    const docSnap = await getDoc(doc(db, "images", docId));
    if (!docSnap.exists()) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Image not found in Firebase" }));
    }

    const data = docSnap.data();
    const rawBase64 = data.base64 || "";
    const cleanBase64 = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
    const contentType = data.contentType || "image/jpeg";
    const buffer = Buffer.from(cleanBase64, "base64");

    memoryCache.set(docId, { buffer, contentType });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.statusCode = 200;
    return res.end(buffer);
  } catch (err: any) {
    console.error("[Vercel API] Error serving image:", err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err?.message || "Failed to load image" }));
  }
}

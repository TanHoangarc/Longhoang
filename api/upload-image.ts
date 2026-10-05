import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        // use raw body
      }
    }

    const { id, name, contentType, base64 } = body || {};

    if (!base64) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Missing image base64" }));
    }

    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const type = contentType || "image/jpeg";
    const cleanName = (name || "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
    const imageId = id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fileNameWithExt = `${imageId}.${ext}`;

    const buffer = Buffer.from(cleanBase64, "base64");

    await setDoc(doc(db, "images", imageId), {
      id: imageId,
      name: cleanName,
      contentType: type,
      base64: cleanBase64,
      size: buffer.length,
      createdAt: new Date().toISOString(),
    });

    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto || "https");
    const host = req.headers["host"] || "localhost:3000";
    const realUrl = `${proto}://${host}/api/images/${fileNameWithExt}`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        success: true,
        id: imageId,
        name: cleanName,
        url: realUrl,
      })
    );
  } catch (err: any) {
    console.error("[Vercel API] Error uploading image:", err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err?.message || "Failed to upload image" }));
  }
}

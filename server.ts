import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Read Firebase config
const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (e) {
  console.error('Failed to load firebase-applet-config.json', e);
}

// Initialize Firebase App
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Image endpoint: Fetch image by ID from Firebase Firestore and stream binary bytes
app.get('/api/images/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const imageId = rawId.replace(/\.[a-zA-Z0-9]+$/, '');
    
    const docRef = doc(db, 'images', imageId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      return res.status(404).send('Image not found in Firebase database');
    }
    
    const data = snap.data();
    const dataUrl: string = data?.dataUrl || data?.url || '';
    
    if (!dataUrl) {
      return res.status(404).send('Image data is empty');
    }
    
    // If it's a data URL (base64)
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1] || 'image/jpeg';
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    }
    
    // If it's already an external HTTP link, redirect
    if (dataUrl.startsWith('http')) {
      return res.redirect(dataUrl);
    }
    
    return res.status(400).send('Invalid image format');
  } catch (err: any) {
    console.error('Error serving image from Firebase:', err);
    res.status(500).send('Error retrieving image: ' + (err?.message || 'Server error'));
  }
});

// API endpoint to upload image
app.post('/api/images/upload', async (req, res) => {
  try {
    const { id, dataUrl, name, size, mimeType } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'dataUrl is required' });
    }
    
    const imageId = id || `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const docRef = doc(db, 'images', imageId);
    
    const imageDoc = {
      id: imageId,
      dataUrl,
      name: name || 'uploaded_image.jpg',
      size: size || dataUrl.length,
      mimeType: mimeType || 'image/jpeg',
      createdAt: Date.now()
    };
    
    await setDoc(docRef, imageDoc);
    
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/api/images/${imageId}.jpg`;
    
    res.json({
      success: true,
      id: imageId,
      url: imageUrl,
      name: imageDoc.name,
      createdAt: imageDoc.createdAt
    });
  } catch (err: any) {
    console.error('Error uploading image to Firebase:', err);
    res.status(500).json({ error: err?.message || 'Failed to upload image' });
  }
});

// API endpoint to list recent uploaded images
app.get('/api/images', async (_req, res) => {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    
    const list = snap.docs.map(d => {
      const data = d.data();
      return {
        id: data.id || d.id,
        name: data.name || 'image.jpg',
        url: `/api/images/${data.id || d.id}.jpg`,
        createdAt: data.createdAt || 0,
        size: data.size || 0
      };
    });
    
    res.json({ success: true, images: list });
  } catch (err: any) {
    console.error('Error listing images:', err);
    res.status(500).json({ error: err?.message || 'Failed to list images' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

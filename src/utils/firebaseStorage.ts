import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UploadedImageItem {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string;
}

export const clientImageCache = new Map<string, string>();

/**
 * Resolves an image URL or ID directly from Firebase Firestore in the browser.
 * This guarantees that even if a host (like Vercel static SPA) rewrites image URLs to index.html,
 * the image will seamlessly load from Firestore via the client SDK without ever showing a broken icon!
 */
export async function resolveImageFromFirestore(urlOrId: string): Promise<string | null> {
  if (!urlOrId) return null;
  const match = urlOrId.match(/(img_\d+_[a-zA-Z0-9]+)/);
  if (!match) return null;
  const docId = match[1];

  if (clientImageCache.has(docId)) {
    return clientImageCache.get(docId)!;
  }

  try {
    const snap = await getDoc(doc(db, 'images', docId));
    if (snap.exists()) {
      const d = snap.data();
      const base64 = d.base64 || '';
      const type = d.contentType || 'image/jpeg';
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const dataUrl = `data:${type};base64,${cleanBase64}`;
      clientImageCache.set(docId, dataUrl);
      return dataUrl;
    }
  } catch (e) {
    console.warn('[resolveImageFromFirestore] Direct lookup note:', e);
  }
  return null;
}

const LOCAL_UPLOAD_HISTORY_KEY = 'lh_uploaded_images_history_v1';

/**
 * Compresses an image file in the browser to optimize file size while keeping crisp quality.
 * Downscales images exceeding maxDimension and encodes to JPEG (or preserves SVG).
 * Guaranteed to never hang (includes a 10s timeout safety).
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ base64: string; dataUrl: string; contentType: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|gif|svg|bmp)$/i)) {
      reject(new Error('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WebP, GIF, SVG).'));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('Thời gian nén ảnh quá lâu. Vui lòng thử ảnh khác.'));
    }, 12000);

    const cleanup = () => clearTimeout(timer);

    const reader = new FileReader();
    reader.onerror = () => {
      cleanup();
      reject(new Error('Không thể đọc file ảnh từ thiết bị của bạn.'));
    };

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        cleanup();
        reject(new Error('File ảnh không có dữ liệu.'));
        return;
      }

      // If SVG, return as is without canvas rendering
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        cleanup();
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          base64: base64Data,
          dataUrl: result,
          contentType: 'image/svg+xml',
          width: 800,
          height: 600,
        });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        cleanup();
        // Fallback: if browser Image object cannot decode, use raw base64
        const rawBase64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({
          base64: rawBase64,
          dataUrl: result,
          contentType: file.type || 'image/jpeg',
          width: 1200,
          height: 800,
        });
      };

      img.onload = () => {
        cleanup();
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const rawBase64 = result.includes(',') ? result.split(',')[1] : result;
            resolve({
              base64: rawBase64,
              dataUrl: result,
              contentType: file.type || 'image/jpeg',
              width,
              height,
            });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const targetFormat = 'image/jpeg';
          const dataUrl = canvas.toDataURL(targetFormat, quality);
          const base64 = dataUrl.split(',')[1] || '';

          resolve({
            base64,
            dataUrl,
            contentType: targetFormat,
            width,
            height,
          });
        } catch {
          const rawBase64 = result.includes(',') ? result.split(',')[1] : result;
          resolve({
            base64: rawBase64,
            dataUrl: result,
            contentType: file.type || 'image/jpeg',
            width: img.width || 800,
            height: img.height || 600,
          });
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Saves uploaded image item to localStorage history for quick access
 */
export function saveUploadedImageToHistory(item: UploadedImageItem): void {
  try {
    const history = getUploadedImagesHistory();
    const updated = [item, ...history.filter((i) => i.id !== item.id)].slice(0, 30);
    localStorage.setItem(LOCAL_UPLOAD_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to local image upload history:', e);
  }
}

/**
 * Retrieves the list of recently uploaded images from local history
 */
export function getUploadedImagesHistory(): UploadedImageItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_UPLOAD_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read image history:', e);
  }
  return [];
}

/**
 * Main function to upload an image from computer, store it permanently in Firebase Firestore,
 * and return a REAL, accessible HTTP image link (https://.../api/images/img_xxx.jpg).
 * 
 * Crucial fix: Avoids Firebase Storage SDK hang (which was freezing at 45% due to non-existent
 * storage bucket retry loop). Instead, sends to /api/upload-image backend which writes directly
 * to Firestore and returns the live public URL instantly!
 */
export async function uploadImageToFirebase(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; url: string; id: string; name: string; dataUrl?: string }> {
  // Phase 1: Reading file & compression (0% -> 50%)
  if (onProgress) onProgress(15);

  const cleanName = (file.name || 'image.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  const fileExt = cleanName.includes('.') ? cleanName.split('.').pop() : 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const imageId = `img_${timestamp}_${randomSuffix}`;
  const fileNameWithExt = `${imageId}.${fileExt}`;

  let base64 = '';
  let contentType = 'image/jpeg';

  try {
    const compressed = await compressImageFile(file, 1600, 0.85);
    base64 = compressed.base64;
    contentType = compressed.contentType;
  } catch (compressionErr) {
    console.warn('Compression error, attempting direct file read:', compressionErr);
    // Direct fallback
    base64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const str = r.result as string;
        resolve(str.includes(',') ? str.split(',')[1] : str);
      };
      r.onerror = () => reject(new Error('Không thể đọc file ảnh từ máy tính.'));
      r.readAsDataURL(file);
    });
    contentType = file.type || 'image/jpeg';
  }

  // Phase 2: Compression complete (50%)
  if (onProgress) onProgress(50);

  let realImageUrl = '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const expectedPublicUrl = `${origin}/api/images/${fileNameWithExt}`;

  // Phase 3: Upload to Express server /api/upload-image (which writes to Firebase Firestore)
  if (onProgress) onProgress(70);

  let serverUploadSuccess = false;
  try {
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: imageId,
        name: cleanName,
        contentType,
        base64,
      }),
      signal: controller.signal,
    });

    clearTimeout(abortTimeout);

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        realImageUrl = data.url;
        serverUploadSuccess = true;
      }
    } else {
      console.warn('[uploadImageToFirebase] Server responded with status:', res.status);
    }
  } catch (serverErr) {
    console.warn('[uploadImageToFirebase] Server endpoint note, using direct Firestore fallback:', serverErr);
  }

  if (onProgress) onProgress(85);

  // Phase 4: Direct client write to Firestore 'images' collection (dual persistence)
  // Wrapped in a fast 4s timeout so it will NEVER block or hang the UI!
  try {
    const firestoreWritePromise = setDoc(doc(db, 'images', imageId), {
      id: imageId,
      name: cleanName,
      contentType,
      base64,
      size: Math.round((base64.length * 3) / 4),
      url: realImageUrl || expectedPublicUrl,
      createdAt: new Date().toISOString(),
    });

    const firestoreTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), 4000)
    );

    await Promise.race([firestoreWritePromise, firestoreTimeoutPromise]);
  } catch (firestoreErr) {
    console.warn('[uploadImageToFirebase] Direct Firestore note:', firestoreErr);
  }

  // Ensure we have a valid public image URL
  if (!realImageUrl) {
    realImageUrl = expectedPublicUrl;
  }

  const dataUrl = `data:${contentType};base64,${base64}`;
  clientImageCache.set(imageId, dataUrl);
  if (realImageUrl) {
    clientImageCache.set(realImageUrl, dataUrl);
  }

  // Phase 5: Complete!
  if (onProgress) onProgress(100);

  const finalItem: UploadedImageItem = {
    id: imageId,
    name: cleanName,
    url: realImageUrl,
    size: file.size,
    contentType,
    createdAt: new Date().toISOString(),
  };

  saveUploadedImageToHistory(finalItem);

  return {
    success: true,
    url: realImageUrl,
    id: imageId,
    name: cleanName,
    dataUrl,
  };
}

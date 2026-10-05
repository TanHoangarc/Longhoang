import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface UploadedImageItem {
  id: string;
  url: string;
  name: string;
  size?: number;
  createdAt: number;
}

// In-memory cache to instantly resolve images in current session
const LOCAL_IMAGE_CACHE = new Map<string, string>();

/**
 * Compress an image file to an optimized format before uploading
 */
export async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu file ảnh từ máy.'));
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('File ảnh không có dữ liệu.'));
        return;
      }

      if (file.type === 'image/svg+xml') {
        resolve({ dataUrl: result, mimeType: 'image/svg+xml' });
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Trình duyệt không thể giải mã hình ảnh này.'));
      img.onload = () => {
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

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl: result, mimeType: file.type || 'image/jpeg' });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === 'image/png';
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve({ dataUrl: compressedDataUrl, mimeType });
        } catch {
          resolve({ dataUrl: result, mimeType: file.type || 'image/jpeg' });
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Firebase Firestore and return a clean, persistent URL
 */
export async function uploadImageToFirebase(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadedImageItem> {
  if (onProgress) onProgress(20);

  // 1. Compress image
  const { dataUrl, mimeType } = await compressImage(file);
  if (onProgress) onProgress(50);

  // 2. Generate unique image ID
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const imageId = `img_${timestamp}_${randomSuffix}`;

  const imageRecord = {
    id: imageId,
    name: file.name,
    size: file.size,
    mimeType,
    dataUrl,
    createdAt: timestamp,
  };

  // 3. Save to Firebase Firestore collection 'images'
  try {
    const imageDocRef = doc(db, 'images', imageId);
    await setDoc(imageDocRef, imageRecord);
  } catch (firestoreError) {
    console.warn('Direct Firestore write error, attempting server fallback:', firestoreError);
    // Fallback: POST to /api/images/upload if direct write fails
    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageRecord),
      });
      if (!response.ok) {
        throw new Error('Server upload responded with ' + response.status);
      }
    } catch (serverErr) {
      console.error('All upload methods failed:', serverErr);
      throw new Error('Không thể tải ảnh lên Firebase. Vui lòng kiểm tra kết nối mạng!');
    }
  }

  if (onProgress) onProgress(90);

  // 4. Construct clean public image URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/api/images/${imageId}.jpg`;

  // Cache in memory for instant local rendering
  LOCAL_IMAGE_CACHE.set(publicUrl, dataUrl);
  LOCAL_IMAGE_CACHE.set(`/api/images/${imageId}.jpg`, dataUrl);

  if (onProgress) onProgress(100);

  return {
    id: imageId,
    url: publicUrl,
    name: file.name,
    size: file.size,
    createdAt: timestamp,
  };
}

/**
 * Get cached image dataUrl if available in the current session
 */
export function getCachedImageData(url: string): string | undefined {
  return LOCAL_IMAGE_CACHE.get(url);
}

/**
 * Fetch recently uploaded images from Firebase
 */
export async function getRecentUploadedImages(): Promise<UploadedImageItem[]> {
  try {
    const imagesRef = collection(db, 'images');
    const q = query(imagesRef, orderBy('createdAt', 'desc'), limit(24));
    const snap = await getDocs(q);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const id = data.id || docSnap.id;
      return {
        id,
        name: data.name || 'image.jpg',
        url: `${origin}/api/images/${id}.jpg`,
        size: data.size,
        createdAt: data.createdAt || 0,
      };
    });
  } catch (err) {
    console.warn('Could not fetch recent images from Firestore:', err);
    // Fallback to /api/images
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const json = await res.json();
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return (json.images || []).map((img: any) => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${origin}${img.url}`,
        }));
      }
    } catch {
      // Ignore
    }
    return [];
  }
}

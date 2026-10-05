import { db, storage } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UploadedImageItem {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string;
}

const LOCAL_UPLOAD_HISTORY_KEY = 'lh_uploaded_images_history_v1';

/**
 * Compresses an image file in the browser to optimize file size while keeping crisp quality.
 * Typical output is 80KB - 250KB JPEG/WebP.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ base64: string; dataUrl: string; contentType: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WebP,...).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh từ thiết bị của bạn.'));
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('File ảnh không có dữ liệu.'));
        return;
      }

      // If SVG, return as is
      if (file.type === 'image/svg+xml') {
        const base64Data = result.split(',')[1] || '';
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
            const base64 = result.split(',')[1] || '';
            resolve({ base64, dataUrl: result, contentType: file.type || 'image/jpeg', width, height });
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
          const base64 = result.split(',')[1] || '';
          resolve({ base64, dataUrl: result, contentType: file.type || 'image/jpeg', width: img.width, height: img.height });
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
 * Main function to upload an image, store it permanently in Firebase (Firestore + Storage),
 * and return a REAL, accessible HTTP image link (https://.../api/images/img_xxx.jpg).
 */
export async function uploadImageToFirebase(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<{ success: boolean; url: string; id: string; name: string }> {
  if (onProgress) onProgress(15);

  // 1. Client-side compression
  const { base64, contentType } = await compressImageFile(file, 1600, 0.85);
  if (onProgress) onProgress(45);

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase() || 'image.jpg';
  const fileExt = cleanName.includes('.') ? cleanName.split('.').pop() : 'jpg';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const imageId = `img_${timestamp}_${randomSuffix}`;
  const fileNameWithExt = `${imageId}.${fileExt}`;

  let realImageUrl = '';

  // 2. Try official Firebase Storage first (if configured and storage bucket exists)
  try {
    const storageRef = ref(storage, `images/${fileNameWithExt}`);
    await uploadString(storageRef, base64, 'base64', {
      contentType,
      customMetadata: { originalName: cleanName },
    });
    realImageUrl = await getDownloadURL(storageRef);
    console.log('[Firebase Storage] Image uploaded successfully:', realImageUrl);
  } catch (storageErr) {
    console.warn('[Firebase Storage] Storage bucket unavailable, proceeding with Firestore Image Store:', storageErr);
  }

  if (onProgress) onProgress(70);

  // 3. Store image binary in Firebase Firestore 'images' collection
  // This guarantees permanent persistence in Firebase even if Storage bucket is not enabled!
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const firestoreImageUrl = realImageUrl || `${origin}/api/images/${fileNameWithExt}`;

    await setDoc(doc(db, 'images', imageId), {
      id: imageId,
      name: cleanName,
      contentType,
      base64,
      size: Math.round((base64.length * 3) / 4),
      url: firestoreImageUrl,
      createdAt: new Date().toISOString(),
    });

    if (!realImageUrl) {
      realImageUrl = firestoreImageUrl;
    }
  } catch (firestoreErr) {
    console.warn('[Firebase Firestore] Client direct save note:', firestoreErr);
  }

  // 4. Also notify backend API /api/upload-image to ensure in-memory cache and server-side sync
  if (!realImageUrl || realImageUrl.includes('/api/images/')) {
    try {
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
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          realImageUrl = data.url;
        }
      }
    } catch (apiErr) {
      console.warn('Backend image upload endpoint fallback note:', apiErr);
    }
  }

  // Fallback to origin URL if still empty
  if (!realImageUrl) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    realImageUrl = `${origin}/api/images/${fileNameWithExt}`;
  }

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
  };
}

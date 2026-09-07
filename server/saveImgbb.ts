import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SaveImgbbResponse {
  url: string;
  localPath: string;
  success: boolean;
  error?: string;
}

/**
 * Downloads an image from ImgBB (either direct link or page viewer)
 * and saves it into public/img (and dist/img if dist exists).
 */
export async function downloadAndSaveImgbb(rawUrl: string): Promise<SaveImgbbResponse> {
  const url = rawUrl.trim().replace(/[.,;:!?]+$/, '');

  if (!url || (!url.includes('ibb.co') && !url.includes('imgbb.com'))) {
    return { url, localPath: url, success: false, error: 'Not an ImgBB URL' };
  }

  // Generate safe filename based on URL hash and original name
  const urlHash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);

  let baseName = 'imgbb';
  let ext = '.jpg';

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    const dotIdx = lastPart.lastIndexOf('.');
    if (dotIdx > 0) {
      ext = lastPart.slice(dotIdx).toLowerCase();
      const rawBase = lastPart.slice(0, dotIdx).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
      if (rawBase) baseName = rawBase;
    } else if (parts.length > 0) {
      const idPart = parts[parts.length - 1].replace(/[^a-zA-Z0-9_-]/g, '-');
      if (idPart) baseName = `imgbb_${idPart}`;
    }
  } catch {
    // fallback
  }

  const filename = `${baseName}_${urlHash}${ext.startsWith('.') ? ext : '.' + ext}`;
  const publicDir = path.join(process.cwd(), 'public', 'img');
  const distDir = path.join(process.cwd(), 'dist', 'img');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const publicFilePath = path.join(publicDir, filename);

  // If already exists and has non-zero size, reuse it
  if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).size > 100) {
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      try {
        fs.copyFileSync(publicFilePath, path.join(distDir, filename));
      } catch {}
    }
    return { url, localPath: `/img/${filename}`, success: true };
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };

    let response = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when downloading ${url}`);
    }

    let contentType = response.headers.get('content-type') || '';
    let buffer: Buffer;

    // If ImgBB returned an HTML page (e.g. ibb.co/xyz), parse the real image URL
    if (contentType.includes('text/html')) {
      const html = await response.text();
      const ogMatch =
        html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i) ||
        html.match(/<img[^>]+id=["']image-viewer["'][^>]+src=["']([^"']+)["']/i) ||
        html.match(/<img[^>]+src=["'](https:\/\/[^"']*ibb\.co\/[^"']+)["']/i);

      if (ogMatch && ogMatch[1]) {
        const directImageUrl = ogMatch[1];
        const imgRes = await fetch(directImageUrl, {
          headers: { ...headers, Referer: url },
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
        });
        if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status} downloading direct image: ${directImageUrl}`);
        contentType = imgRes.headers.get('content-type') || contentType;
        buffer = Buffer.from(await imgRes.arrayBuffer());
      } else {
        throw new Error(`Could not locate image tag inside HTML for ${url}`);
      }
    } else {
      buffer = Buffer.from(await response.arrayBuffer());
    }

    if (buffer.length === 0) {
      throw new Error('Downloaded image buffer is empty');
    }

    // Determine correct extension from content-type
    let finalExt = ext;
    if (contentType.includes('image/png')) finalExt = '.png';
    else if (contentType.includes('image/webp')) finalExt = '.webp';
    else if (contentType.includes('image/gif')) finalExt = '.gif';
    else if (contentType.includes('image/svg')) finalExt = '.svg';
    else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) finalExt = '.jpg';

    const finalFilename = `${baseName}_${urlHash}${finalExt}`;
    const finalPublicPath = path.join(publicDir, finalFilename);

    fs.writeFileSync(finalPublicPath, buffer);

    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      try {
        fs.writeFileSync(path.join(distDir, finalFilename), buffer);
      } catch {}
    }

    return {
      url,
      localPath: `/img/${finalFilename}`,
      success: true,
    };
  } catch (err: any) {
    console.error(`[ImgBB Save Error] Failed to save ${url}:`, err);
    return {
      url,
      localPath: url,
      success: false,
      error: err?.message || 'Download error',
    };
  }
}

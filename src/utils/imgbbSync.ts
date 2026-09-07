import { NewsArticle, JobOpening } from '../types';

// Matches standard ImgBB domains (ibb.co, i.ibb.co, imgbb.com, ibb.co.com, etc.)
export const IMGBB_URL_REGEX = /https?:\/\/(?:[a-zA-Z0-9_-]+\.)?(?:ibb\.co|imgbb\.com|ibb\.co\.com)\/[^\s"')<>|#*]+/gi;

/**
 * Extracts all unique ImgBB URLs from any arbitrary string
 */
export function extractImgbbUrlsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(IMGBB_URL_REGEX) || [];
  return matches.map((m) => m.replace(/[.,;:!?]+$/, '').trim()).filter(Boolean);
}

/**
 * Deep-scans an object or array to discover all ImgBB URLs
 */
export function extractAllImgbbUrls(data: unknown): string[] {
  const urls = new Set<string>();

  function walk(val: unknown) {
    if (!val) return;
    if (typeof val === 'string') {
      const found = extractImgbbUrlsFromText(val);
      found.forEach((u) => urls.add(u));
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (typeof val === 'object') {
      Object.values(val as Record<string, unknown>).forEach(walk);
    }
  }

  walk(data);
  return Array.from(urls);
}

/**
 * Replaces mapped ImgBB URLs with their corresponding /img/... local paths
 */
export function replaceImgbbUrls<T>(item: T, mapping: Record<string, string>): T {
  if (!item || Object.keys(mapping).length === 0) return item;

  if (typeof item === 'string') {
    let res: string = item;
    for (const [oldUrl, newUrl] of Object.entries(mapping)) {
      if (res.includes(oldUrl)) {
        res = res.replaceAll(oldUrl, newUrl);
      }
    }
    return res as unknown as T;
  }

  if (Array.isArray(item)) {
    return item.map((sub) => replaceImgbbUrls(sub, mapping)) as unknown as T;
  }

  if (typeof item === 'object') {
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      copy[k] = replaceImgbbUrls(v, mapping);
    }
    return copy as unknown as T;
  }

  return item;
}

/**
 * Calls server API /api/save-imgbb to download and save images into public/img
 */
export async function downloadAndSaveImgbbUrls(
  urls: string[]
): Promise<{ mapping: Record<string, string>; savedCount: number; error?: string }> {
  const uniqueUrls = Array.from(new Set(urls.map((u) => u.trim()))).filter(Boolean);
  if (uniqueUrls.length === 0) {
    return { mapping: {}, savedCount: 0 };
  }

  try {
    const res = await fetch('/api/save-imgbb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: uniqueUrls }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { mapping: {}, savedCount: 0, error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return {
      mapping: data.mapping || {},
      savedCount: data.savedCount || Object.keys(data.mapping || {}).length,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.error('Failed to sync ImgBB images via API:', err);
    return { mapping: {}, savedCount: 0, error: msg };
  }
}

/**
 * Scans, downloads, and converts all ImgBB URLs across articles & jobs
 */
export async function convertAllImgbbToLocalImg(
  newsList: NewsArticle[],
  jobsList: JobOpening[]
): Promise<{
  updatedNews: NewsArticle[];
  updatedJobs: JobOpening[];
  mapping: Record<string, string>;
  savedCount: number;
  hasChanges: boolean;
}> {
  // 1. Gather all ImgBB URLs
  const imgbbUrls = extractAllImgbbUrls({ newsList, jobsList });
  if (imgbbUrls.length === 0) {
    return {
      updatedNews: newsList,
      updatedJobs: jobsList,
      mapping: {},
      savedCount: 0,
      hasChanges: false,
    };
  }

  console.log(`[ImgBB Migration] Found ${imgbbUrls.length} ImgBB URLs to download to public/img...`);

  // 2. Download via server
  const { mapping, savedCount } = await downloadAndSaveImgbbUrls(imgbbUrls);
  const keys = Object.keys(mapping);
  if (keys.length === 0) {
    return {
      updatedNews: newsList,
      updatedJobs: jobsList,
      mapping: {},
      savedCount: 0,
      hasChanges: false,
    };
  }

  // 3. Replace in news and jobs
  const updatedNews = replaceImgbbUrls(newsList, mapping);
  const updatedJobs = replaceImgbbUrls(jobsList, mapping);

  return {
    updatedNews,
    updatedJobs,
    mapping,
    savedCount,
    hasChanges: true,
  };
}

import { NewsArticle, JobOpening } from '../types';
import { NEWS_ARTICLES as DEFAULT_NEWS, JOB_OPENINGS as DEFAULT_JOBS } from './mockData';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const NEWS_STORAGE_KEY = 'lh_custom_news_v2';
const JOBS_STORAGE_KEY = 'lh_custom_jobs_v2';
const CONTENT_UPDATE_EVENT = 'lh_content_updated';

// Known sample IDs to purge and never restore
const SAMPLE_NEWS_IDS = new Set([
  'lh-race-2026',
  'canh-bao-tuyen-dung',
  'global-freight-conference',
  'xu-huong-cuoc-bien-2026',
  'incoterms-2020-guide',
  'quy-trinh-khai-hai-quan-2026',
]);

const SAMPLE_JOB_IDS = new Set([
  'tuyen-dung-co-hoi-nghe-nghiep',
  'tuyen-dung-lai-xe-tai',
  'tuyen-dung-nhan-vien-hien-truong',
]);

// Clean up legacy v1 localStorage if any
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('lh_custom_news_v1');
    localStorage.removeItem('lh_custom_jobs_v1');
  } catch (e) {
    // Ignore storage errors
  }
}

// In-memory cache for ultra-fast synchronous UI renders
let inMemoryNews: NewsArticle[] = (() => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(NEWS_STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a && !SAMPLE_NEWS_IDS.has(a.id));
      }
    }
  } catch (e) {
    console.error('Error loading initial local news:', e);
  }
  return [];
})();

let inMemoryJobs: JobOpening[] = (() => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(JOBS_STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((j) => j && !SAMPLE_JOB_IDS.has(j.id));
      }
    }
  } catch (e) {
    console.error('Error loading initial local jobs:', e);
  }
  return [];
})();

let isFirestoreInitialized = false;

// Helper to reliably parse various date formats (DD/MM/YYYY, YYYY-MM-DD, ISO) into timestamp
export function parseDateStringToTime(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  // Format DD/MM/YYYY or D/M/YYYY
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day).getTime();
      }
    }
  }

  // Format YYYY-MM-DD or DD-MM-YYYY
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day).getTime();
        }
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day).getTime();
        }
      }
    }
    const t = new Date(trimmed).getTime();
    if (!isNaN(t)) return t;
  }

  const parsed = Date.parse(trimmed);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sorts news articles:
 * 1. Pinned articles first (isPinned: true)
 * 2. Then sorted by date from newest to oldest (ngày mới đến ngày cũ)
 * 3. Tiebreakers for identical dates: pinnedAt (if pinned), then id
 */
export function sortNewsArticles(a: NewsArticle, b: NewsArticle): number {
  const aPinned = Boolean(a.isPinned);
  const bPinned = Boolean(b.isPinned);

  // 1. Pinned articles come first
  if (aPinned && !bPinned) return -1;
  if (!aPinned && bPinned) return 1;

  // 2. Sort by date from newest to oldest (timeB - timeA)
  const timeA = parseDateStringToTime(a.date);
  const timeB = parseDateStringToTime(b.date);
  if (timeB !== timeA) {
    return timeB - timeA;
  }

  // 3. For pinned articles with identical dates, prioritize most recently pinned
  if (aPinned && bPinned && a.pinnedAt && b.pinnedAt) {
    const pinDiff = new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
    if (pinDiff !== 0) return pinDiff;
  }

  // 4. Stable tiebreaker
  return (a.id || '').localeCompare(b.id || '');
}

export const ContentStore = {
  // Initialize Real-time Firestore sync & Auto-seed
  initFirestoreSync() {
    if (isFirestoreInitialized || typeof window === 'undefined') return;
    isFirestoreInitialized = true;

    try {
      const newsColRef = collection(db, 'news');
      const jobsColRef = collection(db, 'jobs');

      // 1. Listen to Realtime News updates from Firestore
      onSnapshot(
        newsColRef,
        (snapshot) => {
          const list: NewsArticle[] = [];
          snapshot.forEach((d) => {
            if (SAMPLE_NEWS_IDS.has(d.id)) {
              // Purge old sample news from Firestore
              deleteDoc(doc(db, 'news', d.id)).catch(() => {});
            } else {
              list.push(d.data() as NewsArticle);
            }
          });
          // Update cache & storage
          inMemoryNews = list;
          try {
            localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
          } catch (e) {
            // Ignore storage errors
          }
          this.notifyUpdate();
        },
        (err) => {
          console.warn('Firestore News snapshot notice (offline/fallback active):', err);
        }
      );

      // 2. Listen to Realtime Jobs updates from Firestore
      onSnapshot(
        jobsColRef,
        (snapshot) => {
          const list: JobOpening[] = [];
          snapshot.forEach((d) => {
            if (SAMPLE_JOB_IDS.has(d.id)) {
              // Purge old sample job from Firestore
              deleteDoc(doc(db, 'jobs', d.id)).catch(() => {});
            } else {
              list.push(d.data() as JobOpening);
            }
          });
          inMemoryJobs = list;
          try {
            localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(list));
          } catch (e) {
            // Ignore storage errors
          }
          this.notifyUpdate();
        },
        (err) => {
          console.warn('Firestore Jobs snapshot notice (offline/fallback active):', err);
        }
      );
    } catch (err) {
      console.error('Error initializing Firestore sync:', err);
    }
  },

  // Sample seeding is disabled as user creates their own content
  async seedDefaultNews() {},
  async seedDefaultJobs() {},

  // --- NEWS METHODS ---
  getNews(): NewsArticle[] {
    return [...inMemoryNews].sort(sortNewsArticles);
  },

  getNewsById(id: string): NewsArticle | undefined {
    const list = this.getNews();
    return list.find((item) => item.id === id);
  },

  async togglePinNews(id: string): Promise<boolean> {
    const target = inMemoryNews.find((a) => a.id === id);
    if (!target) return false;

    const newPinnedState = !target.isPinned;
    const updatedArticle: NewsArticle = {
      ...target,
      isPinned: newPinnedState,
      pinnedAt: newPinnedState ? new Date().toISOString() : undefined,
    };

    await this.saveNews(updatedArticle);
    return newPinnedState;
  },

  async saveNews(article: NewsArticle): Promise<void> {
    // 1. Update local state immediately for zero-latency UI response
    const existingIdx = inMemoryNews.findIndex((a) => a.id === article.id);
    if (existingIdx >= 0) {
      inMemoryNews[existingIdx] = article;
    } else {
      inMemoryNews = [article, ...inMemoryNews];
    }
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(inMemoryNews));
    this.notifyUpdate();

    // 2. Persist to Firebase Firestore
    try {
      const cleanArticle = JSON.parse(JSON.stringify(article));
      await setDoc(doc(db, 'news', article.id), {
        ...cleanArticle,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Firestore saveNews error:', err);
    }
  },

  async deleteNews(id: string): Promise<void> {
    // 1. Update local cache
    inMemoryNews = inMemoryNews.filter((a) => a.id !== id);
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(inMemoryNews));
    this.notifyUpdate();

    // 2. Delete from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      console.error('Firestore deleteNews error:', err);
    }
  },

  // --- CAREERS / JOBS METHODS ---
  getJobs(): JobOpening[] {
    return [...inMemoryJobs];
  },

  getJobById(id: string): JobOpening | undefined {
    const list = this.getJobs();
    return list.find((item) => item.id === id);
  },

  async toggleJobStatus(id: string): Promise<'active' | 'expired'> {
    const target = inMemoryJobs.find((j) => j.id === id);
    if (!target) return 'active';

    const newStatus: 'active' | 'expired' = (target.status === 'expired') ? 'active' : 'expired';
    const updatedJob: JobOpening = {
      ...target,
      status: newStatus,
    };

    await this.saveJob(updatedJob);
    return newStatus;
  },

  async saveJob(job: JobOpening): Promise<void> {
    // 1. Update local cache
    const existingIdx = inMemoryJobs.findIndex((j) => j.id === job.id);
    if (existingIdx >= 0) {
      inMemoryJobs[existingIdx] = job;
    } else {
      inMemoryJobs = [job, ...inMemoryJobs];
    }
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(inMemoryJobs));
    this.notifyUpdate();

    // 2. Persist to Firebase Firestore
    try {
      const cleanJob = JSON.parse(JSON.stringify(job));
      await setDoc(doc(db, 'jobs', job.id), {
        ...cleanJob,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Firestore saveJob error:', err);
    }
  },

  async deleteJob(id: string): Promise<void> {
    // 1. Update local cache
    inMemoryJobs = inMemoryJobs.filter((j) => j.id !== id);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(inMemoryJobs));
    this.notifyUpdate();

    // 2. Delete from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (err) {
      console.error('Firestore deleteJob error:', err);
    }
  },

  // --- CLEAR / RESET DATA ---
  async clearAll(): Promise<void> {
    inMemoryNews = [];
    inMemoryJobs = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(NEWS_STORAGE_KEY);
      localStorage.removeItem(JOBS_STORAGE_KEY);
      localStorage.removeItem('lh_custom_news_v1');
      localStorage.removeItem('lh_custom_jobs_v1');
    }
    this.notifyUpdate();

    try {
      const newsSnap = await getDocs(collection(db, 'news'));
      for (const d of newsSnap.docs) {
        await deleteDoc(doc(db, 'news', d.id));
      }
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      for (const d of jobsSnap.docs) {
        await deleteDoc(doc(db, 'jobs', d.id));
      }
    } catch (err) {
      console.error('Firestore clearAll error:', err);
    }
  },

  async resetAll(): Promise<void> {
    await this.clearAll();
  },

  // Broadcast change event
  notifyUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CONTENT_UPDATE_EVENT));
    }
  },

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback();
    window.addEventListener(CONTENT_UPDATE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(CONTENT_UPDATE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }
};

// Auto-trigger sync initialization
ContentStore.initFirestoreSync();

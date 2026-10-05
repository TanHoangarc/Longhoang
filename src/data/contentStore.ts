import { NewsArticle, JobOpening } from '../types';
import { NEWS_ARTICLES as DEFAULT_NEWS, JOB_OPENINGS as DEFAULT_JOBS } from './mockData';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

const NEWS_STORAGE_KEY = 'lh_custom_news_v2';
const JOBS_STORAGE_KEY = 'lh_custom_jobs_v2';
const CONTENT_UPDATE_EVENT = 'lh_content_updated';
const SYNC_STATE_EVENT = 'lh_sync_state_changed';

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

export interface CloudSyncStatus {
  state: 'connected' | 'syncing' | 'error' | 'idle';
  lastSyncedAt: string | null;
  remoteNewsCount: number;
  remoteJobsCount: number;
  localNewsCount: number;
  localJobsCount: number;
  errorMessage: string | null;
}

let syncStatus: CloudSyncStatus = {
  state: 'idle',
  lastSyncedAt: null,
  remoteNewsCount: 0,
  remoteJobsCount: 0,
  localNewsCount: 0,
  localJobsCount: 0,
  errorMessage: null,
};

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

    testConnection().then((connected) => {
      if (connected) {
        syncStatus.state = 'connected';
      } else {
        syncStatus.state = 'error';
        syncStatus.errorMessage = 'Không thể kết nối Firebase test endpoint';
      }
      this.notifySyncState();
    });

    try {
      const newsColRef = collection(db, 'news');
      const jobsColRef = collection(db, 'jobs');

      // 1. Listen to Realtime News updates from Firestore
      onSnapshot(
        newsColRef,
        (snapshot) => {
          const remoteList: NewsArticle[] = [];
          const remoteDocIds = new Set<string>();

          snapshot.forEach((d) => {
            if (SAMPLE_NEWS_IDS.has(d.id)) {
              deleteDoc(doc(db, 'news', d.id)).catch(() => {});
            } else {
              const art = d.data() as NewsArticle;
              remoteList.push(art);
              remoteDocIds.add(art.id);
            }
          });

          // Check if local cache has any custom articles NOT yet in Firestore
          // If so, automatically push them to Firestore!
          if (inMemoryNews.length > 0) {
            const unsyncedArticles = inMemoryNews.filter(
              (a) => !remoteDocIds.has(a.id) && !SAMPLE_NEWS_IDS.has(a.id)
            );
            if (unsyncedArticles.length > 0) {
              console.log(`[Firestore Sync] Auto-pushing ${unsyncedArticles.length} local articles to Firestore...`);
              unsyncedArticles.forEach((article) => {
                const clean = JSON.parse(JSON.stringify(article));
                setDoc(doc(db, 'news', article.id), {
                  ...clean,
                  updatedAt: new Date().toISOString(),
                }).catch((e) => {
                  handleFirestoreError(e, OperationType.WRITE, `news/${article.id}`);
                });
                remoteList.push(article);
              });
            }
          }

          inMemoryNews = remoteList;
          try {
            localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(remoteList));
          } catch (e) {}

          syncStatus.state = 'connected';
          syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
          syncStatus.remoteNewsCount = snapshot.size;
          syncStatus.localNewsCount = inMemoryNews.length;
          syncStatus.errorMessage = null;

          this.notifyUpdate();
          this.notifySyncState();
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'news');
          syncStatus.state = 'error';
          syncStatus.errorMessage = err?.message || 'Lỗi kết nối Firebase News';
          this.notifySyncState();
        }
      );

      // 2. Listen to Realtime Jobs updates from Firestore
      onSnapshot(
        jobsColRef,
        (snapshot) => {
          const remoteList: JobOpening[] = [];
          const remoteDocIds = new Set<string>();

          snapshot.forEach((d) => {
            if (SAMPLE_JOB_IDS.has(d.id)) {
              deleteDoc(doc(db, 'jobs', d.id)).catch(() => {});
            } else {
              const job = d.data() as JobOpening;
              remoteList.push(job);
              remoteDocIds.add(job.id);
            }
          });

          // Check if local cache has any custom jobs NOT yet in Firestore
          if (inMemoryJobs.length > 0) {
            const unsyncedJobs = inMemoryJobs.filter(
              (j) => !remoteDocIds.has(j.id) && !SAMPLE_JOB_IDS.has(j.id)
            );
            if (unsyncedJobs.length > 0) {
              console.log(`[Firestore Sync] Auto-pushing ${unsyncedJobs.length} local jobs to Firestore...`);
              unsyncedJobs.forEach((job) => {
                const clean = JSON.parse(JSON.stringify(job));
                setDoc(doc(db, 'jobs', job.id), {
                  ...clean,
                  updatedAt: new Date().toISOString(),
                }).catch((e) => {
                  handleFirestoreError(e, OperationType.WRITE, `jobs/${job.id}`);
                });
                remoteList.push(job);
              });
            }
          }

          inMemoryJobs = remoteList;
          try {
            localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(remoteList));
          } catch (e) {}

          syncStatus.state = 'connected';
          syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
          syncStatus.remoteJobsCount = snapshot.size;
          syncStatus.localJobsCount = inMemoryJobs.length;
          syncStatus.errorMessage = null;

          this.notifyUpdate();
          this.notifySyncState();
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'jobs');
          syncStatus.state = 'error';
          syncStatus.errorMessage = err?.message || 'Lỗi kết nối Firebase Jobs';
          this.notifySyncState();
        }
      );
    } catch (err) {
      console.error('Error initializing Firestore sync:', err);
    }
  },

  // Manual trigger to force upload ALL local news and jobs to Firestore Cloud
  async syncAllLocalToFirestore(): Promise<{
    newsCount: number;
    jobsCount: number;
    imgbbSavedCount: number;
    success: boolean;
    error?: string;
  }> {
    syncStatus.state = 'syncing';
    this.notifySyncState();

    try {
      let newsPushed = 0;
      let jobsPushed = 0;

      // 1. Push all articles currently in memory / local
      for (const article of inMemoryNews) {
        if (SAMPLE_NEWS_IDS.has(article.id)) continue;
        const clean = JSON.parse(JSON.stringify(article));
        await setDoc(doc(db, 'news', article.id), {
          ...clean,
          updatedAt: new Date().toISOString(),
        });
        newsPushed++;
      }

      // 2. Push all jobs currently in memory / local
      for (const job of inMemoryJobs) {
        if (SAMPLE_JOB_IDS.has(job.id)) continue;
        const clean = JSON.parse(JSON.stringify(job));
        await setDoc(doc(db, 'jobs', job.id), {
          ...clean,
          updatedAt: new Date().toISOString(),
        });
        jobsPushed++;
      }

      syncStatus.state = 'connected';
      syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
      syncStatus.remoteNewsCount = newsPushed;
      syncStatus.remoteJobsCount = jobsPushed;
      syncStatus.errorMessage = null;
      this.notifySyncState();
      this.notifyUpdate();

      return {
        newsCount: newsPushed,
        jobsCount: jobsPushed,
        imgbbSavedCount: 0,
        success: true,
      };
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.WRITE, 'syncAll');
      syncStatus.state = 'error';
      syncStatus.errorMessage = errInfo.error;
      this.notifySyncState();
      return {
        newsCount: 0,
        jobsCount: 0,
        imgbbSavedCount: 0,
        success: false,
        error: errInfo.error,
      };
    }
  },

  getSyncStatus(): CloudSyncStatus {
    return {
      ...syncStatus,
      localNewsCount: inMemoryNews.length,
      localJobsCount: inMemoryJobs.length,
    };
  },

  notifySyncState() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SYNC_STATE_EVENT, { detail: this.getSyncStatus() }));
    }
  },

  subscribeSyncState(callback: (status: CloudSyncStatus) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback(this.getSyncStatus());
    window.addEventListener(SYNC_STATE_EVENT, handler);
    // Send immediate current state
    callback(this.getSyncStatus());
    return () => window.removeEventListener(SYNC_STATE_EVENT, handler);
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

  async saveNews(article: NewsArticle): Promise<{ success: boolean; error?: string }> {
    const articleToSave = article;

    // 1. Update local state immediately for zero-latency UI response
    const existingIdx = inMemoryNews.findIndex((a) => a.id === articleToSave.id);
    if (existingIdx >= 0) {
      inMemoryNews[existingIdx] = articleToSave;
    } else {
      inMemoryNews = [articleToSave, ...inMemoryNews];
    }
    try {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(inMemoryNews));
    } catch (e) {}
    this.notifyUpdate();

    // 2. Persist to Firebase Firestore
    try {
      const cleanArticle = JSON.parse(JSON.stringify(articleToSave));
      await setDoc(doc(db, 'news', articleToSave.id), {
        ...cleanArticle,
        updatedAt: new Date().toISOString(),
      });
      syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
      syncStatus.state = 'connected';
      syncStatus.errorMessage = null;
      this.notifySyncState();
      return { success: true };
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.WRITE, `news/${articleToSave.id}`);
      syncStatus.state = 'error';
      syncStatus.errorMessage = errInfo.error;
      this.notifySyncState();
      return { success: false, error: errInfo.error };
    }
  },

  async deleteNews(id: string): Promise<void> {
    // 1. Update local cache
    inMemoryNews = inMemoryNews.filter((a) => a.id !== id);
    try {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(inMemoryNews));
    } catch (e) {}
    this.notifyUpdate();

    // 2. Delete from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'news', id));
      syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
      this.notifySyncState();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
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

  async saveJob(job: JobOpening): Promise<{ success: boolean; error?: string }> {
    const jobToSave = job;

    // 1. Update local cache
    const existingIdx = inMemoryJobs.findIndex((j) => j.id === jobToSave.id);
    if (existingIdx >= 0) {
      inMemoryJobs[existingIdx] = jobToSave;
    } else {
      inMemoryJobs = [jobToSave, ...inMemoryJobs];
    }
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(inMemoryJobs));
    } catch (e) {}
    this.notifyUpdate();

    // 2. Persist to Firebase Firestore
    try {
      const cleanJob = JSON.parse(JSON.stringify(jobToSave));
      await setDoc(doc(db, 'jobs', job.id), {
        ...cleanJob,
        updatedAt: new Date().toISOString(),
      });
      syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
      syncStatus.state = 'connected';
      syncStatus.errorMessage = null;
      this.notifySyncState();
      return { success: true };
    } catch (err) {
      const errInfo = handleFirestoreError(err, OperationType.WRITE, `jobs/${jobToSave.id}`);
      syncStatus.state = 'error';
      syncStatus.errorMessage = errInfo.error;
      this.notifySyncState();
      return { success: false, error: errInfo.error };
    }
  },

  async deleteJob(id: string): Promise<void> {
    // 1. Update local cache
    inMemoryJobs = inMemoryJobs.filter((j) => j.id !== id);
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(inMemoryJobs));
    } catch (e) {}
    this.notifyUpdate();

    // 2. Delete from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'jobs', id));
      syncStatus.lastSyncedAt = new Date().toLocaleTimeString('vi-VN');
      this.notifySyncState();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `jobs/${id}`);
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
      syncStatus.remoteNewsCount = 0;
      syncStatus.remoteJobsCount = 0;
      this.notifySyncState();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'clearAll');
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

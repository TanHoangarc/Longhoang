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

const NEWS_STORAGE_KEY = 'lh_custom_news_v1';
const JOBS_STORAGE_KEY = 'lh_custom_jobs_v1';
const CONTENT_UPDATE_EVENT = 'lh_content_updated';

// In-memory cache for ultra-fast synchronous UI renders
let inMemoryNews: NewsArticle[] = (() => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(NEWS_STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading initial local news:', e);
  }
  return DEFAULT_NEWS;
})();

let inMemoryJobs: JobOpening[] = (() => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(JOBS_STORAGE_KEY) : null;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading initial local jobs:', e);
  }
  return DEFAULT_JOBS;
})();

let isFirestoreInitialized = false;

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
          if (!snapshot.empty) {
            const list: NewsArticle[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as NewsArticle);
            });
            // Update cache & storage
            inMemoryNews = list;
            localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(list));
            this.notifyUpdate();
          } else {
            // Firestore collection is empty -> auto seed defaults into Firestore
            this.seedDefaultNews();
          }
        },
        (err) => {
          console.warn('Firestore News snapshot notice (offline/fallback active):', err);
        }
      );

      // 2. Listen to Realtime Jobs updates from Firestore
      onSnapshot(
        jobsColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: JobOpening[] = [];
            snapshot.forEach((d) => {
              list.push(d.data() as JobOpening);
            });
            inMemoryJobs = list;
            localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(list));
            this.notifyUpdate();
          } else {
            // Firestore collection is empty -> auto seed defaults into Firestore
            this.seedDefaultJobs();
          }
        },
        (err) => {
          console.warn('Firestore Jobs snapshot notice (offline/fallback active):', err);
        }
      );
    } catch (err) {
      console.error('Error initializing Firestore sync:', err);
    }
  },

  // Seed default news to Firestore if empty
  async seedDefaultNews() {
    try {
      for (const article of DEFAULT_NEWS) {
        await setDoc(doc(db, 'news', article.id), {
          ...article,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to seed default news to Firestore:', e);
    }
  },

  // Seed default jobs to Firestore if empty
  async seedDefaultJobs() {
    try {
      for (const job of DEFAULT_JOBS) {
        await setDoc(doc(db, 'jobs', job.id), {
          ...job,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to seed default jobs to Firestore:', e);
    }
  },

  // --- NEWS METHODS ---
  getNews(): NewsArticle[] {
    return inMemoryNews.length > 0 ? inMemoryNews : DEFAULT_NEWS;
  },

  getNewsById(id: string): NewsArticle | undefined {
    const list = this.getNews();
    return list.find((item) => item.id === id);
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
      await setDoc(doc(db, 'news', article.id), {
        ...article,
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
    return inMemoryJobs.length > 0 ? inMemoryJobs : DEFAULT_JOBS;
  },

  getJobById(id: string): JobOpening | undefined {
    const list = this.getJobs();
    return list.find((item) => item.id === id);
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
      await setDoc(doc(db, 'jobs', job.id), {
        ...job,
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

  // --- RESET TO FACTORY DEFAULTS ---
  async resetAll(): Promise<void> {
    // 1. Reset local cache
    inMemoryNews = DEFAULT_NEWS;
    inMemoryJobs = DEFAULT_JOBS;
    localStorage.removeItem(NEWS_STORAGE_KEY);
    localStorage.removeItem(JOBS_STORAGE_KEY);
    this.notifyUpdate();

    // 2. Re-seed Firebase Firestore
    try {
      const newsSnap = await getDocs(collection(db, 'news'));
      for (const d of newsSnap.docs) {
        await deleteDoc(doc(db, 'news', d.id));
      }
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      for (const d of jobsSnap.docs) {
        await deleteDoc(doc(db, 'jobs', d.id));
      }

      await this.seedDefaultNews();
      await this.seedDefaultJobs();
    } catch (err) {
      console.error('Firestore resetAll error:', err);
    }
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

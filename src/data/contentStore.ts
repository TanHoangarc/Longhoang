import { NewsArticle, JobOpening } from '../types';
import { NEWS_ARTICLES as DEFAULT_NEWS, JOB_OPENINGS as DEFAULT_JOBS } from './mockData';

const NEWS_STORAGE_KEY = 'lh_custom_news_v1';
const JOBS_STORAGE_KEY = 'lh_custom_jobs_v1';

// Custom event name for instant cross-component updates
const CONTENT_UPDATE_EVENT = 'lh_content_updated';

export const ContentStore = {
  // --- NEWS METHODS ---
  getNews(): NewsArticle[] {
    try {
      const stored = localStorage.getItem(NEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load news from storage:', e);
    }
    return DEFAULT_NEWS;
  },

  getNewsById(id: string): NewsArticle | undefined {
    const list = this.getNews();
    return list.find((item) => item.id === id);
  },

  saveNews(article: NewsArticle): void {
    const list = this.getNews();
    const existingIndex = list.findIndex((a) => a.id === article.id);
    let updatedList: NewsArticle[];

    if (existingIndex >= 0) {
      // Update existing
      updatedList = [...list];
      updatedList[existingIndex] = article;
    } else {
      // Prepend new article so it appears first
      updatedList = [article, ...list];
    }

    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(updatedList));
    this.notifyUpdate();
  },

  deleteNews(id: string): void {
    const list = this.getNews();
    const updatedList = list.filter((a) => a.id !== id);
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(updatedList));
    this.notifyUpdate();
  },

  // --- CAREERS / JOBS METHODS ---
  getJobs(): JobOpening[] {
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load jobs from storage:', e);
    }
    return DEFAULT_JOBS;
  },

  getJobById(id: string): JobOpening | undefined {
    const list = this.getJobs();
    return list.find((item) => item.id === id);
  },

  saveJob(job: JobOpening): void {
    const list = this.getJobs();
    const existingIndex = list.findIndex((j) => j.id === job.id);
    let updatedList: JobOpening[];

    if (existingIndex >= 0) {
      // Update existing
      updatedList = [...list];
      updatedList[existingIndex] = job;
    } else {
      // Prepend new job
      updatedList = [job, ...list];
    }

    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedList));
    this.notifyUpdate();
  },

  deleteJob(id: string): void {
    const list = this.getJobs();
    const updatedList = list.filter((j) => j.id !== id);
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedList));
    this.notifyUpdate();
  },

  // --- RESET TO FACTORY DEFAULTS ---
  resetAll(): void {
    localStorage.removeItem(NEWS_STORAGE_KEY);
    localStorage.removeItem(JOBS_STORAGE_KEY);
    this.notifyUpdate();
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

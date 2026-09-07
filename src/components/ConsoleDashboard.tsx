import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bold,
  Heading,
  List,
  Link as LinkIcon,
  HelpCircle,
  Newspaper,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Save,
  X,
  Check,
  RotateCcw,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Calendar,
  Layers,
  Image as ImageIcon,
  Building,
  Upload,
  Download,
  AlertCircle,
  FileText,
  Cloud,
  Database,
  MessageSquare,
  Pin,
  PinOff,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  RefreshCw,
  CloudUpload,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Monitor,
  Smartphone,
  Maximize2
} from 'lucide-react';
import { LongHoangLogo } from './LongHoangLogo';
import { ContentStore, sortNewsArticles, CloudSyncStatus } from '../data/contentStore';
import { NewsArticle, JobOpening } from '../types';
import { ConsoleQuotesTab } from './ConsoleQuotesTab';
import { renderTextWithTooltips } from '../utils/tooltipParser';

interface ConsoleDashboardProps {
  onBackToHome: () => void;
  onViewArticle?: (id: string) => void;
  onViewJob?: (id: string) => void;
}

// Preset images for convenient selection
const PRESET_NEWS_IMAGES = [
  { label: 'Tàu chở hàng đại dương', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cảng biển quốc tế & Cẩu hàng', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kho bãi & Vận tải đường bộ', url: 'https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Vận chuyển hàng không', url: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Đội xe tải container', url: 'https://plus.unsplash.com/premium_photo-1733342421852-3bce709563e4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sự kiện công ty & Giải chạy', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80' },
];

const PRESET_JOB_IMAGES = [
  { label: 'Văn phòng hiện đại & Đội ngũ', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cuộc họp chuyên nghiệp Logistics', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Giao dịch quốc tế & Forwarding', url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hiện trường Cảng biển & Hải quan', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80' },
];

export const ConsoleDashboard: React.FC<ConsoleDashboardProps> = ({
  onBackToHome,
  onViewArticle,
  onViewJob,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'careers' | 'quotes' | 'settings'>('quotes');
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [jobsList, setJobsList] = useState<JobOpening[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsFilter, setNewsFilter] = useState<'all' | 'industry-news' | 'industry-knowledge' | 'company-news' | 'pinned'>('all');
  const [jobFilter, setJobFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudSync, setCloudSync] = useState<CloudSyncStatus>(ContentStore.getSyncStatus());
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    const unsub = ContentStore.subscribeSyncState((status) => {
      setCloudSync(status);
    });
    return unsub;
  }, []);

  const handleSyncAllToFirestore = async () => {
    setIsSyncingAll(true);
    try {
      const res = await ContentStore.syncAllLocalToFirestore();
      if (res.success) {
        if (res.imgbbSavedCount && res.imgbbSavedCount > 0) {
          showToast(`Đã tải & lưu ${res.imgbbSavedCount} ảnh ImgBB về thư mục public/img, đồng bộ ${res.newsCount} bài viết & ${res.jobsCount} tin tuyển dụng lên Firebase Cloud thành công!`);
        } else {
          showToast(`Đã đồng bộ ${res.newsCount} bài viết & ${res.jobsCount} tin tuyển dụng lên Firebase Cloud! (Tất cả ảnh đã an toàn trong hệ thống)`);
        }
        setNewsList(ContentStore.getNews());
        setJobsList(ContentStore.getJobs());
      } else {
        showToast(`Lỗi đồng bộ: ${res.error || 'Vui lòng kiểm tra mạng'}`);
      }
    } catch (e: any) {
      showToast(`Lỗi: ${e?.message || 'Không thể đồng bộ'}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Edit / Create News Modal State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  // Form State for News
  const [newsFormTitle, setNewsFormTitle] = useState('');
  const [newsFormType, setNewsFormType] = useState<'industry-news' | 'industry-knowledge' | 'company-news'>('industry-news');
  const [newsFormDate, setNewsFormDate] = useState('');
  const [newsFormImage, setNewsFormImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [helperImageUrl, setHelperImageUrl] = useState('');
  const [isUploadingHelper, setIsUploadingHelper] = useState(false);
  const [helperUploadProgress, setHelperUploadProgress] = useState(0);


  const applyTextChange = (
    activeEl: HTMLTextAreaElement | HTMLInputElement,
    newText: string,
    newSelectionStart: number,
    newSelectionEnd: number
  ) => {
    // Call the native setter to bypass React's tracking, then dispatch input event
    const prototype = activeEl.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    nativeInputValueSetter?.call(activeEl, newText);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));

    // Restore focus and selection
    setTimeout(() => {
      activeEl.focus();
      activeEl.setSelectionRange(newSelectionStart, newSelectionEnd);
    }, 0);
  };

  const handleFormatText = (prefix: string, suffix: string, defaultText: string) => {
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
    if (!activeEl || (activeEl.tagName !== 'TEXTAREA' && activeEl.tagName !== 'INPUT')) {
      alert('Vui lòng click chuột vào ô nhập liệu bên dưới và chọn đoạn chữ (nếu có) trước khi bấm nút chèn!');
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const value = activeEl.value || '';
    const selectedText = value.substring(start, end) || defaultText;

    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    applyTextChange(activeEl, newText, start + prefix.length, start + prefix.length + selectedText.length);
  };

  // Format one or multiple selected lines with '* ' bullet point
  const handleBulletList = () => {
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
    if (!activeEl || (activeEl.tagName !== 'TEXTAREA' && activeEl.tagName !== 'INPUT')) {
      alert('Vui lòng click chuột vào ô nhập liệu bên dưới và bôi đen một hoặc nhiều hàng cần thêm dấu đầu dòng * trước khi bấm nút!');
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const value = activeEl.value || '';

    // If no text is selected (single cursor position)
    if (start === end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = value.indexOf('\n', start);
      if (lineEnd === -1) lineEnd = value.length;

      const currentLine = value.substring(lineStart, lineEnd);
      let newLine = '';
      let newCursorPos = start;

      if (currentLine.trim() === '') {
        newLine = '* ';
        newCursorPos = lineStart + 2;
      } else if (currentLine.startsWith('* ')) {
        // Toggle off
        newLine = currentLine.substring(2);
        newCursorPos = Math.max(lineStart, start - 2);
      } else if (currentLine.startsWith('*')) {
        newLine = currentLine.substring(1).trimStart();
        newCursorPos = Math.max(lineStart, start - (currentLine.length - newLine.length));
      } else {
        // Prepend '* '
        newLine = '* ' + currentLine;
        newCursorPos = start + 2;
      }

      const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      applyTextChange(activeEl, newText, newCursorPos, newCursorPos);
      return;
    }

    // Text is selected across one or more rows/lines
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end > 0 && value[end - 1] === '\n' ? end - 1 : end);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedBlock = value.substring(lineStart, lineEnd);
    const lines = selectedBlock.split('\n');

    // Check if all non-empty lines already start with '* '
    const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
    const allBulleted = nonEmptyLines.length > 0 && nonEmptyLines.every((l) => l.startsWith('* '));

    const updatedLines = lines.map((line) => {
      if (allBulleted) {
        // Toggle off: remove '* ' or '*'
        if (line.startsWith('* ')) return line.substring(2);
        if (line.startsWith('*')) return line.substring(1).trimStart();
        return line;
      } else {
        // Toggle on: add '* '
        if (line.trim().length === 0) return line;
        if (line.startsWith('* ')) return line;
        if (line.startsWith('*')) return '* ' + line.substring(1).trimStart();
        return '* ' + line;
      }
    });

    const replacement = updatedLines.join('\n');
    const newText = value.substring(0, lineStart) + replacement + value.substring(lineEnd);
    applyTextChange(activeEl, newText, lineStart, lineStart + replacement.length);
  };

  // State for Suggest & Assign Existing Article to Selected Keyword
  const [isArticleSuggestModalOpen, setIsArticleSuggestModalOpen] = useState(false);
  const [selectedArticleForKeyword, setSelectedArticleForKeyword] = useState<NewsArticle | null>(null);
  const [suggestedKeyword, setSuggestedKeyword] = useState('');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [articleAssignMode, setArticleAssignMode] = useState<'link' | 'tooltip'>('link');
  const targetInputRef = React.useRef<{
    element: HTMLTextAreaElement | HTMLInputElement | null;
    start: number;
    end: number;
    value: string;
  } | null>(null);

  const handleOpenArticleSuggestModal = () => {
    const activeEl = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
    if (!activeEl || (activeEl.tagName !== 'TEXTAREA' && activeEl.tagName !== 'INPUT')) {
      alert('Vui lòng click chuột vào ô nội dung/đoạn văn và bôi đen từ khóa cần gán bài viết trước khi bấm nút!');
      return;
    }

    const start = activeEl.selectionStart || 0;
    const end = activeEl.selectionEnd || 0;
    const value = activeEl.value || '';
    const selectedText = value.substring(start, end).trim();

    targetInputRef.current = {
      element: activeEl,
      start,
      end,
      value,
    };

    const initialKeyword = selectedText || '';
    setSuggestedKeyword(initialKeyword);
    setArticleSearchQuery(selectedText || '');

    // Auto-match best existing article if user selected a keyword
    const lower = selectedText.toLowerCase();
    const bestMatch = lower
      ? newsList.find(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.summary.toLowerCase().includes(lower) ||
            (a.categoryTitle && a.categoryTitle.toLowerCase().includes(lower))
        )
      : null;

    setSelectedArticleForKeyword(bestMatch || newsList[0] || null);
    setIsArticleSuggestModalOpen(true);
  };

  const handleConfirmAssignArticle = () => {
    if (!selectedArticleForKeyword) {
      alert('Vui lòng chọn một bài viết từ danh sách gợi ý!');
      return;
    }

    const keyword = suggestedKeyword.trim() || selectedArticleForKeyword.title;
    let replacement = '';
    if (articleAssignMode === 'link') {
      replacement = `[${keyword}](#article-${selectedArticleForKeyword.id})`;
    } else {
      const cleanSummary = (selectedArticleForKeyword.summary || selectedArticleForKeyword.title)
        .replace(/\|/g, '-')
        .replace(/\n/g, ' ')
        .slice(0, 140);
      replacement = `*#${keyword} | ${selectedArticleForKeyword.image} | ${selectedArticleForKeyword.title}: ${cleanSummary}#*`;
    }

    const target = targetInputRef.current;
    if (target && target.element) {
      const { element, start, end } = target;
      const currentVal = element.value || '';
      const newText = currentVal.substring(0, start) + replacement + currentVal.substring(end);
      applyTextChange(element, newText, start, start + replacement.length);
      setToastMessage(`Đã gán bài viết "${selectedArticleForKeyword.title}" vào từ khóa "${keyword}"!`);
    } else {
      handleFormatText(replacement, '', '');
      setToastMessage(`Đã gán bài viết vào vị trí con trỏ!`);
    }

    setIsArticleSuggestModalOpen(false);
  };

  const filteredArticlesForKeyword = newsList
    .filter((art) => {
      if (!articleSearchQuery.trim()) return true;
      const q = articleSearchQuery.toLowerCase().trim();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        (art.categoryTitle && art.categoryTitle.toLowerCase().includes(q)) ||
        art.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!articleSearchQuery.trim()) return 0;
      const q = articleSearchQuery.toLowerCase().trim();
      const aTitleMatch = a.title.toLowerCase().includes(q);
      const bTitleMatch = b.title.toLowerCase().includes(q);
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });

  // Fast, zero-failure client-side image compressor (max 1280px, WebP/JPEG, ~60-120KB)
  const compressAndLoadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Vui lòng chọn một file hình ảnh hợp lệ.'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Không thể đọc file ảnh từ máy tính.'));
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) {
          reject(new Error('File ảnh không có dữ liệu.'));
          return;
        }

        if (file.type === 'image/svg+xml') {
          resolve(result);
          return;
        }

        const img = new Image();
        img.onerror = () => reject(new Error('Trình duyệt không thể giải mã hình ảnh này.'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 1280;

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(result);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG with 0.82 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve(dataUrl);
          } catch {
            resolve(result);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleHelperImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng dưới 15MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setIsUploadingHelper(true);
    setHelperUploadProgress(20);
    try {
      const progressTimer = setInterval(() => {
        setHelperUploadProgress((prev) => (prev < 90 ? prev + 30 : prev));
      }, 40);

      const compressedDataUrl = await compressAndLoadImage(file);
      clearInterval(progressTimer);
      
      setHelperUploadProgress(100);
      setHelperImageUrl(compressedDataUrl);

      // Auto copy to clipboard
      try {
        await navigator.clipboard.writeText(compressedDataUrl);
        setToastMessage('Đã tải ảnh lên & tự động copy link ảnh vào bộ nhớ tạm!');
      } catch {
        setToastMessage('Đã tải và xử lý ảnh thành công!');
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh:', err);
      alert(err?.message || 'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại!');
    } finally {
      setIsUploadingHelper(false);
      setHelperUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng dưới 15MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(20);
    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 30 : prev));
      }, 40);

      const compressedDataUrl = await compressAndLoadImage(file);
      clearInterval(progressTimer);

      setUploadProgress(100);
      setNewsFormImage(compressedDataUrl);
      setToastMessage('Đã tải và cập nhật ảnh đại diện bài viết thành công!');
    } catch (err: any) {
      console.error('Lỗi tải ảnh đại diện:', err);
      alert(err?.message || 'Có lỗi khi xử lý ảnh đại diện. Vui lòng thử lại.');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };
  const [newsFormSummary, setNewsFormSummary] = useState('');
  const [newsFormLead, setNewsFormLead] = useState('');
  const [newsFormParagraphs, setNewsFormParagraphs] = useState<string[]>(['']);
  const [newsFormDetailsTitle, setNewsFormDetailsTitle] = useState('');
  const [newsFormDetailsRaw, setNewsFormDetailsRaw] = useState(''); // Multiline helper
  const [newsFormNote, setNewsFormNote] = useState('');
  const [newsFormIsPinned, setNewsFormIsPinned] = useState(false);

  // Suggestions for Note / Footer of News
  const [showNoteSuggestions, setShowNoteSuggestions] = useState(false);
  const [noteSuggestionSearch, setNoteSuggestionSearch] = useState('');
  const [customNotesHistory, setCustomNotesHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lh_news_notes_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper to normalize note suggestions: replaces exact links with (URL) and standardizes source citations
  const normalizeNoteForSuggestion = (text: string): string => {
    if (!text) return '';
    let s = text.trim();

    // 1. Markdown link destinations: [Title](https://...) or [Title](...) -> [Title](URL)
    s = s.replace(/\[(.*?)\]\([^)]+\)/g, '[$1](URL)');

    // 2. Standardize [Nguồn: X](URL) into [Nguồn X](URL)
    s = s.replace(/\[Nguồn:\s*(.*?)\]\(URL\)/gi, '[Nguồn $1](URL)');

    // 3. Replace raw URLs in parentheses (http...) with (URL)
    s = s.replace(/\(https?:\/\/[^\s)]+\)/gi, '(URL)');

    // 4. Replace any standalone URL http/https with (URL)
    s = s.replace(/https?:\/\/[^\s)]+/gi, '(URL)');

    // 5. Clean up duplicate spaces
    s = s.replace(/\s+/g, ' ');

    return s.trim();
  };

  // Built-in presets for Logistics & Industry News with standardized (URL)
  const DEFAULT_INDUSTRY_NOTE_PRESETS = [
    '[Nguồn Tạp chí Kinh tế](URL)',
    '[Nguồn Tạp chí Tài chính](URL)',
    '[Nguồn Báo Đầu Tư](URL)',
    '[Nguồn Báo Hải Quan](URL)',
    '[Nguồn Cục Hải quan Việt Nam](URL)',
    'Long Hoàng Logistics – Đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn.',
    'Thông tin mang tính chất tham khảo. Quý doanh nghiệp cần tư vấn chuyên sâu về thuế và thủ tục hải quan, vui lòng liên hệ đội ngũ chuyên gia Long Hoàng Logistics.',
    'Để nhận báo giá cước vận tải biển/hàng không ưu đãi và lịch tàu mới nhất, quý khách vui lòng liên hệ Hotline: 0867 141 877.',
    'Long Hoàng Logistics – Giải pháp vận chuyển toàn diện, an toàn và tối ưu chi phí cho chuỗi cung ứng của bạn.',
    'Các quy định và biểu thuế có thể thay đổi theo văn bản pháp luật hiện hành. Vui lòng liên hệ trực tiếp để được cập nhật kịp thời.',
    'Quý doanh nghiệp cần hỗ trợ tư vấn hồ sơ hải quan hoặc thủ tục chuyên ngành, vui lòng liên hệ hotline: 0867 141 877.',
  ];

  const noteSuggestions = useMemo(() => {
    const list: { text: string; source: string; isIndustry: boolean; articleTitle?: string }[] = [];
    const seen = new Set<string>();

    const addSug = (text: string, source: string, isIndustry: boolean, articleTitle?: string) => {
      const normalized = normalizeNoteForSuggestion(text);
      if (!normalized) return;

      // Key for strict deduplication: case-insensitive and normalized spaces
      const key = normalized.toLowerCase().replace(/\s+/g, ' ');
      if (seen.has(key)) return;
      seen.add(key);

      list.push({ text: normalized, source, isIndustry, articleTitle });
    };

    // 1. Preset recommendations for Long Hoàng Logistics & Industry news (e.g. [Nguồn Tạp chí Kinh tế](URL))
    DEFAULT_INDUSTRY_NOTE_PRESETS.forEach((preset) => {
      addSug(preset, 'Mẫu chuyên ngành đề xuất', true);
    });

    // 2. Extract notes from existing Industry News / Industry Knowledge articles
    newsList.forEach((article) => {
      const note = article.content?.note?.trim();
      if (note) {
        const isInd = article.type === 'industry-news' || article.type === 'industry-knowledge';
        const sourceLabel = isInd ? 'Tin tức chuyên ngành' : 'Tin tức công ty';

        // Extract any source citation tags like [Nguồn ...](...) or [...](...)
        const linkMatches = note.match(/\[(.*?)\]\([^)]+\)/g);
        if (linkMatches) {
          linkMatches.forEach((m) => {
            addSug(m, `${sourceLabel}`, isInd, article.title);
          });
        }

        // Also add the full normalized note (URLs converted to URL placeholder)
        addSug(note, `${sourceLabel}`, isInd, article.title);
      }
    });

    // 3. Custom notes previously saved/entered by the user
    customNotesHistory.forEach((note) => {
      addSug(note, 'Đã nhập trước đó', true);
    });

    // Filter by search query if any
    let result = list;
    if (noteSuggestionSearch.trim()) {
      const q = noteSuggestionSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.text.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.articleTitle && item.articleTitle.toLowerCase().includes(q))
      );
    }

    // Sort: if current article type is industry-news, keep industry notes first
    if (newsFormType === 'industry-news' || newsFormType === 'industry-knowledge') {
      return [...result].sort((a, b) => (b.isIndustry ? 1 : 0) - (a.isIndustry ? 1 : 0));
    }

    return result;
  }, [newsList, customNotesHistory, noteSuggestionSearch, newsFormType]);

  const handleSelectNoteSuggestion = (noteText: string, append = false) => {
    if (append && newsFormNote.trim()) {
      setNewsFormNote(`${newsFormNote.trim()} ${noteText.trim()}`);
      showToast('Đã nối thêm lời kết vào cuối!');
    } else {
      setNewsFormNote(noteText.trim());
      showToast('Đã áp dụng lời kết thành công!');
    }
  };

  // Edit / Create Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);

  // Article Preview Modal State (Xem Web)
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [isArticlePreviewOpen, setIsArticlePreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Job Preview Modal State (Xem Web Tuyển dụng)
  const [previewJob, setPreviewJob] = useState<JobOpening | null>(null);
  const [isJobPreviewOpen, setIsJobPreviewOpen] = useState(false);
  const [previewJobDevice, setPreviewJobDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Preview Scroll Container Refs & Reset
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const jobScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isArticlePreviewOpen && articleScrollRef.current) {
      articleScrollRef.current.scrollTop = 0;
    }
  }, [isArticlePreviewOpen, previewDevice]);

  useEffect(() => {
    if (isJobPreviewOpen && jobScrollRef.current) {
      jobScrollRef.current.scrollTop = 0;
    }
  }, [isJobPreviewOpen, previewJobDevice]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('lh_admin_auth') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin@7602') {
      setIsAuthenticated(true);
      sessionStorage.setItem('lh_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  // Form State for Job
  const [jobFormTitle, setJobFormTitle] = useState('');
  const [jobFormLocation, setJobFormLocation] = useState('Hồ Chí Minh');
  const [jobFormType, setJobFormType] = useState('Toàn thời gian');
  const [jobFormStatus, setJobFormStatus] = useState<'active' | 'expired'>('active');
  const [jobFormDate, setJobFormDate] = useState('');
  const [jobFormDeadline, setJobFormDeadline] = useState('31/12/2026');
  const [jobFormImage, setJobFormImage] = useState('');
  const [isUploadingJobImage, setIsUploadingJobImage] = useState(false);
  const [jobImageUploadProgress, setJobImageUploadProgress] = useState(0);

  const handleJobImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng dưới 15MB.');
      if (e.target) e.target.value = '';
      return;
    }

    setIsUploadingJobImage(true);
    setJobImageUploadProgress(20);
    try {
      const progressTimer = setInterval(() => {
        setJobImageUploadProgress((prev) => (prev < 90 ? prev + 30 : prev));
      }, 40);

      const compressedDataUrl = await compressAndLoadImage(file);
      clearInterval(progressTimer);

      setJobImageUploadProgress(100);
      setJobFormImage(compressedDataUrl);
      setToastMessage('Đã tải và cập nhật ảnh bìa tuyển dụng thành công!');
    } catch (err: any) {
      console.error('Lỗi tải ảnh tuyển dụng:', err);
      alert(err?.message || 'Có lỗi khi xử lý ảnh tuyển dụng. Vui lòng thử lại.');
    } finally {
      setIsUploadingJobImage(false);
      setJobImageUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const [jobFormSummary, setJobFormSummary] = useState('');
  const [jobFormLead, setJobFormLead] = useState('');
  const [jobFormPositions, setJobFormPositions] = useState<
    {
      title: string;
      location: string;
      salary: string;
      description: string;
      requirements: string;
      benefits: string;
    }[]
  >([
    {
      title: 'Nhân viên Kinh doanh Logistics (Sales Forwarder)',
      location: 'Hồ Chí Minh & Hải Phòng',
      salary: '12 - 25 Triệu + Thưởng KPI',
      description: 'Tìm kiếm, phát triển khách hàng xuất nhập khẩu mới;\nTư vấn các giải pháp vận tải đường biển, hàng không, đa phương thức;\nTheo dõi đơn hàng và chăm sóc khách hàng định kỳ.',
      requirements: 'Tốt nghiệp Cao đẳng/Đại học chuyên ngành Logistics, XNK hoặc QTKD;\nKinh nghiệm từ 6 tháng - 1 năm vị trí tương đương;\nNhanh nhẹn, kỹ năng giao tiếp và đàm phán tốt.',
      benefits: 'Thu nhập hấp dẫn, thưởng doanh số hàng tháng/quý/năm;\nĐược đào tạo bài bản về nghiệp vụ chuỗi cung ứng quốc tế;\nĐóng BHXH, BHYT đầy đủ, du lịch teambuilding hàng năm.',
    },
  ]);

  // Load content on mount & sync
  const loadData = () => {
    setNewsList(ContentStore.getNews());
    setJobsList(ContentStore.getJobs());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = ContentStore.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to format date parts
  const parseDateParts = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length >= 2) {
      return { day: parts[0], month: `Th${parts[1]}` };
    }
    const d = new Date();
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: `Th${String(d.getMonth() + 1).padStart(2, '0')}`,
    };
  };

  const getTodayFormatted = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ================= NEWS CRUD =================
  const handleOpenCreateNews = () => {
    setEditingNews(null);
    setNewsFormTitle('');
    setNewsFormType('industry-news');
    setNewsFormDate(getTodayFormatted());
    setNewsFormImage(PRESET_NEWS_IMAGES[0].url);
    setNewsFormSummary('');
    setNewsFormLead('');
    setNewsFormParagraphs(['']);
    setNewsFormDetailsTitle('');
    setNewsFormDetailsRaw('');
    setNewsFormNote('Long Hoàng Logistics – Đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn.');
    setNewsFormIsPinned(false);
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setNewsFormTitle(article.title);
    setNewsFormType(article.type);
    setNewsFormDate(article.date);
    setNewsFormImage(article.image);
    setNewsFormSummary(article.summary);
    setNewsFormLead(article.content?.lead || '');
    setNewsFormParagraphs(article.content?.paragraphs || ['']);
    setNewsFormDetailsTitle(article.content?.detailsCardTitle || '');

    // Convert detailsList to raw text
    if (article.content?.detailsList) {
      const raw = article.content.detailsList
        .map((sec) => `## ${sec.title}\n${sec.points.join('\n')}`)
        .join('\n\n');
      setNewsFormDetailsRaw(raw);
    } else {
      setNewsFormDetailsRaw('');
    }

    setNewsFormNote(article.content?.note || '');
    setNewsFormIsPinned(Boolean(article.isPinned));
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    const { day, month } = parseDateParts(newsFormDate);
    const categoryTitle =
      newsFormType === 'industry-news'
        ? 'Tin tức chuyên ngành'
        : newsFormType === 'industry-knowledge'
        ? 'Kiến thức chuyên ngành'
        : 'Tin tức công ty';

    // Parse structured details
    let detailsList: { title: string; points: string[] }[] | undefined = undefined;
    if (newsFormDetailsRaw.trim()) {
      const sections = newsFormDetailsRaw.split(/##\s+/).filter(Boolean);
      detailsList = sections.map((sec) => {
        const lines = sec.trim().split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim();
        const points = lines
          .slice(1)
          .map((l) => l.trim())
          .filter(Boolean);
        return { title, points };
      });
    }

    const id =
      editingNews?.id ||
      'lh-' +
        newsFormTitle
          .toLowerCase()
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
          .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
          .replace(/[ùúụủũưừứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50) +
        '-' +
        Date.now().toString().slice(-4);

    const newArticle: NewsArticle = {
      id,
      title: newsFormTitle.trim(),
      category: categoryTitle,
      type: newsFormType,
      date: newsFormDate,
      day,
      month,
      summary: newsFormSummary.trim() || newsFormTitle,
      image: newsFormImage.trim() || PRESET_NEWS_IMAGES[0].url,
      isPinned: newsFormIsPinned,
      pinnedAt: newsFormIsPinned
        ? (editingNews?.isPinned && editingNews?.pinnedAt ? editingNews.pinnedAt : new Date().toISOString())
        : undefined,
      content: {
        lead: newsFormLead.trim(),
        paragraphs: newsFormParagraphs.filter((p) => p.trim().length > 0),
        detailsCardTitle: newsFormDetailsTitle.trim() || undefined,
        detailsList: detailsList && detailsList.length > 0 ? detailsList : undefined,
        note: newsFormNote.trim() || undefined,
      },
    };

    if (newsFormNote.trim()) {
      const normalizedForHistory = normalizeNoteForSuggestion(newsFormNote);
      const updatedHistory = [
        normalizedForHistory,
        ...customNotesHistory.filter(
          (n) => normalizeNoteForSuggestion(n).toLowerCase() !== normalizedForHistory.toLowerCase()
        ),
      ].slice(0, 50);
      setCustomNotesHistory(updatedHistory);
      try {
        localStorage.setItem('lh_news_notes_history', JSON.stringify(updatedHistory));
      } catch {}
    }

    const saveResult = await ContentStore.saveNews(newArticle);
    setIsNewsModalOpen(false);
    if (saveResult.success) {
      showToast(editingNews ? 'Đã lưu & đồng bộ bài viết lên Firebase Cloud thành công!' : 'Đã đăng bài & đồng bộ Firebase Cloud thành công!');
    } else {
      showToast(`Đã lưu cục bộ. Cảnh báo lỗi Firebase: ${saveResult.error || 'Vui lòng kiểm tra mạng'}`);
    }
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" khỏi hệ thống & Firebase?`)) {
      await ContentStore.deleteNews(id);
      showToast('Đã xóa bài viết khỏi Firebase & hệ thống!');
    }
  };

  const handleTogglePinNews = async (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const newStatus = await ContentStore.togglePinNews(article.id);
      showToast(
        newStatus
          ? `Đã ghim bài viết "${article.title}" lên vị trí ưu tiên đầu danh sách!`
          : `Đã bỏ ghim bài viết "${article.title}"!`
      );
    } catch (err) {
      console.error('Lỗi khi ghim bài viết:', err);
      showToast('Có lỗi xảy ra khi cập nhật trạng thái ghim bài viết.');
    }
  };

  // ================= JOBS CRUD =================
  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobFormTitle('LONG HOÀNG LOGISTICS TUYỂN DỤNG - THÁNG ' + (new Date().getMonth() + 1));
    setJobFormLocation('Hồ Chí Minh & Toàn quốc');
    setJobFormType('Toàn thời gian');
    setJobFormStatus('active');
    setJobFormDate(getTodayFormatted());
    setJobFormDeadline('30/' + String(new Date().getMonth() + 2).padStart(2, '0') + '/' + new Date().getFullYear());
    setJobFormImage(PRESET_JOB_IMAGES[0].url);
    setJobFormSummary('Long Hoàng Logistics tìm kiếm các ứng viên năng động, nhiệt huyết gia nhập đội ngũ chuỗi cung ứng quốc tế.');
    setJobFormLead('Nhằm đáp ứng tốc độ tăng trưởng và mở rộng mạng lưới vận tải, Long Hoàng Logistics trân trọng thông báo tuyển dụng nhiều vị trí hấp dẫn.');
    setJobFormPositions([
      {
        title: 'Nhân viên Kinh doanh Cước Quốc tế (Sales Forwarding)',
        location: 'Hồ Chí Minh / Hải Phòng / Đà Nẵng',
        salary: '12 - 25 Triệu + % Hoa hồng cao',
        description: 'Phát triển khách hàng xuất nhập khẩu có nhu cầu vận tải biển, hàng không;\nTư vấn giá cước và lịch trình tối ưu cho khách hàng;\nChăm sóc và duy trì mối quan hệ bền vững với đối tác.',
        requirements: 'Tốt nghiệp Đại học/Cao đẳng chuyên ngành Logistics, XNK, Ngoại thương;\nCó tinh thần trách nhiệm, giao tiếp tự tin và nhiệt huyết;\nƯu tiên ứng viên có tiếng Anh giao tiếp hoặc kinh nghiệm Sales.',
        benefits: 'Lương cơ bản cạnh tranh + Thưởng doanh số hấp dẫn không giới hạn;\nĐược đào tạo chuyên sâu bởi các chuyên gia Logistics 15+ năm kinh nghiệm;\nĐầy đủ chế độ BHXH, bảo hiểm sức khỏe, thưởng lễ Tết, du lịch hàng năm.',
      },
    ]);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobOpening) => {
    setEditingJob(job);
    setJobFormTitle(job.title);
    setJobFormLocation(job.location);
    setJobFormType(job.type);
    setJobFormStatus(job.status || 'active');
    setJobFormDate(job.date);
    setJobFormDeadline(job.deadline);
    setJobFormImage(job.image);
    setJobFormSummary(job.summary);
    setJobFormLead(job.content?.lead || '');

    if (job.content?.positions && job.content.positions.length > 0) {
      setJobFormPositions(
        job.content.positions.map((p) => ({
          title: p.title,
          location: p.location,
          salary: p.salary || '',
          description: p.description.join('\n'),
          requirements: p.requirements.join('\n'),
          benefits: p.benefits.join('\n'),
        }))
      );
    } else {
      setJobFormPositions([
        {
          title: 'Nhân viên Logistics',
          location: job.location,
          salary: 'Thỏa thuận',
          description: 'Thực hiện công việc logistics theo phân công.',
          requirements: 'Có trách nhiệm trong công việc.',
          benefits: 'Chế độ đãi ngộ tốt theo quy định công ty.',
        },
      ]);
    }

    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài tuyển dụng!');
      return;
    }

    const { day, month } = parseDateParts(jobFormDate);
    const id =
      editingJob?.id ||
      'job-' +
        jobFormTitle
          .toLowerCase()
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
          .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
          .replace(/[ùúụủũưừứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 50) +
        '-' +
        Date.now().toString().slice(-4);

    const positions = jobFormPositions.map((pos) => ({
      title: pos.title.trim(),
      location: pos.location.trim(),
      salary: pos.salary.trim() || undefined,
      description: pos.description
        .split('\n')
        .map((s) => s.replace(/^[-*•]\s+/, '').trim())
        .filter(Boolean),
      requirements: pos.requirements
        .split('\n')
        .map((s) => s.replace(/^[-*•]\s+/, '').trim())
        .filter(Boolean),
      benefits: pos.benefits
        .split('\n')
        .map((s) => s.replace(/^[-*•]\s+/, '').trim())
        .filter(Boolean),
    }));

    const newJob: JobOpening = {
      id,
      title: jobFormTitle.trim(),
      location: jobFormLocation.trim(),
      type: jobFormType.trim(),
      date: jobFormDate,
      day,
      month,
      views: editingJob?.views || Math.floor(Math.random() * 40) + 15,
      deadline: jobFormDeadline.trim(),
      status: jobFormStatus,
      image: jobFormImage.trim() || PRESET_JOB_IMAGES[0].url,
      summary: jobFormSummary.trim(),
      content: {
        lead: jobFormLead.trim(),
        subLead: 'Môi trường làm việc năng động, lộ trình phát triển rõ ràng cùng nhiều cơ hội thăng tiến.',
        positions,
        howToApply: {
          email: 'Teddy.diem@longhoanglogistics.com',
          hotline: '0867 141 877',
          zalo: '0867 141 877',
          address: 'Tầng 4, Tòa nhà D-Head, 371 Nguyễn Kiệm, P.3, Q. Gò Vấp, TP. Hồ Chí Minh',
        },
      },
    };

    const saveResult = await ContentStore.saveJob(newJob);
    setIsJobModalOpen(false);
    if (saveResult.success) {
      showToast(editingJob ? 'Đã cập nhật bài tuyển dụng lên Firebase Cloud thành công!' : 'Đã đăng tin tuyển dụng & đồng bộ Firebase Cloud thành công!');
    } else {
      showToast(`Đã lưu cục bộ. Cảnh báo lỗi Firebase: ${saveResult.error || 'Vui lòng kiểm tra mạng'}`);
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${title}" khỏi hệ thống & Firebase?`)) {
      await ContentStore.deleteJob(id);
      showToast('Đã xóa tin tuyển dụng khỏi Firebase & hệ thống!');
    }
  };

  const handleToggleJobStatus = async (job: JobOpening, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const newStatus = await ContentStore.toggleJobStatus(job.id);
      showToast(
        newStatus === 'active'
          ? `Đã chuyển tin "${job.title}" sang trạng thái: Còn hiệu lực!`
          : `Đã chuyển tin "${job.title}" sang trạng thái: Hết hiệu lực!`
      );
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái tuyển dụng:', err);
      showToast('Có lỗi xảy ra khi đổi trạng thái tin tuyển dụng.');
    }
  };

  // Filtered lists
  const filteredNews = newsList
    .filter((a) => {
      const matchesFilter =
        newsFilter === 'all'
          ? true
          : newsFilter === 'pinned'
          ? Boolean(a.isPinned)
          : a.type === newsFilter;
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort(sortNewsArticles);

  const filteredJobs = jobsList.filter((j) => {
    const status = j.status || 'active';
    const matchesFilter =
      jobFilter === 'all'
        ? true
        : status === jobFilter;
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0048ba] to-[#0284c7] flex items-center justify-center font-black text-white text-xl shadow-md mb-4">
              LH
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Console Quản Trị</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Đăng nhập để quản lý nội dung website</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tài khoản</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Nhập tên tài khoản"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onBackToHome} className="text-slate-400 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-[#0048ba] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-emerald-400">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Console Navigation Bar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Về Website chính</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0048ba] to-[#0284c7] flex items-center justify-center font-black text-white text-xs shadow-md">
                LH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide">
                    LONG HOÀNG CONSOLE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    PORTAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hệ thống quản lý nội dung Tin tức & Tuyển dụng
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3.5 h-3.5" />
              <span>Firebase Cloud Firestore Active</span>
            </div>

            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 rounded-lg bg-[#0048ba] hover:bg-[#00368a] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Web</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Console Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Tổng bài viết Tin tức</p>
              <h3 className="text-2xl font-black text-white mt-1">{newsList.length}</h3>
              <p className="text-[11px] text-blue-400 mt-0.5">Chuyên ngành & Hoạt động</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Newspaper className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Tin tuyển dụng hoạt động</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{jobsList.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Đang nhận hồ sơ</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Vị trí việc làm mở</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">
                {jobsList.reduce((acc, j) => acc + (j.content?.positions?.length || 1), 0)}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-0.5">Trên toàn quốc</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cloudSync.state === 'connected' ? 'bg-emerald-400 animate-pulse' : cloudSync.state === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'}`}></span>
                <p className="text-xs font-medium text-slate-400">Firebase Firestore Cloud</p>
              </div>
              <h3 className="text-base font-bold text-emerald-400 mt-1">
                {cloudSync.state === 'connected' ? 'Đã kết nối trực tuyến' : cloudSync.state === 'syncing' ? 'Đang đồng bộ...' : 'Lưu trữ cục bộ'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cloudSync.lastSyncedAt ? `Lần cuối: ${cloudSync.lastSyncedAt}` : 'Sẵn sàng đồng bộ'} ({cloudSync.remoteNewsCount} tin | {cloudSync.remoteJobsCount} việc)
              </p>
            </div>
            <button
              onClick={handleSyncAllToFirestore}
              disabled={isSyncingAll}
              title="Đẩy tất cả bài viết và tin tuyển dụng lên Firebase Firestore"
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Đồng bộ Cloud</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-[#0048ba] text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Quản lý Tin tức ({newsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('careers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'careers'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Quản lý Tuyển dụng ({jobsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quotes'
                  ? 'bg-blue-600 text-white shadow font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Khách hàng Liên hệ</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sao lưu / Dữ liệu</span>
            </button>
          </div>

          {/* Actions on the right */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllToFirestore}
              disabled={isSyncingAll}
              title="Đẩy lên Cloud: Tự động lưu tất cả ảnh ImgBB về thư mục public/img để tránh lỗi hiển thị và đồng bộ dữ liệu lên Firebase Firestore"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncingAll ? 'animate-bounce' : ''}`} />
              <span>{isSyncingAll ? 'Đang lưu ảnh & đẩy Cloud...' : 'Đẩy lên Cloud'}</span>
            </button>

            {/* Quick Action Button for current active tab */}
            {activeTab === 'news' && (
              <button
                onClick={handleOpenCreateNews}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng bài viết mới</span>
              </button>
            )}

            {activeTab === 'careers' && (
              <button
                onClick={handleOpenCreateJob}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng tin tuyển dụng mới</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= SECTION 1: NEWS ARTICLES ================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setNewsFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    newsFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Tất cả ({newsList.length})
                </button>
                <button
                  onClick={() => setNewsFilter('pinned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    newsFilter === 'pinned'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-amber-400/90 hover:bg-slate-800 border border-amber-500/20'
                  }`}
                >
                  <Pin className="w-3 h-3 fill-current" />
                  <span>Đã ghim ({newsList.filter((a) => a.isPinned).length})</span>
                </button>
                <button
                  onClick={() => setNewsFilter('industry-news')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    newsFilter === 'industry-news'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Tin tức chuyên ngành
                </button>
                <button
                  onClick={() => setNewsFilter('industry-knowledge')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    newsFilter === 'industry-knowledge'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Kiến thức chuyên ngành
                </button>
                <button
                  onClick={() => setNewsFilter('company-news')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    newsFilter === 'company-news'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Tin tức công ty
                </button>
              </div>
            </div>

            {/* Sort Order Guidance Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs text-slate-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  <span>Ưu tiên bài ghim</span>
                </span>
                <span className="text-slate-500">→</span>
                <span className="flex items-center gap-1 font-bold text-blue-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ngày mới nhất đến cũ nhất</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Hiển thị {filteredNews.length} bài viết
              </span>
            </div>

            {/* Articles Table / Cards */}
            {filteredNews.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-700/40 space-y-3">
                <Newspaper className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-sm">Không tìm thấy bài viết nào phù hợp.</p>
                <button
                  onClick={handleOpenCreateNews}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Tạo bài viết ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    className={`bg-slate-800/60 rounded-xl border ${
                      article.isPinned
                        ? 'border-amber-500/80 ring-1 ring-amber-500/40 bg-slate-800/85'
                        : 'border-slate-700/80'
                    } overflow-hidden flex flex-col justify-between hover:border-slate-500 transition-all group shadow-md relative`}
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase shadow">
                            {article.category}
                          </span>
                          {article.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase shadow flex items-center gap-1">
                              <Pin className="w-3 h-3 fill-current" />
                              Ưu tiên
                            </span>
                          )}
                        </div>

                        {/* Quick Pin Toggle overlay button */}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePinNews(article, e)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md cursor-pointer ${
                            article.isPinned
                              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
                              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
                          }`}
                          title={article.isPinned ? 'Bỏ ghim bài viết này' : 'Ghim bài viết này lên vị trí ưu tiên'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${article.isPinned ? 'fill-current' : ''}`} />
                        </button>

                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-mono">
                          {article.date}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        {article.isPinned && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Pin className="w-3 h-3 fill-current" />
                            <span>Đang ghim ưu tiên đầu trang</span>
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewArticle(article);
                          setIsArticlePreviewOpen(true);
                        }}
                        className="text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-[#0048ba] transition-all cursor-pointer border border-slate-700 hover:border-blue-500 font-medium text-xs shadow-xs"
                        title="Mở cửa sổ chế độ xem trước (Preview)"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Xem Web</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleTogglePinNews(article, e)}
                          className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                            article.isPinned
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
                          }`}
                          title={article.isPinned ? 'Bỏ ghim' : 'Ghim bài viết lên đầu trang'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${article.isPinned ? 'fill-current text-amber-400' : ''}`} />
                          <span>{article.isPinned ? 'Đã ghim' : 'Ghim'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditNews(article)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(article.id, article.title)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: CAREERS / JOBS ================= */}
        {activeTab === 'careers' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tin tuyển dụng..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setJobFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      jobFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    Tất cả ({jobsList.length})
                  </button>
                  <button
                    onClick={() => setJobFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      jobFilter === 'active'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Còn hiệu lực ({jobsList.filter((j) => (j.status || 'active') === 'active').length})</span>
                  </button>
                  <button
                    onClick={() => setJobFilter('expired')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      jobFilter === 'expired'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hết hiệu lực ({jobsList.filter((j) => j.status === 'expired').length})</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between sm:justify-end gap-2">
                <span>Hiển thị <strong>{filteredJobs.length}</strong> bài tuyển dụng</span>
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-700/40 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-sm">Không tìm thấy bài tuyển dụng nào phù hợp với bộ lọc hiện tại.</p>
                <div className="flex items-center justify-center gap-3">
                  {jobFilter !== 'all' && (
                    <button
                      onClick={() => setJobFilter('all')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Xem tất cả tin
                    </button>
                  )}
                  <button
                    onClick={handleOpenCreateJob}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Đăng tin tuyển dụng ngay
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => {
                  const isActive = (job.status || 'active') === 'active';
                  return (
                    <div
                      key={job.id}
                      className="bg-slate-800/60 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all group shadow-md"
                    >
                      <div>
                        {/* Image Header */}
                        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                          <img
                            src={job.image}
                            alt={job.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow">
                            {job.type}
                          </div>

                          {/* Status Tag badge */}
                          {isActive ? (
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-emerald-400/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Còn hiệu lực</span>
                            </div>
                          ) : (
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-rose-400/40">
                              <Clock className="w-3.5 h-3.5 text-rose-200" />
                              <span>Hết hiệu lực</span>
                            </div>
                          )}

                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-mono">
                            Hạn nộp: {job.deadline}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Đang nhận hồ sơ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <Clock className="w-3 h-3" /> Đã đóng tuyển
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug group-hover:text-amber-400 transition-colors">
                            {job.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>📍 {job.location}</span>
                            <span>📅 Ngày đăng: {job.date}</span>
                            <span>👁️ {job.views || 0} lượt xem</span>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {job.summary}
                          </p>

                          {/* List of sub-positions */}
                          {job.content?.positions && (
                            <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase">
                                Các vị trí đang tuyển ({job.content.positions.length}):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {job.content.positions.map((p, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-0.5 bg-slate-700/60 rounded text-[11px] text-blue-300 border border-slate-600"
                                  >
                                    {p.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="p-3 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewJob(job);
                              setIsJobPreviewOpen(true);
                            }}
                            className="text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-[#0048ba] transition-all cursor-pointer border border-slate-700 hover:border-blue-500 font-medium text-xs shadow-xs"
                            title="Mở cửa sổ chế độ xem trước tin tuyển dụng (Preview)"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Xem Web</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick Toggle Status */}
                          <button
                            onClick={(e) => handleToggleJobStatus(job, e)}
                            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                              isActive
                                ? 'bg-emerald-500/15 hover:bg-rose-500/20 text-emerald-300 hover:text-rose-300 border border-emerald-500/40 hover:border-rose-500/40'
                                : 'bg-rose-500/15 hover:bg-emerald-500/20 text-rose-300 hover:text-emerald-300 border border-rose-500/40 hover:border-emerald-500/40'
                            }`}
                            title={isActive ? 'Nhấn để chuyển sang Hết hiệu lực' : 'Nhấn để chuyển sang Còn hiệu lực'}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Còn hiệu lực</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-rose-400" />
                                <span>Hết hiệu lực</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenEditJob(job)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors cursor-pointer"
                            title="Chỉnh sửa tin tuyển dụng"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.title)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Xóa tin tuyển dụng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION: QUOTES/CONTACTS ================= */}
        {activeTab === 'quotes' && <ConsoleQuotesTab />}

        {/* ================= SECTION 3: SETTINGS & BACKUP ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            {/* Firebase Cloud Sync Card */}
            <div className="bg-slate-800/60 border border-emerald-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Đồng bộ Đám mây (Firebase Cloud Firestore)</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cloudSync.state === 'connected'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cloudSync.state === 'syncing'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cloudSync.state === 'connected' ? 'bg-emerald-400 animate-pulse' : cloudSync.state === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'}`}></span>
                        {cloudSync.state === 'connected' ? 'Đã kết nối trực tuyến' : cloudSync.state === 'syncing' ? 'Đang đồng bộ...' : 'Chưa kết nối Cloud'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dữ liệu trên Cloud: <strong className="text-emerald-400">{cloudSync.remoteNewsCount}</strong> bài viết | <strong className="text-emerald-400">{cloudSync.remoteJobsCount}</strong> tin tuyển dụng. {cloudSync.lastSyncedAt ? `Lần cuối: ${cloudSync.lastSyncedAt}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Hệ thống tự động lưu hai chiều: khi bạn tạo hoặc chỉnh sửa bài viết/tin tuyển dụng, dữ liệu sẽ được lưu đồng thời vào Firebase Cloud Firestore và bộ nhớ đệm máy bạn. Nhấn nút dưới đây để <strong>tự động tải & lưu tất cả ảnh ImgBB về thư mục <code className="text-emerald-400 font-mono">public/img</code></strong> (giúp tránh lỗi hiển thị/chặn link) và đẩy toàn bộ dữ liệu lên Firebase Cloud ngay lập tức.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleSyncAllToFirestore}
                  disabled={isSyncingAll}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                >
                  <CloudUpload className={`w-4 h-4 ${isSyncingAll ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingAll ? 'Đang lưu ảnh ImgBB & đẩy lên Firebase...' : 'Đẩy tất cả dữ liệu lên Firebase Cloud (Tự động lưu ảnh ImgBB)'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                <span>Xuất dữ liệu Sao lưu (Export JSON)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tải xuống toàn bộ bài viết Tin tức và các bài Tuyển dụng hiện tại dưới dạng file JSON để lưu trữ hoặc sao chép dự phòng.
              </p>
              <button
                onClick={() => {
                  const data = {
                    news: ContentStore.getNews(),
                    jobs: ContentStore.getJobs(),
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `longhoang-backup-${getTodayFormatted().replace(/\//g, '-')}.json`;
                  a.click();
                  showToast('Đã tải xuống file sao lưu thành công!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống bản sao lưu (.json)</span>
              </button>
            </div>

            <div className="bg-slate-800/60 border border-rose-900/50 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <span>Khôi phục Dữ liệu Mặc định (Reset Factory)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Xóa tất cả các bài viết tự thêm mới/chỉnh sửa và đưa toàn bộ nội dung Tin tức và Tuyển dụng về trạng thái ban đầu của hệ thống.
              </p>
              <button
                onClick={async () => {
                  if (window.confirm('Bạn có chắc chắn muốn khôi phục về dữ liệu mặc định ban đầu trên Firebase và hệ thống? Các bài viết bạn đã tạo sẽ bị xóa.')) {
                    await ContentStore.resetAll();
                    showToast('Đã khôi phục dữ liệu ban đầu trên Firebase & hệ thống!');
                  }
                }}
                className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Khôi phục dữ liệu gốc trên Firebase</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: CREATE / EDIT NEWS ================= */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Newspaper className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingNews ? 'Chỉnh sửa bài viết tin tức' : 'Đăng bài viết mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveNews} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tiêu đề bài viết *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsFormTitle}
                    onChange={(e) => setNewsFormTitle(e.target.value)}
                    placeholder="Nhập tiêu đề bài viết (VD: TRIỂN VỌNG THỊ TRƯỜNG LOGISTICS...)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Chuyên mục *
                  </label>
                  <select
                    value={newsFormType}
                    onChange={(e) =>
                      setNewsFormType(e.target.value as 'industry-news' | 'industry-knowledge' | 'company-news')
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="industry-news">Tin tức chuyên ngành</option>
                    <option value="industry-knowledge">Kiến thức chuyên ngành</option>
                    <option value="company-news">Tin tức công ty</option>
                  </select>
                </div>
              </div>

              {/* Pin / Priority toggle switch */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    newsFormIsPinned ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-700 text-slate-400'
                  }`}>
                    <Pin className={`w-4 h-4 ${newsFormIsPinned ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <div className="text-white font-bold flex items-center gap-2">
                      <span>Ghim bài viết này lên vị trí ưu tiên</span>
                      {newsFormIsPinned && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          Đang bật ghim
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Bài viết được ghim sẽ luôn xuất hiện ở đầu trang Tin tức & Bảng tin để người xem dễ dàng thấy nhất.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={newsFormIsPinned}
                    onChange={(e) => setNewsFormIsPinned(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngày đăng (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    required
                    value={newsFormDate}
                    onChange={(e) => setNewsFormDate(e.target.value)}
                    placeholder="20/08/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex justify-between items-center">
                    <span>Ảnh đại diện (Image URL) *</span>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-xs active:scale-95">
                      {isUploadingImage ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Đang tải {uploadProgress}%
                        </span>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newsFormImage}
                      onChange={(e) => setNewsFormImage(e.target.value)}
                      placeholder="Dán link ảnh hoặc chọn nút Tải ảnh từ máy ở trên..."
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {newsFormImage && (
                      <div className="w-10 h-8 rounded border border-slate-700 bg-slate-900 overflow-hidden shrink-0">
                        <img src={newsFormImage} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  {(newsFormImage.includes('ibb.co') || newsFormImage.includes('imgbb.com')) && (
                    <p className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <span>✓</span> Link ImgBB sẽ tự động được tải & lưu an toàn về thư mục <code className="font-mono bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/20">public/img</code> khi lưu hoặc bấm 'Đẩy lên Cloud'.
                    </p>
                  )}
                </div>
              </div>

              {/* Preset Image Selection */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">
                  Gợi ý chọn ảnh chất lượng cao nhanh:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_NEWS_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewsFormImage(img.url)}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                        newsFormImage === img.url
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đoạn tóm tắt (Hiển thị ngoài danh sách bài viết) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newsFormSummary}
                  onChange={(e) => setNewsFormSummary(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn 2 - 3 câu về nội dung chính của bài viết..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Content Formatting Guide */}
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-200 font-bold text-xs uppercase tracking-wider mb-1">
                  Cú pháp định dạng nhanh (Click để gán vào văn bản đang chọn)
                </label>
                <div className="text-slate-300 text-xs flex flex-wrap gap-2">
                  <button 
                    type="button"
                    title="Chèn tiêu đề (## Tiêu đề) - Chữ hiển thị màu xanh đậm"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('## ', '', 'Tiêu đề mục'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <Heading className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                    <span>Tiêu đề</span>
                  </button>

                  <button 
                    type="button"
                    title="Thêm dấu đầu dòng * cho một hoặc nhiều hàng được chọn"
                    onMouseDown={(e) => { e.preventDefault(); handleBulletList(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <List className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                    <span>Đầu dòng *</span>
                  </button>

                  <button 
                    type="button"
                    title="In đậm chữ (**Văn bản**)"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('**', '**', 'Văn bản in đậm'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <Bold className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                    <span>In đậm</span>
                  </button>
                  
                  <button 
                    type="button"
                    title="Chèn liên kết web ([Tên hiển thị](URL))"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('[', '](URL)', 'Tên hiển thị'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                    <span>Link</span>
                  </button>

                  {/* Nút gợi ý gán bài viết đã có vào từ khóa */}
                  <button 
                    type="button"
                    title="Gợi ý bài viết đã có để gán vào từ khóa được chọn"
                    onMouseDown={(e) => { e.preventDefault(); handleOpenArticleSuggestModal(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 border border-blue-500 hover:border-blue-400 rounded-lg transition-all text-white font-semibold group cursor-pointer active:scale-95 shadow-xs ring-1 ring-blue-500/30"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-300 group-hover:text-white" />
                    <Sparkles className="w-3 h-3 text-amber-300 group-hover:rotate-12 transition-transform" />
                    <span>Gợi ý gán bài viết</span>
                  </button>
                  
                  <button 
                    type="button"
                    title="Chèn hình ảnh ([img|Link ảnh|Ghi chú])"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('[img|', '|Ghi chú hình ảnh]', 'Đường_dẫn_ảnh'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                    <span>Ảnh</span>
                  </button>

                  <button 
                    type="button"
                    title="Chèn chú thích thuật ngữ kèm ảnh (*#Từ khóa | Link ảnh | Giải thích#*)"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('*#', ' | Link_ảnh | Giải thích#*', 'Từ khóa'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300" />
                    <span>Tooltip</span>
                  </button>
                </div>
              </div>

              {/* Lead paragraph */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đoạn văn mở đầu (Lead paragraph in đậm)
                </label>
                <textarea
                  rows={2}
                  value={newsFormLead}
                  onChange={(e) => setNewsFormLead(e.target.value)}
                  placeholder="Đoạn văn giới thiệu nổi bật đầu bài viết chi tiết..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Paragraphs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    Các đoạn văn nội dung bài viết
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewsFormParagraphs([...newsFormParagraphs, ''])}
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm đoạn văn</span>
                  </button>
                </div>

                {newsFormParagraphs.map((para, pIdx) => (
                  <div key={pIdx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const updated = [...newsFormParagraphs];
                        updated[pIdx] = e.target.value;
                        setNewsFormParagraphs(updated);
                      }}
                      placeholder={`Nội dung đoạn văn thứ ${pIdx + 1}...`}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {newsFormParagraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewsFormParagraphs(newsFormParagraphs.filter((_, i) => i !== pIdx));
                        }}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Structured Box / Details */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-slate-200 font-bold text-xs uppercase tracking-wider">
                  Khung thông tin có cấu trúc (Tùy chọn - Hiển thị trong khung viền đẹp mắt)
                </label>

                <div>
                  <input
                    type="text"
                    value={newsFormDetailsTitle}
                    onChange={(e) => setNewsFormDetailsTitle(e.target.value)}
                    placeholder="Tiêu đề khung (VD: Chi tiết giải thưởng, Quy định quan trọng...)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <textarea
                    rows={18}
                    value={newsFormDetailsRaw}
                    onChange={(e) => setNewsFormDetailsRaw(e.target.value)}
                    placeholder={`Cú pháp đặc biệt cho khung này:\n- Dùng ## cho tên mục lớn (chữ màu xanh đậm).\n- Dùng nút "Đầu dòng *" hoặc bắt đầu dòng bằng dấu sao (*) / dấu trừ (-) để tạo danh sách.\n(Các cú pháp in đậm, ảnh, link, tooltip ở trên đều dùng được ở đây)`}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Link Generator Tool */}
              <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" />
                    <span>Công cụ tải ảnh & lấy link chèn vào bài viết</span>
                  </label>
                  {helperImageUrl && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Đã sẵn sàng chèn
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-95">
                    {isUploadingHelper ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang xử lý {helperUploadProgress}%
                      </span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Chọn ảnh từ máy</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleHelperImageUpload}
                      disabled={isUploadingHelper}
                    />
                  </label>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={helperImageUrl}
                      placeholder="Link ảnh sẽ xuất hiện tại đây ngay khi chọn ảnh..."
                      className="w-full pl-3 pr-16 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      onClick={(e) => {
                        if (helperImageUrl) {
                          (e.target as HTMLInputElement).select();
                          navigator.clipboard.writeText(helperImageUrl);
                          setToastMessage('Đã sao chép link ảnh vào Clipboard!');
                        }
                      }}
                    />
                    {helperImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(helperImageUrl);
                          setToastMessage('Đã sao chép link ảnh!');
                        }}
                        className="absolute right-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[10px] font-medium transition-colors border border-slate-700"
                      >
                        Copy
                      </button>
                    )}
                  </div>

                  {helperImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleFormatText('[img|', '|Ghi chú hình ảnh]', helperImageUrl);
                        setToastMessage('Đã chèn ảnh vào vị trí con trỏ!');
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Chèn nhanh vào bài</span>
                    </button>
                  )}
                </div>

                {helperImageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-16 h-12 rounded-lg border border-slate-700 bg-slate-950 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                      <img 
                        src={helperImageUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-emerald-400 font-medium">✓ Đã tự động nén & copy link.</span> Bạn có thể click <strong className="text-white">"Chèn nhanh vào bài"</strong> hoặc dán theo cú pháp ảnh <code className="text-emerald-400 font-mono bg-emerald-400/10 px-1 py-0.5 rounded">[img|Link|Ghi chú]</code> hoặc tooltip <code className="text-emerald-400 font-mono bg-emerald-400/10 px-1 py-0.5 rounded">*#Từ khóa|Link ảnh|Giải thích#*</code> vào ô nội dung.
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 italic">
                  * Hỗ trợ mọi định dạng ảnh từ máy tính (JPG, PNG, WebP,...). Ảnh được tự động tối ưu hóa hiển thị sắc nét với tốc độ tải siêu tốc.
                </p>
              </div>

              {/* Note / Footer with Previous Suggestions */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ghi chú hoặc lời kết cuối bài (Note)</span>
                    </label>
                    {newsFormType === 'industry-news' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Tin tức chuyên ngành
                      </span>
                    ) : newsFormType === 'industry-knowledge' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Kiến thức chuyên ngành
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNoteSuggestions(!showNoteSuggestions)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gợi ý lời kết đã nhập ({noteSuggestions.length})</span>
                    {showNoteSuggestions ? (
                      <ChevronUp className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-amber-400" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={newsFormNote}
                    onChange={(e) => setNewsFormNote(e.target.value)}
                    placeholder="Ghi chú in nghiêng cuối bài (VD: Long Hoàng Logistics – Đồng hành cùng sự phát triển bền vững của doanh nghiệp bạn)..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                  />
                  {newsFormNote && (
                    <button
                      type="button"
                      onClick={() => setNewsFormNote('')}
                      className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                      title="Xóa nội dung ghi chú"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Quick Suggestion Chips (Top most relevant previous notes) */}
                {noteSuggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Gợi ý nhanh từ các bài đã nhập:</span>
                      </span>
                      {!showNoteSuggestions && (
                        <button
                          type="button"
                          onClick={() => setShowNoteSuggestions(true)}
                          className="text-blue-400 hover:text-blue-300 hover:underline text-[10px] cursor-pointer"
                        >
                          Xem tất cả ({noteSuggestions.length}) &rarr;
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {noteSuggestions.slice(0, 4).map((sug, idx) => {
                        const isCurrent = newsFormNote.trim() === sug.text.trim();
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectNoteSuggestion(sug.text, false)}
                            title={`Nhấn để áp dụng: "${sug.text}"`}
                            className={`group text-left px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1.5 border cursor-pointer ${
                              isCurrent
                                ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold'
                                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="truncate max-w-[260px] sm:max-w-[340px]">{sug.text}</span>
                            {isCurrent && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expanded Suggestions Drawer / Panel */}
                {showNoteSuggestions && (
                  <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">
                          Danh sách lời kết & ghi chú đã dùng trước đó ({noteSuggestions.length})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNoteSuggestions(false)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                        title="Đóng bảng gợi ý"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Search filter within suggestions */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={noteSuggestionSearch}
                        onChange={(e) => setNoteSuggestionSearch(e.target.value)}
                        placeholder="Tìm kiếm lời kết đã nhập theo từ khóa..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    {/* Suggestions scroll list */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {noteSuggestions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">
                          Không tìm thấy lời kết phù hợp với từ khóa tìm kiếm.
                        </p>
                      ) : (
                        noteSuggestions.map((sug, idx) => {
                          const isCurrent = newsFormNote.trim() === sug.text.trim();
                          return (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-lg border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                isCurrent
                                  ? 'bg-blue-950/40 border-blue-500/50 text-slate-200'
                                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                      sug.isIndustry
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {sug.source}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Đang dùng
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                                  {sug.text}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectNoteSuggestion(sug.text, false)}
                                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow cursor-pointer"
                                  title="Thay thế nội dung ghi chú bằng mẫu này"
                                >
                                  Áp dụng
                                </button>
                                {newsFormNote.trim() && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => handleSelectNoteSuggestion(sug.text, true)}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all cursor-pointer"
                                    title="Nối thêm mẫu này vào sau ghi chú hiện tại"
                                  >
                                    + Nối thêm
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNews ? 'Lưu cập nhật' : 'Đăng bài viết'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: GỢI Ý & GÁN BÀI VIẾT VÀO TỪ KHÓA ================= */}
      {isArticleSuggestModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Gợi ý gán bài viết vào từ khóa</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Chọn bài viết đã có để liên kết trực tiếp vào từ khóa đang chọn trong nội dung
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArticleSuggestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Keyword input */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Từ khóa hiển thị trong bài viết <span className="text-blue-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={suggestedKeyword}
                    onChange={(e) => setSuggestedKeyword(e.target.value)}
                    placeholder="Nhập hoặc chỉnh sửa từ khóa hiển thị..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {suggestedKeyword && (
                    <span className="px-2.5 py-1.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-md font-mono text-[11px] shrink-0">
                      Từ khóa: "{suggestedKeyword}"
                    </span>
                  )}
                </div>
              </div>

              {/* Search & Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>Chọn bài viết để gán ({filteredArticlesForKeyword.length}/{newsList.length} bài):</span>
                  </label>
                  {articleSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setArticleSearchQuery('')}
                      className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Xem tất cả bài viết
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    placeholder="Gõ tiêu đề bài viết, chủ đề, mã ID để tìm..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Articles List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredArticlesForKeyword.length === 0 ? (
                  <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400">
                    <p>Không tìm thấy bài viết nào khớp với từ khóa "{articleSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => setArticleSearchQuery('')}
                      className="mt-2 text-blue-400 hover:underline text-xs"
                    >
                      Bấm để hiển thị toàn bộ bài viết
                    </button>
                  </div>
                ) : (
                  filteredArticlesForKeyword.map((art) => {
                    const isSelected = selectedArticleForKeyword?.id === art.id;
                    return (
                      <div
                        key={art.id}
                        onClick={() => setSelectedArticleForKeyword(art)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Thumbnail */}
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-16 h-14 object-cover rounded-lg bg-slate-800 shrink-0 border border-slate-700"
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-800 shrink-0">
                              {art.categoryTitle || 'Tin tức'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {art.date}
                            </span>
                          </div>
                          <h4 className={`text-xs sm:text-sm font-bold line-clamp-1 ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                            {art.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {art.summary}
                          </p>
                        </div>

                        {/* Checkmark */}
                        <div className="shrink-0 pt-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-blue-600 border-blue-400 text-white'
                                : 'border-slate-600 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Assignment Format Mode */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Kiểu gán vào từ khóa:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      articleAssignMode === 'link'
                        ? 'bg-blue-950/70 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignMode"
                      checked={articleAssignMode === 'link'}
                      onChange={() => setArticleAssignMode('link')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <strong className="block text-xs font-bold text-slate-200">
                        Liên kết bài viết (Khuyên dùng)
                      </strong>
                      <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                        Người đọc nhấp vào từ khóa sẽ tự động mở trang bài viết này.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      articleAssignMode === 'tooltip'
                        ? 'bg-blue-950/70 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignMode"
                      checked={articleAssignMode === 'tooltip'}
                      onChange={() => setArticleAssignMode('tooltip')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <strong className="block text-xs font-bold text-slate-200">
                        Chú thích Tooltip kèm ảnh
                      </strong>
                      <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                        Rê chuột vào từ khóa sẽ hiện thẻ tóm tắt + ảnh bài viết.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Syntax */}
              {selectedArticleForKeyword && (
                <div className="text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-400 font-mono overflow-x-auto">
                  <span className="text-slate-500 select-none">Mã sẽ chèn vào văn bản: </span>
                  <span className="text-emerald-400">
                    {articleAssignMode === 'link'
                      ? `[${suggestedKeyword || selectedArticleForKeyword.title}](#article-${selectedArticleForKeyword.id})`
                      : `*#${suggestedKeyword || selectedArticleForKeyword.title} | ${selectedArticleForKeyword.image} | ${selectedArticleForKeyword.title}: ${selectedArticleForKeyword.summary.slice(0, 60)}...#*`}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsArticleSuggestModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!selectedArticleForKeyword}
                onClick={handleConfirmAssignArticle}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 cursor-pointer text-xs"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận gán bài viết</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT JOB ================= */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tiêu đề tin tuyển dụng *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobFormTitle}
                    onChange={(e) => setJobFormTitle(e.target.value)}
                    placeholder="VD: LONG HOÀNG LOGISTICS TUYỂN DỤNG THÁNG..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hình thức làm việc
                  </label>
                  <select
                    value={jobFormType}
                    onChange={(e) => setJobFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Toàn thời gian">Toàn thời gian</option>
                    <option value="Bán thời gian">Bán thời gian</option>
                    <option value="Thực tập sinh">Thực tập sinh</option>
                    <option value="Hợp đồng dự án">Hợp đồng dự án</option>
                  </select>
                </div>
              </div>

              {/* Job Status Selector: Còn hiệu lực / Hết hiệu lực */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-white font-bold flex items-center gap-2">
                    <span>Trạng thái hiệu lực:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                        jobFormStatus === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {jobFormStatus === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Còn hiệu lực (Đang nhận hồ sơ)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-rose-400" />
                          <span>Hết hiệu lực (Đã đóng tuyển)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {jobFormStatus === 'active'
                      ? 'Bài tuyển dụng sẽ hiển thị nhãn "Còn hiệu lực" và mở form nộp hồ sơ ứng tuyển.'
                      : 'Bài tuyển dụng sẽ hiển thị nhãn "Hết hiệu lực" và thông báo tạm ngưng nhận hồ sơ.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setJobFormStatus('active')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      jobFormStatus === 'active'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Còn hiệu lực</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobFormStatus('expired')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      jobFormStatus === 'expired'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hết hiệu lực</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Địa điểm làm việc chính
                  </label>
                  <input
                    type="text"
                    required
                    value={jobFormLocation}
                    onChange={(e) => setJobFormLocation(e.target.value)}
                    placeholder="Hồ Chí Minh, Hải Phòng, Đà Nẵng..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngày đăng
                  </label>
                  <input
                    type="text"
                    required
                    value={jobFormDate}
                    onChange={(e) => setJobFormDate(e.target.value)}
                    placeholder="20/08/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hạn nộp hồ sơ
                  </label>
                  <input
                    type="text"
                    required
                    value={jobFormDeadline}
                    onChange={(e) => setJobFormDeadline(e.target.value)}
                    placeholder="30/09/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex justify-between items-center">
                  <span>Đường dẫn ảnh bìa tuyển dụng (Banner URL) *</span>
                  <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 shadow-xs active:scale-95">
                    {isUploadingJobImage ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        Đang tải {jobImageUploadProgress}%
                      </span>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleJobImageUpload}
                      disabled={isUploadingJobImage}
                    />
                  </label>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={jobFormImage}
                    onChange={(e) => setJobFormImage(e.target.value)}
                    placeholder="Dán link ảnh hoặc chọn nút Tải ảnh từ máy..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {jobFormImage && (
                    <div className="w-10 h-8 rounded border border-slate-700 bg-slate-900 overflow-hidden shrink-0">
                      <img src={jobFormImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Preset Job Images */}
              <div>
                <span className="block text-[11px] text-slate-400 mb-1.5">
                  Gợi ý chọn ảnh tuyển dụng chuyên nghiệp:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_JOB_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setJobFormImage(img.url)}
                      className={`px-2.5 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                        jobFormImage === img.url
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tóm tắt ngắn (Summary) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={jobFormSummary}
                  onChange={(e) => setJobFormSummary(e.target.value)}
                  placeholder="Tóm tắt ngắn hiển thị ngoài danh sách tuyển dụng..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Positions List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-amber-400 uppercase text-xs tracking-wider">
                    Danh sách các vị trí tuyển dụng chi tiết ({jobFormPositions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setJobFormPositions([
                        ...jobFormPositions,
                        {
                          title: 'Vị trí mới',
                          location: jobFormLocation,
                          salary: 'Cạnh tranh',
                          description: 'Mô tả công việc...',
                          requirements: 'Yêu cầu ứng viên...',
                          benefits: 'Quyền lợi...',
                        },
                      ])
                    }
                    className="px-3 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vị trí tuyển</span>
                  </button>
                </div>

                {jobFormPositions.map((pos, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-400 text-xs">
                        # Vị trí số {pIdx + 1}
                      </span>
                      {jobFormPositions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setJobFormPositions(jobFormPositions.filter((_, i) => i !== pIdx))
                          }
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa vị trí này</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Tên vị trí tuyển dụng *
                        </label>
                        <input
                          type="text"
                          required
                          value={pos.title}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].title = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="Nhân viên Chứng từ XNK..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Địa điểm làm việc
                        </label>
                        <input
                          type="text"
                          value={pos.location}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].location = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="Hồ Chí Minh"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Mức lương / Đãi ngộ
                        </label>
                        <input
                          type="text"
                          value={pos.salary}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].salary = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="10 - 20 Triệu"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Mô tả công việc (Mỗi dòng 1 ý)
                        </label>
                        <textarea
                          rows={3}
                          value={pos.description}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].description = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="- Theo dõi lịch tàu&#10;- Khai báo hải quan..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Yêu cầu ứng viên (Mỗi dòng 1 ý)
                        </label>
                        <textarea
                          rows={3}
                          value={pos.requirements}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].requirements = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="- Tốt nghiệp CĐ/ĐH&#10;- Tiếng Anh cơ bản..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">
                          Quyền lợi (Mỗi dòng 1 ý)
                        </label>
                        <textarea
                          rows={3}
                          value={pos.benefits}
                          onChange={(e) => {
                            const updated = [...jobFormPositions];
                            updated[pIdx].benefits = e.target.value;
                            setJobFormPositions(updated);
                          }}
                          placeholder="- BHXH đầy đủ&#10;- Thưởng KPI tháng/quý..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingJob ? 'Lưu tin tuyển dụng' : 'Đăng tin tuyển dụng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARTICLE PREVIEW (XEM WEB TRƯỚC) ================= */}
      {isArticlePreviewOpen && previewArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-hidden animate-fadeIn"
          onClick={() => setIsArticlePreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control Top Header Bar */}
            <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wide shrink-0">
                  <Eye className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>Cửa sổ xem trước Web</span>
                </span>
                <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md hidden sm:inline" title={previewArticle.title}>
                  {previewArticle.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 shrink-0 hidden md:inline">
                  {previewArticle.category}
                </span>
              </div>

              {/* Center: Device View Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-semibold text-slate-400">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'hover:text-slate-200'
                  }`}
                  title="Xem giao diện máy tính"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'hover:text-slate-200'
                  }`}
                  title="Xem giao diện điện thoại"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Điện thoại</span>
                </button>
              </div>

              {/* Right: Quick actions & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const art = previewArticle;
                    setIsArticlePreviewOpen(false);
                    handleOpenEditNews(art);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Mở trình chỉnh sửa bài viết này"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Sửa bài</span>
                </button>

                {onViewArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = previewArticle.id;
                      setIsArticlePreviewOpen(false);
                      onViewArticle(id);
                    }}
                    className="px-3 py-1.5 bg-[#0048ba] hover:bg-[#00368a] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Chuyển sang trang web xem thực tế"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Mở trang thật</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsArticlePreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đóng xem trước"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Stage */}
            <div
              ref={articleScrollRef}
              tabIndex={0}
              className="flex-1 min-h-0 w-full bg-slate-950/70 p-3 sm:p-6 overflow-y-auto overscroll-contain flex justify-center items-start focus:outline-none scroll-smooth"
            >
              <div
                className={`transition-all duration-300 w-full shrink-0 ${
                  previewDevice === 'desktop'
                    ? 'max-w-4xl bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-0'
                    : 'max-w-[390px] bg-white text-slate-800 rounded-[38px] shadow-2xl border-[8px] border-slate-800 overflow-hidden my-4'
                }`}
              >
                {/* Desktop browser mockup top bar */}
                {previewDevice === 'desktop' && (
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-slate-600 select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-white border border-slate-300 rounded px-3 py-1 font-mono text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold text-xs">🔒</span>
                      <span className="truncate">https://longhoanglogistics.com/tin-tuc/{previewArticle.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <button
                        type="button"
                        onClick={() => articleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hover:text-blue-600 font-semibold cursor-pointer"
                        title="Cuộn lên đầu trang"
                      >
                        ↑ Lên đầu
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile mock speaker bar if mobile device */}
                {previewDevice === 'mobile' && (
                  <div className="w-full bg-slate-800 py-1.5 flex justify-center items-center">
                    <div className="w-20 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                      <div className="w-8 h-1 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                )}

                {/* Top Banner with Light Washed-Out Cargo Ship Background */}
                <div className="relative w-full h-28 sm:h-36 md:h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?q=80&w=1146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Banner Ocean Logistics"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

                  <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#0048ba] tracking-wide uppercase leading-snug">
                      {previewArticle.title}
                    </h1>
                  </div>
                </div>

                {/* Breadcrumbs Navigation Bar */}
                <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center text-xs text-slate-500 font-medium">
                  <span className="text-[#0284c7] font-semibold">Trang chủ</span>
                  <span className="mx-1.5 text-slate-400">»</span>
                  <span className="text-[#0284c7] font-semibold">{previewArticle.category}</span>
                  <span className="mx-1.5 text-slate-400">»</span>
                  <span className="text-slate-700 font-semibold truncate max-w-xs sm:max-w-md">
                    {previewArticle.title}
                  </span>
                </div>

                {/* Article Core Content */}
                <div className="p-4 sm:p-8 space-y-6">
                  {/* Featured Image */}
                  {previewArticle.image && (
                    <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                      <img
                        src={previewArticle.image}
                        alt={previewArticle.title}
                        className="w-full h-auto max-h-[420px] object-cover"
                      />
                    </div>
                  )}

                  {/* Meta Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#004b93] font-bold rounded">
                      {previewArticle.category}
                    </span>
                    <span>
                      Ngày đăng: <strong className="text-slate-700">{previewArticle.date}</strong>
                    </span>
                  </div>

                  {/* Lead Text */}
                  {previewArticle.content?.lead && (
                    <p className="font-bold text-slate-900 leading-relaxed text-sm sm:text-base text-justify">
                      {renderTextWithTooltips(previewArticle.content.lead)}
                    </p>
                  )}

                  {/* Paragraphs */}
                  <div className="space-y-4 text-slate-700 leading-relaxed text-justify text-sm sm:text-[15px]">
                    {previewArticle.content?.paragraphs.map((p, idx) => {
                      const trimmed = p.trim();
                      if (trimmed.startsWith('##')) {
                        const headingText = trimmed.replace(/^##+\s*/, '');
                        return (
                          <h3 key={idx} className="text-base sm:text-lg font-bold text-[#0048ba] mt-6 mb-2 pt-2 border-b border-blue-100/70 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-[#0048ba] rounded-full inline-block shrink-0"></span>
                            <span className="text-[#0048ba]">{renderTextWithTooltips(headingText)}</span>
                          </h3>
                        );
                      }

                      // Bullet list
                      if (
                        trimmed.startsWith('* ') ||
                        trimmed.startsWith('- ') ||
                        trimmed.startsWith('• ') ||
                        trimmed.includes('\n* ') ||
                        trimmed.includes('\n- ') ||
                        trimmed.includes('\n• ')
                      ) {
                        const lines = p.split('\n');
                        return (
                          <ul key={idx} className="space-y-2 my-3 pl-1 sm:pl-2">
                            {lines.map((line, lIdx) => {
                              const lTrimmed = line.trim();
                              if (/^[-*•]\s+/.test(lTrimmed)) {
                                const bulletText = lTrimmed.replace(/^[-*•]\s+/, '');
                                return (
                                  <li key={lIdx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-justify">
                                    <span className="text-[#0048ba] font-bold select-none text-base leading-none mt-1 shrink-0">•</span>
                                    <span className="flex-1">{renderTextWithTooltips(bulletText)}</span>
                                  </li>
                                );
                              }
                              if (lTrimmed.length === 0) return null;
                              return (
                                <li key={lIdx} className="text-slate-700 leading-relaxed list-none text-justify">
                                  {renderTextWithTooltips(line)}
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }

                      return (
                        <p key={idx} className="leading-relaxed">
                          {renderTextWithTooltips(p)}
                        </p>
                      );
                    })}
                  </div>

                  {/* Details Card Box */}
                  {previewArticle.content?.detailsList && previewArticle.content.detailsList.length > 0 && (
                    <div className="mt-8 border border-slate-300/80 rounded-lg bg-[#fafcff] overflow-hidden">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                        <span className="text-emerald-600 font-black text-base">—</span>
                        <h3 className="font-bold text-emerald-700 text-sm sm:text-base">
                          {previewArticle.content.detailsCardTitle || 'Chi tiết nội dung'}
                        </h3>
                      </div>
                      <div className="p-5 sm:p-6 space-y-5">
                        {previewArticle.content.detailsList.map((sec, secIdx) => (
                          <div key={secIdx} className="space-y-2">
                            <h4 className="text-sm sm:text-base font-bold text-[#0048ba]">
                              {renderTextWithTooltips(sec.title)}
                            </h4>
                            <div className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                              {sec.points.map((pt, ptIdx) => {
                                const isBullet = /^[-*•]\s+/.test(pt);
                                const text = pt.replace(/^[-*•]\s+/, '');
                                if (isBullet) {
                                  return (
                                    <ul key={ptIdx} className="list-disc pl-5 my-1">
                                      <li className="leading-relaxed">{renderTextWithTooltips(text)}</li>
                                    </ul>
                                  );
                                }
                                return (
                                  <p key={ptIdx} className="leading-relaxed">
                                    {renderTextWithTooltips(text)}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note / Footer Section */}
                  {previewArticle.content?.note && (
                    <div className="p-4 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-md text-xs sm:text-sm text-amber-900 italic shadow-xs">
                      {renderTextWithTooltips(previewArticle.content.note)}
                    </div>
                  )}

                  {/* Consultation / Support Bar */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-bold text-slate-800">Tư vấn chuyên môn:</span>
                      <span className="text-[#0048ba] font-bold">Hotline: 0867 141 877</span>
                      <span>•</span>
                      <span>Email: info@longhoanglogistics.com</span>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded font-semibold text-[11px]">
                      Bản xem trước giao diện người dùng
                    </span>
                  </div>
                </div>

                {/* Mobile bottom indicator */}
                {previewDevice === 'mobile' && (
                  <div className="w-full py-2 bg-slate-100 flex justify-center">
                    <div className="w-32 h-1 bg-slate-400 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Floating scroll to top button */}
            <button
              type="button"
              onClick={() => articleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute bottom-5 right-6 p-2.5 bg-[#0048ba] hover:bg-[#00368a] text-white rounded-full shadow-2xl transition-all cursor-pointer border border-blue-400/40 hover:scale-105 z-20 flex items-center gap-1.5 text-xs font-semibold px-3.5"
              title="Cuộn nhanh lên đầu trang"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="hidden sm:inline">Lên đầu trang</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: JOB PREVIEW (XEM WEB TUYỂN DỤNG) ================= */}
      {isJobPreviewOpen && previewJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-hidden animate-fadeIn"
          onClick={() => setIsJobPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Control Bar */}
            <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide shrink-0">
                  <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Cửa sổ xem trước Tuyển dụng</span>
                </span>
                <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md hidden sm:inline" title={previewJob.title}>
                  {previewJob.title}
                </span>
              </div>

              {/* Device switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-semibold text-slate-400">
                <button
                  type="button"
                  onClick={() => setPreviewJobDevice('desktop')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewJobDevice === 'desktop'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'hover:text-slate-200'
                  }`}
                  title="Xem giao diện máy tính"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewJobDevice('mobile')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewJobDevice === 'mobile'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'hover:text-slate-200'
                  }`}
                  title="Xem giao diện điện thoại"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Điện thoại</span>
                </button>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const j = previewJob;
                    setIsJobPreviewOpen(false);
                    handleOpenEditJob(j);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Chỉnh sửa tin tuyển dụng này"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Sửa tin</span>
                </button>

                {onViewJob && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = previewJob.id;
                      setIsJobPreviewOpen(false);
                      onViewJob(id);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Chuyển sang trang web xem thực tế"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Mở trang thật</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsJobPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đóng xem trước"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Stage */}
            <div
              ref={jobScrollRef}
              tabIndex={0}
              className="flex-1 min-h-0 w-full bg-slate-950/70 p-3 sm:p-6 overflow-y-auto overscroll-contain flex justify-center items-start focus:outline-none scroll-smooth"
            >
              <div
                className={`transition-all duration-300 w-full shrink-0 ${
                  previewJobDevice === 'desktop'
                    ? 'max-w-4xl bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-0'
                    : 'max-w-[390px] bg-white text-slate-800 rounded-[38px] shadow-2xl border-[8px] border-slate-800 overflow-hidden my-4'
                }`}
              >
                {/* Desktop browser mockup top bar */}
                {previewJobDevice === 'desktop' && (
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-xs text-slate-600 select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 max-w-md mx-auto bg-white border border-slate-300 rounded px-3 py-1 font-mono text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="text-emerald-600 font-bold text-xs">🔒</span>
                      <span className="truncate">https://longhoanglogistics.com/tuyen-dung/{previewJob.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <button
                        type="button"
                        onClick={() => jobScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="hover:text-emerald-600 font-semibold cursor-pointer"
                        title="Cuộn lên đầu trang"
                      >
                        ↑ Lên đầu
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile mock notch */}
                {previewJobDevice === 'mobile' && (
                  <div className="w-full bg-slate-800 py-1.5 flex justify-center items-center">
                    <div className="w-20 h-3.5 bg-slate-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                      <div className="w-8 h-1 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                )}

                {/* Job Hero Banner */}
                <div className="relative w-full h-28 sm:h-36 md:h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
                  <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop"
                    alt="Banner Careers"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

                  <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#0048ba] tracking-wide uppercase leading-snug">
                      {previewJob.title}
                    </h1>
                  </div>
                </div>

                {/* Job Info Core */}
                <div className="p-4 sm:p-8 space-y-6">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
                      <span>📍 {previewJob.location}</span>
                      <span>💼 {previewJob.type}</span>
                      <span>📅 Đăng ngày: {previewJob.date}</span>
                      <span>⏳ Hạn nộp: {previewJob.deadline}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded font-bold text-emerald-700 bg-emerald-100">
                      Đang nhận hồ sơ
                    </span>
                  </div>

                  {/* Summary & Lead */}
                  {previewJob.summary && (
                    <p className="text-slate-700 font-semibold leading-relaxed text-sm sm:text-base">
                      {previewJob.summary}
                    </p>
                  )}
                  {previewJob.content?.lead && (
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {previewJob.content.lead}
                    </p>
                  )}

                  {/* Positions */}
                  {previewJob.content?.positions && previewJob.content.positions.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-base font-bold text-[#0048ba] border-b pb-2">
                        Các vị trí đang tuyển ({previewJob.content.positions.length})
                      </h3>
                      <div className="space-y-4">
                        {previewJob.content.positions.map((pos, pIdx) => (
                          <div key={pIdx} className="p-4 rounded-lg border border-slate-200 bg-[#f8fafc] space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                {pos.title}
                              </h4>
                              <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold rounded text-xs">
                                💰 {pos.salary}
                              </span>
                            </div>

                            {pos.description && (
                              <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line">
                                <strong>Mô tả công việc:</strong>
                                <p className="mt-1 pl-2 border-l-2 border-slate-300">{pos.description}</p>
                              </div>
                            )}

                            {pos.requirements && (
                              <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line">
                                <strong>Yêu cầu ứng viên:</strong>
                                <p className="mt-1 pl-2 border-l-2 border-slate-300">{pos.requirements}</p>
                              </div>
                            )}

                            {pos.benefits && (
                              <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line">
                                <strong>Quyền lợi:</strong>
                                <p className="mt-1 pl-2 border-l-2 border-emerald-400">{pos.benefits}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer HR info */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 text-slate-700">
                    <p className="font-bold text-[#0048ba]">Phòng Tuyển dụng – Long Hoàng Logistics:</p>
                    <p>Email nhận CV: <strong>hr@longhoanglogistics.com</strong> / <strong>tuyendung@longhoang.com</strong></p>
                    <p>Hotline nhân sự: <strong>0867 141 877</strong> (Hỗ trợ 24/7)</p>
                  </div>
                </div>

                {/* Mobile home bar */}
                {previewJobDevice === 'mobile' && (
                  <div className="w-full py-2 bg-slate-100 flex justify-center">
                    <div className="w-32 h-1 bg-slate-400 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Floating scroll to top button */}
            <button
              type="button"
              onClick={() => jobScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute bottom-5 right-6 p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all cursor-pointer border border-emerald-400/40 hover:scale-105 z-20 flex items-center gap-1.5 text-xs font-semibold px-3.5"
              title="Cuộn nhanh lên đầu trang"
            >
              <ChevronUp className="w-4 h-4" />
              <span className="hidden sm:inline">Lên đầu trang</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Bold,
  Heading,
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
  Clock
} from 'lucide-react';
import { LongHoangLogo } from './LongHoangLogo';
import { ContentStore, sortNewsArticles } from '../data/contentStore';
import { NewsArticle, JobOpening } from '../types';
import { ConsoleQuotesTab } from './ConsoleQuotesTab';

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

    // Call the native setter to bypass React's tracking, then dispatch input event
    const prototype = activeEl.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    nativeInputValueSetter?.call(activeEl, newText);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));

    // Restore focus and selection
    setTimeout(() => {
      activeEl.focus();
      activeEl.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

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

  // Edit / Create Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);

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

    await ContentStore.saveNews(newArticle);
    setIsNewsModalOpen(false);
    showToast(editingNews ? 'Đã lưu & đồng bộ bài viết lên Firebase Cloud!' : 'Đã đăng bài & đồng bộ Firebase Cloud thành công!');
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

    await ContentStore.saveJob(newJob);
    setIsJobModalOpen(false);
    showToast(editingJob ? 'Đã cập nhật bài tuyển dụng lên Firebase Cloud!' : 'Đã đăng tin tuyển dụng & đồng bộ Firebase Cloud!');
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
              <p className="text-xs font-medium text-slate-400">Cơ sở dữ liệu Đám mây</p>
              <h3 className="text-base font-bold text-emerald-400 mt-1">Firebase Firestore</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Đồng bộ Cloud tức thì</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cloud className="w-6 h-6" />
            </div>
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
                        onClick={() => onViewArticle(article.id)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem trên trang người dùng"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
                            onClick={() => onViewJob && onViewJob(job.id)}
                            className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            title="Xem trên trang tuyển dụng người dùng"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem trang</span>
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
                    title="Chèn tiêu đề (## Tiêu đề)"
                    onMouseDown={(e) => { e.preventDefault(); handleFormatText('## ', '', 'Tiêu đề mục'); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors text-slate-200 hover:text-white font-medium group cursor-pointer active:scale-95"
                  >
                    <Heading className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                    <span>Tiêu đề</span>
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
                    placeholder={`Cú pháp đặc biệt cho khung này:\n- Dùng ## cho tên mục lớn.\n- Bắt đầu dòng bằng dấu trừ (-) để tạo danh sách.\n(Các cú pháp in đậm, ảnh, link, tooltip ở trên đều dùng được ở đây)`}
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

              {/* Note / Footer */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú hoặc lời kết cuối bài (Note)
                </label>
                <input
                  type="text"
                  value={newsFormNote}
                  onChange={(e) => setNewsFormNote(e.target.value)}
                  placeholder="Ghi chú in nghiêng cuối bài..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
    </div>
  );
};

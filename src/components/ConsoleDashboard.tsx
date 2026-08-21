import React, { useState, useEffect } from 'react';
import {
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
  Database
} from 'lucide-react';
import { LongHoangLogo } from './LongHoangLogo';
import { ContentStore } from '../data/contentStore';
import { NewsArticle, JobOpening } from '../types';

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
  const [activeTab, setActiveTab] = useState<'news' | 'careers' | 'settings'>('news');
  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [jobsList, setJobsList] = useState<JobOpening[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsFilter, setNewsFilter] = useState<'all' | 'industry-news' | 'industry-knowledge' | 'company-news'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit / Create News Modal State
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

  // Form State for News
  const [newsFormTitle, setNewsFormTitle] = useState('');
  const [newsFormType, setNewsFormType] = useState<'industry-news' | 'industry-knowledge' | 'company-news'>('industry-news');
  const [newsFormDate, setNewsFormDate] = useState('');
  const [newsFormImage, setNewsFormImage] = useState('');
  const [newsFormSummary, setNewsFormSummary] = useState('');
  const [newsFormLead, setNewsFormLead] = useState('');
  const [newsFormParagraphs, setNewsFormParagraphs] = useState<string[]>(['']);
  const [newsFormDetailsTitle, setNewsFormDetailsTitle] = useState('');
  const [newsFormDetailsRaw, setNewsFormDetailsRaw] = useState(''); // Multiline helper
  const [newsFormNote, setNewsFormNote] = useState('');

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
  const [jobFormDate, setJobFormDate] = useState('');
  const [jobFormDeadline, setJobFormDeadline] = useState('31/12/2026');
  const [jobFormImage, setJobFormImage] = useState('');
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
        .map((sec) => `## ${sec.title}\n${sec.points.map((p) => `- ${p}`).join('\n')}`)
        .join('\n\n');
      setNewsFormDetailsRaw(raw);
    } else {
      setNewsFormDetailsRaw('');
    }

    setNewsFormNote(article.content?.note || '');
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
          .map((l) => l.replace(/^[-*•]\s*/, '').trim())
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

  // ================= JOBS CRUD =================
  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobFormTitle('LONG HOÀNG LOGISTICS TUYỂN DỤNG - THÁNG ' + (new Date().getMonth() + 1));
    setJobFormLocation('Hồ Chí Minh & Toàn quốc');
    setJobFormType('Toàn thời gian');
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
        .map((s) => s.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean),
      requirements: pos.requirements
        .split('\n')
        .map((s) => s.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean),
      benefits: pos.benefits
        .split('\n')
        .map((s) => s.replace(/^[-*•]\s*/, '').trim())
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

  // Filtered lists
  const filteredNews = newsList.filter((a) => {
    const matchesFilter = newsFilter === 'all' || a.type === newsFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredJobs = jobsList.filter((j) => {
    return (
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
                    className="bg-slate-800/60 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col justify-between hover:border-slate-600 transition-all group shadow-md"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold uppercase shadow">
                          {article.category}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-mono">
                          {article.date}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
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
            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm tin tuyển dụng..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-xs text-slate-400">
                Hiển thị <strong>{filteredJobs.length}</strong> bài tuyển dụng
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-700/40 space-y-3">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-sm">Không tìm thấy bài tuyển dụng nào phù hợp.</p>
                <button
                  onClick={handleOpenCreateJob}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Đăng tin tuyển dụng ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800/60 rounded-xl border border-slate-700/80 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all group shadow-md"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={job.image}
                          alt={job.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow">
                          {job.type}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-mono">
                          Hạn nộp: {job.deadline}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
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
                      <button
                        onClick={() => onViewJob(job.id)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem trên trang tuyển dụng người dùng"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trang tuyển dụng</span>
                      </button>

                      <div className="flex items-center gap-2">
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
                ))}
              </div>
            )}
          </div>
        )}

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
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đường dẫn ảnh đại diện (Image URL) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newsFormImage}
                    onChange={(e) => setNewsFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
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
                    placeholder={`Cú pháp: Dùng ## cho tên mục và - cho các gạch đầu dòng.\nVí dụ:\n## 1. Đối tượng tham gia\n- Tất cả cán bộ nhân viên Long Hoàng\n- Đối tác và khách hàng thân thiết\n\n## 2. Thời gian và địa điểm\n- Thời gian: 06h00 ngày 25/08/2026\n- Địa điểm: KĐT Sala, TP. Thủ Đức`}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                <label className="block text-slate-300 font-semibold mb-1">
                  Đường dẫn ảnh bìa tuyển dụng (Banner URL) *
                </label>
                <input
                  type="url"
                  required
                  value={jobFormImage}
                  onChange={(e) => setJobFormImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
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

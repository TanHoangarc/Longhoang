import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Loader2, 
  ExternalLink, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Table as TableIcon, 
  PlusCircle, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Info,
  Image as ImageIcon,
  Upload,
  Link2,
  Bold,
  Heading2,
  List,
  Search,
  Pin,
  Eye,
  ChevronRight,
  Flame,
  ArrowLeft,
  Filter,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { TableData, NewsItem } from './News';

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

const EXTENDED_FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fb-news-1',
    title: "Thị trường Logistics Việt Nam dự báo tăng trưởng mạnh mẽ trong quý 4",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[0],
    description: "Các chuyên gia nhận định ngành logistics sẽ có những bước tiến vượt bậc nhờ vào sự phát triển của thương mại điện tử và đầu tư hạ tầng cảng biển trọng điểm.",
    category: "news",
    isManual: false,
    isPinned: true,
    views: 1840,
    content: `## Xu hướng phát triển mạnh mẽ của chuỗi cung ứng
Ngành Logistics Việt Nam đang bước vào giai đoạn tăng tốc với hàng loạt dự án cao tốc, cụm cảng nước sâu Cái Mép - Thị Vải và cảng Lạch Huyện được nâng cấp công suất tiếp nhận tàu mẹ quốc tế.

- **Tăng trưởng kim ngạch:** Xuất khẩu sang thị trường Bắc Mỹ và EU duy trì đà phục hồi tích cực.
- **Hiện đại hóa cảng biển:** Áp dụng hệ thống Smart Port và làm thủ tục hải quan điện tử 24/7.
- **Tối ưu cước tàu:** Doanh nghiệp chủ động ký hợp đồng dịch vụ dài hạn nhằm ổn định chi phí.`
  },
  {
    id: 'fb-news-2',
    title: "Xu hướng số hóa và tự động hóa trong quản lý kho bãi hiện đại (Smart Warehousing)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[2],
    description: "Công nghệ WMS và robot AGV đang thay đổi hoàn toàn phương thức vận hành kho hàng, giúp giảm thiểu sai sót và tăng tốc độ xử lý đơn hàng lên 40%.",
    category: "news",
    isManual: false,
    views: 1250,
    content: `## Ứng dụng công nghệ vào quản trị kho hàng
Kho bãi thông minh là chìa khóa giúp doanh nghiệp nâng cao năng lực cạnh tranh và giảm chi phí lưu kho.

1. **Hệ thống WMS:** Giám sát vị trí pallet theo thời gian thực và quản lý hạn sử dụng FIFO/LIFO.
2. **Robot AGV:** Tự động lấy hàng và vận chuyển pallet trong nhà kho.
3. **Mã vạch QR/RFID:** Quét hàng tốc độ cao, loại bỏ lỗi ghi chép thủ công.`
  },
  {
    id: 'fb-news-3',
    title: "Cập nhật biến động giá cước vận tải biển tuyến Châu Á - Bắc Mỹ & Châu Âu",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[4],
    description: "Phân tích cung cầu tải trọng tàu container trên các tuyến hàng hải huyết mạch, khuyến nghị doanh nghiệp xuất nhập khẩu lên kế hoạch booking sớm.",
    category: "news",
    isManual: false,
    views: 2130,
    content: `## Tình hình cung cầu tải trọng tàu biển
Trong bối cảnh hải trình vòng qua Mũi Hảo Vọng tiếp tục kéo dài thời gian xoay vòng vỏ container, giá cước spot có xu hướng dao động nhẹ theo tuần.

- Doanh nghiệp nên gửi **Shipping Instruction (SI)** và chốt chỗ trước 2-3 tuần.
- Ưu tiên chọn các hãng tàu có lịch trình ổn định và độ tin cậy đúng giờ cao.`
  },
  {
    id: 'fb-news-4',
    title: "Quy định mới về chứng từ hải quan điện tử và kiểm dịch hàng hóa xuất nhập khẩu",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[3],
    description: "Tổng cục Hải quan triển khai cơ chế một cửa quốc gia nâng cao, tinh giản thủ tục kiểm tra chuyên ngành và rút ngắn thời gian thông quan.",
    category: "news",
    isManual: false,
    views: 890,
    content: `## Hướng dẫn cập nhật hồ sơ hải quan điện tử
- Khai báo tờ khai VNACCS/VCIS chính xác từng dòng thuế suất và xuất xứ C/O.
- Tải chứng từ scan có chữ ký số trực tiếp lên hệ thống.`
  },
  {
    id: 'fb-knowledge-1',
    title: "Quy cách & Kích thước chuẩn các loại Container (20ft, 40ft, 40HC)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    link: "",
    thumbnail: STOCK_IMAGES[1],
    description: "Bảng tra cứu kích thước lọt lòng, thể tích chứa hàng và tải trọng chuẩn quốc tế của các loại Container phổ biến nhất trong vận tải đường biển.",
    category: "knowledge",
    isManual: false,
    isPinned: true,
    views: 3450,
    mediaType: "iframe",
    iframeCode: '<iframe title="Shipping Container 3D" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/2f53ec9741ea4db382a939f4fe6d4b29/embed"></iframe>',
    content: `## 1. Khái niệm về Container tiêu chuẩn quốc tế
Container tiêu chuẩn ISO là công cụ vận chuyển hàng hóa cốt lõi trong chuỗi cung ứng toàn cầu. Việc nắm rõ chính xác **kích thước lọt lòng**, **chiều rộng cửa mở** và **tải trọng tối đa** giúp các chủ hàng lên kế hoạch đóng gói, xếp dỡ (stuffing/destuffing) an toàn và tối ưu chi phí cước biển.

![Cấu trúc các loại Container tiêu chuẩn đường biển](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

## 2. Các điểm cần lưu ý khi chọn Container
- **Cont 20ft DC:** Thích hợp cho hàng nặng, thể tích nhỏ như gạo, phân bón, xi măng, khoáng sản.
- **Cont 40ft DC:** Thích hợp cho hàng hóa thể tích lớn nhưng trọng lượng vừa phải như dệt may, nội thất, hạt nhựa.
- **Cont 40ft HC (High Cube):** Chiều cao vượt trội (2.698m), tối ưu chứa được nhiều kiện hàng cồng kềnh.

## 3. Bảng thông số kỹ thuật chi tiết
Dưới đây là bảng thông số chuẩn xác cho từng loại container thông dụng trong logistics:

[BANG_THONG_SO]

## 4. Lời khuyên đóng hàng an toàn
- Kiểm tra seal và tình trạng kín nước của vỏ container trước khi bốc hàng.
- Phân bổ đều trọng lượng hàng hóa trên mặt sàn cont để đảm bảo an toàn khi cẩu và vận chuyển biển.`,
    table: {
      headers: ["Chỉ tiêu kỹ thuật", "Cont 20' Thường (20'DC)", "Cont 40' Thường (40'DC)", "Cont 40' Cao (40'HC)"],
      rows: [
        ["Kích thước lọt lòng (D x R x C)", "5.898 x 2.352 x 2.393 m", "12.032 x 2.352 x 2.393 m", "12.032 x 2.352 x 2.698 m"],
        ["Kích thước cửa (Rộng x Cao)", "2.340 x 2.280 m", "2.340 x 2.280 m", "2.340 x 2.585 m"],
        ["Thể tích chứa hàng (CBM)", "33.2 m³", "67.7 m³", "76.3 m³"],
        ["Trọng lượng vỏ cont (Tare)", "2,230 kg", "3,700 kg", "3,970 kg"],
        ["Tải trọng hàng tối đa (Payload)", "28,250 kg", "26,780 kg", "26,510 kg"],
        ["Trọng lượng toàn bộ (Max Gross)", "30,480 kg", "30,480 kg", "30,480 kg"]
      ]
    }
  },
  {
    id: 'fb-knowledge-2',
    title: "Hướng dẫn phân biệt Incoterms 2020: FOB, CIF, DDP, EXW chuẩn xác nhất",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    link: "",
    thumbnail: STOCK_IMAGES[3],
    description: "Cẩm nang chi tiết về ranh giới chuyển giao rủi ro, phân chia chi phí cước biển, bảo hiểm và trách nhiệm làm thủ tục hải quan giữa người mua và người bán.",
    category: "knowledge",
    isManual: false,
    views: 2980,
    content: `## 1. Tổng quan về Incoterms 2020
Incoterms (International Commercial Terms) là bộ quy tắc thương mại quốc tế quy định quyền và nghĩa vụ giữa bên bán và bên mua trong hợp đồng mua bán hàng hóa quốc tế.

## 2. So sánh các điều kiện phổ biến
- **EXW (Ex Works - Giao tại xưởng):** Người bán chỉ cần chuẩn bị hàng tại kho, người mua chịu toàn bộ chi phí và rủi ro từ xưởng đến điểm đích.
- **FOB (Free On Board - Giao lên tàu):** Người bán hoàn thành nghĩa vụ khi hàng đã qua lan can tàu tại cảng bốc hàng.
- **CIF (Cost, Insurance and Freight):** Người bán trả cước tàu và mua bảo hiểm đường biển tối thiểu cho lô hàng.
- **DDP (Delivered Duty Paid):** Người bán chịu mọi rủi ro và đóng thuế nhập khẩu tận nơi cho người mua.

[BANG_THONG_SO]

## 3. Lưu ý khi đàm phán hợp đồng
Luôn ghi rõ phiên bản Incoterms áp dụng, ví dụ: **FOB Cat Lai Port, Incoterms 2020**.`,
    table: {
      headers: ["Điều kiện", "Chuyển giao rủi ro", "Chi phí cước biển", "Bảo hiểm hàng hải", "Thủ tục thông quan NK"],
      rows: [
        ["EXW", "Tại kho người bán", "Người mua chịu", "Người mua chịu", "Người mua chịu"],
        ["FOB", "Khi hàng lên tàu tại cảng đi", "Người mua chịu", "Người mua tùy chọn", "Người mua chịu"],
        ["CIF", "Khi hàng lên tàu tại cảng đi", "Người bán trả", "Người bán mua (Loại C)", "Người mua chịu"],
        ["DDP", "Tại kho người mua", "Người bán trả", "Người bán mua", "Người bán làm & đóng thuế"]
      ]
    }
  },
  {
    id: 'fb-knowledge-3',
    title: "Quy trình 6 bước thông quan hàng nhập khẩu nguyên container (FCL)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    link: "",
    thumbnail: STOCK_IMAGES[0],
    description: "Hướng dẫn thực chiến từ nhận Thông báo hàng đến (Arrival Notice), lấy D/O, truyền tờ khai VNACCS đến thanh lý hải quan và kéo cont về kho.",
    category: "knowledge",
    isManual: false,
    views: 1620,
    content: `## Quy trình thông quan FCL từng bước
1. **Bước 1: Nhận Arrival Notice:** Kiểm tra ngày tàu cập và hãng tàu chỉ định.
2. **Bước 2: Lấy lệnh giao hàng (D/O):** Nộp cước local charges và tiền cược vỏ container.
3. **Bước 3: Lên tờ khai hải quan:** Nhập dữ liệu phần mềm ECUS5-VNACCS.
4. **Bước 4: Phân luồng tờ khai (Xanh / Vàng / Đỏ):** Nộp thuế và kiểm tra chứng từ/kiểm hóa.
5. **Bước 5: In mã vạch & thanh lý giám sát:** Trình hải quan cổng cảng.
6. **Bước 6: Kéo vỏ cont về kho dỡ hàng và trả vỏ:** Kiểm tra tình trạng vỏ cont tránh phát sinh phí sửa chữa.`
  }
];

interface NewsCategoryPageProps {
  category: 'news' | 'knowledge';
  onBack: () => void;
  onChangeCategory: (cat: 'news' | 'knowledge') => void;
  userRole?: string | null;
  manualNews?: NewsItem[];
  onUpdateNews?: (news: NewsItem[]) => void;
  onOpenPage?: (page: string | null) => void;
}

export const NewsCategoryPage: React.FC<NewsCategoryPageProps> = ({
  category,
  onBack,
  onChangeCategory,
  userRole,
  manualNews = [],
  onUpdateNews,
  onOpenPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  // Admin state
  const isAdmin = userRole === 'admin';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Partial<NewsItem>>({});

  // Toolbar & Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  // Merge items from manualNews and fallbacks
  useEffect(() => {
    // Collect all articles for this category
    const categoryFallbacks = EXTENDED_FALLBACK_NEWS.filter(item => item.category === category);
    const categoryManual = manualNews.filter(item => (item.category || 'news') === category);

    // Merge by id (manual overrides fallbacks if matching)
    const mergedMap = new Map<string | number, NewsItem>();
    
    // Add fallbacks first
    categoryFallbacks.forEach(item => {
      mergedMap.set(item.id, item);
    });

    // Add / override with manual items
    categoryManual.forEach(item => {
      mergedMap.set(item.id, item);
    });

    setItems(Array.from(mergedMap.values()));
  }, [category, manualNews]);

  // Lock body scroll when modal open
  useEffect(() => {
    const isAnyModalOpen = Boolean(readingArticle || isAdding || isEditing !== null);
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [readingArticle, isAdding, isEditing]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Increment view counter and open article
  const handleOpenArticle = (item: NewsItem, e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Increment views locally
    const currentViews = item.views || 0;
    const updatedItem = { ...item, views: currentViews + 1 };

    // Update in list
    setItems(prev => prev.map(n => n.id === item.id ? updatedItem : n));

    // If it's a manual item, update manualNews so it persists
    if (onUpdateNews) {
      const existsInManual = manualNews.some(n => n.id === item.id);
      if (existsInManual) {
        const updated = manualNews.map(n => n.id === item.id ? updatedItem : n);
        onUpdateNews(updated);
      } else {
        // save view count state
        onUpdateNews([...manualNews, { ...updatedItem, isManual: true }]);
      }
    }

    if (item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' || item.link.trim() === '') {
      setReadingArticle(updatedItem);
    } else if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  // Toggle Pin for Admin
  const handleTogglePin = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    const newPinStatus = !item.isPinned;
    const updatedItem = { ...item, isPinned: newPinStatus, isManual: true };

    setItems(prev => prev.map(n => n.id === item.id ? updatedItem : n));

    if (onUpdateNews) {
      const existsInManual = manualNews.some(n => n.id === item.id);
      let updated: NewsItem[];
      if (existsInManual) {
        updated = manualNews.map(n => n.id === item.id ? updatedItem : n);
      } else {
        updated = [...manualNews, updatedItem];
      }
      onUpdateNews(updated);
    }
  };

  // Admin Actions
  const handleAddNew = () => {
    setIsAdding(true);
    setEditData({
      id: Date.now(),
      title: '',
      pubDate: new Date().toISOString(),
      link: '',
      thumbnail: STOCK_IMAGES[0],
      description: '',
      content: '',
      isManual: true,
      category: category,
      isPinned: false,
      views: 0,
      mediaType: 'image',
      iframeCode: ''
    });
  };

  const startEdit = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(item.id);
    setEditData({ ...item });
  };

  const deleteNews = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    setItems(prev => prev.filter(n => n.id !== id));
    if (onUpdateNews) {
      onUpdateNews(manualNews.filter(n => n.id !== id));
    }
  };

  const saveNews = () => {
    if (!onUpdateNews) return;
    let updatedManual = [...manualNews];
    const itemToSave = { ...editData } as NewsItem;

    if (isAdding) {
      updatedManual = [itemToSave, ...updatedManual];
      setItems(prev => [itemToSave, ...prev]);
    } else {
      updatedManual = updatedManual.map(n => n.id === isEditing ? itemToSave : n);
      setItems(prev => prev.map(n => n.id === isEditing ? itemToSave : n));
    }

    onUpdateNews(updatedManual);
    setIsAdding(false);
    setIsEditing(null);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
    setShowLinkPrompt(false);
  };

  // Format Helper for Editor
  const insertFormatAtCursor = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = contentTextareaRef.current;
    const currentVal = editData.content || '';

    if (!textarea) {
      setEditData(prev => ({
        ...prev,
        content: currentVal + prefix + defaultPlaceholder + suffix
      }));
      return;
    }

    const savedTextareaScrollTop = textarea.scrollTop;
    const savedModalScrollTop = modalRef.current?.scrollTop;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentVal.substring(start, end) || defaultPlaceholder;
    const replacement = prefix + selectedText + suffix;

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setEditData(prev => ({ ...prev, content: newVal }));

    const newSelStart = start + prefix.length;
    const newSelEnd = newSelStart + selectedText.length;

    requestAnimationFrame(() => {
      if (contentTextareaRef.current) {
        contentTextareaRef.current.focus({ preventScroll: true });
        contentTextareaRef.current.setSelectionRange(newSelStart, newSelEnd);
        contentTextareaRef.current.scrollTop = savedTextareaScrollTop;
      }
      if (modalRef.current && savedModalScrollTop !== undefined) {
        modalRef.current.scrollTop = savedModalScrollTop;
      }
    });
  };

  // Upload image
  const handleUploadContentImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/upload?category=GALLERY`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = `${API_BASE_URL}/files/GALLERY/${data.record.fileName}`;
        const caption = file.name.replace(/\.[^/.]+$/, "");
        const markdownImg = `\n\n![${caption}](${uploadedUrl})\n\n`;
        setEditData(prev => ({
          ...prev,
          content: (prev.content || '') + markdownImg
        }));
      } else {
        alert('Không thể tải ảnh lên máy chủ. Bạn có thể dùng tính năng Link ảnh.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Lỗi tải ảnh.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInsertLinkImage = () => {
    if (!imgUrlInput.trim()) return;
    const caption = imgCaptionInput.trim() || 'Hình ảnh minh họa';
    const markdownImg = `\n\n![${caption}](${imgUrlInput.trim()})\n\n`;
    setEditData(prev => ({
      ...prev,
      content: (prev.content || '') + markdownImg
    }));
    setImgUrlInput('');
    setImgCaptionInput('');
    setShowLinkPrompt(false);
  };

  // Table Helpers
  const handleToggleTable = () => {
    if (editData.table) {
      setEditData({ ...editData, table: undefined });
    } else {
      setEditData({
        ...editData,
        table: {
          headers: ['Thông số / Chỉ tiêu', 'Giá trị / Chi tiết'],
          rows: [
            ['Kích thước', ''],
            ['Tải trọng', '']
          ]
        }
      });
    }
  };

  const addColumn = () => {
    const curTable = editData.table || { headers: ['Cột 1'], rows: [['']] };
    const newHeaders = [...curTable.headers, `Cột ${curTable.headers.length + 1}`];
    const newRows = curTable.rows.map(row => [...row, '']);
    setEditData({ ...editData, table: { headers: newHeaders, rows: newRows } });
  };

  const removeColumn = (colIndex: number) => {
    const curTable = editData.table;
    if (!curTable || curTable.headers.length <= 1) return;
    const newHeaders = curTable.headers.filter((_, idx) => idx !== colIndex);
    const newRows = curTable.rows.map(row => row.filter((_, idx) => idx !== colIndex));
    setEditData({ ...editData, table: { headers: newHeaders, rows: newRows } });
  };

  const addRow = () => {
    const curTable = editData.table || { headers: ['Cột 1'], rows: [['']] };
    const newRow = Array(curTable.headers.length).fill('');
    setEditData({ ...editData, table: { ...curTable, rows: [...curTable.rows, newRow] } });
  };

  const removeRow = (rowIndex: number) => {
    const curTable = editData.table;
    if (!curTable || curTable.rows.length <= 1) return;
    const newRows = curTable.rows.filter((_, idx) => idx !== rowIndex);
    setEditData({ ...editData, table: { ...curTable, rows: newRows } });
  };

  const updateHeader = (colIndex: number, val: string) => {
    const curTable = editData.table || { headers: [], rows: [] };
    const newHeaders = [...curTable.headers];
    newHeaders[colIndex] = val;
    setEditData({ ...editData, table: { ...curTable, headers: newHeaders } });
  };

  const updateCell = (rowIndex: number, colIndex: number, val: string) => {
    const curTable = editData.table || { headers: [], rows: [] };
    const newRows = curTable.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row;
      const updatedRow = [...row];
      updatedRow[colIndex] = val;
      return updatedRow;
    });
    setEditData({ ...editData, table: { ...curTable, rows: newRows } });
  };

  // Inline formatting helper
  const renderInlineFormattedText = (text: string) => {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let k = 0;
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      parts.push(
        <strong key={`b-${k++}`} className="font-bold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIdx = boldRegex.lastIndex;
    }
    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }
    return parts;
  };

  // Specs table renderer
  const renderSpecsTable = (tableData?: TableData, keyPrefix = 'specs-table') => {
    if (!tableData || !tableData.headers || tableData.headers.length === 0) return null;
    return (
      <div key={keyPrefix} className="my-8">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <TableIcon size={20} className="mr-2 text-primary" />
          Bảng thông số kỹ thuật chi tiết
        </h4>
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                {tableData.headers.map((h, i) => (
                  <th key={i} className="p-3.5 border-b border-primaryDark font-bold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="even:bg-gray-50 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`p-3.5 ${cIdx === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'} whitespace-nowrap sm:whitespace-normal`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTextBlock = (text: string, blockKey: string | number, tableData?: TableData) => {
    const lines = text.split('\n');
    return (
      <div key={blockKey} className="space-y-3.5 my-4">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1.5" />;
          }

          const TABLE_SHORTCODE_REGEX = /^\s*(\[(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE|BANG_THONG_SO_CHI_TIET)\]|\{\{(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE)\}\})\s*$/i;
          if (TABLE_SHORTCODE_REGEX.test(trimmed)) {
            if (tableData && tableData.headers && tableData.headers.length > 0) {
              return renderSpecsTable(tableData, `table-inline-${blockKey}-${lIdx}`);
            }
            return null;
          }

          if (trimmed.startsWith('# ')) {
            return (
              <h3 key={lIdx} className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-6 mb-3 pt-3 border-b border-gray-200 pb-2.5">
                {renderInlineFormattedText(trimmed.replace(/^#\s+/, ''))}
              </h3>
            );
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={lIdx} className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-2.5 inline-block flex-shrink-0"></span>
                <span>{renderInlineFormattedText(trimmed.replace(/^##\s+/, ''))}</span>
              </h4>
            );
          }

          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={lIdx} className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 flex items-center">
                {renderInlineFormattedText(trimmed.replace(/^###\s+/, ''))}
              </h5>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={lIdx} className="flex items-start ml-2 sm:ml-4 text-gray-700">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="leading-relaxed text-base">{renderInlineFormattedText(trimmed.replace(/^[-*]\s+/, ''))}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start ml-2 sm:ml-4 text-gray-700">
                <span className="font-bold text-primary mr-2 flex-shrink-0">{numMatch[1]}.</span>
                <span className="leading-relaxed text-base">{renderInlineFormattedText(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className="text-gray-700 leading-relaxed text-base">
              {renderInlineFormattedText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderArticleContent = (content?: string, tableData?: TableData) => {
    if (!content) return null;
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = content.substring(lastIndex, match.index);
        if (textSegment.trim()) {
          elements.push(renderTextBlock(textSegment, `block-${partIndex++}`, tableData));
        }
      }

      const altText = match[1] || 'Hình ảnh minh họa';
      const imageUrl = match[2];

      elements.push(
        <figure key={`img-${partIndex++}`} className="my-6 text-center">
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 inline-block w-full max-h-[500px]">
            <img 
              src={imageUrl} 
              alt={altText}
              className="w-full h-auto max-h-[500px] object-contain mx-auto transition-transform hover:scale-[1.01] duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = STOCK_IMAGES[0];
              }}
            />
          </div>
          {altText && (
            <figcaption className="text-xs sm:text-sm text-gray-500 mt-2.5 italic font-medium">
              📷 {altText}
            </figcaption>
          )}
        </figure>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText.trim()) {
        elements.push(renderTextBlock(remainingText, `block-${partIndex++}`, tableData));
      }
    }

    return <div>{elements}</div>;
  };

  // Filter items by search keyword
  const filteredItems = items.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchTitle = (item.title || '').toLowerCase().includes(q);
    const matchDesc = (item.description || '').toLowerCase().includes(q);
    const matchContent = (item.content || '').toLowerCase().includes(q);
    return matchTitle || matchDesc || matchContent;
  });

  // Sort main list: Pinned items first, then by date / order
  const sortedMainItems = [...filteredItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  // Most viewed list (Right Sidebar): Sorted by views descending (highest to lowest)
  const topViewedItems = [...items].sort((a, b) => (b.views || 0) - (a.views || 0));

  const pageTitle = category === 'news' ? 'Tin tức chuyên ngành' : 'Kiến thức chuyên ngành';
  const pageSubtitle = category === 'news'
    ? 'Cập nhật tin tức thị trường Logistics, xuất nhập khẩu, giá cước và biến động cảng biển trong nước & quốc tế.'
    : 'Cẩm nang tra cứu quy cách container, bảng thông số kỹ thuật, thủ tục hải quan và kiến thức vận tải biển thực chiến.';

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-6">
      {/* Main Content Area */}
      <div className="container mx-auto px-4">
        {/* Compact Breadcrumb & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
            <button 
              onClick={onBack}
              className="hover:text-primary transition flex items-center gap-1.5 font-semibold text-gray-700 hover:underline"
            >
              <ArrowLeft size={16} />
              <span>Trang chủ</span>
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-primary font-bold">{pageTitle}</span>
          </div>

          {/* Clean Category Switcher Tabs */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => onChangeCategory('news')}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                category === 'news'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>Tin tức chuyên ngành</span>
            </button>
            <button
              onClick={() => onChangeCategory('knowledge')}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 ${
                category === 'knowledge'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={14} />
              <span>Kiến thức chuyên ngành</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Action Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Tìm kiếm trong ${pageTitle.toLowerCase()} (ví dụ: container, FOB, cước tàu, cảng...)...`}
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results count & Admin Add */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
              Hiển thị <span className="font-bold text-gray-900">{filteredItems.length}</span> bài viết
            </div>

            {isAdmin && (
              <button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-primary/20 transition whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Đăng bài mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Main Articles List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {sortedMainItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy bài viết phù hợp</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Không có bài viết nào khớp với từ khóa "{searchTerm}". Vui lòng thử tìm kiếm bằng từ khóa khác.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary/20 transition"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              sortedMainItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={(e) => handleOpenArticle(item, e)}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl group cursor-pointer relative flex flex-col sm:flex-row ${
                    item.isPinned ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20 shadow-md' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* Pinned Marker */}
                  {item.isPinned && (
                    <div className="absolute top-3 left-3 z-20 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1">
                      <Pin size={12} className="fill-white" />
                      <span>ĐÃ GHIM</span>
                    </div>
                  )}

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-md border border-gray-200">
                      <button
                        onClick={(e) => handleTogglePin(item, e)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                          item.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                        title={item.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết lên đầu"}
                      >
                        <Pin size={13} className={item.isPinned ? "fill-amber-700" : ""} />
                      </button>
                      <button
                        onClick={(e) => startEdit(item, e)}
                        className="p-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={(e) => deleteNews(item.id, e)}
                        className="p-1.5 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Xóa bài viết"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  {/* Card Thumbnail */}
                  <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-900">
                    {item.mediaType === 'iframe' && item.iframeCode ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
                        <img 
                          src={item.thumbnail || STOCK_IMAGES[1]} 
                          alt={item.title} 
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-sm">
                            <Sparkles size={13} className="mr-1.5 text-amber-300" /> Mô hình 3D xoay 360°
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.thumbnail || STOCK_IMAGES[idx % STOCK_IMAGES.length]}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = STOCK_IMAGES[0];
                        }}
                      />
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Meta stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2.5">
                        <span className="flex items-center text-gray-500">
                          <Calendar size={13} className="mr-1 text-primary" />
                          {formatDate(item.pubDate)}
                        </span>
                        <span className="flex items-center font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          <Eye size={12} className="mr-1 text-blue-500" />
                          {(item.views || 0).toLocaleString()} lượt xem
                        </span>
                        {item.table && (
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center">
                            <TableIcon size={11} className="mr-1 text-blue-600" /> Có bảng thông số
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer link */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary flex items-center group-hover:underline">
                        <span>Đọc toàn bộ bài viết</span>
                        <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition" />
                      </span>

                      <span className="text-[11px] text-gray-400 font-medium">
                        {category === 'news' ? 'Tin chuyên ngành' : 'Cẩm nang nghiệp vụ'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: Top Viewed Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Box 1: Most Viewed Articles */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Flame size={18} className="fill-orange-500 text-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">Xem nhiều nhất</h3>
                    <p className="text-[11px] text-gray-500">Ưu tiên từ cao đến thấp</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
                  Top quan tâm
                </span>
              </div>

              <div className="space-y-3.5">
                {topViewedItems.map((item, index) => {
                  const rankNumber = index + 1;
                  let rankBadgeClass = "bg-gray-100 text-gray-600";
                  if (rankNumber === 1) rankBadgeClass = "bg-amber-400 text-amber-950 font-extrabold shadow-sm";
                  else if (rankNumber === 2) rankBadgeClass = "bg-slate-300 text-slate-900 font-extrabold";
                  else if (rankNumber === 3) rankBadgeClass = "bg-amber-700 text-white font-extrabold";

                  return (
                    <div
                      key={`top-${item.id}`}
                      onClick={(e) => handleOpenArticle(item, e)}
                      className="p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all cursor-pointer group flex items-start space-x-3"
                    >
                      {/* Rank number badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${rankBadgeClass}`}>
                        {rankNumber}
                      </div>

                      {/* Small thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        <img
                          src={item.thumbnail || STOCK_IMAGES[index % STOCK_IMAGES.length]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-gray-500">
                          <span className="flex items-center text-orange-600 font-bold">
                            <Eye size={11} className="mr-1" />
                            {(item.views || 0).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>{formatDate(item.pubDate)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Consultation CTA */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-xl p-4 text-white text-center">
                  <h4 className="font-bold text-sm mb-1">Cần tư vấn báo giá Logistics?</h4>
                  <p className="text-xs text-gray-300 mb-3">Đội ngũ chuyên viên Long Hoàng sẵn sàng hỗ trợ 24/7</p>
                  <button
                    onClick={() => {
                      onBack();
                      setTimeout(() => {
                        const contact = document.querySelector('#contact');
                        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full bg-primary hover:bg-primaryDark text-white py-2 rounded-lg font-bold text-xs transition shadow-md"
                  >
                    Gửi yêu cầu báo giá ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Modal (Streamlined, no top cover or repeated description) */}
      {readingArticle && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setReadingArticle(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-5xl xl:max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 md:p-12 relative my-auto cursor-default border border-gray-100"
          >
            {/* Close Button */}
            <button 
              onClick={() => setReadingArticle(null)} 
              className="absolute top-5 right-5 z-20 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-700 p-2 rounded-full transition shadow-sm"
              title="Đóng (hoặc nhấn phím Esc / bấm ra ngoài)"
            >
              <X size={22} />
            </button>

            {/* Meta & Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                readingArticle.category === 'knowledge' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {readingArticle.category === 'knowledge' ? 'Kiến thức chuyên ngành' : 'Tin tức chuyên ngành'}
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <Calendar size={14} className="mr-1" />
                {formatDate(readingArticle.pubDate)}
              </span>
              <span className="text-gray-500 text-xs flex items-center bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                <Eye size={13} className="mr-1 text-blue-500" />
                {(readingArticle.views || 0).toLocaleString()} lượt đọc
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {readingArticle.title}
            </h2>

            {/* 3D Interactive Model Header (Only when configured as 3D iframe embed) */}
            {readingArticle.mediaType === 'iframe' && readingArticle.iframeCode && (
              <div className="h-80 sm:h-96 md:h-[440px] rounded-2xl overflow-hidden mb-8 bg-gray-950 relative shadow-inner border border-gray-800">
                <div className="w-full h-full media-iframe-container" dangerouslySetInnerHTML={{ __html: readingArticle.iframeCode }} />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white flex items-center pointer-events-none">
                  <Sparkles size={13} className="mr-1.5 text-amber-400" /> Mô hình 3D tương tác (Dùng chuột để xoay 360° & phóng to)
                </div>
              </div>
            )}

            {/* Full Content with rich parsed headers, bold, lists, images, and inline tables */}
            {readingArticle.content ? (
              <div className="my-6">
                {renderArticleContent(readingArticle.content, readingArticle.table)}
              </div>
            ) : (
              readingArticle.description && (
                <div className="bg-gray-50 border-l-4 border-primary p-4 sm:p-5 rounded-r-xl text-gray-700 font-medium text-base my-6 leading-relaxed">
                  {readingArticle.description}
                </div>
              )
            )}

            {/* Specifications Dynamic Table (Fallback at bottom only if not already inserted inline in content) */}
            {(!readingArticle.content || !/\[(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE|BANG_THONG_SO_CHI_TIET)\]|\{\{(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE)\}\}/i.test(readingArticle.content)) && (
              renderSpecsTable(readingArticle.table, 'bottom-specs-table')
            )}

            {/* External link button if available */}
            {readingArticle.link && readingArticle.link !== '#' && readingArticle.link.trim() !== '' && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Nguồn bài viết gốc:</span>
                <a 
                  href={readingArticle.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-primary font-bold hover:underline text-sm"
                >
                  Xem bài viết trên trang gốc <ExternalLink size={15} className="ml-1.5" />
                </a>
              </div>
            )}

            {/* Action Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => {
                  setReadingArticle(null);
                  onBack();
                  setTimeout(() => {
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md shadow-primary/20"
              >
                <span>Liên hệ tư vấn dịch vụ</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setReadingArticle(null)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Modal Form for Add/Edit Article */}
      {(isAdding || isEditing !== null) && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={cancelEdit}
        >
          <div 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto border border-gray-200 my-auto cursor-default"
          >
            <button onClick={cancelEdit} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition">
              <X size={22}/>
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              {isAdding ? <PlusCircle className="mr-2 text-primary" size={26} /> : <Edit className="mr-2 text-primary" size={26} />}
              {isAdding ? 'Đăng bài viết mới' : 'Chỉnh sửa bài viết'}
            </h3>
            
            <div className="space-y-5 text-sm text-gray-800">
              {/* Category & Pin Option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-700">Phân loại chuyên mục</label>
                  <select 
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none"
                    value={editData.category || category} 
                    onChange={e => setEditData({...editData, category: e.target.value as 'news' | 'knowledge'})}
                  >
                    <option value="news">Tin tức chuyên ngành (News)</option>
                    <option value="knowledge">Kiến thức chuyên ngành (Knowledge & Specs)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl w-full">
                    <input
                      type="checkbox"
                      checked={Boolean(editData.isPinned)}
                      onChange={e => setEditData({ ...editData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 mr-2.5"
                    />
                    <span className="font-bold text-amber-900 text-sm flex items-center">
                      <Pin size={15} className="mr-1.5 fill-amber-700 text-amber-700" /> Ghim bài viết này lên vị trí đầu tiên
                    </span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold block mb-1.5 text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none font-medium" 
                  value={editData.title || ''} 
                  onChange={e => setEditData({...editData, title: e.target.value})} 
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="font-bold block mb-1.5 text-gray-700">Mô tả ngắn (Lead / Tóm tắt ngoài danh sách) <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none" 
                  rows={2} 
                  value={editData.description || ''} 
                  onChange={e => setEditData({...editData, description: e.target.value})} 
                  placeholder="Đoạn tóm tắt hiển thị ngoài thẻ danh sách..."
                />
              </div>

              {/* Media Type Selection */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="font-bold block mb-2 text-gray-700">Ảnh bìa / Mô hình 3D (Đầu bài viết)</label>
                <div className="flex flex-wrap gap-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="mediaType" 
                      checked={editData.mediaType !== 'iframe'} 
                      onChange={() => setEditData({...editData, mediaType: 'image'})}
                      className="mr-2 text-primary"
                    />
                    <span>Hình ảnh bìa thông thường</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="mediaType" 
                      checked={editData.mediaType === 'iframe'} 
                      onChange={() => setEditData({...editData, mediaType: 'iframe'})}
                      className="mr-2 text-primary"
                    />
                    <span className="font-semibold text-primary">Mô hình 3D tương tác xoay 360° (Sketchfab Embed)</span>
                  </label>
                </div>

                {editData.mediaType === 'iframe' ? (
                  <div>
                    <textarea 
                      className="w-full border border-gray-300 p-3 rounded-lg font-mono text-xs bg-white focus:ring-2 focus:ring-primary/40 outline-none" 
                      rows={3} 
                      value={editData.iframeCode || ''} 
                      onChange={e => setEditData({...editData, iframeCode: e.target.value})} 
                      placeholder='<iframe src="https://sketchfab.com/models/2f53ec9741ea4db382a939f4fe6d4b29/embed"></iframe>'
                    />
                  </div>
                ) : (
                  <div>
                    <input 
                      className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none" 
                      value={editData.thumbnail || ''} 
                      onChange={e => setEditData({...editData, thumbnail: e.target.value})} 
                      placeholder="https://images.unsplash.com/... hoặc link ảnh kết thúc bằng .jpg/.png"
                    />
                  </div>
                )}
              </div>

              {/* Full Content Toolbar */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div>
                    <label className="font-bold text-gray-800 block">Nội dung chi tiết bài viết</label>
                    <p className="text-xs text-gray-500">Soạn thảo, định dạng tiêu đề, in đậm và chèn ảnh minh họa</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('**', '**', 'Chữ in đậm')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition border border-gray-200 shadow-sm"
                    >
                      <Bold size={13} className="mr-1" /> Tô đậm
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('\n## ', '\n', 'Tiêu đề mục')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition border border-gray-200 shadow-sm"
                    >
                      <Heading2 size={13} className="mr-1 text-primary" /> Tiêu đề mục
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('\n- ', '\n', 'Nội dung danh sách')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center transition border border-gray-200 shadow-sm"
                    >
                      <List size={13} className="mr-1" /> Gạch đầu dòng
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (!editData.table) handleToggleTable();
                        insertFormatAtCursor('\n\n[BANG_THONG_SO]\n\n', '', '');
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition shadow-sm"
                    >
                      <TableIcon size={13} className="mr-1 text-amber-700" /> Chèn Bảng vào bài
                    </button>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUploadContentImage} 
                    />
                    
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition shadow-sm"
                    >
                      {isUploadingImage ? <Loader2 size={13} className="animate-spin mr-1" /> : <Upload size={13} className="mr-1" />} Tải ảnh
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowLinkPrompt(!showLinkPrompt)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center transition border border-gray-200 shadow-sm"
                    >
                      <Link2 size={13} className="mr-1" /> Link ảnh
                    </button>
                  </div>
                </div>

                {showLinkPrompt && (
                  <div className="bg-gray-50 border border-primary/20 rounded-lg p-3 mb-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Link ảnh (https://...jpg/.png)"
                        value={imgUrlInput}
                        onChange={e => setImgUrlInput(e.target.value)}
                      />
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Chú thích ảnh"
                        value={imgCaptionInput}
                        onChange={e => setImgCaptionInput(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleInsertLinkImage}
                        className="bg-primary text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-primaryDark transition"
                      >
                        Chèn vào bài viết
                      </button>
                    </div>
                  </div>
                )}

                <textarea 
                  ref={contentTextareaRef}
                  className="w-full border border-gray-300 p-3.5 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none leading-relaxed font-normal" 
                  rows={8} 
                  value={editData.content || ''} 
                  onChange={e => setEditData({...editData, content: e.target.value})} 
                  placeholder="Nhập nội dung bài viết..."
                />
              </div>

              {/* Dynamic Table Section */}
              <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center text-base">
                      <TableIcon size={18} className="mr-2 text-primary" />
                      Bảng thông số / Dữ liệu kỹ thuật
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Chèn mã <code className="bg-amber-50 text-amber-800 font-bold px-1 rounded border border-amber-200">[BANG_THONG_SO]</code> vào nội dung để chọn vị trí bảng hiển thị.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {editData.table && (
                      <button
                        type="button"
                        onClick={() => insertFormatAtCursor('\n\n[BANG_THONG_SO]\n\n', '', '')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center transition shadow-sm"
                      >
                        <TableIcon size={13} className="mr-1 text-amber-700" /> Đặt bảng vào nội dung
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleTable}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        editData.table 
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                      }`}
                    >
                      {editData.table ? 'Xóa bảng' : '+ Thêm bảng dữ liệu'}
                    </button>

                    {editData.table && (
                      <>
                        <button
                          type="button"
                          onClick={addColumn}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition"
                        >
                          <Plus size={14} className="mr-1" /> Thêm cột
                        </button>
                        <button
                          type="button"
                          onClick={addRow}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition"
                        >
                          <Plus size={14} className="mr-1" /> Thêm hàng
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editData.table && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {editData.table.headers.map((header, colIdx) => (
                            <th key={colIdx} className="p-2 border border-gray-200 min-w-[150px]">
                              <div className="flex items-center gap-1">
                                <input 
                                  className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded font-bold text-gray-800 focus:outline-none focus:border-primary"
                                  value={header}
                                  onChange={e => updateHeader(colIdx, e.target.value)}
                                  placeholder={`Tiêu đề cột ${colIdx + 1}`}
                                />
                                {editData.table!.headers.length > 1 && (
                                  <button 
                                    type="button"
                                    onClick={() => removeColumn(colIdx)} 
                                    className="text-gray-400 hover:text-red-500 p-1"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="p-2 border border-gray-200 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editData.table.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell, colIdx) => (
                              <td key={colIdx} className="p-2 border border-gray-200">
                                <input 
                                  className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-primary focus:bg-white px-2 py-1 rounded transition text-gray-700 outline-none"
                                  value={cell}
                                  onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                                  placeholder="Nhập giá trị..."
                                />
                              </td>
                            ))}
                            <td className="p-2 border border-gray-200 text-center">
                              {editData.table!.rows.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => removeRow(rowIdx)} 
                                  className="text-gray-400 hover:text-red-500 p-1 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
              <button 
                onClick={saveNews} 
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3.5 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20 transition flex items-center justify-center"
              >
                Lưu bài viết
              </button>
              <button 
                onClick={cancelEdit} 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NewsCategoryPage;

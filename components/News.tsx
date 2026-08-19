import React, { useState, useEffect, useRef } from 'react';
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
  Link2
} from 'lucide-react';
import { API_BASE_URL } from '../constants';

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface NewsItem {
  id: string | number;
  title: string;
  pubDate: string;
  link?: string;
  thumbnail?: string;
  description: string;
  category?: 'news' | 'knowledge';
  isManual?: boolean;
  mediaType?: 'image' | 'iframe';
  iframeCode?: string;
  content?: string;
  table?: TableData;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fb-news-0',
    title: "Thị trường Logistics Việt Nam dự báo tăng trưởng mạnh mẽ",
    pubDate: new Date().toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[0],
    description: "Các chuyên gia nhận định ngành logistics sẽ có những bước tiến vượt bậc nhờ vào sự phát triển của thương mại điện tử và đầu tư hạ tầng cảng biển.",
    category: "news",
    isManual: false
  },
  {
    id: 'fb-knowledge-0',
    title: "Quy cách & Kích thước chuẩn các loại Container (20ft, 40ft, 40HC)",
    pubDate: new Date().toISOString(),
    link: "",
    thumbnail: STOCK_IMAGES[1],
    description: "Bảng tra cứu kích thước lọt lòng, thể tích chứa hàng và tải trọng chuẩn quốc tế của các loại Container phổ biến nhất trong vận tải đường biển.",
    category: "knowledge",
    isManual: false,
    mediaType: "iframe",
    iframeCode: '<iframe title="Shipping Container 3D" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/2f53ec9741ea4db382a939f4fe6d4b29/embed"></iframe>',
    content: `Container tiêu chuẩn ISO là công cụ vận tải cốt lõi trong chuỗi cung ứng toàn cầu. Việc nắm rõ chính xác kích thước lọt lòng, kích thước cửa mở và tải trọng tối đa giúp các chủ hàng lên kế hoạch đóng gói, xếp dỡ (stuffing/destuffing) an toàn và tối ưu chi phí cước biển.

![Cấu trúc các loại Container tiêu chuẩn đường biển](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

Dưới đây là bảng thông số kỹ thuật chuẩn chi tiết cho từng loại container thông dụng trong logistics:`,
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
  }
];

interface NewsProps {
  userRole?: string | null;
  manualNews?: NewsItem[];
  onUpdateNews?: (news: NewsItem[]) => void;
}

const News: React.FC<NewsProps> = ({ userRole, manualNews = [], onUpdateNews }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'news' | 'knowledge'>('news');
  
  const isAdmin = userRole === 'admin';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Partial<NewsItem>>({});
  
  // Full article reader modal
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  // Content image upload & insertion states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const RSS_URL = `https://news.google.com/rss/search?q=logistics+vận+tải+xuất+nhập+khẩu+việt+nam&hl=vi&gl=VN&ceid=VN:vi`;
        const API_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
          const processedNews: NewsItem[] = data.items.slice(0, 3).map((item: any, index: number) => {
            const cleanDesc = item.description 
              ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' 
              : 'Tin tức cập nhật mới nhất từ thị trường Logistics Việt Nam.';
            return {
              id: `fetched-${index}`,
              title: item.title,
              pubDate: item.pubDate,
              link: item.link,
              thumbnail: item.thumbnail || STOCK_IMAGES[index % STOCK_IMAGES.length],
              description: cleanDesc,
              isManual: false,
              category: 'news'
            };
          });
          setNews(processedNews);
        } else {
          setNews(FALLBACK_NEWS.filter(n => n.category === 'news'));
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setNews(FALLBACK_NEWS.filter(n => n.category === 'news'));
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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
      category: activeTab,
      mediaType: 'image',
      iframeCode: ''
    });
  };

  const startEdit = (item: NewsItem) => {
    setIsEditing(item.id);
    setEditData({ ...item });
  };

  const saveNews = () => {
    if (!onUpdateNews) return;
    
    let updatedManual = [...manualNews];
    const itemToSave = { ...editData } as NewsItem;

    if (isAdding) {
      updatedManual = [itemToSave, ...updatedManual];
    } else {
      updatedManual = updatedManual.map(n => n.id === isEditing ? itemToSave : n);
    }
    
    onUpdateNews(updatedManual);
    setIsAdding(false);
    setIsEditing(null);
  };

  const deleteNews = (id: string | number) => {
    if (onUpdateNews && window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      onUpdateNews(manualNews.filter(n => n.id !== id));
    }
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
    setShowLinkPrompt(false);
  };

  // Image Upload handler for Article Content
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
        alert('Không thể tải ảnh lên máy chủ. Bạn có thể sử dụng tính năng Chèn link ảnh.');
      }
    } catch (error) {
      console.error('Upload image failed:', error);
      alert('Đã xảy ra lỗi khi tải ảnh lên máy chủ.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Insert image via URL link
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

  // Table manipulation helpers
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

  const loadContainerPreset = () => {
    setEditData({
      ...editData,
      title: editData.title || "Quy cách & Kích thước chi tiết các loại Container (20ft, 40ft, 40HC)",
      description: editData.description || "Bảng tra cứu kích thước lọt lòng, thể tích chứa hàng và tải trọng chuẩn quốc tế của các loại Container phổ biến.",
      content: editData.content || `Container tiêu chuẩn ISO là xương sống của ngành vận tải đường biển quốc tế. Việc nắm rõ chính xác kích thước lọt lòng, chiều rộng cửa mở và tải trọng tối đa giúp doanh nghiệp tính toán xếp hàng (stuffing) tối ưu và tiết kiệm chi phí vận chuyển.

![Cấu trúc các loại Container tiêu chuẩn đường biển](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

Dưới đây là bảng thông số kỹ thuật chuẩn chi tiết cho từng loại container thông dụng:`,
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
    });
  };

  // Click on article item handler
  const handleArticleClick = (item: NewsItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // If it has custom full content, dynamic table, is knowledge, or has no valid external link
    if (item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' || item.link.trim() === '') {
      setReadingArticle(item);
    } else if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  // Robust Markdown and Image Content Parser for Reader Modal
  const renderArticleContent = (content?: string) => {
    if (!content) return null;

    // Pattern to identify markdown image syntax: ![alt text](image_url)
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let partIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      // Text block before this image
      if (match.index > lastIndex) {
        const textSegment = content.substring(lastIndex, match.index).trim();
        if (textSegment) {
          elements.push(
            <div key={`text-${partIndex++}`} className="text-gray-700 leading-relaxed text-base whitespace-pre-line my-4">
              {textSegment}
            </div>
          );
        }
      }

      // The Image block
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

    // Remaining text block after last image
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex).trim();
      if (remainingText) {
        elements.push(
          <div key={`text-${partIndex++}`} className="text-gray-700 leading-relaxed text-base whitespace-pre-line my-4">
            {remainingText}
          </div>
        );
      }
    }

    return <div>{elements}</div>;
  };

  // Combine manual news and fallback/fetched news
  const fallbackForTab = FALLBACK_NEWS.filter(n => n.category === activeTab);
  const filteredManualNews = manualNews.filter(n => (n.category || 'news') === activeTab);
  const filteredFetchedNews = activeTab === 'news' ? news : [];
  
  const allTabItems = [...filteredManualNews, ...filteredFetchedNews];
  const displayNews = allTabItems.length > 0 ? allTabItems.slice(0, 6) : fallbackForTab;

  return (
    <section id="news" className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tin tức & Kiến thức</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Cập nhật thông tin thị trường Logistics mới nhất cùng kho kiến thức chuyên ngành chuyên sâu.
          </p>

          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm flex items-center ${
                activeTab === 'news' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Tin tức chuyên ngành
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-6 py-2.5 rounded-full font-bold transition-all text-sm flex items-center ${
                activeTab === 'knowledge' 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={16} className="mr-1.5" /> Kiến thức chuyên ngành
            </button>
          </div>

          {isAdmin && (
            <div className="absolute top-0 right-0">
               <button 
                 onClick={handleAddNew}
                 className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg shadow-md flex items-center font-bold text-sm transition"
               >
                 <Plus size={16} className="mr-1.5" /> Đăng bài mới
               </button>
            </div>
          )}
        </div>

        {/* Modal form for Adding/Editing Article */}
        {(isAdding || isEditing !== null) && (
          <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto border border-gray-200">
                <button onClick={cancelEdit} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition">
                  <X size={22}/>
                </button>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  {isAdding ? <PlusCircle className="mr-2 text-primary" size={26} /> : <Edit className="mr-2 text-primary" size={26} />}
                  {isAdding ? 'Đăng bài viết mới' : 'Chỉnh sửa bài viết'}
                </h3>
                
                <div className="space-y-5 text-sm text-gray-800">
                  {/* Category & Preset */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block mb-1.5 text-gray-700">Phân loại chuyên mục</label>
                      <select 
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none"
                        value={editData.category || 'news'} 
                        onChange={e => setEditData({...editData, category: e.target.value as 'news' | 'knowledge'})}
                      >
                        <option value="news">Tin tức chuyên ngành (News)</option>
                        <option value="knowledge">Kiến thức chuyên ngành (Knowledge & Specs)</option>
                      </select>
                    </div>

                    {editData.category === 'knowledge' && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={loadContainerPreset}
                          className="w-full bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 px-4 py-3 rounded-lg font-semibold flex items-center justify-center transition"
                        >
                          <Sparkles size={16} className="mr-2 text-amber-600" /> Dán dữ liệu mẫu Container chuẩn (1-Click)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="font-bold block mb-1.5 text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                    <input 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none font-medium" 
                      value={editData.title || ''} 
                      onChange={e => setEditData({...editData, title: e.target.value})} 
                      placeholder="Nhập tiêu đề bài viết hoặc tên loại Container..."
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="font-bold block mb-1.5 text-gray-700">Mô tả ngắn (Lead / Tóm tắt) <span className="text-red-500">*</span></label>
                    <textarea 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none" 
                      rows={2} 
                      value={editData.description || ''} 
                      onChange={e => setEditData({...editData, description: e.target.value})} 
                      placeholder="Đoạn tóm tắt hiển thị ngoài thẻ danh sách..."
                    />
                  </div>

                  {/* Media Type Selection (Cover / 3D Header) */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="font-bold block mb-2 text-gray-700">Ảnh bìa / Mô hình 3D xoay 360 độ (Đầu bài viết)</label>
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
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Info size={14} className="mr-1 text-primary flex-shrink-0" />
                          Dán mã nhúng iframe từ Sketchfab hoặc trang mô hình 3D để người xem xoay 360 độ.
                        </p>
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

                  {/* Full Article Content with Image Inserter Toolbar */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-gray-100">
                      <div>
                        <label className="font-bold text-gray-800 block">Nội dung chi tiết bài viết</label>
                        <p className="text-xs text-gray-500">Soạn thảo bài viết, tài liệu kỹ thuật & chèn ảnh minh họa</p>
                      </div>

                      {/* Image Inserter Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Hidden file input */}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleUploadContentImage} 
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center transition"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 size={13} className="animate-spin mr-1.5" /> Đang tải ảnh...
                            </>
                          ) : (
                            <>
                              <Upload size={13} className="mr-1.5" /> Tải ảnh từ máy tính
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowLinkPrompt(!showLinkPrompt)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center transition"
                        >
                          <Link2 size={13} className="mr-1.5" /> Chèn link ảnh (URL)
                        </button>
                      </div>
                    </div>

                    {/* Quick Link Image Popover / Form */}
                    {showLinkPrompt && (
                      <div className="bg-gray-50 border border-primary/20 rounded-lg p-3 mb-3 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700 flex items-center">
                            <ImageIcon size={14} className="mr-1.5 text-primary" /> Chèn ảnh từ đường link URL
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setShowLinkPrompt(false)} 
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            Đóng
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input 
                            className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Link ảnh (https://...jpg/.png)"
                            value={imgUrlInput}
                            onChange={e => setImgUrlInput(e.target.value)}
                          />
                          <input 
                            className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Chú thích ảnh (Ví dụ: Sơ đồ xếp cont)"
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
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none leading-relaxed font-normal" 
                      rows={6} 
                      value={editData.content || ''} 
                      onChange={e => setEditData({...editData, content: e.target.value})} 
                      placeholder="Nhập nội dung bài viết. Bạn có thể nhấn nút [Tải ảnh từ máy tính] ở trên hoặc gõ ![Chú thích](link_ảnh) để chèn hình ảnh vào đúng vị trí mong muốn..."
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      💡 Mẹo: Hình ảnh được chèn với cú pháp <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded">![Chú thích ảnh](link_ảnh)</code> sẽ tự động hiển thị đẹp mắt, rõ nét trong bài đọc.
                    </p>
                  </div>

                  {/* Dynamic Table Section */}
                  <div className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 flex items-center text-base">
                          <TableIcon size={18} className="mr-2 text-primary" />
                          Bảng thông số / Dữ liệu kỹ thuật
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">Tùy biến không giới hạn số dòng và số cột</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
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
                          {/* Table Headers */}
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
                                        title="Xóa cột này"
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

                          {/* Table Rows */}
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
                                      title="Xóa hàng này"
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

                  {/* External Link (Optional) */}
                  <div>
                    <label className="font-bold block mb-1 text-gray-700">
                      Link bài viết nguồn (URL) 
                      {editData.category === 'knowledge' ? (
                        <span className="text-gray-400 font-normal ml-2">(Tùy chọn - để trống nếu đọc trực tiếp trên trang)</span>
                      ) : (
                        <span className="text-gray-400 font-normal ml-2">(Tùy chọn)</span>
                      )}
                    </label>
                    <input 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none text-gray-600" 
                      value={editData.link || ''} 
                      onChange={e => setEditData({...editData, link: e.target.value})} 
                      placeholder="https://... (nếu có bài báo nguồn ngoài)"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
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
          </div>
        )}

        {/* Full Article / Knowledge Reader Modal */}
        {readingArticle && (
          <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-10 relative">
              {/* Close Button */}
              <button 
                onClick={() => setReadingArticle(null)} 
                className="absolute top-5 right-5 z-20 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition"
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
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {readingArticle.title}
              </h2>

              {/* 3D Model or Image Viewer Header */}
              {readingArticle.mediaType === 'iframe' && readingArticle.iframeCode ? (
                <div className="h-80 sm:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-950 relative shadow-inner border border-gray-800">
                  <div className="w-full h-full media-iframe-container" dangerouslySetInnerHTML={{ __html: readingArticle.iframeCode }} />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white flex items-center pointer-events-none">
                    <Sparkles size={13} className="mr-1.5 text-amber-400" /> Mô hình 3D tương tác (Dùng chuột để xoay 360° & phóng to)
                  </div>
                </div>
              ) : (
                <div className="h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 relative">
                  <img 
                    src={readingArticle.thumbnail || STOCK_IMAGES[0]} 
                    alt={readingArticle.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description Lead */}
              {readingArticle.description && (
                <div className="bg-gray-50 border-l-4 border-primary p-4 sm:p-5 rounded-r-xl text-gray-700 font-medium text-base mb-6 leading-relaxed">
                  {readingArticle.description}
                </div>
              )}

              {/* Full Content (with rich parsed images inside body) */}
              {readingArticle.content && (
                <div className="my-6">
                  {renderArticleContent(readingArticle.content)}
                </div>
              )}

              {/* Specifications Dynamic Table */}
              {readingArticle.table && readingArticle.table.headers.length > 0 && (
                <div className="my-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <TableIcon size={20} className="mr-2 text-primary" />
                    Bảng thông số kỹ thuật chi tiết
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-primary text-white">
                          {readingArticle.table.headers.map((h, i) => (
                            <th key={i} className="p-3.5 border-b border-primaryDark font-bold whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {readingArticle.table.rows.map((row, rIdx) => (
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
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
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
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : displayNews.length === 0 ? (
          <div className="text-center text-gray-500 h-48 flex items-center justify-center">
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <style>{`
              .media-iframe-container iframe {
                width: 100% !important;
                height: 100% !important;
                border: none;
                pointer-events: auto;
              }
            `}</style>
            {displayNews.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 relative"
              >
                {/* Admin controls per item */}
                {isAdmin && item.isManual && (
                  <div className="absolute top-2 right-2 z-30 flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(item); }} 
                      className="bg-white/95 text-blue-600 p-2 rounded-lg shadow hover:bg-blue-600 hover:text-white transition"
                      title="Chỉnh sửa bài"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNews(item.id); }} 
                      className="bg-white/95 text-red-500 p-2 rounded-lg shadow hover:bg-red-500 hover:text-white transition"
                      title="Xóa bài"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                
                {/* Card Media Header */}
                {item.mediaType === 'iframe' && item.iframeCode ? (
                  <div className="block overflow-hidden h-64 relative bg-gray-950 media-iframe-container">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.iframeCode }} />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center shadow-sm pointer-events-none">
                       <Calendar size={12} className="mr-1" />
                       {formatDate(item.pubDate)}
                    </div>
                    {item.isManual && (
                      <div className="absolute bottom-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">
                        Tin thủ công
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => handleArticleClick(item)} 
                    className="block overflow-hidden h-48 relative cursor-pointer"
                  >
                     <img 
                       src={item.thumbnail || STOCK_IMAGES[index % STOCK_IMAGES.length]} 
                       alt={item.title} 
                       className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                       onError={(e) => {
                        (e.target as HTMLImageElement).src = STOCK_IMAGES[index % STOCK_IMAGES.length];
                      }}
                     />
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center shadow-sm">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(item.pubDate)}
                     </div>
                     {item.isManual && (
                       <div className="absolute bottom-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                         Tin thủ công
                       </div>
                     )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <div 
                    onClick={() => handleArticleClick(item)} 
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors line-clamp-2" title={item.title}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleArticleClick(item)}
                      className="inline-flex items-center text-primary font-bold hover:underline text-sm uppercase tracking-wide cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      {item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' ? (
                        <BookOpen size={14} className="ml-1.5" />
                      ) : (
                        <ExternalLink size={14} className="ml-1.5" />
                      )}
                    </button>

                    {item.table && (
                      <span className="text-[11px] font-semibold text-gray-400 flex items-center bg-gray-100 px-2 py-0.5 rounded">
                        <TableIcon size={12} className="mr-1 text-primary" /> Có bảng thông số
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default News;

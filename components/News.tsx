import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Calendar, Plus, Edit, Save, Trash2, X } from 'lucide-react';

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

const FALLBACK_NEWS = [
  {
    title: "Thị trường Logistics Việt Nam dự báo tăng trưởng mạnh",
    pubDate: new Date().toISOString(),
    link: "#",
    thumbnail: STOCK_IMAGES[0],
    description: "Các chuyên gia nhận định ngành logistics sẽ có những bước tiến vượt bậc nhờ vào sự phát triển của thương mại điện tử và đầu tư hạ tầng."
  }
];

interface NewsProps {
  userRole?: string | null;
  manualNews?: any[];
  onUpdateNews?: (news: any[]) => void;
}

const News: React.FC<NewsProps> = ({ userRole, manualNews = [], onUpdateNews }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = userRole === 'admin';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const RSS_URL = `https://news.google.com/rss/search?q=logistics+vận+tải+xuất+nhập+khẩu+việt+nam&hl=vi&gl=VN&ceid=VN:vi`;
        const API_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
          const processedNews = data.items.slice(0, 3).map((item: any, index: number) => {
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
              isManual: false
            };
          });
          setNews(processedNews);
        } else {
          setNews(FALLBACK_NEWS.map((n, i) => ({ ...n, id: `fb-${i}`, isManual: false })));
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setNews(FALLBACK_NEWS.map((n, i) => ({ ...n, id: `fb-${i}`, isManual: false })));
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
      link: '#',
      thumbnail: STOCK_IMAGES[0],
      description: '',
      isManual: true
    });
  };

  const startEdit = (item: any) => {
    setIsEditing(item.id);
    setEditData({ ...item });
  };

  const saveNews = () => {
    if (!onUpdateNews) return;
    
    let updatedManual = [...manualNews];
    if (isAdding) {
      updatedManual = [editData, ...updatedManual];
    } else {
      updatedManual = updatedManual.map(n => n.id === isEditing ? editData : n);
    }
    
    onUpdateNews(updatedManual);
    setIsAdding(false);
    setIsEditing(null);
  };

  const deleteNews = (id: number) => {
    if (onUpdateNews && window.confirm("Bạn có chắc muốn xóa bản tin này?")) {
      onUpdateNews(manualNews.filter(n => n.id !== id));
    }
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
  };

  // Combine manual news (from admin) and fetched news (from Google)
  const displayNews = [...manualNews, ...news].slice(0, 6);

  return (
    <section id="news" className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tin tức thị trường</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về ngành Logistics, vận tải và xuất nhập khẩu tại Việt Nam (Tự động cập nhật 24/7).
          </p>

          {isAdmin && (
            <div className="absolute top-0 right-0">
               <button 
                 onClick={handleAddNew}
                 className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded shadow flex items-center font-bold text-sm"
               >
                 <Plus size={16} className="mr-1" /> Đăng tin thủ công
               </button>
            </div>
          )}
        </div>

        {/* Modal form cho việc đăng/sửa tin */}
        {(isAdding || isEditing !== null) && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={cancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                <h3 className="text-2xl font-bold mb-6">{isAdding ? 'Đăng tin mới' : 'Chỉnh sửa tin'}</h3>
                
                <div className="space-y-4 text-sm text-gray-800">
                  <div>
                    <label className="font-bold block mb-1">Tiêu đề</label>
                    <input className="w-full border p-3 rounded" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} placeholder="Nhập tiêu đề tin..."/>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Mô tả ngắn</label>
                    <textarea className="w-full border p-3 rounded" rows={3} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Tóm tắt nội dung..."/>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Link bài viết (URL)</label>
                    <input className="w-full border p-3 rounded" value={editData.link} onChange={e => setEditData({...editData, link: e.target.value})} placeholder="https://..."/>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Link Ảnh minh họa (URL)</label>
                    <input className="w-full border p-3 rounded" value={editData.thumbnail} onChange={e => setEditData({...editData, thumbnail: e.target.value})} placeholder="https://..."/>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={saveNews} className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded font-bold flex-1">Lưu bản tin</button>
                  <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded font-bold">Hủy bỏ</button>
                </div>
             </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayNews.map((item, index) => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 relative">
                
                {/* Admin controls per item */}
                {isAdmin && item.isManual && (
                  <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button onClick={() => startEdit(item)} className="bg-white/90 text-blue-600 p-2 rounded shadow hover:bg-blue-600 hover:text-white transition">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteNews(item.id)} className="bg-white/90 text-red-500 p-2 rounded shadow hover:bg-red-500 hover:text-white transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="block overflow-hidden h-48 relative">
                   <img 
                     src={item.thumbnail} 
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
                </a>
                <div className="p-6 flex flex-col flex-grow">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors line-clamp-2" title={item.title}>
                      {item.title}
                    </h3>
                  </a>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                    {item.description}
                  </p>
                  <a 
                     href={item.link} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="inline-flex items-center text-primary font-medium hover:underline text-sm uppercase tracking-wide mt-auto"
                  >
                    Đọc chi tiết <ExternalLink size={14} className="ml-1" />
                  </a>
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

import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Calendar } from 'lucide-react';

// Stock images to use if the fetched news doesn't have a good image
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

const FALLBACK_NEWS = [
  {
    title: "Thị trường Logistics Việt Nam dự báo tăng trưởng mạnh",
    pubDate: new Date().toISOString(), // Today
    link: "#",
    thumbnail: STOCK_IMAGES[0],
    description: "Các chuyên gia nhận định ngành logistics sẽ có những bước tiến vượt bậc nhờ vào sự phát triển của thương mại điện tử và đầu tư hạ tầng."
  },
  {
    title: "Tối ưu hóa chuỗi cung ứng: Chìa khóa cho doanh nghiệp",
    pubDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    link: "#",
    thumbnail: STOCK_IMAGES[1],
    description: "Việc áp dụng công nghệ số vào quản lý chuỗi cung ứng đang giúp các doanh nghiệp giảm thiểu chi phí và tăng tốc độ giao hàng."
  },
  {
    title: "Cập nhật quy định mới về thủ tục hải quan xuất nhập khẩu",
    pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    link: "#",
    thumbnail: STOCK_IMAGES[2],
    description: "Bộ Tài chính vừa ban hành thông tư mới hướng dẫn chi tiết về quy trình kiểm tra, giám sát hải quan đối với hàng hóa xuất nhập khẩu."
  }
];

const News = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Query Google News for "Logistics Vietnam" using a public RSS to JSON bridge
        // Keywords: Logistics, Vận tải, Xuất nhập khẩu, Supply Chain
        const RSS_URL = `https://news.google.com/rss/search?q=logistics+vận+tải+xuất+nhập+khẩu+việt+nam&hl=vi&gl=VN&ceid=VN:vi`;
        const API_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

        const response = await fetch(API_ENDPOINT);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
          // Process the items to ensure they have images and clean descriptions
          const processedNews = data.items.slice(0, 3).map((item: any, index: number) => {
            // Pick a random stock image if the feed doesn't have one (Google RSS often doesn't)
            const randomImage = STOCK_IMAGES[index % STOCK_IMAGES.length];
            
            // Clean up description (remove HTML tags if present)
            const cleanDesc = item.description 
              ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' 
              : 'Tin tức cập nhật mới nhất từ thị trường Logistics Việt Nam.';

            return {
              title: item.title,
              pubDate: item.pubDate,
              link: item.link,
              thumbnail: item.thumbnail || randomImage,
              description: cleanDesc
            };
          });
          setNews(processedNews);
        } else {
          // If API returns empty or error status
          setNews(FALLBACK_NEWS);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setNews(FALLBACK_NEWS); // Fallback to static data on error
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <section id="news" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tin tức thị trường</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về ngành Logistics, vận tải và xuất nhập khẩu tại Việt Nam (Tự động cập nhật 24/7).
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="block overflow-hidden h-48 relative">
                   <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => {
                      // Fallback image on error
                      (e.target as HTMLImageElement).src = STOCK_IMAGES[index % STOCK_IMAGES.length];
                    }}
                   />
                   <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center shadow-sm">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(item.pubDate)}
                   </div>
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
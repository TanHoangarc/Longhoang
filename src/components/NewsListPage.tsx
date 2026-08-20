import React, { useState, useEffect } from 'react';
import { ContentStore } from '../data/contentStore';
import { NewsArticle } from '../types';

interface NewsListPageProps {
  categoryType: 'industry-news' | 'industry-knowledge' | 'company-news' | 'all';
  onSelectArticle: (articleId: string) => void;
  onBackToHome: () => void;
  onSelectCategory: (type: 'industry-news' | 'industry-knowledge' | 'company-news') => void;
}

export const NewsListPage: React.FC<NewsListPageProps> = ({
  categoryType,
  onSelectArticle,
  onBackToHome,
  onSelectCategory,
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>(ContentStore.getNews());

  useEffect(() => {
    setArticles(ContentStore.getNews());
    const unsubscribe = ContentStore.subscribe(() => {
      setArticles(ContentStore.getNews());
    });
    return () => unsubscribe();
  }, []);

  const getCategoryTitle = () => {
    switch (categoryType) {
      case 'industry-news':
        return 'TIN TỨC CHUYÊN NGÀNH';
      case 'industry-knowledge':
        return 'KIẾN THỨC CHUYÊN NGÀNH';
      case 'company-news':
        return 'TIN TỨC CÔNG TY';
      default:
        return 'TIN TỨC & SỰ KIỆN';
    }
  };

  const getBreadcrumbTitle = () => {
    switch (categoryType) {
      case 'industry-news':
        return 'Tin tức chuyên ngành';
      case 'industry-knowledge':
        return 'Kiến thức chuyên ngành';
      case 'company-news':
        return 'Tin tức công ty';
      default:
        return 'Tin tức';
    }
  };

  // Filter articles for main listing
  const filteredArticles =
    categoryType === 'all'
      ? articles
      : articles.filter((a) => a.type === categoryType || categoryType === 'all');

  // Recent posts for the sidebar
  const recentArticles = articles.slice(0, 5);

  return (
    <div className="pt-[70px] bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Top Banner with Light Washed-Out Cargo Ship Background matching Sample Image */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
        <img
          src="https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?q=80&w=1146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Banner Ocean Logistics"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
          referrerPolicy="no-referrer"
        />
        {/* Soft High-Key White Tint Overlay matching sample */}
        <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0048ba] tracking-wider uppercase drop-shadow-xs">
            {getCategoryTitle()}
          </h1>
        </div>
      </div>

      {/* Breadcrumbs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <button
              onClick={onBackToHome}
              className="text-[#0284c7] hover:text-[#0369a1] hover:underline font-semibold"
            >
              Trang chủ
            </button>
            <span className="text-slate-400">»</span>
            <span className="text-slate-700 font-medium">{getBreadcrumbTitle()}</span>
          </div>

          {/* Quick Category Switcher Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectCategory('industry-news')}
              className={`px-3 py-1 text-xs rounded font-bold transition-all ${
                categoryType === 'industry-news'
                  ? 'bg-[#004b93] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tin tức chuyên ngành
            </button>
            <button
              onClick={() => onSelectCategory('industry-knowledge')}
              className={`px-3 py-1 text-xs rounded font-bold transition-all ${
                categoryType === 'industry-knowledge'
                  ? 'bg-[#004b93] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kiến thức chuyên ngành
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: 2 Columns (Main Listing + Sidebar) matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Articles Grid (8 cols) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  {/* Article Thumbnail */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 bg-[#004b93]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {article.category}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Orange Bold Title matching Screenshot 1 */}
                      <h2 className="text-sm sm:text-[15px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-snug line-clamp-2 uppercase mb-2">
                        {article.title}
                      </h2>

                      {/* Date */}
                      <div className="text-xs text-slate-500 font-medium mb-2">
                        <span>Ngày đăng: </span>
                        <span className="text-slate-700 font-semibold">{article.date}</span>
                      </div>

                      {/* Summary */}
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3 text-justify">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#004b93] group-hover:translate-x-1 transition-transform">
                      <span>Xem chi tiết bài viết</span>
                      <span>→</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT: Sidebar (4 cols) - "BÀI VIẾT GẦN ĐÂY" matching Screenshot 1 */}
          <aside className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-lg border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-black text-[#004b93] uppercase tracking-wider">
                BÀI VIẾT GẦN ĐÂY
              </h3>
            </div>

            <div className="divide-y divide-slate-100 space-y-4 pt-1">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="pt-4 first:pt-0 flex items-start gap-3.5 group cursor-pointer"
                >
                  {/* Date Badge: Day in big orange, month below matching screenshot */}
                  <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-amber-400 transition-colors">
                    <span className="text-lg font-black text-[#e0831a] leading-none">
                      {article.day}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                      {article.month}
                    </span>
                  </div>

                  {/* Article info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-tight line-clamp-2 uppercase">
                      {article.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal text-justify">
                      {article.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

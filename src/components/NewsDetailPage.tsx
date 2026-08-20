import React, { useState, useEffect } from 'react';
import { SERVICES_LIST, COMPANY_SOCIAL_LINKS } from '../data/mockData';
import { ContentStore } from '../data/contentStore';
import { NewsArticle } from '../types';
import { FileText, ChevronRight, Phone, MessageSquare } from 'lucide-react';

interface NewsDetailPageProps {
  articleId: string;
  onSelectArticle: (id: string) => void;
  onSelectService: (serviceId: string) => void;
  onBackToHome: () => void;
  onBackToNewsList: (type?: 'industry-news' | 'industry-knowledge' | 'company-news') => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  articleId,
  onSelectArticle,
  onSelectService,
  onBackToHome,
  onBackToNewsList,
}) => {
  const [article, setArticle] = useState<NewsArticle>(
    ContentStore.getNewsById(articleId) || ContentStore.getNews()[0]
  );

  useEffect(() => {
    const current = ContentStore.getNewsById(articleId) || ContentStore.getNews()[0];
    setArticle(current);
  }, [articleId]);

  // List of all services to display on the right sidebar matching Screenshot 2 & 3
  const servicesList = [
    { id: 'customs-brokerage', title: 'Dịch vụ khai báo hải quan của Long Hoàng Logistics' },
    { id: 'bonded-warehouse', title: 'Dịch vụ cho thuê Kho ngoại quan & Kho bãi CFS' },
    { id: 'lcl-consolidation', title: 'Dịch vụ gom hàng lẻ LCL vận chuyển đường biển' },
    { id: 'coconut-fiber-export', title: 'Thủ tục xuất khẩu chỉ xơ dừa – Long Hoàng Logistics' },
    { id: 'danang-distribution', title: 'Dịch vụ vận chuyển hàng hóa nội địa Bắc - Trung - Nam' },
    { id: 'co-application', title: 'Dịch vụ xin cấp C/O – Làm giấy chứng nhận xuất xứ hàng hóa' },
    { id: 'door-to-door', title: 'Vận chuyển Door to Door trong xuất nhập khẩu' },
    { id: 'value-added', title: 'Dịch vụ logistics bổ trợ' },
    { id: 'cross-border', title: 'Dịch vụ vận tải Cross-Border' },
    { id: 'sea-freight', title: 'Dịch vụ vận chuyển đường biển quốc tế' },
    { id: 'air-freight', title: 'Dịch vụ vận tải hàng không' },
    { id: 'multimodal', title: 'Dịch vụ vận tải đa phương thức' },
    { id: 'inland-trucking', title: 'Dịch vụ vận tải nội địa' },
  ];

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

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#0048ba] tracking-wide uppercase leading-snug">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Breadcrumbs Navigation Bar matching Screenshot 2 */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium flex-wrap">
            <button
              onClick={onBackToHome}
              className="text-[#0284c7] hover:text-[#0369a1] hover:underline font-semibold"
            >
              Trang chủ
            </button>
            <span className="text-slate-400">»</span>
            <button
              onClick={() => onBackToNewsList(article.type)}
              className="text-[#0284c7] hover:text-[#0369a1] hover:underline font-semibold"
            >
              {article.category}
            </button>
            <span className="text-slate-400">»</span>
            <span className="text-slate-700 font-semibold line-clamp-1 max-w-md">
              {article.title}
            </span>
          </div>

          <button
            onClick={() => onBackToNewsList(article.type)}
            className="text-xs text-[#004b93] font-bold hover:underline shrink-0 hidden sm:block"
          >
            ← Quay lại danh sách tin
          </button>
        </div>
      </div>

      {/* Main Content 2 Columns matching Screenshot 2 & 3 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Main Article Details (8 cols) */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-slate-200/90 shadow-sm space-y-6">
            
            {/* Featured Image */}
            <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>

            {/* Date and Category Tag */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs text-slate-500">
              <span className="px-2.5 py-1 bg-blue-50 text-[#004b93] font-bold rounded">
                {article.category}
              </span>
              <span>
                Ngày đăng: <strong className="text-slate-700">{article.date}</strong>
              </span>
            </div>

            {/* Article Lead & Paragraphs */}
            <div className="space-y-4 text-slate-700 leading-relaxed text-justify text-sm sm:text-[15px]">
              {article.content?.lead && (
                <p className="font-bold text-slate-900 leading-relaxed">
                  {article.content.lead}
                </p>
              )}

              {article.content?.paragraphs.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Structured Info Box with Border matching Screenshot 3 */}
            {article.content?.detailsList && (
              <div className="mt-8 border border-slate-300/80 rounded-lg overflow-hidden bg-[#fafcff]">
                {/* Box Header (Green dash title e.g. "— Chi tiết giải" in Screenshot 3) */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <span className="text-emerald-600 font-black text-base">—</span>
                  <h3 className="font-bold text-emerald-700 text-sm sm:text-base">
                    {article.content.detailsCardTitle || 'Chi tiết nội dung'}
                  </h3>
                </div>

                {/* Box Sections */}
                <div className="p-5 sm:p-6 space-y-6">
                  {article.content.detailsList.map((sec, secIdx) => (
                    <div key={secIdx} className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {sec.title}
                      </h4>
                      <ul className="space-y-1.5 pl-4 text-xs sm:text-sm text-slate-600 list-disc marker:text-slate-400">
                        {sec.points.map((pt, ptIdx) => (
                          <li key={ptIdx} className="leading-relaxed">
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note & Contact footer */}
            {article.content?.note && (
              <div className="p-4 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-md text-xs sm:text-sm text-amber-900 italic">
                {article.content.note}
              </div>
            )}

            {/* Share / Back Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onBackToNewsList(article.type)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors"
              >
                ← Trở lại danh mục tin
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Tư vấn nhanh:</span>
                <a
                  href={`tel:${COMPANY_SOCIAL_LINKS.hotlineHcm.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004b93] hover:bg-[#00366b] text-white rounded text-xs font-bold transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{COMPANY_SOCIAL_LINKS.hotlineHcm}</span>
                </a>
                <a
                  href={COMPANY_SOCIAL_LINKS.zalo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0068FF] hover:bg-[#0052cc] text-white rounded text-xs font-bold transition-all shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Zalo Chat</span>
                </a>
              </div>
            </div>
          </main>

          {/* RIGHT COLUMN: DỊCH VỤ (Services Sidebar matching Screenshot 2 & 3) (4 cols) */}
          <aside className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-lg border border-slate-200/90 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-black text-[#004b93] uppercase tracking-wider">
                DỊCH VỤ
              </h3>
            </div>

            {/* List of Services with Document/File Icon matching screenshot */}
            <div className="divide-y divide-slate-100">
              {servicesList.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => onSelectService(svc.id)}
                  className="w-full text-left py-3 px-2 flex items-start gap-3 hover:bg-slate-50 rounded-md transition-colors group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded bg-slate-100 text-slate-400 group-hover:text-[#004b93] group-hover:bg-blue-50 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-normal text-slate-700 group-hover:text-[#004b93] group-hover:font-semibold transition-all leading-snug">
                    {svc.title}
                  </span>
                </button>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

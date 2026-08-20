import React, { useState } from 'react';
import { 
  ChevronRight, 
  Download, 
  FileText, 
  Play, 
  ExternalLink, 
  Check, 
  Globe, 
  Eye, 
  Share2, 
  Clock, 
  ArrowRight,
  Layers,
  Sparkles,
  Newspaper
} from 'lucide-react';
import { SERVICES_LIST } from '../data/mockData';

interface CompanyProfilePageProps {
  onBackToHome: () => void;
  onSelectService: (serviceId: string) => void;
}

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({
  onBackToHome,
  onSelectService,
}) => {
  const [tocOpen, setTocOpen] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [downloadSuccessLang, setDownloadSuccessLang] = useState<string | null>(null);

  const handleDownload = (langCode: string, langName: string) => {
    setDownloadSuccessLang(langCode);
    
    // Simulate direct download of Company Profile PDF
    const dummyContent = `LONG HOÀNG LOGISTICS - COMPANY PROFILE (${langName})\n\n` +
      `think logistics - think us\n` +
      `Comprehensive Logistics Solutions: Sea, Air, Multimodal, Inland Trucking & Warehousing.\n` +
      `Hotline: 0903 000 888 | Website: longhoanglogistics.com`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Long_Hoang_Logistics_Company_Profile_${langCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadSuccessLang(null);
    }, 3000);
  };

  const SIDEBAR_SERVICES = [
    { id: 'customs', title: 'Dịch vụ khai báo hải quan' },
    { id: 'bonded-warehouse', title: 'Dịch vụ cho thuê Kho ngoại quan Cửa khẩu quốc tế Bờ Y' },
    { id: 'sea-freight-lcl', title: 'Dịch vụ gom hàng lẻ LCL vận chuyển đường biển' },
    { id: 'coconut-export', title: 'Thủ tục xuất khẩu chỉ xơ dừa – Long Hoàng Group' },
    { id: 'danang-transport', title: 'Dịch vụ vận chuyển hàng hóa Đà Nẵng đi các khắp tỉnh thành phố' },
    { id: 'co-certification', title: 'Dịch vụ xin cấp C/O – Làm giấy chứng nhận xuất xứ hàng hóa' },
    { id: 'door-to-door', title: 'Vận chuyển Door to Door trong xuất nhập khẩu' },
    { id: 'value-added', title: 'Dịch vụ logistics bổ trợ' },
    { id: 'cross-border', title: 'Dịch vụ vận tải Cross-Border' },
    { id: 'sea-freight', title: 'Dịch vụ vận chuyển đường biển quốc tế' },
    { id: 'air-freight', title: 'Dịch vụ vận tải hàng không' },
    { id: 'multimodal', title: 'Dịch vụ vận tải đa phương thức' },
    { id: 'inland-trucking', title: 'Dịch vụ vận tải nội địa' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. HERO BANNER: Standardized High-Key Banner matching screenshots */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=2000&q=80"
          alt="Long Hoàng Logistics Cargo Ship Banner"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* High-Key Bright Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.95) 100%)'
          }}
        />

        {/* Banner Title */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider text-[#0048ba] drop-shadow-xs">
            COMPANY PROFILE – LONG HOANG GROUP
          </h1>
        </div>
      </div>

      {/* 2. BREADCRUMBS */}
      <div className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button
              onClick={onBackToHome}
              className="hover:text-[#0048ba] transition-colors cursor-pointer"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">COMPANY PROFILE – LONG HOANG GROUP</span>
          </nav>
        </div>
      </div>

      {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT MATCHING SCREENSHOT 3, 4, 5 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* MAIN COLUMN (Left: 8 cols) */}
          <div className="lg:col-span-8 space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Table of Contents / Mục lục box (Screenshot 3) */}
            <div className="bg-[#f0f7ff] border border-[#bae0fd] rounded-xl p-5 max-w-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[#bae0fd]/80 pb-2 mb-3">
                <span className="text-xs sm:text-sm font-bold text-[#0048ba]">
                  Nội dung bài viết
                </span>
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="text-xs text-[#0048ba] hover:underline font-medium cursor-pointer"
                >
                  [{tocOpen ? 'hide' : 'show'}]
                </button>
              </div>

              {tocOpen && (
                <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#0048ba]">
                  <li>
                    <a href="#company-profile-download" className="hover:underline font-medium block">
                      Hồ sơ công ty / Company Profile / 公司简介
                    </a>
                    <ul className="pl-4 pt-1 space-y-1 text-slate-600 font-normal">
                      <li>
                        <a href="#profile-vn" className="hover:text-[#0048ba] transition-colors">
                          • Tiếng Việt
                        </a>
                      </li>
                      <li>
                        <a href="#profile-en" className="hover:text-[#0048ba] transition-colors">
                          • English
                        </a>
                      </li>
                      <li>
                        <a href="#profile-cn" className="hover:text-[#0048ba] transition-colors">
                          • 中文
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="pt-1">
                    <a href="#corporate-video" className="hover:underline font-medium block">
                      Corporate Video – Long Hoang Logistics
                    </a>
                  </li>
                </ul>
              )}
            </div>

            {/* Brand Logo & Slogan Header (Screenshot 3 & 4) */}
            <div className="text-center py-4 space-y-2">
              <div className="inline-flex flex-col items-center justify-center">
                <img
                  src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png"
                  alt="Long Hoàng Group Logo"
                  className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-2xl sm:text-3xl font-black text-[#0048ba] tracking-tight uppercase mt-2">
                  LONG HOANG GROUP
                </h2>
                <p className="text-sm sm:text-base font-serif italic text-amber-500 font-semibold tracking-wide">
                  think logistics - think us
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#0048ba] max-w-xl mx-auto leading-relaxed pt-2">
                Long Hoang Group is committed to providing the best logistics solutions and services to our customers. Thank you for your interest in our company. For more detailed information, please download our company profile in your preferred language below.
              </p>
            </div>

            {/* Section: Hồ sơ công ty / Company Profile / 公司简介 (Screenshot 4) */}
            <div id="company-profile-download" className="pt-4 border-t border-slate-100">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8">
                Hồ sơ công ty / Company Profile / 公司简介
              </h3>

              {/* 3 Download Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* 1. Tiếng Việt Card */}
                <div id="profile-vn" className="border border-slate-200 rounded-2xl p-6 text-center bg-white hover:border-[#0048ba]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-slate-900 tracking-wider">
                      VN
                    </div>
                    <div className="text-base font-bold text-slate-800">
                      Tiếng Việt
                    </div>
                    <div className="text-xs text-slate-500">
                      Hồ sơ năng lực (VI)
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload('VN', 'Tiếng Việt')}
                    className="w-full py-2.5 px-4 bg-[#1544a0] hover:bg-[#1a53c4] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadSuccessLang === 'VN' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Đã tải xuống</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Tải xuống</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. English Card */}
                <div id="profile-en" className="border border-slate-200 rounded-2xl p-6 text-center bg-white hover:border-[#0048ba]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-slate-900 tracking-wider">
                      GB
                    </div>
                    <div className="text-base font-bold text-slate-800">
                      English
                    </div>
                    <div className="text-xs text-slate-500">
                      Company Profile (EN)
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload('GB', 'English')}
                    className="w-full py-2.5 px-4 bg-[#1544a0] hover:bg-[#1a53c4] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadSuccessLang === 'GB' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. 中文 Card */}
                <div id="profile-cn" className="border border-slate-200 rounded-2xl p-6 text-center bg-white hover:border-[#0048ba]/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-slate-900 tracking-wider">
                      CN
                    </div>
                    <div className="text-base font-bold text-slate-800">
                      中文
                    </div>
                    <div className="text-xs text-slate-500">
                      公司简介 (CN)
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload('CN', '中文')}
                    className="w-full py-2.5 px-4 bg-[#1544a0] hover:bg-[#1a53c4] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadSuccessLang === 'CN' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>已下载</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>下载</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Corporate Video Section (Screenshot 5) */}
            <div id="corporate-video" className="pt-8 border-t border-slate-100">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-slate-900 group">
                {isPlayingVideo ? (
                  <iframe
                    src="https://www.youtube.com/embed/y8dSzoKBGwA?autoplay=1"
                    title="Long Hoang Logistics Corporate Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* Background preview image matching Screenshot 5 & actual YouTube video */}
                    <img
                      src="https://img.youtube.com/vi/y8dSzoKBGwA/maxresdefault.jpg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://img.youtube.com/vi/y8dSzoKBGwA/hqdefault.jpg";
                      }}
                      alt="Long Hoang Logistics Corporate Video"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none" />

                    {/* Top YouTube-style header overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md p-1.5 border border-white/30 flex items-center justify-center">
                          <img
                            src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold drop-shadow">
                            Long Hoang Logistics Corporate Video
                          </h4>
                          <p className="text-[10px] text-slate-300">Long Hoang Group</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'Long Hoang Logistics Corporate Video',
                                url: 'https://www.youtube.com/watch?v=y8dSzoKBGwA'
                              }).catch(() => {});
                            }
                          }}
                          className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white cursor-pointer"
                          title="Chia sẻ"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Center: Play Button & Slogan (Screenshot 5) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
                      <button
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group-hover:ring-8 group-hover:ring-red-600/30 cursor-pointer mb-6"
                        aria-label="Play Corporate Video"
                      >
                        <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
                      </button>

                      <div className="text-white text-lg sm:text-2xl md:text-3xl font-black tracking-wide uppercase drop-shadow-md">
                        Optimized · Compliant · Future Ready
                      </div>
                    </div>

                    {/* Bottom: "Xem trên YouTube" button */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <a
                        href="https://www.youtube.com/watch?v=y8dSzoKBGwA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-md text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>Xem trên</span>
                        <span className="font-black text-red-500">YouTube</span>
                        <ExternalLink className="w-3 h-3 text-slate-300" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN (Right: 4 cols) matching Screenshot 3, 4, 5 */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden sticky top-24">
              {/* Sidebar Header */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200/80">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0048ba]" />
                  <span>DỊCH VỤ</span>
                </h3>
              </div>

              {/* Service list with newspaper / document icon */}
              <div className="divide-y divide-slate-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                {SIDEBAR_SERVICES.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectService(item.id)}
                    className="w-full text-left p-3.5 sm:p-4 hover:bg-[#f0f7ff] transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="p-1 rounded bg-slate-100 text-slate-400 group-hover:bg-[#0048ba]/10 group-hover:text-[#0048ba] shrink-0 mt-0.5 transition-colors">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-medium text-slate-700 group-hover:text-[#0048ba] group-hover:font-semibold transition-all leading-snug">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

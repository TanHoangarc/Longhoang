import React, { useState, useEffect } from 'react';
import { Briefcase, PlusCircle } from 'lucide-react';
import { ContentStore } from '../data/contentStore';
import { JobOpening } from '../types';

interface CareersListPageProps {
  onSelectJob: (jobId: string) => void;
  onBackToHome: () => void;
}

export const CareersListPage: React.FC<CareersListPageProps> = ({
  onSelectJob,
  onBackToHome,
}) => {
  const [jobs, setJobs] = useState<JobOpening[]>(ContentStore.getJobs());

  useEffect(() => {
    setJobs(ContentStore.getJobs());
    const unsubscribe = ContentStore.subscribe(() => {
      setJobs(ContentStore.getJobs());
    });
    return () => unsubscribe();
  }, []);

  // Recent hiring articles for the sidebar
  const sidebarJobs = jobs;

  return (
    <div className="pt-[70px] bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Top Banner with Light Washed-Out Cargo Ship Background matching Sample */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
        <img
          src="https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?q=80&w=1146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Banner Ocean Logistics"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
          referrerPolicy="no-referrer"
        />
        {/* Soft High-Key White Tint Overlay */}
        <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0048ba] tracking-wider uppercase drop-shadow-xs">
            TUYỂN DỤNG
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
            <span className="text-slate-700 font-semibold">Tuyển Dụng</span>
          </div>
        </div>
      </div>

      {/* Main Content 2 Columns Layout matching Screenshot 1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Recruitment Cards Grid (8 cols) */}
          <div className="lg:col-span-8">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/90 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#004b93] flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
                  Chưa có vị trí tuyển dụng nào
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
                  Hiện tại công ty chưa đăng thông tin tuyển dụng mới. Bạn có thể truy cập Bàn điều khiển Quản trị (Console) để tạo bài đăng tuyển dụng mới.
                </p>
                <button
                  onClick={() => {
                    window.location.hash = '#console';
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#004b93] hover:bg-[#003870] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Tạo tin tuyển dụng trong Console</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    onClick={() => onSelectJob(job.id)}
                    className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image banner */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={job.image}
                        alt={job.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-[#004b93]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {job.type}
                      </div>

                      {/* Status Tag Badge */}
                      {(job.status || 'active') === 'active' ? (
                        <div className="absolute top-2 right-2 bg-emerald-600/95 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span>Còn hiệu lực</span>
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-slate-700/90 backdrop-blur-xs text-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <span>Hết hiệu lực</span>
                        </div>
                      )}
                    </div>

                    {/* Body Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Orange Bold Title matching Screenshot 1 */}
                        <h2 className="text-sm sm:text-[15px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-snug line-clamp-2 uppercase mb-2">
                          {job.title}
                        </h2>

                        {/* Date & Status */}
                        <div className="text-xs text-slate-500 font-medium mb-2.5 flex items-center justify-between">
                          <div>
                            <span>Ngày đăng: </span>
                            <span className="text-slate-700 font-semibold">{job.date}</span>
                          </div>
                          {(job.status || 'active') === 'active' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đang nhận hồ sơ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Đã đóng tuyển
                            </span>
                          )}
                        </div>

                        {/* Summary */}
                        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-3 text-justify">
                          {job.summary}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#004b93] group-hover:translate-x-1 transition-transform">
                        <span>Xem chi tiết vị trí</span>
                        <span>→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar (4 cols) - "TUYỂN DỤNG KHÁC" matching Screenshot 1 */}
          <aside className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-lg border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-black text-[#004b93] uppercase tracking-wider">
                TUYỂN DỤNG KHÁC
              </h3>
            </div>

            {sidebarJobs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Chưa có tin tuyển dụng nào khác.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 space-y-4 pt-1">
                {sidebarJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job.id)}
                    className="pt-4 first:pt-0 flex items-start gap-3.5 group cursor-pointer"
                  >
                    {/* Date Badge: Day in big orange, month below matching screenshot */}
                    <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-amber-400 transition-colors">
                      <span className="text-lg font-black text-[#e0831a] leading-none">
                        {job.day}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {job.month}
                      </span>
                    </div>

                    {/* Article info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-tight line-clamp-2 uppercase">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {(job.status || 'active') === 'active' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Còn hiệu lực
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            Hết hiệu lực
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal text-justify">
                        {job.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
};

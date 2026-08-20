import React, { useState, useEffect } from 'react';
import { COMPANY_SOCIAL_LINKS } from '../data/mockData';
import { ContentStore } from '../data/contentStore';
import { JobOpening, NewsArticle } from '../types';
import { Calendar, Eye, MapPin, DollarSign, CheckCircle2, Phone, Mail, Send, Check } from 'lucide-react';

interface CareersDetailPageProps {
  jobId: string;
  onSelectJob: (id: string) => void;
  onSelectArticle?: (articleId: string) => void;
  onBackToHome: () => void;
  onBackToCareersList: () => void;
}

export const CareersDetailPage: React.FC<CareersDetailPageProps> = ({
  jobId,
  onSelectJob,
  onSelectArticle,
  onBackToHome,
  onBackToCareersList,
}) => {
  const [job, setJob] = useState<JobOpening>(
    ContentStore.getJobById(jobId) || ContentStore.getJobs()[0]
  );
  const [allJobs, setAllJobs] = useState<JobOpening[]>(ContentStore.getJobs());
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>(
    ContentStore.getNews().slice(0, 4)
  );

  useEffect(() => {
    const current = ContentStore.getJobById(jobId) || ContentStore.getJobs()[0];
    setJob(current);
    setAllJobs(ContentStore.getJobs());
    setRecentArticles(ContentStore.getNews().slice(0, 4));
  }, [jobId]);

  // Quick apply form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPosition, setApplicantPosition] = useState(
    job.content?.positions[0]?.title || 'Nhân viên kinh doanh Logistics'
  );
  const [applicantCvUrl, setApplicantCvUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantEmail('');
      setApplicantCvUrl('');
    }, 4000);
  };

  // Other jobs for sidebar
  const otherJobs = allJobs.filter((j) => j.id !== job.id);

  return (
    <div className="pt-[70px] bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Top Banner with Washed-out Cargo Ship Background matching Sample */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
        <img
          src="https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?q=80&w=1146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Banner Ocean Logistics"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65"
          referrerPolicy="no-referrer"
        />
        {/* Soft High-Key White Tint Overlay */}
        <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#0048ba] tracking-wide uppercase leading-snug">
            {job.title}
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
              onClick={onBackToCareersList}
              className="text-[#0284c7] hover:text-[#0369a1] hover:underline font-semibold"
            >
              Tuyển Dụng
            </button>
            <span className="text-slate-400">»</span>
            <span className="text-slate-700 font-semibold line-clamp-1 max-w-md">
              {job.title}
            </span>
          </div>

          <button
            onClick={onBackToCareersList}
            className="text-xs text-[#004b93] font-bold hover:underline shrink-0 hidden sm:block"
          >
            ← Quay lại danh sách tuyển dụng
          </button>
        </div>
      </div>

      {/* Main Content 2 Columns Layout matching Screenshot 2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Recruitment Detail Content (8 cols) */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-slate-200/90 shadow-sm space-y-6">
            
            {/* Meta Information matching Screenshot 2: Date & View Count */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.date}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.views || 34} lượt xem</span>
              </div>
            </div>

            {/* Introductory text */}
            <div className="space-y-3 text-slate-700 text-sm sm:text-[15px] leading-relaxed text-justify">
              <p className="leading-relaxed font-normal">
                {job.content?.lead || job.summary}
              </p>
              {job.content?.subLead && (
                <p className="leading-relaxed font-normal">
                  {job.content.subLead}
                </p>
              )}
              <p className="font-semibold text-slate-900 pt-1">
                Xem ngay các vị trí đang tuyển và tìm cho mình cơ hội phù hợp nhé!
              </p>
            </div>

            {/* Section Header: CÁC VỊ TRÍ DÀNH CHO BẠN */}
            <div className="pt-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider mb-6 border-b-2 border-[#0048ba] pb-2 inline-block">
                CÁC VỊ TRÍ DÀNH CHO BẠN
              </h2>

              <div className="space-y-8">
                {job.content?.positions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 bg-slate-50/70 rounded-lg border border-slate-200 space-y-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                      <h3 className="text-sm sm:text-base font-bold text-[#0048ba]">
                        {pos.title}
                      </h3>
                      {pos.salary && (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{pos.salary}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Khu vực làm việc: <strong>{pos.location}</strong></span>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        • Mô tả công việc:
                      </h4>
                      <ul className="space-y-1 pl-4 text-xs sm:text-[13px] text-slate-600 list-disc marker:text-slate-400">
                        {pos.description.map((d, dIdx) => (
                          <li key={dIdx} className="leading-relaxed">{d}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        • Yêu cầu ứng viên:
                      </h4>
                      <ul className="space-y-1 pl-4 text-xs sm:text-[13px] text-slate-600 list-disc marker:text-slate-400">
                        {pos.requirements.map((r, rIdx) => (
                          <li key={rIdx} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        • Quyền lợi được hưởng:
                      </h4>
                      <ul className="space-y-1 pl-4 text-xs sm:text-[13px] text-slate-600 list-disc marker:text-emerald-500">
                        {pos.benefits.map((b, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Info Box */}
            <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-3 text-xs sm:text-sm text-slate-700">
              <h4 className="font-bold text-[#0048ba] text-sm uppercase">
                HƯỚNG DẪN NỘP HỒ SƠ & LIÊN HỆ PHÒNG NHÂN SỰ
              </h4>
              <p className="leading-relaxed">
                Ứng viên gửi CV về email:{' '}
                <a
                  href="mailto:hr@longhoang.vn"
                  className="font-bold text-[#0048ba] hover:underline"
                >
                  hr@longhoang.vn
                </a>{' '}
                với tiêu đề [Họ tên] - [Vị trí ứng tuyển] - [Khu vực].
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-xs">
                <div>
                  📞 Hotline tuyển dụng:{' '}
                  <strong className="text-slate-900">{COMPANY_SOCIAL_LINKS.hotlineHcm}</strong>
                </div>
                <div>
                  💬 Zalo hỗ trợ:{' '}
                  <strong className="text-slate-900">{COMPANY_SOCIAL_LINKS.zaloPhone}</strong>
                </div>
              </div>
            </div>

            {/* Quick Online Application Form */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider mb-4">
                Ứng tuyển trực tuyến nhanh
              </h3>

              {isSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Cảm ơn bạn đã gửi hồ sơ! Ban Nhân sự Long Hoàng Logistics sẽ liên hệ với bạn trong vòng 24 - 48 giờ làm việc.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Email liên hệ *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="nguyenvana@gmail.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Vị trí ứng tuyển
                      </label>
                      <select
                        value={applicantPosition}
                        onChange={(e) => setApplicantPosition(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      >
                        {job.content?.positions.map((p, idx) => (
                          <option key={idx} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Link CV (Google Drive / LinkedIn / Dropbox)
                    </label>
                    <input
                      type="url"
                      value={applicantCvUrl}
                      onChange={(e) => setApplicantCvUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0048ba] hover:bg-[#00368a] text-white font-bold rounded text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Nộp hồ sơ ứng tuyển ngay</span>
                  </button>
                </form>
              )}
            </div>
          </main>

          {/* RIGHT: Sidebar matching Screenshot 2 (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* BÀI VIẾT GẦN ĐÂY */}
            <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200/90 shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base sm:text-lg font-black text-[#004b93] uppercase tracking-wider">
                  BÀI VIẾT GẦN ĐÂY
                </h3>
              </div>

              <div className="divide-y divide-slate-100 space-y-4 pt-1">
                {recentArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      if (onSelectArticle) onSelectArticle(art.id);
                    }}
                    className="pt-4 first:pt-0 flex items-start gap-3.5 group cursor-pointer"
                  >
                    {/* Date Badge: Day in big orange, month below matching screenshot */}
                    <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center shrink-0 shadow-2xs group-hover:border-amber-400 transition-colors">
                      <span className="text-lg font-black text-[#e0831a] leading-none">
                        {art.day}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {art.month}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-tight line-clamp-2 uppercase">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal text-justify">
                        {art.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TUYỂN DỤNG KHÁC */}
            {otherJobs.length > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200/90 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-[#004b93] uppercase tracking-wider">
                    TUYỂN DỤNG KHÁC
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 space-y-3">
                  {otherJobs.map((oj) => (
                    <div
                      key={oj.id}
                      onClick={() => onSelectJob(oj.id)}
                      className="pt-3 first:pt-0 group cursor-pointer"
                    >
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#e0831a] group-hover:text-[#c46d0e] transition-colors leading-snug line-clamp-2">
                        {oj.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>Ngày đăng: {oj.date}</span>
                        <span className="text-[#0048ba] font-semibold group-hover:underline">Chi tiết →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
};

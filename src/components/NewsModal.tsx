import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, Briefcase, MapPin, Clock, Building2, Pin, Newspaper } from 'lucide-react';
import { ContentStore } from '../data/contentStore';
import { NewsArticle, JobOpening } from '../types';

interface NewsModalProps {
  isOpen: boolean;
  initialTab?: 'news' | 'careers';
  onClose: () => void;
  onSelectArticle?: (articleId: string) => void;
  onSelectJob?: (jobId: string) => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  initialTab = 'news',
  onClose,
  onSelectArticle,
  onSelectJob,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'careers'>(initialTab);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsArticle[]>(ContentStore.getNews());
  const [jobsList, setJobsList] = useState<JobOpening[]>(ContentStore.getJobs());

  useEffect(() => {
    setNewsList(ContentStore.getNews());
    setJobsList(ContentStore.getJobs());
    const unsubscribe = ContentStore.subscribe(() => {
      setNewsList(ContentStore.getNews());
      setJobsList(ContentStore.getJobs());
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1544a0] text-white flex items-center justify-between">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('news');
                setSelectedNewsId(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'news'
                  ? 'bg-amber-400 text-slate-900 shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Tin Tức & Thị Trường
            </button>
            <button
              onClick={() => {
                setActiveTab('careers');
                setSelectedNewsId(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'careers'
                  ? 'bg-amber-400 text-slate-900 shadow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Tuyển Dụng Nhân Tài
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'news' ? (
            <div className="space-y-6">
              {newsList.length === 0 ? (
                <div className="p-10 text-center rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1544a0] flex items-center justify-center mx-auto mb-3">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Chưa có bài viết nào</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hiện chưa có bài viết tin tức. Bạn có thể sử dụng Bàn điều khiển Quản trị (Console) để đăng bài viết mới.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newsList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (onSelectArticle) {
                          onClose();
                          onSelectArticle(item.id);
                        }
                      }}
                      className={`rounded-xl overflow-hidden border ${
                        item.isPinned
                          ? 'border-amber-400/90 ring-1 ring-amber-400/30 shadow-md'
                          : 'border-slate-100 shadow-sm'
                      } hover:shadow-md transition-all flex flex-col bg-white group cursor-pointer`}
                    >
                      <div className="h-44 overflow-hidden relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded bg-[#1544a0] text-white text-[10px] font-bold uppercase tracking-wider shadow">
                            {item.category}
                          </span>
                          {item.isPinned && (
                            <span className="px-2 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                              <Pin className="w-3 h-3 fill-current" />
                              <span>Ưu tiên</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {item.isPinned && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mb-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Pin className="w-3 h-3 fill-current" />
                              <span>BÀI VIẾT NỔI BẬT</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date}</span>
                          </div>
                          <h4 className="text-sm font-bold text-[#0048ba] group-hover:text-[#00366b] leading-snug line-clamp-2 mb-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>

                        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1544a0]">
                          <span>Xem chi tiết</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <strong className="text-[#1544a0]">Cơ hội nghề nghiệp tại Long Hoàng Logistics:</strong> Gia
                nhập môi trường làm việc quốc tế, chế độ đãi ngộ cạnh tranh, lộ trình thăng tiến rõ
                ràng và tham gia các khóa đào tạo chuyên sâu về chuỗi cung ứng toàn cầu.
              </div>

              {jobsList.length === 0 ? (
                <div className="p-10 text-center rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1544a0] flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Chưa có tin tuyển dụng nào</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hiện chưa có vị trí ứng tuyển mở. Vui lòng quay lại sau hoặc tạo bài đăng trong Quản trị hệ thống.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobsList.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        if (onSelectJob) {
                          onClose();
                          onSelectJob(job.id);
                        }
                      }}
                      className="p-5 rounded-xl border border-slate-200/80 bg-white hover:border-[#1544a0] transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
                            {job.type}
                          </span>
                          <span className="text-xs text-slate-400">Hạn nộp: {job.deadline}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 group-hover:text-[#1544a0]">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            Long Hoàng Logistics
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 pt-1">{job.summary}</p>
                      </div>

                      <div className="shrink-0 flex sm:flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectJob) {
                              onClose();
                              onSelectJob(job.id);
                            }
                          }}
                          className="px-5 py-2.5 bg-[#1544a0] hover:bg-[#1a53c4] text-white text-xs font-bold uppercase tracking-wider rounded-lg text-center transition-all shadow active:scale-95 cursor-pointer"
                        >
                          Chi tiết tuyển dụng →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

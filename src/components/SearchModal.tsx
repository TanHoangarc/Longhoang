import React, { useState } from 'react';
import { Search, X, ArrowRight, MapPin, Layers, Briefcase } from 'lucide-react';
import { SERVICES_LIST, OFFICES_LIST } from '../data/mockData';
import { ContentStore } from '../data/contentStore';
import { ServiceItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: ServiceItem) => void;
  onSelectArticle?: (articleId: string) => void;
  onSelectJob?: (jobId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
  onSelectArticle,
  onSelectJob,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const allNews = ContentStore.getNews();
  const allJobs = ContentStore.getJobs();

  const filteredServices = SERVICES_LIST.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase()) ||
      s.details.overview.toLowerCase().includes(query.toLowerCase())
  );

  const filteredOffices = OFFICES_LIST.filter(
    (o) =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.address.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNews = allNews.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.summary.toLowerCase().includes(query.toLowerCase())
  );

  const filteredJobs = allJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.summary.toLowerCase().includes(query.toLowerCase()) ||
      j.location.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[80vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm dịch vụ, tin tức chuyên ngành, kiến thức logistics..."
            className="w-full text-base text-slate-800 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Xóa
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Services Matches */}
          <div>
            <h4 className="text-xs font-bold text-[#1544a0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Dịch vụ ({filteredServices.length})</span>
            </h4>
            {filteredServices.length === 0 ? (
              <p className="text-xs text-slate-400">Không tìm thấy dịch vụ phù hợp.</p>
            ) : (
              <div className="space-y-2">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      onClose();
                      onSelectService(service);
                    }}
                    className="p-3 rounded-lg hover:bg-blue-50/60 border border-slate-100 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#1544a0]">
                        {service.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1544a0] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* News Matches */}
          {filteredNews.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#e0831a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>📰 Tin tức & Kiến thức ({filteredNews.length})</span>
              </h4>
              <div className="space-y-2">
                {filteredNews.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      onClose();
                      if (onSelectArticle) onSelectArticle(article.id);
                    }}
                    className="p-3 rounded-lg hover:bg-amber-50/60 border border-slate-100 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#004b93] bg-blue-50 px-1.5 py-0.5 rounded">
                        {article.category}
                      </span>
                      <p className="text-sm font-bold text-[#e0831a] group-hover:text-[#c46d0e] mt-1">
                        {article.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{article.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#e0831a] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Openings Matches */}
          {filteredJobs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Tuyển dụng & Việc làm ({filteredJobs.length})</span>
              </h4>
              <div className="space-y-2">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => {
                      onClose();
                      if (onSelectJob) onSelectJob(job.id);
                    }}
                    className="p-3 rounded-lg hover:bg-emerald-50/60 border border-slate-100 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {job.type}
                        </span>
                        <span className="text-[11px] text-slate-400">📍 {job.location}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 mt-1">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">{job.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Office Locations */}
          <div>
            <h4 className="text-xs font-bold text-[#1544a0] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Văn phòng & Chi nhánh ({filteredOffices.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredOffices.map((office) => (
                <div key={office.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">{office.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{office.address}</p>
                  <p className="text-[#1544a0] font-semibold mt-1">📞 {office.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Gợi ý: Vận tải biển, Đa phương thức, Khai báo hải quan, Incoterms, Đăng ký race</span>
          <kbd className="px-2 py-0.5 bg-white rounded border text-slate-600 font-mono text-[10px]">
            ESC để thoát
          </kbd>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, CheckCircle, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onRequestQuote: (serviceTitle: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  onClose,
  onRequestQuote,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#1544a0] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
              Dịch vụ Long Hoàng Logistics
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-0.5">
              {service.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold text-[#1544a0] uppercase tracking-wider mb-2">
              Tổng quan dịch vụ
            </h4>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700">
              {service.details.overview}
            </p>
          </div>

          {/* Advantages */}
          <div>
            <h4 className="text-xs font-bold text-[#1544a0] uppercase tracking-wider mb-3">
              Lợi thế vượt trội tại Long Hoàng
            </h4>
            <div className="space-y-2.5">
              {service.details.advantages.map((adv, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700">{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Major Routes */}
          <div>
            <h4 className="text-xs font-bold text-[#1544a0] uppercase tracking-wider mb-3">
              Các tuyến vận chuyển tiêu biểu
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.details.routes.map((route, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs font-medium text-slate-800"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{route}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Hỗ trợ báo giá 24/7 qua Hotline: <strong className="text-[#1544a0]">0236.353.7979</strong>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onRequestQuote(service.title);
              }}
              className="w-1/2 sm:w-auto px-5 py-2 text-xs font-bold bg-[#1544a0] hover:bg-[#1a53c4] text-white rounded-lg transition-all shadow active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Yêu cầu báo giá</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

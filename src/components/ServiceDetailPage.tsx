import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, CheckCircle2, Shield, Phone, Mail, Clock, Send, ArrowLeft } from 'lucide-react';
import { ServiceItem } from '../types';
import { SERVICES_LIST } from '../data/mockData';

interface ServiceDetailPageProps {
  serviceId: string;
  onSelectService: (id: string) => void;
  onBackToHome: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceId,
  onSelectService,
  onBackToHome,
  onNavigateToSection,
}) => {
  const currentService = SERVICES_LIST.find((s) => s.id === serviceId) || SERVICES_LIST[0];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    commodity: '',
    volume: '',
    originPort: '',
    destinationPort: '',
    serviceRequired: currentService.title,
  });

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serviceRequired: currentService.title,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    if (!captchaChecked) {
      alert('Vui lòng xác nhận bạn không phải là người máy');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1000);
  };

  return (
    <div className="w-full bg-white text-slate-800 pt-20">
      {/* Top Banner Header with Cargo Background matching user sample */}
      <div className="relative w-full h-36 sm:h-44 md:h-52 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-200/60">
        <img
          src="https://plus.unsplash.com/premium_photo-1661880224695-47dc8805c4ea?q=80&w=1146&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={currentService.title}
          className="w-full h-full object-cover object-center opacity-65"
          referrerPolicy="no-referrer"
        />
        {/* Soft High-Key White Tint Overlay */}
        <div className="absolute inset-0 bg-white/85 sm:bg-white/80" />

        {/* Page Title in Large Blue Font matching screenshot */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#0048ba] uppercase tracking-wide leading-snug">
            {currentService.title}
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumbs matching screenshot */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-8 pb-4 border-b border-slate-100">
          <button
            onClick={onBackToHome}
            className="text-[#1544a0] hover:underline font-semibold flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trang chủ
          </button>
          <span>»</span>
          <span className="text-slate-700 font-medium capitalize truncate">
            {currentService.title.toLowerCase()}
          </span>
        </nav>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Service Details & Request Quote Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview Intro */}
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                <strong className="text-[#1544a0] font-bold">LONG HOÀNG LOGISTICS</strong>{' '}
                {currentService.details.overview}
              </p>

              {/* Bullet Points matching user screenshot */}
              {currentService.bullets && currentService.bullets.length > 0 && (
                <ul className="space-y-2.5 pt-2">
                  {currentService.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Key Advantages */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 sm:p-6 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#1544a0] uppercase tracking-wide">
                Lợi thế khi lựa chọn Long Hoàng Logistics:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentService.details.advantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Routes / Mạng lưới khai thác */}
            {currentService.details.routes && currentService.details.routes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Mạng lưới tuyến trọng điểm:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentService.details.routes.map((r, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-50 text-[#1544a0] border border-blue-100 rounded-lg text-xs font-semibold"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* QUOTE REQUEST FORM CONTAINER matching user screenshot 2 */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 mt-10">
              {/* Background image container with deep oceanic overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop"
                  alt="Container logistics background"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#081e3d]/88 backdrop-blur-[2px]" />
              </div>

              {/* Form Content */}
              <div className="relative z-10 p-6 sm:p-8 md:p-10 text-white">
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-1">
                    Đăng Ký Báo Giá Nhanh
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200">
                    Nhận tư vấn phương án vận chuyển và cước phí tối ưu trong vòng 15-30 phút
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-6 text-center animate-fadeIn">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-white mb-1">Gửi yêu cầu thành công!</h4>
                    <p className="text-xs sm:text-sm text-slate-200 mb-4">
                      Cảm ơn <strong>{formData.fullName}</strong>. Chuyên viên Long Hoàng Logistics sẽ liên hệ lại qua số <strong>{formData.phone}</strong> sớm nhất.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitSuccess(false);
                        setCaptchaChecked(false);
                      }}
                      className="px-5 py-2 bg-[#1544a0] hover:bg-[#1a53c4] text-white text-xs font-bold uppercase rounded-lg shadow transition-all"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Họ và Tên */}
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Họ và Tên *"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Địa chỉ Email *"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại *"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>

                    {/* Tên mặt hàng */}
                    <div>
                      <input
                        type="text"
                        placeholder="Tên mặt hàng *"
                        value={formData.commodity}
                        onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>

                    {/* Khối lượng (Volume) */}
                    <div>
                      <input
                        type="text"
                        placeholder="Khối lượng (Volume) *"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                      />
                    </div>

                    {/* Cảng đi & Cảng đến */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Cảng đi"
                          value={formData.originPort}
                          onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Cảng đến"
                          value={formData.destinationPort}
                          onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                          className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Dịch vụ cần tư vấn/báo giá */}
                    <div>
                      <textarea
                        rows={3}
                        required
                        placeholder="Dịch vụ cần tư vấn/báo giá *"
                        value={formData.serviceRequired}
                        onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/25 rounded-md text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors resize-none"
                      />
                    </div>

                    {/* reCAPTCHA Mockup matching screenshot 2 */}
                    <div className="p-3 bg-slate-900/90 border border-slate-600 rounded-md flex items-center justify-between w-full sm:w-72">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={captchaChecked}
                          onChange={(e) => setCaptchaChecked(e.target.checked)}
                          className="w-6 h-6 rounded border-slate-400 text-[#1544a0] focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs text-slate-200 font-medium">
                          Tôi không phải là người máy
                        </span>
                      </label>
                      <div className="flex flex-col items-center justify-center pl-2">
                        <div className="w-6 h-6 text-slate-400 animate-spin-slow">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono tracking-tighter">
                          reCAPTCHA
                        </span>
                      </div>
                    </div>

                    {/* Submit Button: GỬI ĐI */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-48 py-3 bg-[#1544a0] hover:bg-[#1a53c4] active:scale-98 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>GỬI ĐI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar "DỊCH VỤ" matching user screenshot 1 & 2 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {/* Header Title */}
              <div className="bg-[#1544a0] px-5 py-3.5 border-b border-blue-900">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>DỊCH VỤ</span>
                </h3>
              </div>

              {/* Service List items matching screenshot */}
              <div className="divide-y divide-slate-100">
                {SERVICES_LIST.map((service) => {
                  const isActive = service.id === currentService.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => onSelectService(service.id)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors text-xs sm:text-sm font-medium ${
                        isActive
                          ? 'bg-blue-50/80 text-[#1544a0] font-bold border-l-4 border-[#1544a0]'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#1544a0]'
                      }`}
                    >
                      <FileText
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isActive ? 'text-[#1544a0]' : 'text-slate-400'
                        }`}
                      />
                      <span className="leading-snug">{service.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Contact Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-[#1544a0] text-white rounded-xl p-5 shadow-md">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-2">
                Hỗ Trợ Trực Tuyến 24/7
              </h4>
              <p className="text-xs text-slate-200 mb-4 leading-relaxed">
                Liên hệ ngay hotline để được tư vấn giá cước và phương án vận tải phù hợp nhất.
              </p>
              <div className="space-y-2 text-xs">
                <a
                  href="tel:02873032677"
                  className="flex items-center gap-2 text-white font-bold hover:text-amber-300 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>HCM: 028 7303 2677</span>
                </a>
                <a
                  href="tel:02873027689"
                  className="flex items-center gap-2 text-white font-bold hover:text-amber-300 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>HPH: 028 7302 7689</span>
                </a>
                <a
                  href="mailto:contact@longhoang.vn"
                  className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email: contact@longhoang.vn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

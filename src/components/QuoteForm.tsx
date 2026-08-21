import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { QuoteFormData } from '../types';
import { SERVICES_LIST } from '../data/mockData';

interface QuoteFormProps {
  prefilledService?: string;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ prefilledService }) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    fullName: '',
    email: '',
    phone: '',
    commodity: '',
    volume: '',
    origin: '',
    destination: '',
    service: prefilledService || '',
    otherRequirements: '',
  });

  useEffect(() => {
    if (prefilledService) {
      setFormData((prev) => ({ ...prev, service: prefilledService }));
    }
  }, [prefilledService]);

  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleCaptchaClick = () => {
    if (captchaChecked) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
    }, 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và Tên của bạn.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Vui lòng nhập Số điện thoại liên hệ.');
      return;
    }
    if (!formData.commodity.trim()) {
      setErrorMessage('Vui lòng nhập Tên mặt hàng cần vận chuyển.');
      return;
    }
    if (!formData.volume.trim()) {
      setErrorMessage('Vui lòng nhập Khối lượng / Kích thước (Volume).');
      return;
    }
    if (!formData.service) {
      setErrorMessage('Vui lòng chọn Dịch vụ cần tư vấn/báo giá.');
      return;
    }
    if (!captchaChecked) {
      setErrorMessage('Vui lòng xác nhận bạn không phải là người máy.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      await addDoc(collection(db, 'quotes'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Mở Zalo sau khi gửi thành công
      setTimeout(() => {
        window.open('https://zalo.me/0867141877', '_blank');
      }, 800);

    } catch (err) {
      console.error('Lỗi khi lưu yêu cầu báo giá:', err);
      setErrorMessage('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      commodity: '',
      volume: '',
      origin: '',
      destination: '',
      service: '',
      otherRequirements: '',
    });
    setCaptchaChecked(false);
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  return (
    <div
      id="contact"
      className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700/60 text-white"
    >
      {/* Background Container Ship Image with Deep Navy Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1542314831-c6a4d27f8e80?q=80&w=1200&auto=format&fit=crop)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061f38]/95 via-[#0b294a]/95 to-[#071a2e]/98" />

      {/* Form Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        {/* Form Title */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase mb-6 text-center sm:text-left">
          LIÊN HỆ VỚI CHÚNG TÔI
        </h3>

        {submitSuccess ? (
          <div className="py-12 px-4 text-center bg-white/10 backdrop-blur-md rounded-xl border border-emerald-400/40 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Gửi yêu cầu thành công!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
              Cảm ơn <strong className="text-amber-400">{formData.fullName}</strong>. Đội ngũ chuyên
              viên tư vấn Long Hoàng Logistics sẽ liên hệ lại qua số điện thoại{' '}
              <strong className="text-white">{formData.phone}</strong> trong vòng 15-30 phút để báo giá chi tiết.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Full Name */}
            <div>
              <input
                type="text"
                id="input-fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Họ và Tên *"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Row 2: Email */}
            <div>
              <input
                type="email"
                id="input-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Địa chỉ Email *"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Row 3: Phone */}
            <div>
              <input
                type="tel"
                id="input-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại *"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Row 4: Commodity */}
            <div>
              <input
                type="text"
                id="input-commodity"
                name="commodity"
                value={formData.commodity}
                onChange={handleChange}
                placeholder="Tên mặt hàng *"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Row 5: Volume */}
            <div>
              <input
                type="text"
                id="input-volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                placeholder="Khối lượng (Volume) *"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Row 6: Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                id="input-origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Điểm đi (Port of Loading)"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
              />
              <input
                type="text"
                id="input-destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Điểm đến (Port of Discharge)"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors"
              />
            </div>

            {/* Row 7: Service Selector */}
            <div>
              <select
                id="select-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white rounded focus:outline-none transition-colors"
                required
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  Dịch vụ cần tư vấn/báo giá *
                </option>
                {SERVICES_LIST.map((srv) => (
                  <option key={srv.id} value={srv.title} className="bg-slate-900 text-white">
                    {srv.title}
                  </option>
                ))}
                <option value="Dịch vụ logistics trọn gói" className="bg-slate-900 text-white">
                  Dịch vụ logistics trọn gói
                </option>
              </select>
            </div>

            {/* Row 8: Other requirements */}
            <div>
              <textarea
                id="input-otherRequirements"
                name="otherRequirements"
                rows={2}
                value={formData.otherRequirements}
                onChange={handleChange}
                placeholder="Yêu cầu khác (nếu có: điều kiện Incoterms, thời gian dự kiến...)"
                className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-600/80 hover:border-slate-400 focus:border-amber-400 focus:bg-slate-900 text-sm text-white placeholder-slate-400 rounded focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* reCAPTCHA Checkbox Card & Send Button matching screenshot 7 & 8 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              {/* Interactive reCAPTCHA Simulation Box */}
              <div
                id="recaptcha-box"
                onClick={handleCaptchaClick}
                className="flex items-center justify-between px-3 py-2 bg-slate-100 text-slate-800 rounded-sm border border-slate-300 w-full sm:w-64 cursor-pointer hover:bg-slate-200 transition-all select-none shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-xs border-2 flex items-center justify-center transition-all ${
                      captchaChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {captchaLoading ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : captchaChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : null}
                  </div>
                  <span className="text-xs font-medium text-slate-800">Tôi không phải là người máy</span>
                </div>

                <div className="flex flex-col items-center pl-2">
                  <div className="w-5 h-5 text-blue-600">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                    reCAPTCHA
                  </span>
                </div>
              </div>

              {/* Submit Button "GỬI ĐI" matching screenshots */}
              <button
                type="submit"
                id="btn-submit-quote"
                disabled={isSubmitting}
                className="w-full sm:w-36 py-2.5 px-6 bg-[#1544a0] hover:bg-[#1e58cb] text-white font-extrabold text-sm uppercase tracking-wider rounded transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>GỬI ĐI</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

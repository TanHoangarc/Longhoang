import React, { useState } from 'react';
import { 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  ThumbsUp, 
  Users, 
  Send, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { OFFICES_LIST, COMPANY_SOCIAL_LINKS } from '../data/mockData';

interface AboutUsPageProps {
  onBackToHome: () => void;
  onNavigateToCompanyProfile?: () => void;
  onSelectService?: (serviceId: string) => void;
  focusSection?: 'all' | 'vision-mission' | 'core-values' | 'connect';
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onBackToHome,
  onNavigateToCompanyProfile,
  onSelectService,
  focusSection = 'all',
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        company: '',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO BANNER: Standardized High-Key Banner matching screenshots */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] overflow-hidden flex items-center justify-center">
        <img
          src="https://i.ibb.co/fVPWrC4L/Pic10.jpg"
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black uppercase tracking-wider text-[#0048ba] drop-shadow-xs">
            VỀ CHÚNG TÔI
          </h1>
        </div>
      </div>

      {/* 2. BREADCRUMBS */}
      <div className="bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <button
              onClick={onBackToHome}
              className="hover:text-[#0048ba] transition-colors flex items-center gap-1 cursor-pointer"
            >
              Trang chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">Về chúng tôi</span>
          </nav>
        </div>
      </div>

      {/* 3. TẦM NHÌN & SỨ MỆNH SECTION (Exact layout from Screenshot 1) */}
      <section id="vision-mission" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
            {/* LEFT COLUMN: TẦM NHÌN */}
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-[#0048ba] tracking-wide uppercase mb-6 sm:mb-8 text-center lg:text-left">
                TẦM NHÌN
              </h2>

              {/* Orange framed quote box matching Screenshot 1 */}
              <div className="relative border-2 border-[#f59e0b] rounded-sm p-8 sm:p-10 flex-1 flex items-center justify-center text-center bg-white shadow-xs">
                {/* Top-left Orange Opening Quote */}
                <span className="absolute -top-5 left-6 bg-white px-2 text-[#f59e0b] text-5xl sm:text-6xl font-serif font-black leading-none select-none">
                  “
                </span>

                {/* Main Vision Statement */}
                <p className="text-slate-800 font-bold text-base sm:text-lg md:text-xl leading-relaxed max-w-md mx-auto">
                  Trở thành sự lựa chọn hàng đầu của khách hàng trong việc cung cấp các dịch vụ logistics toàn diện
                </p>

                {/* Bottom-right Orange Closing Quote */}
                <span className="absolute -bottom-7 right-6 bg-white px-2 text-[#f59e0b] text-5xl sm:text-6xl font-serif font-black leading-none select-none">
                  ”
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: SỨ MỆNH */}
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-black text-[#0048ba] tracking-wide uppercase mb-6 sm:mb-8 text-center lg:text-left">
                SỨ MỆNH
              </h2>

              {/* 3 Numbered circular items matching Screenshot 1 */}
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {/* Mission Item 1 */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-sm mt-0.5">
                    1
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed pt-1.5 sm:pt-2">
                    Cung cấp dịch vụ Logistics tối ưu và giải pháp có lợi cho khách hàng.
                  </p>
                </div>

                {/* Mission Item 2 */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-sm mt-0.5">
                    2
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed pt-1.5 sm:pt-2">
                    Cầu nối giao thương cho các sản phẩm Việt Nam ra toàn thế giới.
                  </p>
                </div>

                {/* Mission Item 3 */}
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-sm mt-0.5">
                    3
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed pt-1.5 sm:pt-2">
                    Xây dựng môi trường làm việc chuyên nghiệp, tích cực cho các thành viên có chung mục tiêu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GIÁ TRỊ CỐT LÕI SECTION (Exact layout with container vessel from Screenshot 1 & 2) */}
      <section id="core-values" className="py-14 sm:py-20 relative overflow-hidden bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0048ba] uppercase tracking-wider">
              GIÁ TRỊ CỐT LÕI
            </h2>
          </div>

          {/* 2x2 Grid with Background Ship Graphic on Right Side */}
          <div className="relative">
            {/* Ambient Ship Graphic floating on the right side */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 lg:w-2/5 h-full opacity-20 lg:opacity-35 pointer-events-none overflow-hidden hidden md:block">
              <img
                src="https://i.ibb.co/fVPWrC4L/Pic10.jpg"
                alt="Long Hoàng Logistics Cargo Vessel"
                className="w-full h-full object-contain object-right"
                referrerPolicy="no-referrer"
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0) 100%)'
                }}
              />
            </div>

            {/* Core Values 4-Item Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10 max-w-5xl">
              {/* Value 1: CHUYÊN NGHIỆP */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#f59e0b] shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-[#0048ba] uppercase tracking-wide">
                    CHUYÊN NGHIỆP
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                    Chúng tôi tin rằng với đội ngũ chuyên gia có hiểu biết cực kì sâu rộng cùng thâm niên gần 20 năm về lĩnh vực ngoại thương – logistics, chúng tôi có thể mang lại một chất lượng dịch vụ tốt nhất, tạo ra giá trị đích thực cho khách hàng.
                  </p>
                </div>
              </div>

              {/* Value 2: CHÍNH TRỰC */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#f59e0b] shadow-xs">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-[#0048ba] uppercase tracking-wide">
                    CHÍNH TRỰC
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                    Chúng tôi luôn đúng mực trong các quy tắc ứng xử và đặt sự liêm chính, trung thực vào trong tất cả các giao dịch.
                  </p>
                </div>
              </div>

              {/* Value 3: CHIA SẺ */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#f59e0b] shadow-xs">
                  <ThumbsUp className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-[#0048ba] uppercase tracking-wide">
                    CHIA SẺ
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                    Chúng tôi tin rằng, khi các thành viên trong công ty quan tâm, giúp đỡ lẫn nhau, chúng tôi có thể sáng tạo các giá trị mới cho đối tác, nhà đầu tư và cộng đồng.
                  </p>
                </div>
              </div>

              {/* Value 4: TẬN TÂM */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#f59e0b] shadow-xs">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-[#0048ba] uppercase tracking-wide">
                    TẬN TÂM
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed text-justify">
                    Chúng tôi hiểu rằng, mỗi yêu cầu của khách hàng đều là những yêu cầu cấp thiết và chính đáng, vì thế chúng tôi nỗ lực xây dựng hệ thống dịch vụ 24/7 để có thể hỗ trợ khách hàng một cách chính xác và kịp thời.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KẾT NỐI VỚI CHÚNG TÔI SECTION (Exact layout from Screenshot 2) */}
      <section id="connect" className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Section Header */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0048ba] uppercase tracking-wider mb-4">
            KẾT NỐI VỚI CHÚNG TÔI
          </h2>

          {/* Inspirational Quote */}
          <p className="text-xs sm:text-sm md:text-base text-slate-600 italic leading-relaxed max-w-3xl mx-auto mb-10">
            &quot;Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng nhau&quot;. Hãy để chúng tôi là đối tác của bạn, hãy tin tưởng để chúng tôi &quot;chung tay&quot; vì thành công của bạn, và thành quả đó sẽ là điểm nhấn tuyệt vời cho câu chuyện của chúng ta. Vì Long Hoàng, sinh ra là để dành cho bạn.
          </p>

          {/* Contact Box Form matching Screenshot 2 (Dark Teal / Navy Box) */}
          <div className="bg-[#053b48] text-white rounded-2xl p-6 sm:p-10 shadow-xl text-left border border-teal-900/30">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Gửi thông tin thành công!</h3>
                <p className="text-teal-100 text-sm max-w-md mx-auto">
                  Cảm ơn quý khách đã kết nối với Long Hoàng Logistics. Đội ngũ chuyên gia của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Họ và Tên */}
                  <div>
                    <label className="block text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1.5">
                      Họ và Tên <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-teal-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="block text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1.5">
                      Số điện thoại <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0901 234 567"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-teal-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1.5">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@company.com"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-teal-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
                    />
                  </div>

                  {/* Công ty */}
                  <div>
                    <label className="block text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1.5">
                      Tên doanh nghiệp / Công ty
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Tên công ty xuất nhập khẩu..."
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-teal-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>

                {/* Lời nhắn / Nhu cầu */}
                <div>
                  <label className="block text-xs font-semibold text-teal-100 uppercase tracking-wider mb-1.5">
                    Lời nhắn / Nhu cầu dịch vụ <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Quý khách vui lòng mô tả tuyến đường, loại hàng hóa, hoặc yêu cầu dịch vụ logistics..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-teal-200/50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all resize-none"
                  />
                </div>

                {/* Submit button & Quick hotline */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-teal-200 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Hotline tư vấn 24/7: <strong>{COMPANY_SOCIAL_LINKS.hotlineHcm}</strong></span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi thông tin liên hệ</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

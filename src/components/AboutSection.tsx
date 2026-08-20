import React from 'react';

interface AboutSectionProps {
  onLearnMoreServices?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = () => {
  return (
    <section id="about" className="relative w-full bg-white overflow-hidden p-0 m-0 border-none">
      <div className="relative w-full min-h-[340px] sm:min-h-[380px] md:min-h-[420px] flex items-center">
        {/* Full horizontal background image with ship on left and fade to white towards right */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://i.ibb.co/fVPWrC4L/Pic10.jpg"
            alt="Tàu container Long Hoàng Logistics trên biển"
            className="w-full h-full object-cover object-[20%_center] sm:object-[25%_center] md:object-[left_center]"
            referrerPolicy="no-referrer"
          />

          {/* Seamless horizontal gradient fading from transparent on the left to solid white on the right */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.98) 60%, rgba(255,255,255,1) 100%)'
            }}
          />

          {/* Additional mobile-friendly overlay for optimal readability on small screens */}
          <div className="absolute inset-0 bg-white/70 sm:hidden pointer-events-none" />
        </div>

        {/* Content Overlaid directly on the right faded area */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            {/* Left Column Spacer (allowing the clean cargo ship to be seen) */}
            <div className="hidden md:block md:col-span-5 lg:col-span-6" />

            {/* Right Column: Title, Slogan & Description exact layout matching screenshot */}
            <div className="md:col-span-7 lg:col-span-6 flex flex-col items-center text-center md:pl-6 lg:pl-10">
              {/* Brand Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#1544a0] tracking-tight uppercase mb-0.5">
                LONG HOÀNG LOGISTICS
              </h2>

              {/* Slogan in golden-amber italic script font style */}
              <p className="text-lg sm:text-xl font-serif italic text-amber-500 font-semibold mb-4 tracking-wide lowercase">
                think logistics - think us
              </p>

              {/* Paragraph 1 */}
              <p className="text-xs sm:text-[14px] text-slate-700 leading-relaxed mb-3 text-justify w-full">
                Long Hoàng là đơn vị cung cấp các giải pháp logistics toàn diện và linh hoạt, cùng hệ thống hỗ trợ 24/7 nhằm đáp ứng nhu cầu khách hàng một cách hiệu quả và nhanh chóng.
              </p>

              {/* Paragraph 2 */}
              <p className="text-xs sm:text-[14px] text-slate-700 leading-relaxed text-justify w-full">
                Với đội ngũ chuyên gia có hiểu biết cực kỳ sâu rộng cùng thâm niên gần 20 năm trong lĩnh vực ngoại thương – logistics, Long Hoàng cam kết luôn mang đến chất lượng dịch vụ tốt nhất, tạo ra giá trị đích thực cho khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



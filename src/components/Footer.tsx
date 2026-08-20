import React from 'react';
import { MapPin, Phone, ShieldCheck, Facebook, Youtube, ChevronUp, Lock } from 'lucide-react';
import { LongHoangLogo } from './LongHoangLogo';
import { OFFICES_LIST } from '../data/mockData';

interface FooterProps {
  onOpenConsole?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenConsole }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-r from-[#ffffff] via-[#f4f8fc] to-[#e4eef9] text-slate-800 pt-16 pb-8 overflow-hidden border-t border-slate-200/70">
      {/* Background container ship in the bottom right corner with soft water ripple blend matching the image */}
      <div 
        className="absolute right-0 bottom-0 top-0 w-full sm:w-2/3 lg:w-1/2 pointer-events-none z-0 opacity-80 mix-blend-multiply flex items-end justify-end overflow-hidden"
      >
        <img
          src="https://i.ibb.co/6cCKqGs4/Pic14.jpg"
          alt="Container Cargo Ship at Sea"
          className="object-cover object-left h-full w-full mask-gradient-ship"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 85%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 85%)'
          }}
          loading="lazy"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content Grid matching screenshot layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-14 items-start">
          
          {/* Left Column: Logo, Description (orange font), Social Icons, DMCA */}
          <div className="md:col-span-4 lg:col-span-4 flex flex-col items-start space-y-4">
            {/* Logo */}
            <div className="inline-block">
              <LongHoangLogo variant="color" />
            </div>

            {/* Description matching the orange color and justified text in the image */}
            <p className="text-xs sm:text-[13px] text-[#e0831a] font-normal leading-relaxed text-justify max-w-sm">
              Long Hoàng là nhà cung cấp các giải pháp logistics toàn diện và linh hoạt, cùng hệ thống hỗ trợ 24/7 nhằm đáp ứng nhu cầu của khách hàng một cách nhanh chóng và hiệu quả.
            </p>

            {/* Social Icons matching screenshot */}
            <div className="flex items-center gap-2 pt-1">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/longhoanglogistics/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all shadow-sm"
                title="Facebook Long Hoàng Logistics"
              >
                <Facebook className="w-4 h-4 fill-white" />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@longhoanglogistics8023"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded bg-[#0077b5] text-white flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all shadow-sm"
                title="YouTube Long Hoàng Logistics"
              >
                <Youtube className="w-4 h-4 fill-white" />
              </a>

              {/* Zalo */}
              <a
                href="https://zalo.me/0867141877"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 h-8 rounded bg-[#0068FF] text-white text-xs font-bold flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all shadow-sm"
                title="Zalo Official Long Hoàng Logistics (0867 141 877)"
              >
                Zalo
              </a>
            </div>

            {/* DMCA Protected Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a4d2e] border border-[#2d7a46] rounded text-[11px] font-bold text-white shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="tracking-wider">DMCA</span>
                <span className="text-[10px] text-slate-200 font-normal">PROTECTED</span>
              </div>
            </div>
          </div>

          {/* Right Columns: Office Locations in Grid matching the screenshot typography & colors */}
          <div className="md:col-span-8 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {OFFICES_LIST.map((office) => (
              <div key={office.id} className="space-y-2">
                {/* Office Header in Bold Deep Blue */}
                <h4 className="text-sm font-extrabold text-[#0f3b7d] uppercase tracking-wide">
                  {office.name}
                </h4>

                {/* Address in Orange with Pin Icon */}
                <p className="text-xs sm:text-[13px] text-[#e0831a] leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>{office.address}</span>
                </p>

                {/* Phone in Orange with Phone Icon */}
                <p className="text-xs sm:text-[13px] text-[#e0831a] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600 shrink-0" />
                  <a
                    href={`tel:${office.phone.replace(/[\s.]/g, '')}`}
                    className="hover:underline font-semibold text-[#e0831a]"
                  >
                    {office.phone}
                  </a>
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Copyright Bar matching screenshot */}
        <div className="pt-8 border-t border-slate-200/60 flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-1">
          <p className="font-normal text-slate-600">
            Copyrights © {new Date().getFullYear()} by Long Hoang Group
          </p>
          <div className="flex items-center gap-2 text-slate-500 flex-wrap justify-center">
            <span className="hover:text-blue-900 cursor-pointer">Term of use</span>
            <span>-</span>
            <span className="hover:text-blue-900 cursor-pointer">Privacy policy</span>
            <span>-</span>
            <button
              onClick={() => {
                if (onOpenConsole) {
                  onOpenConsole();
                } else {
                  window.location.hash = '#/console';
                }
              }}
              className="text-[#0048ba] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              title="Cổng Quản trị Tin tức & Tuyển dụng (longhoanglogistics.com/console)"
            >
              <Lock className="w-3 h-3" />
              <span>Console Quản trị (/console)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};


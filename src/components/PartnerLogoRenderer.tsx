import React from 'react';

interface PartnerLogoProps {
  type: string;
  className?: string;
}

export const PartnerLogoRenderer: React.FC<PartnerLogoProps> = ({ type, className = 'h-14' }) => {
  switch (type) {
    case 'vla':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center gap-1.5 px-3 py-1">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center font-black text-red-600 text-xs tracking-tighter">
              VLA
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-black text-blue-900 leading-tight">VIETNAM LOGISTICS</span>
              <span className="text-[8px] font-semibold text-slate-500 uppercase">Association</span>
            </div>
          </div>
        </div>
      );

    case 'vcci':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center gap-2 px-2 py-1">
            {/* VCCI red stylised logo */}
            <div className="flex items-center">
              <span className="text-3xl font-black text-[#c01818] tracking-widest font-sans">V</span>
              <span className="text-3xl font-black text-[#c01818] tracking-widest font-sans">C</span>
              <span className="text-3xl font-black text-[#c01818] tracking-widest font-sans">C</span>
              <span className="text-3xl font-black text-[#c01818] tracking-widest font-sans">I</span>
            </div>
          </div>
        </div>
      );

    case 'jctrans':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center px-2 py-1">
            <span className="text-2xl font-black text-[#0f3b7d] tracking-tight italic">JC</span>
            <span className="text-2xl font-extrabold text-[#e0831a] tracking-tight italic">TRANS</span>
            <span className="ml-1 text-[10px] font-semibold text-slate-400 self-end mb-0.5">.net</span>
          </div>
        </div>
      );

    case 'pcn':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="flex items-center justify-center mb-0.5">
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="11" fill="#0284c7" />
                <path d="M12 18h12M18 12v12" stroke="white" strokeWidth="1.5" />
                <path d="M7 13c2-5 13-9 22-3-2 5-13 9-22 3z" fill="#16a34a" />
                <path d="M29 23c-2 5-13 9-22 3 2-5 13-9 22-3z" fill="#16a34a" />
              </svg>
            </div>
            <span className="text-[10px] font-black text-[#0f3b7d] tracking-wider uppercase leading-none">PROJECT</span>
            <span className="text-[10px] font-black text-[#0f3b7d] tracking-wider uppercase leading-none">CARGO</span>
            <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">NETWORK</span>
          </div>
        </div>
      );

    case 'wiffa':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center gap-1.5 px-2 py-1">
            {/* MIFFA round logo with globe */}
            <div className="w-9 h-9 rounded-full bg-[#004b93] border-2 border-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <span className="text-[11px] font-extrabold text-amber-300">MIFFA</span>
            </div>
          </div>
        </div>
      );

    case 'fiata':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex items-center gap-1.5 px-2 py-1">
            <div className="w-8 h-8 rounded-full border-2 border-[#004b93] flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-[#004b93]">FIATA</span>
            </div>
            <span className="text-xs font-bold text-[#004b93]">FEDERATION</span>
          </div>
        </div>
      );

    case 'iata':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="flex items-center justify-center">
              <svg className="w-10 h-7" viewBox="0 0 48 32" fill="none">
                <circle cx="24" cy="14" r="10" stroke="#004b93" strokeWidth="1.5" />
                <ellipse cx="24" cy="14" rx="5" ry="10" stroke="#004b93" strokeWidth="1" />
                <line x1="14" y1="14" x2="34" y2="14" stroke="#004b93" strokeWidth="1" />
                <path d="M8 20h32l-4 4H12z" fill="#004b93" />
              </svg>
            </div>
            <span className="text-lg font-black text-[#004b93] tracking-widest leading-none mt-0.5">IATA</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};


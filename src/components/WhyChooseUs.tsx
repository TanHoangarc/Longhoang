import React, { useState } from 'react';
import { ThumbsUp, Star, RefreshCw, Heart, Plus, Minus } from 'lucide-react';
import { CORE_VALUES } from '../data/mockData';

export const WhyChooseUs: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('val-1'); // First item open by default

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'thumbs-up':
        return <ThumbsUp className="w-5 h-5 text-slate-500 group-hover:text-[#1544a0]" />;
      case 'star':
        return <Star className="w-5 h-5 text-slate-500 group-hover:text-amber-500" />;
      case 'refresh':
        return <RefreshCw className="w-5 h-5 text-slate-500 group-hover:text-blue-500" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-slate-500 group-hover:text-red-500" />;
      default:
        return <ThumbsUp className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div id="why-us" className="w-full">
      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-black text-[#1544a0] uppercase tracking-tight mb-8">
        VÌ SAO CHỌN CHÚNG TÔI
      </h2>

      {/* Accordion List matching the exact style in screenshot 6 & 7 */}
      <div className="space-y-4">
        {CORE_VALUES.map((item) => {
          const isOpen = openItem === item.id;

          return (
            <div
              key={item.id}
              className="border-b border-slate-200/90 pb-4 transition-all"
            >
              <button
                id={`accordion-btn-${item.id}`}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between py-2 text-left group focus:outline-none cursor-pointer"
              >
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0">{renderIcon(item.icon)}</div>
                  <span className="text-base sm:text-lg font-bold text-slate-700 group-hover:text-[#1544a0] tracking-wide uppercase transition-colors">
                    {item.title}
                  </span>
                </div>

                {/* Right: Circular Plus/Minus Toggle Icon matching screenshot */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isOpen
                      ? 'border-[#1544a0] bg-[#1544a0] text-white'
                      : 'border-blue-400 text-blue-500 group-hover:border-[#1544a0]'
                  }`}
                >
                  {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="pt-2 pl-9 pr-4 text-slate-600 text-sm leading-relaxed animate-fadeIn">
                  <p className="font-semibold text-slate-800 mb-1">{item.shortDesc}</p>
                  <p className="text-slate-600 font-normal">{item.fullDesc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

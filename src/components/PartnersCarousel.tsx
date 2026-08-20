import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PARTNERS_LIST } from '../data/mockData';
import { PartnerLogoRenderer } from './PartnerLogoRenderer';

export const PartnersCarousel: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 5;

  const nextPartners = () => {
    setStartIndex((prev) => (prev + 1) % PARTNERS_LIST.length);
  };

  const prevPartners = () => {
    setStartIndex((prev) => (prev - 1 + PARTNERS_LIST.length) % PARTNERS_LIST.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextPartners();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Compute displayed partners wrapping circularly
  const visiblePartners = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const idx = (startIndex + i) % PARTNERS_LIST.length;
    visiblePartners.push(PARTNERS_LIST[idx]);
  }

  return (
    <section className="py-8 bg-white border-t border-b border-slate-100 shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left Arrow Button `<` matching image */}
          <button
            id="btn-partner-prev"
            onClick={prevPartners}
            className="w-9 h-12 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center transition-all shadow shrink-0 active:scale-95 cursor-pointer"
            aria-label="Previous Partners"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Partner Logos Grid / Row */}
          <div className="flex-1 overflow-hidden py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 items-center justify-center">
              {visiblePartners.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex items-center justify-center transition-transform hover:scale-105"
                  title={`${partner.name} - ${partner.subtitle}`}
                >
                  <PartnerLogoRenderer type={partner.logoType} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow Button `>` matching image */}
          <button
            id="btn-partner-next"
            onClick={nextPartners}
            className="w-9 h-12 rounded bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center transition-all shadow shrink-0 active:scale-95 cursor-pointer"
            aria-label="Next Partners"
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>
    </section>
  );
};


import React from 'react';

export function renderTextWithTooltips(text: string) {
  if (!text) return text;

  // Pattern matches *#Keyword|Description|ImageUrl#*
  // Example 1: *#FCA|Free Carrier Description|https://image.com/pic.jpg#*
  // Example 2 (no image): *#FCA|Free Carrier Description#*
  const customPattern = /\*\#(.*?)\#\*/g;

  const parts = text.split(customPattern);

  return parts.map((part, index) => {
    // matched groups are at odd indices
    if (index % 2 === 1) {
      const segments = part.split('|').map(s => s.trim());
      const term = segments[0] || '';
      const description = segments[1] || '';
      const image = segments[2] || ''; // Optional

      return (
        <span key={`custom-${index}`} className="relative group inline-block font-semibold text-emerald-600 cursor-help border-b border-dashed border-emerald-600/40 hover:border-emerald-600 transition-colors">
          {term}
          <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-[512px] bg-white text-slate-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100 overflow-visible text-left">
            <span className="block overflow-hidden rounded-2xl">
              {image && (
                <span className="block w-full h-56 bg-slate-100">
                  <img src={image} alt={term} className="w-full h-full object-cover" />
                </span>
              )}
              <span className="block p-6">
                <strong className="block text-emerald-700 mb-2.5 text-lg">{term}</strong>
                <span className="block leading-relaxed text-slate-600 font-normal text-base">{description}</span>
              </span>
            </span>
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-[12px] border-transparent border-t-white"></span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[3px] border-[12px] border-transparent border-t-slate-200 -z-10"></span>
          </span>
        </span>
      );
    }
    
    // Standard text outside custom tags
    return <React.Fragment key={`frag-${index}`}>{part}</React.Fragment>;
  });
}

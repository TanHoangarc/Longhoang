import React from 'react';

const glossary = [
  {
    term: 'EXW',
    title: 'EXW (Ex Works)',
    description: 'Người bán giao hàng tại cơ sở của mình; người mua chịu phần lớn chi phí và rủi ro từ điểm giao hàng.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80'
  },
  {
    term: 'FCA',
    title: 'FCA (Free Carrier)',
    description: 'Người bán giao hàng cho người chuyên chở do người mua chỉ định. Rủi ro chuyển giao khi hàng được giao cho người vận chuyển.',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80'
  },
  {
    term: 'FAS',
    title: 'FAS (Free Alongside Ship)',
    description: 'Người bán giao hàng dọc mạn tàu tại cảng bốc hàng do người mua chỉ định.',
  },
  {
    term: 'FOB',
    title: 'FOB (Free on Board)',
    description: 'Người bán giao hàng qua lan can tàu tại cảng bốc, rủi ro chuyển giao ngay khi hàng nằm trên boong tàu.',
    image: 'https://images.unsplash.com/photo-1605810730811-40b541bb8eb7?auto=format&fit=crop&w=400&q=80'
  },
  {
    term: 'CFR',
    title: 'CFR (Cost and Freight)',
    description: 'Người bán phải trả cước phí để đưa hàng tới cảng đích quy định, nhưng rủi ro được chuyển giao ngay khi hàng qua lan can tàu tại cảng bốc.',
  },
  {
    term: 'CIF',
    title: 'CIF (Cost, Insurance and Freight)',
    description: 'Giống CFR nhưng người bán phải mua bảo hiểm hàng hóa tối thiểu cho người mua.',
    image: 'https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=400&q=80'
  },
  {
    term: 'CPT',
    title: 'CPT (Carriage Paid To)',
    description: 'Người bán thanh toán cước phí vận chuyển đến đích được chỉ định. Rủi ro chuyển giao khi hàng được giao cho người vận chuyển đầu tiên.',
  },
  {
    term: 'CIP',
    title: 'CIP (Carriage and Insurance Paid to)',
    description: 'Giống CPT, nhưng người bán phải mua thêm bảo hiểm mức loại A (cao nhất) theo Incoterms 2020.',
  },
  {
    term: 'DAP',
    title: 'DAP (Delivered at Place)',
    description: 'Người bán giao hàng khi hàng hóa được đặt dưới sự định đoạt của người mua trên phương tiện vận tải sẵn sàng dỡ tại nơi đến quy định.',
  },
  {
    term: 'DPU',
    title: 'DPU (Delivered at Place Unloaded)',
    description: 'Người bán giao hàng và dỡ hàng khỏi phương tiện vận tải tại nơi đến.',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=400&q=80'
  },
  {
    term: 'DDP',
    title: 'DDP (Delivered Duty Paid)',
    description: 'Người bán chịu mọi chi phí và rủi ro để đưa hàng đến điểm đích, bao gồm cả việc thông quan nhập khẩu và nộp thuế.',
  }
];

function parseGlossary(text: string) {
  if (!text) return text;
  const termPattern = glossary.map(g => g.term).join('|');
  const regex = new RegExp(`\\b(${termPattern})\\b`, 'g');
  const parts = text.split(regex);
  return parts.map((part, index) => {
    const termData = glossary.find(g => g.term === part);
    if (termData) {
      return (
        <span key={`gloss-${index}`} className="relative group inline-block font-semibold text-[#0048ba] cursor-help border-b border-dashed border-[#0048ba]/40 hover:border-[#0048ba] transition-colors">
          {part}
          <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white text-slate-800 text-xs rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100 overflow-visible">
            <span className="block overflow-hidden rounded-xl">
              {termData.image && (
                <span className="block w-full h-28 bg-slate-100">
                  <img src={termData.image} alt={termData.title} className="w-full h-full object-cover" />
                </span>
              )}
              <span className="block p-3.5">
                <strong className="block text-[#0048ba] mb-1.5">{termData.title}</strong>
                <span className="block leading-relaxed text-slate-600 font-normal">{termData.description}</span>
              </span>
            </span>
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-white"></span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-[6px] border-transparent border-t-slate-200 -z-10"></span>
          </span>
        </span>
      );
    }
    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
}

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
          <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white text-slate-800 text-xs rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100 overflow-visible text-left">
            <span className="block overflow-hidden rounded-xl">
              {image && (
                <span className="block w-full h-28 bg-slate-100">
                  <img src={image} alt={term} className="w-full h-full object-cover" />
                </span>
              )}
              <span className="block p-3.5">
                <strong className="block text-emerald-700 mb-1.5 text-sm">{term}</strong>
                <span className="block leading-relaxed text-slate-600 font-normal">{description}</span>
              </span>
            </span>
            {/* Arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-white"></span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] border-[6px] border-transparent border-t-slate-200 -z-10"></span>
          </span>
        </span>
      );
    }
    
    // For standard text outside custom tags, parse auto-glossary
    return <React.Fragment key={`frag-${index}`}>{parseGlossary(part)}</React.Fragment>;
  });
}

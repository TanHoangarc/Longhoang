import React from 'react';

export function renderTextWithTooltips(text: string) {
  if (!text) return text;

  // Pattern matches:
  // 1. Tooltips: *#Keyword|Description|ImageUrl#*
  // 2. Bold text: **Bold Text**
  // 3. Inline images: [img|https://image.url]
  // 4. Links: [text](url)
  const combinedPattern = /(\*\#.*?\#\*|\*\*.*?\*\*|\[img\|.*?\]|\[.*?\]\(.*?\))/g;
  const parts = text.split(combinedPattern);

  return parts.map((part, index) => {
    // matched groups are at odd indices
    if (index % 2 === 1) {
      // 1. Bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return <strong key={`bold-${index}`} className="font-bold text-slate-900">{content}</strong>;
      }
      
      // 2. Inline Image
      if (part.startsWith('[img|') && part.endsWith(']')) {
        const content = part.slice(5, -1).trim();
        const segments = content.split('|').map(s => s.trim());
        const url = segments[0] || '';
        const caption = segments.slice(1).join(' | ');
        return (
          <span key={`img-${index}`} className="block my-6">
            <img 
              src={url} 
              alt={caption || "Hình ảnh minh họa"} 
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full max-w-3xl mx-auto h-auto rounded-xl shadow-md border border-slate-200 object-cover" 
            />
            {caption && (
              <span className="block text-center text-xs sm:text-sm text-slate-500 mt-2 italic font-normal">
                {caption}
              </span>
            )}
          </span>
        );
      }

      // 4. Links
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const textMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (textMatch && urlMatch) {
          const linkText = textMatch[1];
          const linkUrl = urlMatch[1];
          return (
            <a 
              key={`link-${index}`} 
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 underline transition-colors font-medium"
            >
              {linkText}
            </a>
          );
        }
      }

      // 3. Tooltips
      if (part.startsWith('*#') && part.endsWith('#*')) {
        const content = part.slice(2, -2);
        const segments = content.split('|').map(s => s.trim());
        const term = segments[0] || '';
        const description = segments[1] || '';
        const image = segments[2] || ''; // Optional
        
        return (
          <span key={`custom-${index}`} className="relative group inline-block font-semibold text-emerald-600 cursor-help border-b border-dashed border-emerald-600/40 hover:border-emerald-600 transition-colors">
            {term}
            <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-[512px] max-w-[85vw] bg-white text-slate-800 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100 overflow-visible text-left">
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
    }
        
    // Standard text outside custom tags
    return <React.Fragment key={`frag-${index}`}>{part}</React.Fragment>;
  });
}

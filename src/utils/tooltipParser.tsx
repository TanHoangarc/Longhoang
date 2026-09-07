import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, X, Image as ImageIcon, HelpCircle, BookOpen } from 'lucide-react';

interface TooltipKeywordProps {
  key?: React.Key;
  term: string;
  image?: string;
  description?: string;
}

interface InlineImageBlockProps {
  key?: React.Key;
  url: string;
  caption?: string;
}

/**
 * High-performance smart tooltip component with:
 * 1. Automatic viewport bounding (top/bottom auto-flip, left/right auto-clamp)
 * 2. Proper image framing with object-contain so large images never get cropped
 * 3. Mobile touch support (tap to open/close)
 * 4. Lightbox preview on click for high-res diagrams/photos
 */
function TooltipKeyword({ term, image, description }: TooltipKeywordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    arrowLeft: number;
    placement: 'top' | 'bottom';
    width: number;
  }>({
    top: 0,
    left: 0,
    arrowLeft: 0,
    placement: 'top',
    width: 440,
  });

  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Constrain tooltip width gracefully to viewport
    const tooltipWidth = Math.min(460, Math.max(280, windowWidth - 28));
    
    // Horizontal alignment: center on keyword, clamped to screen edges
    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const left = Math.max(14, Math.min(idealLeft, windowWidth - tooltipWidth - 14));
    
    // Arrow indicator horizontal position pointing right at keyword center
    const arrowLeft = Math.max(18, Math.min(rect.left + rect.width / 2 - left, tooltipWidth - 18));

    // Vertical placement:
    // Estimate tooltip height ~340px (with image) or ~180px (text only)
    const estimatedHeight = image && !imageError ? 340 : 180;
    
    // If not enough room above the trigger, show below
    const showBelow = rect.top < estimatedHeight + 20;

    let top = 0;
    if (showBelow) {
      top = rect.bottom + 8;
    } else {
      top = rect.top - 8;
    }

    setCoords({
      top,
      left,
      arrowLeft,
      placement: showBelow ? 'bottom' : 'top',
      width: tooltipWidth,
    });
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    setIsOpen((prev) => !prev);
  };

  // Close on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsLightboxOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="relative inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 cursor-help border-b-2 border-dashed border-emerald-500/50 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/60 px-1 py-0.5 rounded transition-all select-none group"
      >
        <span>{term}</span>
        <HelpCircle className="w-3 h-3 text-emerald-500 opacity-70 group-hover:opacity-100 shrink-0" />
      </span>

      {/* PORTAL TOOLTIP: Prevents any parent clipping and fits neatly within screen */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              top: coords.placement === 'bottom' ? `${coords.top}px` : undefined,
              bottom: coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="animate-in fade-in zoom-in-95 duration-150 text-left bg-white text-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200/90 overflow-hidden flex flex-col max-h-[82vh]"
          >
            {/* Arrow */}
            <div
              style={{ left: `${coords.arrowLeft}px` }}
              className={`absolute w-3.5 h-3.5 bg-white border border-slate-200/90 rotate-45 z-10 ${
                coords.placement === 'bottom'
                  ? '-top-2 border-b-0 border-r-0'
                  : '-bottom-2 border-t-0 border-l-0'
              }`}
            />

            {/* Header with Term & Close Button */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  Thuật ngữ
                </span>
                <strong className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {term}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                title="Đóng tooltip"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* IMAGE FRAME: Fix large images into bounded frame with object-contain */}
            {image && !imageError && (
              <div className="relative w-full bg-slate-950/5 p-2.5 flex items-center justify-center border-b border-slate-100 group/img overflow-hidden shrink-0">
                <div className="relative max-h-56 sm:max-h-64 w-full flex items-center justify-center">
                  <img
                    src={image}
                    alt={term}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    onClick={() => setIsLightboxOpen(true)}
                    className="max-h-52 sm:max-h-60 max-w-full w-auto h-auto object-contain rounded-lg shadow-2xs cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]"
                  />
                  {/* Zoom button on hover */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 hover:bg-black text-white text-[11px] font-medium rounded-md shadow flex items-center gap-1 backdrop-blur-xs transition-opacity opacity-85 hover:opacity-100 cursor-pointer"
                    title="Nhấp để xem ảnh đầy đủ"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Xem ảnh to</span>
                  </button>
                </div>
              </div>
            )}

            {/* If image had loading error */}
            {image && imageError && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-300" />
                <span>Không tải được ảnh minh họa liên kết</span>
              </div>
            )}

            {/* Description Text Body */}
            {description && (
              <div className="p-4 sm:p-5 overflow-y-auto max-h-48 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            )}
          </div>,
          document.body
        )}

      {/* FULLSCREEN LIGHTBOX MODAL: For viewing the full-size diagram / image */}
      {isLightboxOpen &&
        image &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            >
              {/* Top Bar */}
              <div className="w-full flex items-center justify-between pb-3 text-white">
                <span className="font-bold text-sm sm:text-base text-slate-200 flex items-center gap-2">
                  <span className="text-emerald-400">●</span> {term}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bounded Image: never overflows screen */}
              <img
                src={image}
                alt={term}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {/* Caption */}
              {description && (
                <p className="text-xs text-slate-300 text-center mt-3 max-w-2xl px-4 py-1.5 bg-black/50 rounded-lg backdrop-blur-xs">
                  {description}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Inline Image Component with bounding and lightbox zoom
 */
function InlineImageBlock({ url, caption }: InlineImageBlockProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <span className="block my-6">
        <span className="block relative max-w-3xl mx-auto group">
          <img
            src={url}
            alt={caption || 'Hình ảnh minh họa'}
            loading="lazy"
            referrerPolicy="no-referrer"
            onClick={() => setIsLightboxOpen(true)}
            className="max-h-[520px] w-auto max-w-full mx-auto object-contain rounded-xl shadow-md border border-slate-200 bg-slate-50/50 block cursor-zoom-in hover:shadow-lg transition-all"
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-xs font-medium rounded-lg shadow flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Phóng to</span>
          </button>
        </span>
        {caption && (
          <span className="block text-center text-xs sm:text-sm text-slate-500 mt-2.5 italic font-normal">
            {caption}
          </span>
        )}
      </span>

      {isLightboxOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between pb-3 text-white">
                <span className="font-medium text-sm text-slate-300">
                  {caption || 'Hình ảnh chi tiết'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={url}
                alt={caption || 'Hình ảnh chi tiết'}
                referrerPolicy="no-referrer"
                className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Parses article text with support for:
 * 1. Tooltips: *#Từ khóa | Link ảnh | Giải thích#*
 * 2. Inline images: [img|URL|Ghi chú]
 * 3. Bold text: **In đậm**
 * 4. Links: [Tiêu đề](URL)
 */
export function renderTextWithTooltips(text: string) {
  if (!text) return text;

  const combinedPattern = /(\*\#.*?\#\*|\*\*.*?\*\*|\[img\|.*?\]|\[.*?\]\(.*?\))/g;
  const parts = text.split(combinedPattern);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // 1. Bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return (
          <strong key={`bold-${index}`} className="font-bold text-slate-900">
            {content}
          </strong>
        );
      }

      // 2. Inline Image: [img|URL|Ghi chú]
      if (part.startsWith('[img|') && part.endsWith(']')) {
        const content = part.slice(5, -1).trim();
        const segments = content.split('|').map((s) => s.trim());
        const url = segments[0] || '';
        const caption = segments.slice(1).join(' | ');
        return <InlineImageBlock key={`img-${index}`} url={url} caption={caption} />;
      }

      // 3. Links: [text](url)
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const textMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (textMatch && urlMatch) {
          const linkText = textMatch[1];
          const linkUrl = urlMatch[1];

          // Check if this is an assigned internal article link (e.g. #article-id, article:id, or /news/id)
          const isArticleLink =
            linkUrl.startsWith('article:') ||
            linkUrl.startsWith('#article-') ||
            linkUrl.startsWith('/news/');

          if (isArticleLink) {
            const articleId = linkUrl.replace(/^article:|^#article-|^(\/news\/)/, '');
            return (
              <button
                key={`art-link-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.hash = `#article-${articleId}`;
                  window.dispatchEvent(
                    new CustomEvent('open-article', { detail: { articleId } })
                  );
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#0048ba] hover:text-[#002b70] underline decoration-[#0048ba]/40 hover:decoration-[#0048ba] transition-colors cursor-pointer group/artlink py-0.5"
                title={`Nhấp để chuyển đến bài viết: ${linkText}`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#0048ba] group-hover/artlink:scale-110 transition-transform shrink-0" />
                <span>{linkText}</span>
              </button>
            );
          }

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

      // 4. Tooltips: *#Từ khóa | Link ảnh | Giải thích#* (or *#Từ khóa | Giải thích | Link ảnh#*)
      if (part.startsWith('*#') && part.endsWith('#*')) {
        const content = part.slice(2, -2);
        const segments = content.split('|').map((s) => s.trim());
        const term = segments[0] || '';
        let image = '';
        let description = '';

        if (segments.length >= 3) {
          const seg1IsUrl = /^(https?:\/\/|data:image|\/)/i.test(segments[1]);
          const seg2IsUrl = /^(https?:\/\/|data:image|\/)/i.test(segments[2]);

          if (!seg1IsUrl && seg2IsUrl) {
            // Backward compatibility for *#Từ khóa | Giải thích | Link ảnh#*
            description = segments[1];
            image = segments.slice(2).join(' | ');
          } else {
            // Standard format: *#Từ khóa | Link ảnh | Giải thích#*
            image = segments[1];
            description = segments.slice(2).join(' | ');
          }
        } else if (segments.length === 2) {
          const seg1IsUrl = /^(https?:\/\/|data:image|\/)/i.test(segments[1]);
          if (seg1IsUrl) {
            image = segments[1];
            description = '';
          } else {
            description = segments[1];
            image = '';
          }
        }

        return (
          <TooltipKeyword
            key={`custom-${index}`}
            term={term}
            image={image}
            description={description}
          />
        );
      }
    }

    // Standard text outside custom tags
    return <React.Fragment key={`frag-${index}`}>{part}</React.Fragment>;
  });
}

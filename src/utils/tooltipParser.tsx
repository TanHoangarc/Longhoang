import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ZoomIn,
  Maximize2,
  X,
  Image as ImageIcon,
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  ExternalLink,
  Play
} from 'lucide-react';
import { resolveImageFromFirestore } from './firebaseStorage';

interface TooltipKeywordProps {
  key?: React.Key;
  term: string;
  image?: string;
  description?: string;
}

export interface AlbumImageItem {
  url: string;
  caption?: string;
}

interface ArticleImageAlbumProps {
  key?: React.Key;
  images: AlbumImageItem[];
  title?: string;
}

interface YouTubeEmbedBlockProps {
  key?: React.Key;
  urlOrId: string;
  caption?: string;
}

interface InlineImageBlockProps {
  key?: React.Key;
  url: string;
  caption?: string;
}

/**
 * Extracts YouTube 11-character video ID from various YouTube URL formats or raw ID.
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const str = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // watch?v=VIDEO_ID
  const vMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  // youtu.be/VIDEO_ID
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // /shorts/VIDEO_ID, /embed/VIDEO_ID, /v/VIDEO_ID
  const embedMatch = str.match(/\/(?:embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

/**
 * YouTube Embed Player Component
 * Loads and displays YouTube video inline in the article content for direct viewing
 */
export function YouTubeEmbedBlock({ urlOrId, caption }: YouTubeEmbedBlockProps) {
  const videoId = extractYouTubeId(urlOrId);

  if (!videoId) {
    return (
      <div className="my-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center justify-between">
        <span>Đường link YouTube không hợp lệ hoặc không xác định được mã video: <code className="font-mono">{urlOrId}</code></span>
        <a href={urlOrId} target="_blank" rel="noopener noreferrer" className="underline font-bold flex items-center gap-1">
          Mở link <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="my-6 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-900 shadow-md">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center font-bold">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </span>
          <span className="font-bold text-white tracking-wide">Video YouTube</span>
          {caption && <span className="text-slate-400 font-medium truncate max-w-xs sm:max-w-md">• {caption}</span>}
        </div>

        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px] font-semibold"
          title="Mở xem trực tiếp trên YouTube"
        >
          <span>Mở trên YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* 16:9 Responsive Video Stage */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={caption || 'Video YouTube'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* Caption bar */}
      {caption && (
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 text-center text-xs text-slate-300 italic">
          {caption}
        </div>
      )}
    </div>
  );
}

/**
 * Album Carousel Component with Left/Right navigation arrows, thumbnail bar, and lightbox
 * Replaces stacked vertical images with a modern interactive album slider
 */
export function ArticleImageAlbum({ images, title }: ArticleImageAlbumProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = images.length;
  const currentImage = images[currentIndex] || images[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  // Keyboard navigation when Lightbox is active
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;

  // If single image, render with lightbox zoom
  if (total === 1) {
    return (
      <InlineImageBlock
        url={currentImage.url}
        caption={currentImage.caption || title}
      />
    );
  }

  return (
    <>
      <div className="my-6 max-w-3xl mx-auto rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-md">
        {/* Album Header Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold tracking-wide">
              {title || 'Album hình ảnh'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
              {currentIndex + 1} / {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Phóng to toàn màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phóng to</span>
            </button>
          </div>
        </div>

        {/* Main Stage with Left & Right Arrows */}
        <div
          className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden group select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle background ambient blur */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${currentImage.url})` }}
          />

          {/* Current Main Image */}
          <img
            src={currentImage.url}
            alt={currentImage.caption || `Ảnh ${currentIndex + 1}`}
            onClick={() => setIsLightboxOpen(true)}
            referrerPolicy="no-referrer"
            onError={async (e) => {
              const fallback = await resolveImageFromFirestore(currentImage.url);
              if (fallback) {
                (e.target as HTMLImageElement).src = fallback;
              }
            }}
            className="relative z-1 max-w-full max-h-full object-contain cursor-zoom-in transition-all duration-300"
          />

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-lg border border-white/20 active:scale-90 cursor-pointer"
            title="Xem ảnh trước (←)"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-lg border border-white/20 active:scale-90 cursor-pointer"
            title="Xem ảnh kế tiếp (→)"
          >
            <ChevronRight className="w-6 h-6 ml-0.5" />
          </button>

          {/* Floating Caption Overlay on Image */}
          {currentImage.caption && (
            <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-8 text-center text-xs sm:text-sm text-slate-200">
              <p className="max-w-xl mx-auto leading-relaxed drop-shadow">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="px-3 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-400/40 scale-105 opacity-100 z-10'
                    : 'border-slate-800 opacity-55 hover:opacity-100'
                }`}
                title={`Ảnh ${idx + 1}: ${img.caption || ''}`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  onError={async (e) => {
                    const fallback = await resolveImageFromFirestore(img.url);
                    if (fallback) {
                      (e.target as HTMLImageElement).src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-1 bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          >
            {/* Top Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl flex items-center justify-between py-2 text-white"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-100">
                  {title || 'Album hình ảnh'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold">
                  {currentIndex + 1} / {total}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Central Stage with Arrows */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2"
            >
              {/* Left Arrow in Lightbox */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-2xl active:scale-95 cursor-pointer"
                title="Ảnh trước (←)"
              >
                <ChevronLeft className="w-7 h-7 -ml-0.5" />
              </button>

              {/* Lightbox Main Image */}
              <img
                src={currentImage.url}
                alt={currentImage.caption || `Ảnh ${currentIndex + 1}`}
                referrerPolicy="no-referrer"
                onError={async (e) => {
                  const fallback = await resolveImageFromFirestore(currentImage.url);
                  if (fallback) {
                    (e.target as HTMLImageElement).src = fallback;
                  }
                }}
                className="max-h-[75vh] max-w-[88vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />

              {/* Right Arrow in Lightbox */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-2xl active:scale-95 cursor-pointer"
                title="Ảnh tiếp theo (→)"
              >
                <ChevronRight className="w-7 h-7 ml-0.5" />
              </button>
            </div>

            {/* Caption & Navigation Hint */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl text-center py-2 text-slate-300 text-xs sm:text-sm space-y-1"
            >
              {currentImage.caption && (
                <p className="px-4 py-1.5 bg-black/60 rounded-lg inline-block border border-white/10">
                  {currentImage.caption}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Sử dụng mũi tên ◀ ▶ trên màn hình hoặc bàn phím để chuyển ảnh
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Smart Tooltip Keyword Component
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

    const tooltipWidth = Math.min(460, Math.max(280, windowWidth - 28));
    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const left = Math.max(14, Math.min(idealLeft, windowWidth - tooltipWidth - 14));
    const arrowLeft = Math.max(18, Math.min(rect.left + rect.width / 2 - left, tooltipWidth - 18));

    const estimatedHeight = image && !imageError ? 340 : 180;
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
      if (isOpen) calculatePosition();
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
        className="inline cursor-pointer group/tip select-text relative"
      >
        <span className="font-semibold text-[#0048ba] bg-blue-50/70 hover:bg-blue-100/80 px-1.5 py-0.5 rounded-md border-b-2 border-dotted border-[#0048ba]/70 transition-all inline-flex items-center gap-1">
          <span>{term}</span>
          <HelpCircle className="w-3 h-3 text-[#0048ba] inline-block -mt-0.5 opacity-70 group-hover/tip:opacity-100" />
        </span>
      </span>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              top: coords.placement === 'bottom' ? coords.top : 'auto',
              bottom: coords.placement === 'top' ? window.innerHeight - coords.top : 'auto',
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className="bg-white rounded-xl shadow-2xl border border-slate-200/90 text-slate-800 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-[#0048ba] text-white flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm truncate">
                <span className="text-emerald-400">●</span>
                <span>{term}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image Preview */}
            {image && !imageError && (
              <div className="relative w-full h-44 bg-slate-900 overflow-hidden flex items-center justify-center group/img">
                <img
                  src={image}
                  alt={term}
                  onError={async (e) => {
                    const fallback = await resolveImageFromFirestore(image);
                    if (fallback) {
                      (e.target as HTMLImageElement).src = fallback;
                    } else {
                      setImageError(true);
                    }
                  }}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain transition-transform group-hover/img:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 hover:bg-black text-white text-[11px] font-medium rounded-md shadow flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>Phóng to</span>
                </button>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="p-4 overflow-y-auto max-h-44 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {description}
              </div>
            )}
          </div>,
          document.body
        )}

      {/* Fullscreen Lightbox for Tooltip Image */}
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

              <img
                src={image}
                alt={term}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10"
              />

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
  const [currentSrc, setCurrentSrc] = useState(url);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setCurrentSrc(url);
  }, [url]);

  const handleImgError = async (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallback = await resolveImageFromFirestore(url);
    if (fallback) {
      setCurrentSrc(fallback);
      (e.target as HTMLImageElement).src = fallback;
    }
  };

  return (
    <>
      <span className="block my-6">
        <span className="block relative max-w-3xl mx-auto group">
          <img
            src={currentSrc}
            alt={caption || 'Hình ảnh minh họa'}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImgError}
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
                src={currentSrc}
                alt={caption || 'Hình ảnh chi tiết'}
                referrerPolicy="no-referrer"
                onError={handleImgError}
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
 * Helper to parse album syntax:
 * [album|url1,url2,url3|Tiêu đề] OR [album|url1|caption1; url2|caption2]
 */
function parseAlbumContent(rawContent: string): { images: AlbumImageItem[]; title?: string } {
  // Auto-clean: in case user mistakenly nested [img|URL|] tags inside [album|...|Title]
  let normalized = rawContent;
  normalized = normalized.replace(/\[img\|([^|\]]+)(?:\|[^\]]*)?\]/g, '$1');

  const parts = normalized.split('|').map((s) => s.trim());
  const images: AlbumImageItem[] = [];
  let title = '';

  if (parts.length >= 2 && !parts[0].includes(';')) {
    // Format: [album|url1,url2,url3|Tiêu đề album]
    const rawUrls = parts[0]
      .split(',')
      .map((u) => u.trim().replace(/^\[img\|/, '').replace(/\|\]$/, ''))
      .filter((u) => Boolean(u) && u !== '...' && u !== '…');
    title = parts.slice(1).join(' | ');
    rawUrls.forEach((u) => {
      const cleanUrl = u.replace(/[\[\]]/g, '').trim();
      if (cleanUrl) {
        images.push({ url: cleanUrl, caption: title });
      }
    });
  } else {
    // Format: [album|url1|caption1; url2|caption2]
    const entries = normalized.split(';').map((e) => e.trim()).filter(Boolean);
    entries.forEach((entry) => {
      const segs = entry.split('|').map((s) => s.trim());
      if (segs[0]) {
        const cleanUrl = segs[0].replace(/[\[\]]/g, '').trim();
        if (cleanUrl) {
          images.push({ url: cleanUrl, caption: segs[1] || '' });
        }
      }
    });
  }

  return { images, title };
}

/**
 * Parses article text with support for:
 * 1. Album carousel: [album|url1,url2,...|Tiêu đề] or grouped images
 * 2. YouTube videos: [youtube|URL|Tiêu đề] or [video|URL|Tiêu đề] or standalone YouTube URLs
 * 3. Tooltips: *#Từ khóa | Link ảnh | Giải thích#*
 * 4. Inline images: [img|URL|Ghi chú]
 * 5. Bold text: **In đậm**
 * 6. Links: [Tiêu đề](URL)
 */
export function renderTextWithTooltips(text: string) {
  if (!text) return text;

  // Regex pattern matching all formatting tags (supports nested [img|...] in [album|...])
  const combinedPattern = /(\*\#.*?\#\*|\*\*.*?\*\*|\[album\|(?:\[img\|[^\]]*\]|[^\]])*\]|\[youtube\|.*?\]|\[video\|.*?\]|\[img\|.*?\]|\[.*?\]\(.*?\))/g;
  const parts = text.split(combinedPattern);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // 1. Album: [album|...]
      if (part.startsWith('[album|') && part.endsWith(']')) {
        const content = part.slice(7, -1).trim();
        const { images, title } = parseAlbumContent(content);
        return <ArticleImageAlbum key={`album-${index}`} images={images} title={title} />;
      }

      // 2. YouTube Video: [youtube|URL|Tiêu đề] or [video|URL|Tiêu đề]
      if (
        (part.startsWith('[youtube|') || part.startsWith('[video|')) &&
        part.endsWith(']')
      ) {
        const prefixLen = part.startsWith('[youtube|') ? 9 : 7;
        const content = part.slice(prefixLen, -1).trim();
        const segments = content.split('|').map((s) => s.trim());
        const urlOrId = segments[0] || '';
        const caption = segments.slice(1).join(' | ');
        return <YouTubeEmbedBlock key={`yt-${index}`} urlOrId={urlOrId} caption={caption} />;
      }

      // 3. Bold text: **văn bản**
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return (
          <strong key={`bold-${index}`} className="font-bold text-slate-900">
            {content}
          </strong>
        );
      }

      // 4. Inline Image: [img|URL|Ghi chú]
      if (part.startsWith('[img|') && part.endsWith(']')) {
        const content = part.slice(5, -1).trim();
        const segments = content.split('|').map((s) => s.trim());
        const url = segments[0] || '';
        const caption = segments.slice(1).join(' | ');
        return <InlineImageBlock key={`img-${index}`} url={url} caption={caption} />;
      }

      // 5. Links: [text](url)
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const textMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (textMatch && urlMatch) {
          const linkText = textMatch[1];
          const linkUrl = urlMatch[1];

          // Check if YouTube link wrapped in markdown
          const ytId = extractYouTubeId(linkUrl);
          if (ytId && (linkText.toLowerCase().includes('video') || linkText.toLowerCase().includes('youtube'))) {
            return <YouTubeEmbedBlock key={`yt-md-${index}`} urlOrId={linkUrl} caption={linkText} />;
          }

          // Check if this is an assigned internal article link
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

      // 6. Tooltips: *#Từ khóa | Link ảnh | Giải thích#*
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
            description = segments[1];
            image = segments.slice(2).join(' | ');
          } else {
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

    // Check for standalone YouTube URL in ordinary text blocks
    const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}[^\s<>"']*)/gi;
    if (ytRegex.test(part)) {
      const subParts = part.split(ytRegex);
      return subParts.map((sub, sIdx) => {
        if (extractYouTubeId(sub)) {
          return <YouTubeEmbedBlock key={`sub-yt-${index}-${sIdx}`} urlOrId={sub} />;
        }
        return <React.Fragment key={`sub-frag-${index}-${sIdx}`}>{sub}</React.Fragment>;
      });
    }

    // Standard text outside custom tags
    return <React.Fragment key={`frag-${index}`}>{part}</React.Fragment>;
  });
}

/**
 * Smart paragraph renderer for article detail page.
 * Groups consecutive paragraphs that contain images into an Album Carousel with Left/Right arrows!
 */
export function renderArticleParagraphs(paragraphs: string[]): React.ReactNode[] {
  if (!paragraphs || paragraphs.length === 0) return [];

  const nodes: React.ReactNode[] = [];
  let pendingImages: AlbumImageItem[] = [];

  const flushPendingImages = (keyPrefix: string) => {
    if (pendingImages.length === 0) return;

    if (pendingImages.length === 1) {
      nodes.push(
        <InlineImageBlock
          key={`flush-single-${keyPrefix}`}
          url={pendingImages[0].url}
          caption={pendingImages[0].caption}
        />
      );
    } else {
      nodes.push(
        <ArticleImageAlbum
          key={`flush-album-${keyPrefix}`}
          images={[...pendingImages]}
          title="Album hình ảnh chi tiết"
        />
      );
    }
    pendingImages = [];
  };

  paragraphs.forEach((p, idx) => {
    const trimmed = p.trim();

    // 1. Check if paragraph is purely one or multiple [img|...] tags
    const imgMatches = Array.from(trimmed.matchAll(/\[img\|(.*?)\]/g));
    const nonImgText = trimmed.replace(/\[img\|(.*?)\]/g, '').trim();

    if (imgMatches.length > 0 && nonImgText.length === 0) {
      // Collect images into pending album
      imgMatches.forEach((m) => {
        const parts = m[1].split('|').map((s) => s.trim());
        const url = parts[0] || '';
        const caption = parts.slice(1).join(' | ');
        if (url) {
          pendingImages.push({ url, caption });
        }
      });
      return;
    }

    // If there were pending images collected before this non-image paragraph, flush them as Album!
    flushPendingImages(`p-${idx}`);

    // 2. Heading
    if (trimmed.startsWith('##')) {
      const headingText = trimmed.replace(/^##+\s*/, '');
      nodes.push(
        <h3
          key={`h-${idx}`}
          className="text-base sm:text-lg font-bold text-[#0048ba] mt-6 mb-2 pt-2 border-b border-blue-100/70 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-[#0048ba] rounded-full inline-block shrink-0"></span>
          <span className="text-[#0048ba]">{renderTextWithTooltips(headingText)}</span>
        </h3>
      );
      return;
    }

    // 3. Bullet list lines
    if (
      trimmed.startsWith('* ') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('• ') ||
      trimmed.includes('\n* ') ||
      trimmed.includes('\n- ') ||
      trimmed.includes('\n• ')
    ) {
      const lines = p.split('\n');
      nodes.push(
        <ul key={`ul-${idx}`} className="space-y-2 my-3 pl-1 sm:pl-2">
          {lines.map((line, lIdx) => {
            const lTrimmed = line.trim();
            if (/^[-*•]\s+/.test(lTrimmed)) {
              const bulletText = lTrimmed.replace(/^[-*•]\s+/, '');
              return (
                <li
                  key={lIdx}
                  className="flex items-start gap-2.5 text-slate-700 leading-relaxed text-justify"
                >
                  <span className="text-[#0048ba] font-bold select-none text-base leading-none mt-1 shrink-0">
                    •
                  </span>
                  <span className="flex-1">{renderTextWithTooltips(bulletText)}</span>
                </li>
              );
            }
            if (lTrimmed.length === 0) return null;
            return (
              <li
                key={lIdx}
                className="text-slate-700 leading-relaxed list-none text-justify"
              >
                {renderTextWithTooltips(line)}
              </li>
            );
          })}
        </ul>
      );
      return;
    }

    // 4. Regular paragraph
    nodes.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderTextWithTooltips(p)}
      </p>
    );
  });

  // Flush any trailing pending images at the end of paragraphs
  flushPendingImages('final');

  return nodes;
}

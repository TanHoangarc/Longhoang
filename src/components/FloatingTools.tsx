import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageCircle, FileText, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingToolsProps {
  onRequestQuote: () => void;
}

export const FloatingTools: React.FC<FloatingToolsProps> = ({ onRequestQuote }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 220) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth gliding scroll to top with custom cubic-bezier easing
  const smoothScrollToTop = () => {
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (startPosition === 0 || isScrolling) return;

    setIsScrolling(true);
    // Dynamic smooth duration between 650ms and 950ms depending on scroll distance
    const duration = Math.min(Math.max(Math.abs(startPosition) * 0.35, 650), 950);
    const startTime = performance.now();

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition * (1 - easedProgress));

      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

  return (
    <>
      {/* Floating Scroll to Top Button matching exactly the uploaded screenshot */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="btn-scroll-to-top"
            onClick={smoothScrollToTop}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ 
              y: -4, 
              scale: 1.06, 
              backgroundColor: '#bccde0',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)' 
            }}
            whileTap={{ scale: 0.92, y: 0 }}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-[14px] bg-[#cad8e6]/95 hover:bg-[#b8cbdf] text-[#1c2e4a] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-white/60 backdrop-blur-md cursor-pointer transition-colors group"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            {/* Subtle animated Chevron icon */}
            <motion.div
              animate={isScrolling ? { y: [-2, -8, -2], opacity: [1, 0.5, 1] } : { y: [0, -3, 0] }}
              transition={
                isScrolling 
                  ? { repeat: Infinity, duration: 0.45, ease: 'easeInOut' }
                  : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
              }
            >
              <ChevronUp className="w-5 h-5 text-[#1e2e4a] stroke-[2.75] group-hover:text-[#0048ba] transition-colors" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Right Edge Quick Action Strip */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-1.5 shadow-xl">
        {/* Hotline */}
        <a
          href="tel:02873032677"
          className="flex items-center gap-2 px-3 py-2 bg-[#1544a0] hover:bg-[#0f3277] text-white rounded-l-md text-xs font-bold transition-all hover:translate-x-[-4px]"
          title="Hotline 24/7 (028 7303 2677)"
        >
          <PhoneCall className="w-4 h-4 text-amber-400" />
          <span className="hidden xl:inline">028 7303 2677</span>
        </a>

        {/* Zalo */}
        <a
          href="https://zalo.me/0867141877"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-[#0068FF] hover:bg-[#0052cc] text-white rounded-l-md text-xs font-bold transition-all hover:translate-x-[-4px]"
          title="Chat Zalo (0867 141 877)"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden xl:inline">Zalo Chat</span>
        </a>

        {/* Quick Quote */}
        <button
          onClick={onRequestQuote}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-l-md text-xs font-bold transition-all hover:translate-x-[-4px] cursor-pointer"
          title="Yêu cầu báo giá"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden xl:inline">Báo giá</span>
        </button>
      </div>
    </>
  );
};


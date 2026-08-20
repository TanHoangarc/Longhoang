import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import { HERO_SLIDES } from '../data/mockData';

interface HeroSliderProps {
  onScrollToContent: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onScrollToContent }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <section
      id="home"
      className="relative w-full h-screen min-h-[620px] max-h-[1080px] overflow-hidden bg-slate-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Backgrounds */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background image with optimized dark maritime overlay */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />

            {/* Gradient overlays matching realistic logistics tone in screenshots */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/50" />
            <div className="absolute inset-0 bg-blue-950/20 mix-blend-multiply" />

            {/* Slide Content */}
            <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-center">
              <div className="max-w-3xl pt-16 sm:pt-20">
                {/* Top Category Tag / Header */}
                <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wider mb-1 drop-shadow-md">
                  {slide.titleTop}
                </p>

                {/* Main Hero Headline */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                  {slide.titleMain}
                </h1>

                {/* Description Subtitle matching exact screenshots */}
                <p className="text-base sm:text-lg md:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl drop-shadow">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Left Slider Arrow Button `<` */}
      <button
        id="hero-slider-prev"
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 transition-all focus:outline-none"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>

      {/* Right Slider Arrow Button `>` */}
      <button
        id="hero-slider-next"
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/30 transition-all focus:outline-none"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
      </button>

      {/* Bottom Center Scroll-Down Button with Square Box & Arrow Down `↓` as shown in screenshots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <button
          id="btn-scroll-down-hero"
          onClick={onScrollToContent}
          className="w-8 h-8 sm:w-9 sm:h-9 border border-white/80 hover:border-amber-400 bg-black/30 hover:bg-black/50 text-white hover:text-amber-400 flex items-center justify-center rounded-xs transition-all duration-300 hover:scale-110 cursor-pointer shadow-lg group backdrop-blur-xs"
          title="Cuộn xuống để xem thêm"
        >
          <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1 animate-slow-bounce" />
        </button>

        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-2 mt-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

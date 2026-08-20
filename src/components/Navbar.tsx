import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Phone, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { LongHoangLogo } from './LongHoangLogo';
import { Language } from '../types';

interface NavbarProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenSearch: () => void;
  onOpenNews: () => void;
  onOpenNewsCategory?: (type: 'industry-news' | 'industry-knowledge' | 'company-news') => void;
  onOpenCareers: () => void;
  onOpenAboutUs?: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenVisionMission?: () => void;
  onOpenTrackTrace?: () => void;
  onOpenServiceDetail?: (serviceId: string) => void;
  onNavigateHome?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  currentView?: 'home' | 'service-detail' | 'news-list' | 'news-detail' | 'careers-list' | 'careers-detail' | 'about-us' | 'company-profile';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  onOpenSearch,
  onOpenNews,
  onOpenNewsCategory,
  onOpenCareers,
  onOpenAboutUs,
  onOpenCompanyProfile,
  onOpenVisionMission,
  onOpenTrackTrace,
  onOpenServiceDetail,
  onNavigateHome,
  onNavigateToSection,
  currentView = 'home',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(true);
  const [mobileNewsExpanded, setMobileNewsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentView === 'home') {
        const sections = ['home', 'about', 'services', 'why-us', 'contact'];
        const scrollPos = window.scrollY + 200;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      if (onNavigateToSection) {
        onNavigateToSection(id);
      } else if (onNavigateHome) {
        onNavigateHome();
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            const navHeight = 70;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      }
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const navHeight = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectServiceFromMenu = (serviceId: string) => {
    setMobileMenuOpen(false);
    if (onOpenServiceDetail) {
      onOpenServiceDetail(serviceId);
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || currentView === 'service-detail'
          ? 'bg-slate-950/95 backdrop-blur-md shadow-xl border-b border-white/10 py-2.5'
          : 'bg-gradient-to-b from-black/85 via-black/45 to-transparent py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button on Left for Mobile */}
          <div className="flex lg:hidden items-center">
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* DESKTOP: Left Navigation Group (TRANG CHỦ, GIỚI THIỆU, DỊCH VỤ [with Dropdown], TIN TỨC) */}
          <nav className="hidden lg:flex items-center justify-end flex-1 gap-1 xl:gap-2 pr-4 xl:pr-6">
            {/* TRANG CHỦ */}
            <button
              id="nav-btn-home"
              onClick={() => scrollToSection('home')}
              className={`px-3.5 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-all rounded-sm border ${
                activeSection === 'home' && currentView === 'home'
                  ? 'border-white text-white bg-white/15 shadow-sm font-black'
                  : 'border-transparent text-slate-100 hover:text-white hover:border-white/50'
              }`}
            >
              TRANG CHỦ
            </button>

            {/* GIỚI THIỆU WITH EXPANDED DROPDOWN MENU */}
            <div className="relative group">
              <button
                id="nav-btn-about"
                onClick={() => {
                  if (onOpenAboutUs) {
                    onOpenAboutUs();
                  } else {
                    scrollToSection('about');
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-colors ${
                  (activeSection === 'about' && currentView === 'home') || currentView === 'about-us' || currentView === 'company-profile'
                    ? 'text-amber-400 font-black'
                    : 'text-slate-100 hover:text-white'
                }`}
              >
                <span>GIỚI THIỆU</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-300" />
              </button>

              {/* Dropdown Menu Container for GIỚI THIỆU */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-slate-900/98 backdrop-blur-xl rounded-xl border border-white/15 shadow-2xl overflow-hidden py-2 text-left text-slate-200 divide-y divide-white/10">
                  <div className="px-3 py-1">
                    {/* 1. Về chúng tôi */}
                    <button
                      onClick={() => {
                        if (onOpenAboutUs) onOpenAboutUs();
                      }}
                      className="block w-full text-left py-2 px-3 text-xs font-bold text-slate-100 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Về chúng tôi
                    </button>

                    {/* 2. Company profile */}
                    <button
                      onClick={() => {
                        if (onOpenCompanyProfile) onOpenCompanyProfile();
                      }}
                      className="block w-full text-left py-2 px-3 text-xs font-bold text-slate-100 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Company profile
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* DỊCH VỤ WITH EXPANDED DROPDOWN MENU */}
            <div className="relative group">
              <button
                id="nav-btn-services"
                onClick={() => scrollToSection('services')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-colors ${
                  (activeSection === 'services' && currentView === 'home') || currentView === 'service-detail'
                    ? 'text-amber-400 font-black'
                    : 'text-slate-100 hover:text-white'
                }`}
              >
                <span>DỊCH VỤ</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-300" />
              </button>

              {/* Dropdown Menu Container */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 w-72 sm:w-80 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-slate-900/98 backdrop-blur-xl rounded-xl border border-white/15 shadow-2xl overflow-hidden py-2 text-left text-slate-200 divide-y divide-white/10">
                  {/* 1. Dịch vụ vận tải quốc tế (with sub-services) */}
                  <div className="px-4 py-2.5 space-y-1.5">
                    <button
                      onClick={() => handleSelectServiceFromMenu('sea-freight')}
                      className="text-xs font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300 transition-colors flex items-center justify-between w-full text-left"
                    >
                      <span>Dịch vụ vận tải quốc tế</span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400/70" />
                    </button>
                    <div className="pl-2 space-y-1 border-l border-white/15 mt-1">
                      <button
                        onClick={() => handleSelectServiceFromMenu('sea-freight')}
                        className="block w-full text-left py-1 text-xs text-slate-300 hover:text-amber-300 hover:translate-x-1 transition-all"
                      >
                        • Dịch vụ Vận tải đường biển
                      </button>
                      <button
                        onClick={() => handleSelectServiceFromMenu('air-freight')}
                        className="block w-full text-left py-1 text-xs text-slate-300 hover:text-amber-300 hover:translate-x-1 transition-all"
                      >
                        • Dịch vụ vận tải hàng không
                      </button>
                      <button
                        onClick={() => handleSelectServiceFromMenu('multimodal')}
                        className="block w-full text-left py-1 text-xs text-slate-300 hover:text-amber-300 hover:translate-x-1 transition-all"
                      >
                        • Dịch vụ vận tải đa phương thức
                      </button>
                    </div>
                  </div>

                  {/* 2. Dịch vụ Vận tải nội địa */}
                  <div className="px-4 py-2.5">
                    <button
                      onClick={() => handleSelectServiceFromMenu('inland-trucking')}
                      className="block w-full text-left text-xs font-bold text-slate-100 hover:text-amber-400 uppercase tracking-wider transition-colors"
                    >
                      Dịch vụ Vận tải nội địa
                    </button>
                  </div>

                  {/* 3. Dịch vụ Logistics bổ trợ */}
                  <div className="px-4 py-2.5">
                    <button
                      onClick={() => handleSelectServiceFromMenu('value-added')}
                      className="block w-full text-left text-xs font-bold text-slate-100 hover:text-amber-400 uppercase tracking-wider transition-colors"
                    >
                      Dịch vụ Logistics bổ trợ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TIN TỨC WITH EXPANDED DROPDOWN MENU */}
            <div className="relative group">
              <button
                id="nav-btn-news"
                onClick={() => {
                  if (onOpenNewsCategory) {
                    onOpenNewsCategory('industry-news');
                  } else {
                    onOpenNews();
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-colors ${
                  currentView === 'news-list' || currentView === 'news-detail'
                    ? 'text-amber-400 font-black'
                    : 'text-slate-100 hover:text-white'
                }`}
              >
                <span>TIN TỨC</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-300" />
              </button>

              {/* Dropdown Menu Container */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <div className="bg-slate-900/98 backdrop-blur-xl rounded-xl border border-white/15 shadow-2xl overflow-hidden py-2 text-left text-slate-200 divide-y divide-white/10">
                  <div className="px-3 py-1">
                    <button
                      onClick={() => {
                        if (onOpenNewsCategory) {
                          onOpenNewsCategory('industry-news');
                        } else {
                          onOpenNews();
                        }
                      }}
                      className="block w-full text-left py-2 px-3 text-xs font-bold text-slate-100 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Tin tức chuyên ngành
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenNewsCategory) {
                          onOpenNewsCategory('industry-knowledge');
                        } else {
                          onOpenNews();
                        }
                      }}
                      className="block w-full text-left py-2 px-3 text-xs font-bold text-slate-100 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Kiến thức chuyên ngành
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenNewsCategory) {
                          onOpenNewsCategory('company-news');
                        } else {
                          onOpenNews();
                        }
                      }}
                      className="block w-full text-left py-2 px-3 text-xs font-bold text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
                    >
                      Tin tức công ty
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* CENTER: LOGO (Prominent in the middle) */}
          <div className="flex-shrink-0 flex items-center justify-center px-2 sm:px-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="flex items-center justify-center group focus:outline-none transition-transform hover:scale-105"
              title="Long Hoàng Logistics"
            >
              <img
                src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png"
                alt="Long Hoàng Logistics"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </a>
          </div>

          {/* DESKTOP: Right Navigation Group (TUYỂN DỤNG, LIÊN HỆ, Flags, Search) */}
          <div className="hidden lg:flex items-center justify-start flex-1 gap-1 xl:gap-2 pl-4 xl:pl-6">
            <nav className="flex items-center gap-1 xl:gap-2">
              <button
                id="nav-btn-careers"
                onClick={onOpenCareers}
                className={`px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-all rounded ${
                  currentView === 'careers-list' || currentView === 'careers-detail'
                    ? 'text-white border-2 border-white/90 bg-white/10 shadow-xs'
                    : 'text-slate-100 hover:text-white hover:border hover:border-white/40'
                }`}
              >
                TUYỂN DỤNG
              </button>

              <button
                id="nav-btn-contact"
                onClick={() => scrollToSection('contact')}
                className={`px-3 py-1.5 text-xs xl:text-[13px] font-bold tracking-wider uppercase transition-colors ${
                  activeSection === 'contact' && currentView === 'home'
                    ? 'text-amber-400 font-black'
                    : 'text-slate-100 hover:text-white'
                }`}
              >
                LIÊN HỆ
              </button>
            </nav>

            {/* Language Switcher Flags & Quick Tools */}
            <div className="flex items-center gap-2.5 ml-2 xl:ml-3 pl-2 xl:pl-3 border-l border-white/20">
              {/* Language Switcher Flags matching screenshot: 🇻🇳, 🇬🇧, 🇨🇳 */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-full border border-white/15">
                {/* Vietnam */}
                <button
                  id="lang-btn-vi"
                  onClick={() => onSelectLang('vi')}
                  className={`transition-transform hover:scale-110 focus:outline-none rounded-xs overflow-hidden ${
                    currentLang === 'vi' ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Tiếng Việt"
                >
                  <svg className="w-4 h-3 sm:w-5 sm:h-3.5" viewBox="0 0 30 20">
                    <rect width="30" height="20" fill="#DA251D" />
                    <polygon
                      points="15,4 16.5,8.5 21.2,8.5 17.4,11.3 18.8,15.8 15,13 11.2,15.8 12.6,11.3 8.8,8.5 13.5,8.5"
                      fill="#FFFF00"
                    />
                  </svg>
                </button>

                {/* UK / English */}
                <button
                  id="lang-btn-en"
                  onClick={() => onSelectLang('en')}
                  className={`transition-transform hover:scale-110 focus:outline-none rounded-xs overflow-hidden ${
                    currentLang === 'en' ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  title="English"
                >
                  <svg className="w-4 h-3 sm:w-5 sm:h-3.5" viewBox="0 0 60 30">
                    <clipPath id="s-desk">
                      <path d="M0,0 v30 h60 v-30 z" />
                    </clipPath>
                    <clipPath id="t-desk">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
                    </clipPath>
                    <g clipPath="url(#s-desk)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t-desk)" stroke="#C8102E" strokeWidth="4" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                    </g>
                  </svg>
                </button>

                {/* China */}
                <button
                  id="lang-btn-zh"
                  onClick={() => onSelectLang('zh')}
                  className={`transition-transform hover:scale-110 focus:outline-none rounded-xs overflow-hidden ${
                    currentLang === 'zh' ? 'ring-2 ring-amber-400 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                  title="中文"
                >
                  <svg className="w-4 h-3 sm:w-5 sm:h-3.5" viewBox="0 0 30 20">
                    <rect width="30" height="20" fill="#DE2910" />
                    <polygon
                      points="5,3 5.9,5.8 8.8,5.8 6.5,7.5 7.4,10.3 5,8.6 2.6,10.3 3.5,7.5 1.2,5.8 4.1,5.8"
                      fill="#FFDE00"
                    />
                    <polygon points="10,2 10.3,3 11.2,3 10.5,3.5 10.8,4.5 10,3.9 9.2,4.5 9.5,3.5 8.8,3 9.7,3" fill="#FFDE00" />
                    <polygon points="12,4 12.3,5 13.2,5 12.5,5.5 12.8,6.5 12,5.9 11.2,6.5 11.5,5.5 10.8,5 11.7,5" fill="#FFDE00" />
                    <polygon points="12,7 12.3,8 13.2,8 12.5,8.5 12.8,9.5 12,8.9 11.2,9.5 11.5,8.5 10.8,8 11.7,8" fill="#FFDE00" />
                    <polygon points="10,9 10.3,10 11.2,10 10.5,10.5 10.8,11.5 10,10.9 9.2,11.5 9.5,10.5 8.8,10 9.7,10" fill="#FFDE00" />
                  </svg>
                </button>
              </div>

              {/* Search Icon */}
              <button
                id="btn-nav-search"
                onClick={onOpenSearch}
                className="text-white hover:text-amber-400 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MOBILE: Right Tools (Search & Flags) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Flags */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/30 rounded-full border border-white/10">
              <button
                onClick={() => onSelectLang('vi')}
                className={`p-0.5 ${currentLang === 'vi' ? 'opacity-100 scale-110' : 'opacity-70'}`}
              >
                <span className="text-sm">🇻🇳</span>
              </button>
              <button
                onClick={() => onSelectLang('en')}
                className={`p-0.5 ${currentLang === 'en' ? 'opacity-100 scale-110' : 'opacity-70'}`}
              >
                <span className="text-sm">🇬🇧</span>
              </button>
            </div>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="text-white p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 px-6 py-6 shadow-2xl animate-fadeIn">
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => scrollToSection('home')}
              className="text-left py-2 px-3 rounded text-sm font-bold text-white bg-blue-900/50 uppercase"
            >
              TRANG CHỦ
            </button>
            {/* GIỚI THIỆU with Accordion on Mobile */}
            <div className="bg-slate-800/60 rounded-lg p-2 border border-white/10">
              <button
                onClick={() => setMobileAboutExpanded(!mobileAboutExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-sm font-bold text-amber-400 uppercase"
              >
                <span>GIỚI THIỆU</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAboutExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileAboutExpanded && (
                <div className="pl-3 pr-1 pt-2 space-y-1.5 border-t border-white/10 mt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAboutUs) onOpenAboutUs();
                    }}
                    className="block w-full text-left py-1.5 text-xs font-bold text-slate-100 hover:text-amber-300"
                  >
                    • Về chúng tôi
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenCompanyProfile) onOpenCompanyProfile();
                    }}
                    className="block w-full text-left py-1.5 text-xs font-bold text-slate-100 hover:text-amber-300"
                  >
                    • Company profile
                  </button>
                </div>
              )}
            </div>

            {/* DỊCH VỤ with Accordion on Mobile */}
            <div className="bg-slate-800/60 rounded-lg p-2 border border-white/10">
              <button
                onClick={() => setMobileServicesExpanded(!mobileServicesExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-sm font-bold text-amber-400 uppercase"
              >
                <span>DỊCH VỤ</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileServicesExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileServicesExpanded && (
                <div className="pl-3 pr-1 pt-2 space-y-2 border-t border-white/10 mt-1">
                  {/* Quốc tế */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase block mb-1">
                      1. Vận tải quốc tế:
                    </span>
                    <div className="pl-2 space-y-1">
                      <button
                        onClick={() => handleSelectServiceFromMenu('sea-freight')}
                        className="block w-full text-left py-1 text-xs text-slate-200 hover:text-amber-300"
                      >
                        • Vận tải đường biển
                      </button>
                      <button
                        onClick={() => handleSelectServiceFromMenu('air-freight')}
                        className="block w-full text-left py-1 text-xs text-slate-200 hover:text-amber-300"
                      >
                        • Vận tải hàng không
                      </button>
                      <button
                        onClick={() => handleSelectServiceFromMenu('multimodal')}
                        className="block w-full text-left py-1 text-xs text-slate-200 hover:text-amber-300"
                      >
                        • Vận tải đa phương thức
                      </button>
                    </div>
                  </div>

                  {/* Nội địa */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleSelectServiceFromMenu('inland-trucking')}
                      className="block w-full text-left py-1 text-xs font-bold text-slate-200 hover:text-amber-300 uppercase"
                    >
                      2. Vận tải nội địa
                    </button>
                  </div>

                  {/* Logistics bổ trợ */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleSelectServiceFromMenu('value-added')}
                      className="block w-full text-left py-1 text-xs font-bold text-slate-200 hover:text-amber-300 uppercase"
                    >
                      3. Dịch vụ Logistics bổ trợ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TIN TỨC with Accordion on Mobile */}
            <div className="bg-slate-800/60 rounded-lg p-2 border border-white/10">
              <button
                onClick={() => setMobileNewsExpanded(!mobileNewsExpanded)}
                className="w-full flex items-center justify-between py-1.5 px-2 text-sm font-bold text-amber-400 uppercase"
              >
                <span>TIN TỨC</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileNewsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileNewsExpanded && (
                <div className="pl-3 pr-1 pt-2 space-y-1.5 border-t border-white/10 mt-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenNewsCategory) onOpenNewsCategory('industry-news');
                      else onOpenNews();
                    }}
                    className="block w-full text-left py-1 text-xs text-slate-200 hover:text-amber-300"
                  >
                    • Tin tức chuyên ngành
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenNewsCategory) onOpenNewsCategory('industry-knowledge');
                      else onOpenNews();
                    }}
                    className="block w-full text-left py-1 text-xs text-slate-200 hover:text-amber-300"
                  >
                    • Kiến thức chuyên ngành
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenNewsCategory) onOpenNewsCategory('company-news');
                      else onOpenNews();
                    }}
                    className="block w-full text-left py-1 text-xs text-slate-300 hover:text-amber-300"
                  >
                    • Tin tức công ty
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCareers();
              }}
              className="text-left py-2 px-3 rounded text-sm font-bold text-slate-200 hover:text-white uppercase"
            >
              TUYỂN DỤNG
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 px-3 rounded text-sm font-bold text-slate-200 hover:text-white uppercase"
            >
              LIÊN HỆ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

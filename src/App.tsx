import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { AboutSection } from './components/AboutSection';
import { AboutUsPage } from './components/AboutUsPage';
import { CompanyProfilePage } from './components/CompanyProfilePage';
import { ServicesSection } from './components/ServicesSection';
import { ServiceModal } from './components/ServiceModal';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { NewsListPage } from './components/NewsListPage';
import { NewsDetailPage } from './components/NewsDetailPage';
import { CareersListPage } from './components/CareersListPage';
import { CareersDetailPage } from './components/CareersDetailPage';
import { ConsoleDashboard } from './components/ConsoleDashboard';
import { WhyAndContactSection } from './components/WhyAndContactSection';
import { PartnersCarousel } from './components/PartnersCarousel';
import { Footer } from './components/Footer';
import { FloatingTools } from './components/FloatingTools';
import { SearchModal } from './components/SearchModal';
import { NewsModal } from './components/NewsModal';
import { Language, ServiceItem } from './types';
import { SERVICES_LIST } from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'service-detail' | 'news-list' | 'news-detail' | 'careers-list' | 'careers-detail' | 'about-us' | 'company-profile' | 'console'>('home');
  const [activeServiceId, setActiveServiceId] = useState<string>('sea-freight');
  const [activeNewsCategory, setActiveNewsCategory] = useState<'industry-news' | 'industry-knowledge' | 'company-news' | 'all'>('industry-news');
  const [activeArticleId, setActiveArticleId] = useState<string>('lh-race-2026');
  const [activeJobId, setActiveJobId] = useState<string>('tuyen-dung-co-hoi-nghe-nghiep');
  const [currentLang, setCurrentLang] = useState<Language>('vi');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [newsInitialTab, setNewsInitialTab] = useState<'news' | 'careers'>('news');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [prefilledQuoteService, setPrefilledQuoteService] = useState<string>('');

  // Check URL pathname or hash for /console routing
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/console') || hash.includes('/console') || hash.includes('console')) {
        setCurrentView('console');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        performScroll(sectionId);
      }, 100);
    } else {
      performScroll(sectionId);
    }
  };

  const performScroll = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navHeight = 75;
      const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 800;
      let start: number | null = null;

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const handleOpenAboutUs = () => {
    setCurrentView('about-us');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCompanyProfile = () => {
    setCurrentView('company-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenVisionMission = () => {
    setCurrentView('about-us');
    setTimeout(() => {
      const el = document.getElementById('vision-mission');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleOpenServiceDetail = (serviceId: string) => {
    setActiveServiceId(serviceId);
    setCurrentView('service-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewsCategory = (type: 'industry-news' | 'industry-knowledge' | 'company-news') => {
    setActiveNewsCategory(type);
    setCurrentView('news-list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArticle = (articleId: string) => {
    setActiveArticleId(articleId);
    setCurrentView('news-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCareers = () => {
    setCurrentView('careers-list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenJobDetail = (jobId: string) => {
    setActiveJobId(jobId);
    setCurrentView('careers-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConsole = () => {
    setCurrentView('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', '/console');
    } catch {
      window.location.hash = '#/console';
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      if (window.location.pathname.includes('/console')) {
        window.history.pushState(null, '', '/');
      }
    } catch {
      // ignore
    }
  };

  const handleOpenNews = () => {
    handleOpenNewsCategory('industry-news');
  };

  const handleRequestQuoteWithService = (serviceTitle: string) => {
    setPrefilledQuoteService(serviceTitle);
    handleScrollToSection('contact');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-[#1544a0] selection:text-white">
      {/* Navigation Header */}
      {currentView !== 'console' && (
        <Navbar
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNews={handleOpenNews}
          onOpenNewsCategory={handleOpenNewsCategory}
          onOpenCareers={handleOpenCareers}
          onOpenAboutUs={handleOpenAboutUs}
          onOpenCompanyProfile={handleOpenCompanyProfile}
          onOpenVisionMission={handleOpenVisionMission}
          onOpenServiceDetail={handleOpenServiceDetail}
          onNavigateHome={handleBackToHome}
          onNavigateToSection={handleScrollToSection}
          currentView={currentView}
        />
      )}

      {/* Main Content Area */}
      {currentView === 'console' && (
        <main className="flex-1">
          <ConsoleDashboard onBackToHome={handleBackToHome} />
        </main>
      )}

      {currentView === 'home' && (
        <main className="flex-1">
          {/* 1. Hero Carousel */}
          <HeroSlider onScrollToContent={() => handleScrollToSection('about')} />

          {/* 2. About Section: "LONG HOÀNG LOGISTICS" - Blue sea never sleeps */}
          <AboutSection onLearnMoreServices={() => handleScrollToSection('services')} />

          {/* 3. Services Section: "DỊCH VỤ" 6 Interactive Cards Grid */}
          <ServicesSection
            onSelectService={(service) => handleOpenServiceDetail(service.id)}
            onRequestQuoteWithService={handleRequestQuoteWithService}
          />

          {/* 4. Two-column Section: "VÌ SAO CHỌN CHÚNG TÔI" & "LIÊN HỆ VỚI CHÚNG TÔI" */}
          <WhyAndContactSection prefilledService={prefilledQuoteService} />

          {/* 5. Associations & Partners Carousel */}
          <PartnersCarousel />
        </main>
      )}

      {currentView === 'service-detail' && (
        <main className="flex-1">
          {/* Detailed Service Page (opens detailed information matching user screenshots) */}
          <ServiceDetailPage
            serviceId={activeServiceId}
            onSelectService={(id) => handleOpenServiceDetail(id)}
            onBackToHome={handleBackToHome}
            onNavigateToSection={handleScrollToSection}
          />
        </main>
      )}

      {currentView === 'news-list' && (
        <main className="flex-1">
          {/* News and Knowledge Listing Page matching Screenshot 1 */}
          <NewsListPage
            categoryType={activeNewsCategory}
            onSelectArticle={handleOpenArticle}
            onBackToHome={handleBackToHome}
            onSelectCategory={(type) => setActiveNewsCategory(type)}
          />
        </main>
      )}

      {currentView === 'news-detail' && (
        <main className="flex-1">
          {/* Single Article Detail Page matching Screenshot 2 & 3 */}
          <NewsDetailPage
            articleId={activeArticleId}
            onSelectArticle={handleOpenArticle}
            onSelectService={handleOpenServiceDetail}
            onBackToHome={handleBackToHome}
            onBackToNewsList={(type) => {
              if (type) setActiveNewsCategory(type);
              setCurrentView('news-list');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      )}

      {currentView === 'careers-list' && (
        <main className="flex-1">
          {/* Careers & Recruitment Listing Page matching Screenshot 1 */}
          <CareersListPage
            onSelectJob={handleOpenJobDetail}
            onBackToHome={handleBackToHome}
          />
        </main>
      )}

      {currentView === 'careers-detail' && (
        <main className="flex-1">
          {/* Careers & Recruitment Detail Page matching Screenshot 2 */}
          <CareersDetailPage
            jobId={activeJobId}
            onSelectJob={handleOpenJobDetail}
            onSelectArticle={handleOpenArticle}
            onBackToHome={handleBackToHome}
            onBackToCareersList={handleOpenCareers}
          />
        </main>
      )}

      {currentView === 'about-us' && (
        <main className="flex-1">
          {/* About Us Page matching Screenshot 1 & 2 */}
          <AboutUsPage
            onBackToHome={handleBackToHome}
            onNavigateToSection={handleScrollToSection}
          />
        </main>
      )}

      {currentView === 'company-profile' && (
        <main className="flex-1">
          {/* Company Profile Page matching Screenshot 3, 4, 5 */}
          <CompanyProfilePage
            onBackToHome={handleBackToHome}
            onSelectService={handleOpenServiceDetail}
          />
        </main>
      )}

      {/* Footer with Offices, Logo, About & DMCA Badge */}
      {currentView !== 'console' && <Footer onOpenConsole={handleOpenConsole} />}

      {/* Floating Tools (Back to Top & Quick Contact) */}
      {currentView !== 'console' && (
        <FloatingTools onRequestQuote={() => handleScrollToSection('contact')} />
      )}

      {/* Modals & Dialogs */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onRequestQuote={handleRequestQuoteWithService}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectService={(service) => {
          handleOpenServiceDetail(service.id);
        }}
        onSelectArticle={handleOpenArticle}
        onSelectJob={handleOpenJobDetail}
      />

      <NewsModal
        isOpen={isNewsOpen}
        initialTab={newsInitialTab}
        onClose={() => setIsNewsOpen(false)}
        onSelectArticle={handleOpenArticle}
        onSelectJob={handleOpenJobDetail}
      />
    </div>
  );
}


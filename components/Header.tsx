import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, ChevronDown, BookOpen, Newspaper } from 'lucide-react';
import { NAV_LINKS } from '../constants';

interface HeaderProps {
  userRole?: any;
  currentUser?: any;
  onLogin?: any;
  onLogout?: any;
  onOpenPage?: (page: string | null) => void;
  users?: any;
  onLoginAttempt?: any;
  onRegister?: any;
  activePage?: string | null;
}

const Header: React.FC<HeaderProps> = ({ activePage, onOpenPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [mobileNewsExpand, setMobileNewsExpand] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, target: string) => {
    e.preventDefault();
    setIsOpen(false);
    setNewsDropdownOpen(false);

    if (target === '#news-dropdown') {
      // Toggle dropdown on mobile
      setMobileNewsExpand(!mobileNewsExpand);
      return;
    }

    if (target === 'news-page' || target === 'knowledge-page') {
      if (onOpenPage) onOpenPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (onOpenPage) onOpenPage(null);
    if (target === '#' || target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMouseEnterNews = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setNewsDropdownOpen(true);
  };

  const handleMouseLeaveNews = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setNewsDropdownOpen(false);
    }, 200);
  };

  const isNewsPageActive = activePage === 'news-page' || activePage === 'knowledge-page';

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-[#1e2a3b] text-white py-2 text-xs border-b border-gray-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-blue-500" />
              <span>028 7303 2677</span>
            </div>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <Mail size={14} className="text-blue-500" />
              <span>info@longhoanglogistics.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <a href="https://www.facebook.com/longhoanglogistics/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition"><Facebook size={14} /></a>
             <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition"><Youtube size={14} /></a>
             <a href="#" className="hover:text-blue-500 transition" onClick={(e) => e.preventDefault()}><Instagram size={14} /></a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
               <a 
                 href="#" 
                 onClick={(e) => handleNavClick(e, '#')}
                 className="flex items-center"
               >
                 <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Long Hoàng Logistics Logo" className="h-12 w-auto object-contain" />
               </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <nav className="flex items-center space-x-6">
                {NAV_LINKS.map((link) => {
                  if (link.name === 'Tin tức') {
                    return (
                      <div 
                        key={link.name} 
                        className="relative group"
                        onMouseEnter={handleMouseEnterNews}
                        onMouseLeave={handleMouseLeaveNews}
                      >
                        <button 
                          onClick={(e) => handleNavClick(e, 'news-page')}
                          className={`font-bold hover:text-blue-600 transition text-xs uppercase tracking-wider flex items-center py-2 ${
                            isNewsPageActive ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        >
                          <span>{link.name}</span>
                          <ChevronDown size={14} className={`ml-1 transition-transform duration-200 ${newsDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {newsDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => handleNavClick(e, 'news-page')}
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center space-x-3 group/item ${
                                activePage === 'news-page' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition">
                                <Newspaper size={15} />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-wider text-gray-900 group-hover/item:text-blue-600">
                                Tin tức chuyên ngành
                              </span>
                            </button>

                            <button
                              onClick={(e) => handleNavClick(e, 'knowledge-page')}
                              className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center space-x-3 group/item mt-1 ${
                                activePage === 'knowledge-page' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover/item:bg-amber-600 group-hover/item:text-white transition">
                                <BookOpen size={15} />
                              </div>
                              <span className="font-bold text-xs uppercase tracking-wider text-gray-900 group-hover/item:text-blue-600">
                                Kiến thức chuyên ngành
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = !isNewsPageActive && activePage === link.href;
                  return (
                    <a 
                      key={link.name} 
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`font-bold hover:text-blue-600 transition text-xs uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                    >
                      {link.name}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-blue-500 p-2">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300 z-40">
          <nav className="flex flex-col p-6 space-y-3">
            {NAV_LINKS.map((link) => {
               if (link.name === 'Tin tức') {
                 return (
                   <div key={link.name} className="border-b border-gray-50 pb-2">
                     <button
                       onClick={() => setMobileNewsExpand(!mobileNewsExpand)}
                       className="w-full flex items-center justify-between font-bold text-gray-700 py-2 hover:text-blue-600"
                     >
                       <span>{link.name}</span>
                       <ChevronDown size={16} className={`transform transition-transform ${mobileNewsExpand ? 'rotate-180 text-blue-600' : ''}`} />
                     </button>
                     
                     {mobileNewsExpand && (
                       <div className="pl-4 mt-2 space-y-2 pb-2">
                         <button
                           onClick={(e) => handleNavClick(e, 'news-page')}
                           className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center space-x-2 ${
                             activePage === 'news-page' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                           }`}
                         >
                           <Newspaper size={14} className="text-blue-600" />
                           <span>Tin tức chuyên ngành</span>
                         </button>
                         <button
                           onClick={(e) => handleNavClick(e, 'knowledge-page')}
                           className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center space-x-2 ${
                             activePage === 'knowledge-page' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                           }`}
                         >
                           <BookOpen size={14} className="text-amber-600" />
                           <span>Kiến thức chuyên ngành</span>
                         </button>
                       </div>
                     )}
                   </div>
                 );
               }

               const isActive = !isNewsPageActive && activePage === link.href;
               return (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-bold hover:text-blue-600 py-2 border-b border-gray-50 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                  >
                    {link.name}
                  </a>
               );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

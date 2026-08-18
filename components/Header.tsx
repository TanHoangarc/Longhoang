import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram } from 'lucide-react';
import { NAV_LINKS } from '../constants';

interface HeaderProps {
  userRole?: any;
  currentUser?: any;
  onLogin?: any;
  onLogout?: any;
  onOpenPage?: any;
  users?: any;
  onLoginAttempt?: any;
  onRegister?: any;
  activePage?: string | null;
}

const Header: React.FC<HeaderProps> = ({ activePage, onOpenPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setIsOpen(false);
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
                 <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Long Hoang Logistics Logo" className="h-12 w-auto object-contain" />
               </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <nav className="flex items-center space-x-6">
                {NAV_LINKS.map((link) => {
                  const isActive = activePage === link.href;
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
          <nav className="flex flex-col p-6 space-y-4">
            {NAV_LINKS.map((link) => {
               const isActive = activePage === link.href;
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

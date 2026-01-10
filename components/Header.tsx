import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, User, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole } from '../App';

interface HeaderProps {
  userRole: UserRole;
  onLogin: (role: UserRole) => void;
  onLogout: () => void;
  onOpenPage: (page: 'finance' | 'company' | 'settings' | null) => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogin, onLogout, onOpenPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (target === '#' || target === 'home') {
      onOpenPage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['finance', 'company', 'settings'].includes(target)) {
      onOpenPage(target as any);
    } else {
      onOpenPage(null);
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Filter links based on role
  const filteredLinks = NAV_LINKS.filter(link => {
    // Hidden by default: Finance, Company, Settings
    const isRestricted = ['finance', 'company', 'settings'].includes(link.href);
    if (!isRestricted) return true;

    if (userRole === 'admin') return true; // Admin sees all
    if (userRole === 'staff' && link.href === 'company') return true;
    if (userRole === 'customer' && link.href === 'finance') return true;

    return false;
  });

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Quản trị viên';
    if (userRole === 'staff') return 'Nhân viên';
    if (userRole === 'customer') return 'Khách hàng';
    return '';
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-[#1e2a3b] text-white py-2 text-xs border-b border-gray-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-primary" />
              <span>028 7303 2677</span>
            </div>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <Mail size={14} className="text-primary" />
              <span>info@longhoanglogistics.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <a href="https://www.facebook.com/longhoanglogistics/?modal=admin_todo_tour" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition"><Facebook size={14} /></a>
             <a href="https://www.youtube.com/channel/UCI6fi78pgFbdYH6W4KaV98Q?view_as=subscriber" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition"><Youtube size={14} /></a>
             <a href="#" className="hover:text-primary transition" onClick={(e) => e.preventDefault()}><Instagram size={14} /></a>
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
                 className="text-2xl font-bold text-gray-800 flex items-center"
               >
                 <span className="text-primary mr-1">LONG</span>HOANG
               </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              <nav className="flex items-center space-x-6">
                {filteredLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-gray-600 font-bold hover:text-primary transition text-xs uppercase tracking-wider"
                  >
                    {link.name}
                  </a>
                ))}

                {/* Login/User Button */}
                <div className="relative ml-4 pl-4 border-l border-gray-100">
                  {!userRole ? (
                    <button 
                      onClick={() => setShowLoginOptions(!showLoginOptions)}
                      className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center shadow-lg shadow-orange-100"
                    >
                      <User size={14} className="mr-2" /> Đăng nhập
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Đã đăng nhập</p>
                          <p className="text-xs font-black text-gray-700 leading-none">{getRoleLabel()}</p>
                       </div>
                       <button 
                        onClick={onLogout}
                        className="p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-full transition shadow-sm"
                        title="Đăng xuất"
                       >
                         <LogOut size={14} />
                       </button>
                    </div>
                  )}

                  {/* Login Selector Dropdown */}
                  {showLoginOptions && !userRole && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                      <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Chọn vai trò truy cập</p>
                      <button 
                        onClick={() => { onLogin('customer'); setShowLoginOptions(false); onOpenPage('finance'); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-primary flex items-center transition"
                      >
                        <User size={16} className="mr-3 opacity-50" /> Portal Khách hàng
                      </button>
                      <button 
                        onClick={() => { onLogin('staff'); setShowLoginOptions(false); onOpenPage('company'); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-primary flex items-center transition"
                      >
                        <ShieldCheck size={16} className="mr-3 opacity-50" /> Cổng Nhân viên
                      </button>
                      <div className="h-px bg-gray-50 mx-2 my-1"></div>
                      <button 
                        onClick={() => { setShowLoginOptions(false); onOpenPage('settings'); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-900 flex items-center transition"
                      >
                        <ChevronDown size={16} className="mr-3 opacity-30" /> Quản trị Hệ thống
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary p-2">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 space-y-4">
            {filteredLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-600 font-bold hover:text-primary py-2 border-b border-gray-50"
              >
                {link.name}
              </a>
            ))}
            
            <div className="pt-4">
              {!userRole ? (
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => { onLogin('customer'); setIsOpen(false); onOpenPage('finance'); }} className="bg-primary text-white font-bold py-3 rounded-lg text-sm">KHÁCH HÀNG ĐĂNG NHẬP</button>
                  <button onClick={() => { onLogin('staff'); setIsOpen(false); onOpenPage('company'); }} className="bg-[#1e2a3b] text-white font-bold py-3 rounded-lg text-sm">NHÂN VIÊN ĐĂNG NHẬP</button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tài khoản</p>
                    <p className="text-sm font-black text-gray-700">{getRoleLabel()}</p>
                  </div>
                  <button onClick={onLogout} className="text-red-500 font-bold text-xs uppercase flex items-center">
                    Đăng xuất <LogOut size={14} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
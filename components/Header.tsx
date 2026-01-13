
import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, User, LogOut, ChevronDown, ShieldCheck, Briefcase, Lock, Key, ArrowRight, ShieldAlert } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole, UserAccount } from '../App';

interface HeaderProps {
  userRole: UserRole;
  onLogin: (role: UserRole, user?: UserAccount) => void;
  onLogout: () => void;
  onOpenPage: (page: 'finance' | 'company' | 'management' | 'settings' | 'account' | null) => void;
  users: UserAccount[];
  onLoginAttempt?: (email: string, isSuccess: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogin, onLogout, onOpenPage, users, onLoginAttempt }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (target === '#' || target === 'home') {
      onOpenPage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (['finance', 'company', 'management', 'settings', 'account'].includes(target)) {
      onOpenPage(target as any);
    } else {
      onOpenPage(null);
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lowerUser = username.toLowerCase().trim();
    const pass = password.trim();

    // 1. Find user by email (insensitive)
    const targetUser = users.find(acc => acc.email.toLowerCase() === lowerUser);

    if (targetUser) {
        // Check Status First
        if (targetUser.status === 'Locked') {
            setError('Tài khoản đã bị KHÓA do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ Admin.');
            if (onLoginAttempt) onLoginAttempt(targetUser.email, false); // Log attempt on locked account
            return;
        }

        // Check Password
        if (targetUser.password === pass) {
            // SUCCESS
            if (onLoginAttempt) onLoginAttempt(targetUser.email, true);
            
            let role: UserRole = 'staff';
            let redirectPage = 'company';

            if (targetUser.role === 'Admin') {
                role = 'admin';
                redirectPage = 'settings';
            } else if (targetUser.role === 'Accounting' || targetUser.role === 'Manager') {
                role = 'manager';
                redirectPage = 'account'; // Accounting goes to Account Portal
            } else if (targetUser.role === 'Sales' || targetUser.role === 'Document') {
                role = 'staff';
                redirectPage = 'company';
            }

            onLogin(role, targetUser); // Pass user object
            onOpenPage(redirectPage as any);
            setShowLoginModal(false);
            return;
        } else {
            // WRONG PASSWORD
            const attempts = (targetUser.failedAttempts || 0) + 1;
            if (onLoginAttempt) onLoginAttempt(targetUser.email, false);

            if (attempts >= 5) {
                setError('Tài khoản của bạn vừa bị KHÓA do nhập sai quá 5 lần!');
            } else {
                setError(`Mật khẩu không đúng! Bạn còn ${5 - attempts} lần thử.`);
            }
            setPassword('');
            return;
        }
    }

    // 2. Fallback to Demo/Generic Accounts (if not found in list)
    if (pass === '123' || pass === 'admin') { 
        if (lowerUser === 'admin') {
            onLogin('admin');
            onOpenPage('settings');
            setShowLoginModal(false);
        } else if (lowerUser === 'manager') {
            onLogin('manager');
            onOpenPage('management');
            setShowLoginModal(false);
        } else if (lowerUser === 'staff') {
            onLogin('staff');
            onOpenPage('company');
            setShowLoginModal(false);
        } else if (lowerUser === 'customer') {
            onLogin('customer');
            onOpenPage('finance');
            setShowLoginModal(false);
        } else {
            setError('Tài khoản không tồn tại hoặc mật khẩu không đúng.');
        }
    } else {
        setError('Tài khoản không tồn tại hoặc mật khẩu không đúng.');
    }
    
    // Clear password on error
    if (error) setPassword('');
  };

  const openLogin = () => {
    setIsOpen(false);
    setShowLoginModal(true);
    setError('');
    setUsername('');
    setPassword('');
  };

  // Build links including Management for specific roles
  const currentNavLinks = [...NAV_LINKS];
  if (userRole === 'admin' || userRole === 'manager') {
    if (!currentNavLinks.find(l => l.href === 'management')) {
        currentNavLinks.push({ name: 'Management', href: 'management' });
    }
  }

  // Filter links based on role
  const filteredLinks = currentNavLinks.filter(link => {
    const isRestricted = ['finance', 'company', 'management', 'settings', 'account'].includes(link.href);
    if (!isRestricted) return true;

    if (userRole === 'admin') return true; 
    if (userRole === 'manager' && ['management', 'company', 'account'].includes(link.href)) return true;
    if (userRole === 'staff' && (link.href === 'company')) return true;
    
    if (userRole === 'customer' && link.href === 'finance') return true;

    return false;
  });

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Quản trị viên';
    if (userRole === 'manager') return 'Quản lý';
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
             <a href="https://www.facebook.com/longhoanglogistics/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition"><Facebook size={14} /></a>
             <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition"><Youtube size={14} /></a>
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
                 className="flex items-center"
               >
                 <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Long Hoang Logistics Logo" className="h-12 w-auto object-contain" />
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
                    className={`text-gray-600 font-bold hover:text-primary transition text-xs uppercase tracking-wider ${link.href === 'management' ? 'text-blue-600' : ''}`}
                  >
                    {link.name}
                  </a>
                ))}

                {/* Login/User Button */}
                <div className="relative ml-4 pl-4 border-l border-gray-100">
                  {!userRole ? (
                    <button 
                      onClick={() => setShowLoginModal(true)}
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
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300 z-40">
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
                <button 
                  onClick={openLogin}
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center"
                >
                  <User size={18} className="mr-2" /> ĐĂNG NHẬP HỆ THỐNG
                </button>
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-[#1e2a3b] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute left-0 bottom-0 w-32 h-32 bg-primary rounded-full mix-blend-overlay filter blur-xl transform -translate-x-10 translate-y-10"></div>
                </div>
                <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="LH Logo" className="h-12 w-auto object-contain mx-auto mb-4 brightness-0 invert" />
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Cổng thông tin điện tử</h3>
                <p className="text-gray-400 text-xs mt-2">Vui lòng đăng nhập để truy cập hệ thống</p>
                <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg flex items-start border border-red-100">
                            <ShieldAlert size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email / Tên đăng nhập</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-bold text-gray-700" 
                                placeholder="name@longhoanglogistics.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-bold text-gray-700" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 flex items-center justify-center mt-4"
                    >
                        Đăng nhập <ArrowRight size={18} className="ml-2" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-gray-400 mb-2">Hoặc tài khoản Demo (Pass: 123):</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['customer', 'staff', 'manager', 'admin'].map(role => (
                            <span key={role} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-mono text-gray-500 border border-gray-200 cursor-pointer hover:bg-gray-200" onClick={() => { setUsername(role); setPassword('123'); }}>
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;


import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, User, LogOut, ChevronDown, ShieldCheck, Briefcase, Lock, Key, ArrowRight, ShieldAlert, UserPlus } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole, UserAccount } from '../App';

interface HeaderProps {
  userRole: UserRole;
  currentUser: UserAccount | null; // Added currentUser prop
  onLogin: (role: UserRole, user?: UserAccount, remember?: boolean) => void;
  onLogout: () => void;
  onOpenPage: (page: 'finance' | 'company' | 'management' | 'settings' | 'account' | null) => void;
  users: UserAccount[];
  onLoginAttempt?: (email: string, isSuccess: boolean) => void;
  onRegister?: (user: UserAccount) => boolean;
}

const Header: React.FC<HeaderProps> = ({ userRole, currentUser, onLogin, onLogout, onOpenPage, users, onLoginAttempt, onRegister }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

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
            } else if (targetUser.role === 'Sales' || targetUser.role === 'Document' || targetUser.role === 'Staff') {
                role = 'staff';
                redirectPage = 'company';
            } else if (targetUser.role === 'Customer') {
                role = 'customer';
                redirectPage = 'finance';
            }

            onLogin(role, targetUser, rememberMe); // Pass user object and remember flag
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

    // No fallback to Demo Accounts anymore
    setError('Tài khoản không tồn tại hoặc mật khẩu không đúng.');
    
    // Clear password on error
    if (error) setPassword('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError('');

      if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
          setRegError('Vui lòng điền đầy đủ thông tin.');
          return;
      }

      if (regPassword !== regConfirmPassword) {
          setRegError('Mật khẩu xác nhận không khớp.');
          return;
      }

      if (regPassword.length < 6) {
          setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
          return;
      }

      const newUser: UserAccount = {
          id: 0, // Will be set by App
          name: regName,
          email: regEmail,
          password: regPassword,
          role: 'Customer',
          status: 'Active',
          failedAttempts: 0
      };

      if (onRegister) {
          const success = onRegister(newUser);
          if (success) {
              alert('Đăng ký thành công! Đang tự động đăng nhập...');
              setShowRegisterModal(false);
              // Clean up form
              setRegName('');
              setRegEmail('');
              setRegPassword('');
              setRegConfirmPassword('');
          } else {
              setRegError('Email này đã được sử dụng. Vui lòng chọn email khác.');
          }
      }
  };

  const openLogin = () => {
    setIsOpen(false);
    setShowLoginModal(true);
    setShowRegisterModal(false);
    setError('');
    setUsername('');
    setPassword('');
    setRememberMe(false);
  };

  const openRegister = () => {
      setIsOpen(false);
      setShowLoginModal(false);
      setShowRegisterModal(true);
      setRegError('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
  };

  // Build links including Management for specific roles
  const currentNavLinks = [...NAV_LINKS];
  if (userRole === 'admin' || (userRole === 'manager' && currentUser?.role !== 'Accounting')) {
    // Only show Management if admin OR (manager AND NOT Accounting)
    if (!currentNavLinks.find(l => l.href === 'management')) {
        currentNavLinks.push({ name: 'Management', href: 'management' });
    }
  }

  // Filter links based on role
  const filteredLinks = currentNavLinks.filter(link => {
    const isRestricted = ['finance', 'company', 'management', 'settings', 'account'].includes(link.href);
    if (!isRestricted) return true;

    if (userRole === 'admin') return true; 
    if (userRole === 'manager') {
       // Management is already filtered by logic above construction of currentNavLinks
       // Check other restricted links
       if (['company', 'account'].includes(link.href)) return true;
       if (link.href === 'management') return true; // It's only here if passed the check above
    }
    if (userRole === 'staff' && (link.href === 'company')) return true;
    
    if (userRole === 'customer') {
        // Customer sees Finance but NOT Company, Account, Management, Settings
        if (link.href === 'finance') return true;
        return false;
    }

    return false;
  });

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Quản trị viên';
    if (userRole === 'manager') return 'Quản lý';
    if (userRole === 'staff') return 'Nhân viên';
    if (userRole === 'customer') return 'Khách hàng';
    return '';
  };

  // Styles for LED Border Animation (Pink Color - Slower Speed)
  const ledStyle = `
    @keyframes led-top { 0% { left: -100%; } 50%, 100% { left: 100%; } }
    @keyframes led-right { 0% { top: -100%; } 50%, 100% { top: 100%; } }
    @keyframes led-bottom { 0% { right: -100%; } 50%, 100% { right: 100%; } }
    @keyframes led-left { 0% { bottom: -100%; } 50%, 100% { bottom: 100%; } }
    
    .led-border span {
      position: absolute;
      display: block;
    }
    .led-border span:nth-child(1) {
      top: 0; left: 0; width: 100%; height: 3px;
      background: linear-gradient(90deg, transparent, #ff00cc);
      animation: led-top 4s linear infinite;
    }
    .led-border span:nth-child(2) {
      top: -100%; right: 0; width: 3px; height: 100%;
      background: linear-gradient(180deg, transparent, #ff00cc);
      animation: led-right 4s linear infinite;
      animation-delay: 1s;
    }
    .led-border span:nth-child(3) {
      bottom: 0; right: -100%; width: 100%; height: 3px;
      background: linear-gradient(270deg, transparent, #ff00cc);
      animation: led-bottom 4s linear infinite;
      animation-delay: 2s;
    }
    .led-border span:nth-child(4) {
      bottom: -100%; left: 0; width: 3px; height: 100%;
      background: linear-gradient(360deg, transparent, #ff00cc);
      animation: led-left 4s linear infinite;
      animation-delay: 3s;
    }
  `;

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md">
      <style>{ledStyle}</style>
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
                    <div className="flex gap-2">
                        <button 
                        onClick={openLogin}
                        className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all transform active:scale-95 flex items-center shadow-lg shadow-orange-100"
                        >
                        <User size={14} className="mr-2" /> Đăng nhập
                        </button>
                    </div>
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
            
            <div className="pt-4 space-y-2">
              {!userRole ? (
                <>
                    <button 
                    onClick={openLogin}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center"
                    >
                    <User size={18} className="mr-2" /> ĐĂNG NHẬP
                    </button>
                    <button 
                    onClick={openRegister}
                    className="w-full bg-white border border-primary text-primary font-bold py-3 rounded-lg text-sm flex items-center justify-center"
                    >
                    <UserPlus size={18} className="mr-2" /> ĐĂNG KÝ
                    </button>
                </>
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

      {/* Login Modal - Glassmorphism with Pink LED Border */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(255,0,204,0.4)] relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 led-border">
            {/* LED Spans */}
            <span></span>
            <span></span>
            <span></span>
            <span></span>

            {/* Modal Header */}
            <div className="p-8 text-center relative border-b border-white/10">
                <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                    <X size={20} />
                </button>
                <div className="mb-4">
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm shadow-[0_0_15px_rgba(255,0,204,0.5)]">
                      <User size={32} className="text-white" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">Chào mừng trở lại</h3>
                <p className="text-gray-200 text-xs mt-2 font-medium">Đăng nhập để truy cập hệ thống</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-4">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/20 text-white text-xs font-bold p-3 rounded-xl flex items-start border border-red-500/30 backdrop-blur-sm">
                            <ShieldAlert size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-200 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                                placeholder="user@kimberry.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-200 uppercase tracking-wider ml-1">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center text-xs text-gray-200 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="mr-2 w-4 h-4 accent-pink-500 rounded border-gray-300 focus:ring-pink-500"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            Ghi nhớ
                        </label>
                        <a href="#" className="text-xs text-gray-200 hover:text-white hover:underline font-medium">Quên mật khẩu?</a>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-[#1A535C] hover:bg-[#13424a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center mt-6 border border-white/10"
                    >
                        Đăng nhập ngay
                    </button>

                    <div className="text-center pt-4 border-t border-white/10 mt-4">
                        <p className="text-xs text-gray-300">Chưa có tài khoản?</p>
                        <button 
                            type="button" 
                            onClick={openRegister}
                            className="text-sm font-bold text-pink-400 hover:text-pink-300 mt-1 hover:underline"
                        >
                            Đăng ký tài khoản mới
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal - Glassmorphism with Pink LED Border */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRegisterModal(false)}></div>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(255,0,204,0.4)] relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 led-border">
            {/* LED Spans */}
            <span></span>
            <span></span>
            <span></span>
            <span></span>

            {/* Modal Header */}
            <div className="p-6 text-center relative border-b border-white/10">
                <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                    <X size={20} />
                </button>
                <h3 className="text-xl font-bold text-white uppercase tracking-wider drop-shadow-md">Đăng ký tài khoản</h3>
                <p className="text-gray-200 text-xs mt-1">Dành cho Khách hàng & Đối tác</p>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-4">
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {regError && (
                        <div className="bg-red-500/20 text-white text-xs font-bold p-3 rounded-xl flex items-start border border-red-500/30 backdrop-blur-sm mb-4">
                            <ShieldAlert size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span>{regError}</span>
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-200 uppercase ml-1">Họ và tên</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                            placeholder="Nguyễn Văn A"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-200 uppercase ml-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                            placeholder="email@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-200 uppercase ml-1">Mật khẩu</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                            placeholder="••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-200 uppercase ml-1">Xác nhận mật khẩu</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition font-bold text-white placeholder-gray-400" 
                            placeholder="••••••"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-[#1A535C] hover:bg-[#13424a] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center mt-6 border border-white/10"
                    >
                        <UserPlus size={18} className="mr-2" /> Đăng ký
                    </button>

                    <div className="text-center pt-4 border-t border-white/10 mt-4">
                        <p className="text-xs text-gray-300">Đã có tài khoản?</p>
                        <button 
                            type="button" 
                            onClick={openLogin}
                            className="text-sm font-bold text-pink-400 hover:text-pink-300 mt-1 hover:underline"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

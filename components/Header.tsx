
import React, { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Youtube, Instagram, User, LogOut, ChevronDown, ShieldCheck, Briefcase, Lock, Key, ArrowRight, ShieldAlert, UserPlus, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { UserRole, UserAccount } from '../App';

interface HeaderProps {
  userRole: UserRole;
  currentUser: UserAccount | null;
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
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

    const targetUser = users.find(acc => (acc.email || '').toLowerCase() === lowerUser);

    if (targetUser) {
        if (targetUser.status === 'Locked') {
            setError('Account LOCKED. Please contact Admin.');
            if (onLoginAttempt) onLoginAttempt(targetUser.email, false);
            return;
        }

        if (targetUser.password === pass) {
            if (onLoginAttempt) onLoginAttempt(targetUser.email, true);
            
            let role: UserRole = 'staff';
            let redirectPage = 'company';

            if (targetUser.role === 'Admin') {
                role = 'admin';
                redirectPage = 'settings';
            } else if (targetUser.role === 'Accounting' || targetUser.role === 'Manager') {
                role = 'manager';
                redirectPage = 'account';
            } else if (targetUser.role === 'Sales' || targetUser.role === 'Document' || targetUser.role === 'Staff') {
                role = 'staff';
                redirectPage = 'company';
            } else if (targetUser.role === 'Customer') {
                role = 'customer';
                redirectPage = 'finance';
            }

            onLogin(role, targetUser, rememberMe);
            onOpenPage(redirectPage as any);
            setShowLoginModal(false);
            return;
        } else {
            const attempts = (targetUser.failedAttempts || 0) + 1;
            if (onLoginAttempt) onLoginAttempt(targetUser.email, false);

            if (attempts >= 5) {
                setError('Account LOCKED due to 5 failed attempts!');
            } else {
                setError(`Incorrect password!`);
            }
            setPassword('');
            return;
        }
    }

    setError('Account does not exist.');
    if (error) setPassword('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError('');

      if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
          setRegError('Please fill in all fields.');
          return;
      }

      if (regPassword !== regConfirmPassword) {
          setRegError('Passwords do not match.');
          return;
      }

      if (regPassword.length < 6) {
          setRegError('Password must be at least 6 characters.');
          return;
      }

      const newUser: UserAccount = {
          id: 0,
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
              alert('Registration successful! Logging in...');
              setShowRegisterModal(false);
              setRegName('');
              setRegEmail('');
              setRegPassword('');
              setRegConfirmPassword('');
          } else {
              setRegError('Email is already in use.');
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
    setRememberMe(true);
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

  const currentNavLinks = [...NAV_LINKS];
  if (userRole === 'admin' || (userRole === 'manager' && currentUser?.role !== 'Accounting')) {
    if (!currentNavLinks.find(l => l.href === 'management')) {
        currentNavLinks.push({ name: 'Management', href: 'management' });
    }
  }

  const filteredLinks = currentNavLinks.filter(link => {
    const isRestricted = ['finance', 'company', 'management', 'settings', 'account'].includes(link.href);
    if (!isRestricted) return true;

    if (userRole === 'admin') return true; 
    if (userRole === 'manager') {
       if (['company', 'account'].includes(link.href)) return true;
       if (link.href === 'management') return true;
    }
    if (userRole === 'staff' && (link.href === 'company')) return true;
    if (userRole === 'customer') {
        if (link.href === 'finance') return true;
        return false;
    }
    return false;
  });

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'Administrator';
    if (userRole === 'manager') return 'Manager';
    if (userRole === 'staff') return 'Staff';
    if (userRole === 'customer') return 'Customer';
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
                    <User size={18} className="mr-2" /> LOGIN
                    </button>
                    <button 
                    onClick={openRegister}
                    className="w-full bg-white border border-primary text-primary font-bold py-3 rounded-lg text-sm flex items-center justify-center"
                    >
                    <UserPlus size={18} className="mr-2" /> REGISTER
                    </button>
                </>
              ) : (
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
                    <p className="text-sm font-black text-gray-700">{getRoleLabel()}</p>
                  </div>
                  <button onClick={onLogout} className="text-red-500 font-bold text-xs uppercase flex items-center">
                    Logout <LogOut size={14} className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* LOGIN MODAL - RE-DESIGNED DARK THEME */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0f172a] overflow-y-auto">
          {/* Animated Background Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]"></div>
             <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
             <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl h-auto min-h-[600px] bg-[#1e293b] rounded-3xl shadow-2xl flex overflow-hidden border border-gray-700 animate-in zoom-in duration-300">
             
             {/* LEFT SIDE: ILLUSTRATION */}
             <div className="hidden lg:flex w-1/2 bg-[#0b1120] relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent z-10"></div>
                {/* Updated Image with Object-Cover for portrait crop */}
                <div className="relative z-0 w-full h-full">
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1668473367234-fe8a1decd456?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Logistics Login" 
                      className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-700"
                    />
                </div>
                {/* Floating Elements */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-blue-500 rounded-full animate-ping z-20"></div>
                <div className="absolute bottom-20 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-500 z-20"></div>
             </div>

             {/* RIGHT SIDE: FORM */}
             <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-[#1e293b]">
                {/* Logo & Close */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
                    </div>
                    <button onClick={() => setShowLoginModal(false)} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Operational Management</h2>
                    <p className="text-gray-400 text-sm">Sign in to access Logistics system</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center">
                            <ShieldAlert size={14} className="mr-2" /> {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username / Phone number</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-500 transition" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-600 transition font-medium"
                                placeholder="Admin / user@domain.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-500 transition" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-600 transition font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition">
                            <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center transition ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>
                                <input type="checkbox" className="hidden" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                {rememberMe && <CheckSquare size={10} className="text-white" />}
                            </div>
                            Remember me
                        </label>
                        <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition font-bold">Forgot password?</a>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform active:scale-[0.98] mt-4"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-auto pt-8 flex items-center justify-center text-xs text-gray-500">
                    <span>Don't have an account?</span>
                    <button onClick={openRegister} className="text-blue-500 hover:text-blue-400 font-bold ml-2 hover:underline">
                        Register new account
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* REGISTER MODAL - RE-DESIGNED DARK THEME */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0f172a] overflow-y-auto">
          {/* Animated Background Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]"></div>
             <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl h-auto min-h-[600px] bg-[#1e293b] rounded-3xl shadow-2xl flex overflow-hidden border border-gray-700 animate-in zoom-in duration-300">
             
             {/* LEFT SIDE: ILLUSTRATION */}
             <div className="hidden lg:flex w-1/2 bg-[#0b1120] relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 to-transparent z-10"></div>
                <div className="relative z-0 w-full h-full">
                    {/* Updated Image with Object-Cover for portrait crop */}
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1764702446180-dd9dc8de3faa?q=80&w=2040&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Register Logistics" 
                      className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-700"
                    />
                </div>
             </div>

             {/* RIGHT SIDE: FORM */}
             <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-[#1e293b]">
                {/* Logo & Close */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
                    </div>
                    <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">Create new account</h2>
                    <p className="text-gray-400 text-sm">Experience professional Logistics services</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {regError && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg flex items-center">
                            <ShieldAlert size={14} className="mr-2" /> {regError}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Company Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                            placeholder="Company Co., Ltd"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                            placeholder="email@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                                placeholder="••••••"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Confirm Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                                placeholder="••••••"
                                value={regConfirmPassword}
                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-900/30 transition-all transform active:scale-[0.98] mt-4"
                    >
                        Register Now
                    </button>
                </form>

                <div className="mt-auto pt-6 flex items-center justify-center text-xs text-gray-500">
                    <span>Already have an account?</span>
                    <button onClick={openLogin} className="text-cyan-500 hover:text-cyan-400 font-bold ml-2 hover:underline">
                        Sign In
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

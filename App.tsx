
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import WhyChooseUs from './components/WhyChooseUs';
import About from './components/About';
import Services from './components/Services';
import SafetyFeatures from './components/SafetyFeatures';
import Jobs from './components/Jobs';
import News from './components/News';
import Testimonials from './components/Testimonials';
import Partners from './components/Partners';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import FinancePage from './components/FinancePage';
import CompanyPage from './components/CompanyPage';
import SettingsPage from './components/SettingsPage';
import ManagementPage from './components/ManagementPage';

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer' | null;

function App() {
  const [activePage, setActivePage] = useState<'finance' | 'company' | 'management' | 'settings' | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Initialize session from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('lh_user_role') as UserRole;
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role) localStorage.setItem('lh_user_role', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    setActivePage(null);
    localStorage.removeItem('lh_user_role');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'finance':
        return <FinancePage onClose={() => setActivePage(null)} />;
      case 'company':
        return <CompanyPage onClose={() => setActivePage(null)} />;
      case 'management':
        return <ManagementPage onClose={() => setActivePage(null)} userRole={userRole} />;
      case 'settings':
        return (
          <SettingsPage 
            onClose={() => setActivePage(null)} 
            isAuthenticated={userRole === 'admin'}
            onLoginSuccess={() => handleLogin('admin')}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <>
            <Hero />
            <WhyChooseUs />
            <About />
            <Services />
            <SafetyFeatures />
            <Jobs />
            <News />
            <Testimonials />
            <Partners />
            <ContactForm />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        userRole={userRole} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onOpenPage={setActivePage} 
      />
      <main>
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

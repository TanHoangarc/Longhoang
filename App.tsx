
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

export interface UserAccount {
  id: number;
  name: string;
  role: string;
  email: string;
  password?: string;
  status: 'Active' | 'Locked';
  failedAttempts: number; // New field for security log
  lastAttemptTime?: string; // New field for security log
}

const INITIAL_USERS: UserAccount[] = [
  { id: 1, name: 'Nguyễn Văn A (Sales 1)', role: 'Sales', email: 'sales1@longhoanglogistics.com', password: 'Jwckim@111', status: 'Active', failedAttempts: 0 },
  { id: 2, name: 'Alan (Sales 2)', role: 'Sales', email: 'alan@longhoanglogistics.com', password: 'Jwckim@112', status: 'Active', failedAttempts: 0 },
  { id: 3, name: 'Kế toán HPH', role: 'Accounting', email: 'acchph@longhoanglogistics.com', password: 'Jwckim@121', status: 'Active', failedAttempts: 0 },
  { id: 4, name: 'Kế toán HCM', role: 'Accounting', email: 'account@longhoanglogistics.com', password: 'Jwckim@122', status: 'Active', failedAttempts: 0 },
  { id: 5, name: 'Chuyên viên CT 1', role: 'Document', email: 'docs1@longhoanglogistics.com', password: 'Jwckim@131', status: 'Active', failedAttempts: 0 },
  { id: 6, name: 'Chuyên viên CT 2', role: 'Document', email: 'docs2@longhoanglogistics.com', password: 'Jwckim@132', status: 'Active', failedAttempts: 0 },
  { id: 7, name: 'Administrator', role: 'Admin', email: 'admin@longhoanglogistics.com', password: 'admin', status: 'Active', failedAttempts: 0 },
];

function App() {
  const [activePage, setActivePage] = useState<'finance' | 'company' | 'management' | 'settings' | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  // Lifted User State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

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

  // User Management Handlers
  const handleAddUser = (user: UserAccount) => setUsers([...users, user]);
  
  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(users.map(u => {
      if (u.id === updatedUser.id) {
        // If Admin sets status back to Active, reset failed attempts
        if (updatedUser.status === 'Active' && u.status === 'Locked') {
           return { ...updatedUser, failedAttempts: 0 };
        }
        return updatedUser;
      }
      return u;
    }));
  };

  const handleDeleteUser = (id: number) => setUsers(users.filter(u => u.id !== id));

  // Security: Handle Login Attempts
  const handleLoginAttempt = (email: string, isSuccess: boolean) => {
    setUsers(currentUsers => currentUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const timestamp = new Date().toLocaleString('vi-VN');
        if (isSuccess) {
          // Reset on success
          return { ...u, failedAttempts: 0, lastAttemptTime: timestamp };
        } else {
          // Increment on failure
          const newAttempts = u.failedAttempts + 1;
          // Auto-lock if attempts >= 5
          const newStatus = newAttempts >= 5 ? 'Locked' : u.status;
          return { ...u, failedAttempts: newAttempts, status: newStatus, lastAttemptTime: timestamp };
        }
      }
      return u;
    }));
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'finance':
        return <FinancePage onClose={() => setActivePage(null)} />;
      case 'company':
        return <CompanyPage onClose={() => setActivePage(null)} />;
      case 'management':
        return (
          <ManagementPage 
            onClose={() => setActivePage(null)} 
            userRole={userRole} 
            users={users} // Pass shared users
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onClose={() => setActivePage(null)} 
            isAuthenticated={userRole === 'admin'}
            onLoginSuccess={() => handleLogin('admin')}
            onLogout={handleLogout}
            users={users} // Pass shared users
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
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
        users={users} 
        onLoginAttempt={handleLoginAttempt} // Pass the handler
      />
      <main>
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

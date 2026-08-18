import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import News from './components/News';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ConsoleLogin from './components/ConsoleLogin';
import { API_BASE_URL } from './constants';

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer' | null;

export interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  images: string[];
  desc: string;
}

export interface GalleryAlbum {
  id: number;
  title: string;
  coverImage?: string;
  cover?: string;
  images: string[];
  date: string;
}

export interface Milestone {
  year: string;
  title: string;
  desc: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  
  // Custom routing and auth
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [fullData, setFullData] = useState<any>({});

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    
    // Check if logged in
    if (localStorage.getItem('lh_admin_logged_in') === 'true') {
      setUserRole('admin');
    }

    // Load data
    fetch(`${API_BASE_URL}/api/data`)
      .then(res => res.json())
      .then(data => {
        setFullData(data);
        if (data.projects) setProjects(data.projects);
        if (data.galleryAlbums) setGalleryAlbums(data.galleryAlbums);
        if (data.milestones) setMilestones(data.milestones);
      })
      .catch(err => console.error("Failed to fetch data:", err));
      
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNewQuotationRequest = (req: any) => {
    alert('Thank you for your request. We will contact you soon!');
  };

  const handleLogin = (password: string) => {
    if (password === 'admin123') { // Mật khẩu mặc định tạm thời
      localStorage.setItem('lh_admin_logged_in', 'true');
      setUserRole('admin');
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    } else {
      alert('Sai mật khẩu!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lh_admin_logged_in');
    setUserRole(null);
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // Provide a save wrapper that sends back to backend
  const handleUpdateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    updateBackend({ ...fullData, projects: newProjects });
  };
  
  const handleUpdateGalleryAlbums = (newAlbums: GalleryAlbum[]) => {
    setGalleryAlbums(newAlbums);
    updateBackend({ ...fullData, galleryAlbums: newAlbums });
  };
  
  const handleUpdateMilestones = (newMilestones: Milestone[]) => {
    setMilestones(newMilestones);
    updateBackend({ ...fullData, milestones: newMilestones });
  };

  const updateBackend = (dataToSave: any) => {
    setFullData(dataToSave);
    fetch(`${API_BASE_URL}/api/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave)
    }).catch(err => console.error("Save failed", err));
  };

  if (currentPath === '/console') {
    if (userRole === 'admin') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
      return null;
    }
    return <ConsoleLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {userRole === 'admin' && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-bold flex justify-center items-center">
          <span className="animate-pulse mr-4">🔴 ĐANG Ở CHẾ ĐỘ QUẢN TRỊ WEBSITE (ADMIN MODE). CÁC THAY ĐỔI SẼ ĐƯỢC LƯU TRỰC TIẾP VÀO HỆ THỐNG.</span>
          <button onClick={handleLogout} className="underline hover:text-gray-200 bg-black/20 px-3 py-1 rounded-md">
            Thoát chế độ
          </button>
        </div>
      )}

      <Header 
        userRole={userRole} 
        currentUser={null} 
        onLogin={() => {}} 
        onLogout={handleLogout} 
        onOpenPage={setActivePage}
        users={[]} 
        activePage={activePage}
      />
      <main>
        <Hero projects={projects} onUpdateProjects={handleUpdateProjects} userRole={userRole} />
        <About 
          galleryAlbums={galleryAlbums}
          onUpdateGallery={handleUpdateGalleryAlbums}
          milestones={milestones}
          onUpdateMilestones={handleUpdateMilestones}
          userRole={userRole}
        />
        <Services />
        <News />
        <ContactForm onSubmitRequest={handleNewQuotationRequest} />
      </main>
      <Footer />
    </div>
  );
}

export default App;

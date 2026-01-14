
import React, { useState, useEffect, useRef } from 'react';
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
import AccountPage from './components/AccountPage';
import { Carrier } from './components/account/AccountData';
import { API_BASE_URL } from './constants';

export type UserRole = 'admin' | 'manager' | 'staff' | 'customer' | null;

export interface EmploymentStatus {
  type: 'Normal' | 'Maternity' | 'Resignation';
  startDate?: string;
  endDate?: string; // For Maternity return date
  note?: string; // The generated note string
}

export interface UserAccount {
  id: number;
  name: string;
  englishName?: string; // Added English Name
  role: string;
  email: string;
  password?: string;
  status: 'Active' | 'Locked';
  failedAttempts: number; // New field for security log
  lastAttemptTime?: string; // New field for security log
  department?: string;
  position?: string;
  employmentStatus?: EmploymentStatus; // New field for detailed status
}

export interface SystemNotification {
  id: number;
  date: string; // Date of posting
  title: string;
  content: string;
  attachment?: string;
  startDate: string; // New: Start of event/holiday
  expiryDate: string; // End of event/holiday
  isPinned: boolean;
  image: string;
}

// Interface for Decree
export interface Decree {
  id: number;
  date: string;
  title: string;
  content: string;
  attachment?: string;
  expiryDate: string;
  isPinned: boolean;
  image: string;
}

// Interface for Statement (Bảng kê)
export interface StatementData {
  id: number;
  month: string; // Format: YYYY-MM
  createdDate: string;
  senderName: string;
  receiverName: string;
  totalAmount: number;
  status: 'Draft' | 'Shared' | 'Locked'; // Added 'Locked'
  rows: any[]; // Rows data
  headerInfo: any; // Header config data
}

// Interface for detailed Leave Form Data
export interface LeaveFormDetails {
  reason: string;
  handoverWork: string;
  handoverTo: string; // Tên người nhận bàn giao
  department: string; // Bộ phận người nhận
  phone: string;
  address: string;
}

// Interface for Attendance (Chấm công)
export interface AttendanceRecord {
  id: number;
  userId: number;
  userName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  status: 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Unpaid Leave'; // Added Unpaid Leave
  note?: string;
  
  // Leave specific fields
  leaveType?: 'Paid' | 'Unpaid'; // Có phép / Không phép
  leaveDuration?: number; // 0.5 or 1
  leavePeriod?: 'All Day' | 'Morning' | 'Afternoon'; // Buổi nghỉ
  leaveForm?: LeaveFormDetails; // Chi tiết đơn xin nghỉ
  leaveFile?: string; // Tên file đính kèm (nếu có)
  leaveReason?: string; // Lý do ngắn gọn
}

// Interface for GUQ Record
export interface GUQRecord {
  id: number;
  companyName: string;
  date: string; // Submission date
  fileName: string; // Physical file name
  originalName?: string;
  path?: string; // Relative path on server
}

// Default data in case server is offline
const INITIAL_USERS: UserAccount[] = [
  { id: 1, name: 'Nguyễn Văn A', englishName: 'Mr. A', role: 'Sales', email: 'sales1@longhoanglogistics.com', password: '123', status: 'Active', failedAttempts: 0, department: 'Sales', position: 'Nhân viên kinh doanh' },
  { id: 7, name: 'Administrator', englishName: 'Admin', role: 'Admin', email: 'admin@longhoanglogistics.com', password: 'admin', status: 'Active', failedAttempts: 0, department: 'Board', position: 'Admin' },
];

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

function App() {
  const [activePage, setActivePage] = useState<'finance' | 'company' | 'management' | 'settings' | 'account' | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null); // Track logged in user
  
  // Data States
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [statements, setStatements] = useState<StatementData[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [guqRecords, setGuqRecords] = useState<GUQRecord[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([
    {
      id: 1,
      name: 'CÔNG TY TNHH DV VT THANH XUÂN ĐÀO',
      address: '41/15d/5/10 Đường Gò Cát, Phường Phú Hữu, Tp Thủ Đức, Tp Hồ Chí Minh',
      accountHolder: '',
      accountNumber: '1044115528',
      bank: 'Vietcombank'
    }
  ]);
  const [decrees, setDecrees] = useState<Decree[]>([
    {
      id: 1,
      date: '01/06/2024',
      title: 'Nghị định 15/2022/NĐ-CP',
      content: 'Quy định chính sách miễn, giảm thuế theo Nghị quyết 43/2022/QH15...',
      attachment: 'ND_15_2022_CP.pdf',
      expiryDate: '2025-12-31',
      isPinned: true,
      image: STOCK_IMAGES[0]
    }
  ]);
  
  // Server connection status
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [serverInfo, setServerInfo] = useState({ rootDir: '', eDriveAvailable: false, isUsingEDrive: false });

  // --- API HELPER ---
  // Sends the FULL state to the backend to be backed up
  const syncToServer = async (fullData: any) => {
    try {
      // UPDATED: Use absolute API_BASE_URL to ensure data goes to the production server
      await fetch(`${API_BASE_URL}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      if (!isServerOnline) setIsServerOnline(true);
    } catch (e) {
      console.warn(`Failed to sync data. Server might be offline.`);
      setIsServerOnline(false);
    }
  };

  // Helper to gather all current state and override with the update
  const getFullState = (overrides: any = {}) => {
    return {
      users,
      notifications,
      statements,
      attendanceRecords,
      guqRecords,
      carriers,
      decrees,
      ...overrides
    };
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Data from Production API
        const res = await fetch(`${API_BASE_URL}/api/data`);
        if (res.ok) {
          const db = await res.json();
          if (db.users && db.users.length > 0) setUsers(db.users);
          if (db.notifications) setNotifications(db.notifications);
          if (db.statements) setStatements(db.statements);
          if (db.attendanceRecords) setAttendanceRecords(db.attendanceRecords);
          if (db.guq) setGuqRecords(db.guq);
          if (db.carriers && db.carriers.length > 0) setCarriers(db.carriers);
          if (db.decrees && db.decrees.length > 0) setDecrees(db.decrees);
          setIsServerOnline(true);
        } else {
            console.warn("Server responded but with error. Using local defaults.");
            setIsServerOnline(false);
        }

        // Fetch Server Status (Storage Path)
        const statusRes = await fetch(`${API_BASE_URL}/api/status`);
        if (statusRes.ok) {
            const info = await statusRes.json();
            setServerInfo(info);
        }

      } catch (e) {
        console.warn("Server offline, using local defaults.");
        setIsServerOnline(false);
      }
    };
    fetchData();

    // Load session
    let savedRole = localStorage.getItem('lh_user_role') as UserRole;
    let savedUserJson = localStorage.getItem('lh_current_user');
    if (!savedRole) {
        savedRole = sessionStorage.getItem('lh_user_role') as UserRole;
        savedUserJson = sessionStorage.getItem('lh_current_user');
    }
    if (savedRole) setUserRole(savedRole);
    if (savedUserJson) {
        try { setCurrentUser(JSON.parse(savedUserJson)); } catch (e) {}
    }
  }, []);

  // --- HANDLERS WRAPPERS (Update State + Sync Server) ---

  const handleUpdateUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    syncToServer(getFullState({ users: newUsers }));
  };

  const handleUpdateNotifications = (newNotifs: SystemNotification[]) => {
    setNotifications(newNotifs);
    syncToServer(getFullState({ notifications: newNotifs }));
  };

  const handleUpdateStatements = (newStmts: StatementData[]) => {
    setStatements(newStmts);
    syncToServer(getFullState({ statements: newStmts }));
  };

  const handleUpdateAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(newRecords);
    syncToServer(getFullState({ attendanceRecords: newRecords }));
  };

  const handleUpdateCarriers = (newCarriers: Carrier[]) => {
    setCarriers(newCarriers);
    syncToServer(getFullState({ carriers: newCarriers }));
  };

  const handleUpdateDecrees = (newDecrees: Decree[]) => {
    setDecrees(newDecrees);
    syncToServer(getFullState({ decrees: newDecrees }));
  };

  const handleUpdateGuq = (newGuq: GUQRecord[]) => {
    setGuqRecords(newGuq);
    syncToServer(getFullState({ guq: newGuq }));
  };

  // --- AUTHENTICATION ---
  const handleLogin = (role: UserRole, user?: UserAccount, remember: boolean = false) => {
    setUserRole(role);
    setCurrentUser(user || null);
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem('lh_user_role');
    otherStorage.removeItem('lh_current_user');
    if (role) storage.setItem('lh_user_role', role);
    if (user) storage.setItem('lh_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setActivePage(null);
    localStorage.removeItem('lh_user_role');
    localStorage.removeItem('lh_current_user');
    sessionStorage.removeItem('lh_user_role');
    sessionStorage.removeItem('lh_current_user');
  };

  // --- USER MANAGEMENT LOGIC ---
  const handleAddUser = (user: UserAccount) => handleUpdateUsers([...users, user]);
  
  const handleUpdateUserSingle = (updatedUser: UserAccount) => {
    const newUsers = users.map(u => {
      if (u.id === updatedUser.id) {
        if (updatedUser.status === 'Active' && u.status === 'Locked') {
           return { ...updatedUser, failedAttempts: 0 };
        }
        return updatedUser;
      }
      return u;
    });
    handleUpdateUsers(newUsers);
  };

  const handleDeleteUser = (id: number) => handleUpdateUsers(users.filter(u => u.id !== id));

  const handleLoginAttempt = (email: string, isSuccess: boolean) => {
    const newUsers = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const timestamp = new Date().toLocaleString('vi-VN');
        if (isSuccess) {
          return { ...u, failedAttempts: 0, lastAttemptTime: timestamp };
        } else {
          const newAttempts = (u.failedAttempts || 0) + 1;
          const newStatus = newAttempts >= 5 ? 'Locked' : u.status;
          return { ...u, failedAttempts: newAttempts, status: newStatus as 'Active' | 'Locked', lastAttemptTime: timestamp };
        }
      }
      return u;
    });
    // Optimistic UI update first, then sync
    setUsers(newUsers);
    syncToServer(getFullState({ users: newUsers }));
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'finance':
        return (
            <FinancePage 
                onClose={() => setActivePage(null)} 
                guqRecords={guqRecords}
                onUpdateGuq={handleUpdateGuq}
                currentUser={currentUser}
            />
        );
      case 'company':
        return (
            <CompanyPage 
                onClose={() => setActivePage(null)} 
                statements={statements} 
                onUpdateStatements={handleUpdateStatements}
                currentUser={currentUser}
                attendanceRecords={attendanceRecords}
                onUpdateAttendance={handleUpdateAttendance}
                notifications={notifications}
                onUpdateNotifications={handleUpdateNotifications}
                decrees={decrees} 
                onUpdateDecrees={handleUpdateDecrees} 
            />
        );
      case 'account':
        return (
            <AccountPage 
                onClose={() => setActivePage(null)} 
                statements={statements}
                onUpdateStatements={handleUpdateStatements}
                attendanceRecords={attendanceRecords} 
                users={users} 
                onUpdateAttendance={handleUpdateAttendance}
                onUpdateUser={handleUpdateUserSingle} 
                notifications={notifications}
                carriers={carriers} 
                onUpdateCarriers={handleUpdateCarriers} 
            />
        );
      case 'management':
        return (
          <ManagementPage 
            onClose={() => setActivePage(null)} 
            userRole={userRole} 
            users={users} 
            guqRecords={guqRecords}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onClose={() => setActivePage(null)} 
            isAuthenticated={userRole === 'admin'}
            onLoginSuccess={() => handleLogin('admin')}
            onLogout={handleLogout}
            users={users} 
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUserSingle}
            onDeleteUser={handleDeleteUser}
            currentUser={currentUser}
            serverInfo={serverInfo}
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
        currentUser={currentUser} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onOpenPage={setActivePage}
        users={users} 
        onLoginAttempt={handleLoginAttempt} 
      />
      <main>
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;


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

// Interface for Project
export interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  date: string;
  images: string[]; // Album support
  desc: string;
}

// Interface for Job
export interface Job {
  id: number;
  title: string;
  branch: 'HCM' | 'HPH';
  type: string;
  quantity: number;
}

// Interface for Statement (Bảng kê)
export interface StatementData {
  id: number;
  title?: string; // Tên bảng kê tùy chỉnh
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

// Interface for User Files (Quotations, Reports, Leave Forms saved)
export interface UserFileRecord {
  id: number;
  userId: number;
  userName: string;
  fileName: string;
  type: 'QUOTATION' | 'REPORT' | 'LEAVE' | 'OTHER';
  date: string;
  path?: string; // Optional URL/Path
  customer?: string; // Specific for quotations
  description?: string;
}

// Interfaces for Library
export interface LibraryFile {
  id: number;
  name: string;
  url: string;
  uploadDate: string;
}

export interface LibraryFolder {
  id: number;
  name: string;
  files: LibraryFile[];
}

// Interface for Gallery Album
export interface GalleryAlbum {
  id: number;
  title: string;
  cover: string;
  images: string[];
  date: string;
}

// Interface for History Milestone
export interface Milestone {
  id: number;
  year: string;
  title: string;
  desc: string;
}

// Interface for Adjustment Record (Biên bản)
export interface AdjustmentRecord {
  id: number;
  bl: string;
  date: string;
  status: 'Signed' | 'Unsigned';
  fileName: string;
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

const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Vận chuyển Tuabin Gió - Dự án Điện gió Bạc Liêu",
    category: "Hàng siêu trường siêu trọng",
    location: "Bạc Liêu, Việt Nam",
    date: "T8/2023",
    images: ["https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    desc: "Vận chuyển và lắp đặt thành công 10 trụ tuabin gió với chiều dài cánh quạt lên đến 70m, đảm bảo an toàn tuyệt đối trên địa hình phức tạp."
  },
  {
    id: 2,
    title: "Xuất khẩu 500 Container Gạo đi Châu Âu",
    category: "Vận tải biển (FCL)",
    location: "Cảng Cát Lái - Rotterdam",
    date: "T11/2023",
    images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    desc: "Hoàn tất thủ tục hải quan và vận chuyển lô hàng nông sản chủ lực đúng tiến độ, đáp ứng tiêu chuẩn khắt khe của EU."
  },
  {
    id: 3,
    title: "Dây chuyền sản xuất Nhà máy VinFast",
    category: "Logistics Dự án",
    location: "Hải Phòng, Việt Nam",
    date: "T5/2022",
    images: ["https://images.unsplash.com/photo-1565514020176-db793306c52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    desc: "Vận chuyển thiết bị robot và dây chuyền lắp ráp tự động từ cảng Hải Phòng về khu công nghiệp, hỗ trợ lắp đặt tận nơi."
  },
  {
    id: 4,
    title: "Vận chuyển Vắc-xin & Thiết bị Y tế",
    category: "Vận tải hàng không (Cold Chain)",
    location: "Nội Bài - Tân Sơn Nhất",
    date: "T2/2021",
    images: ["https://images.unsplash.com/photo-1584036561566-b93a945c50f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
    desc: "Giải pháp chuỗi cung ứng lạnh (Cold Chain) đảm bảo nhiệt độ ổn định cho lô hàng vắc-xin và thiết bị y tế khẩn cấp."
  }
];

const INITIAL_JOBS: Job[] = [
  { id: 1, title: "Nhân viên Kinh doanh Logistics", branch: "HCM", quantity: 2, type: "Toàn thời gian" },
  { id: 2, title: "Nhân viên chứng từ", branch: "HCM", quantity: 1, type: "Toàn thời gian" },
  { id: 3, title: "Nhân viên kế toán", branch: "HPH", quantity: 0, type: "Toàn thời gian" },
  { id: 4, title: "Nhân viên Ops", branch: "HPH", quantity: 1, type: "Toàn thời gian" }
];

const INITIAL_GALLERY: GalleryAlbum[] = [
  {
    id: 1,
    title: "Team Building 2023 - Phú Quốc",
    date: "05/2023",
    cover: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 2,
    title: "Văn phòng làm việc HCM",
    date: "01/2024",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: 3,
    title: "Kho bãi & Vận hành",
    date: "2023",
    cover: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ]
  }
];

const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 1,
    year: '1993',
    title: 'Thành lập công ty',
    desc: 'Khởi đầu với một văn phòng nhỏ tại TP.HCM và đội ngũ 10 nhân sự đầy nhiệt huyết, tập trung vào vận tải nội địa.'
  },
  {
    id: 2,
    year: '2005',
    title: 'Mở rộng quy mô',
    desc: 'Khai trương chi nhánh Hải Phòng và Đà Nẵng, chính thức sở hữu đội xe container riêng gồm 50 đầu kéo.'
  },
  {
    id: 3,
    year: '2015',
    title: 'Vươn ra biển lớn',
    desc: 'Thiết lập mạng lưới đại lý tại 120 quốc gia. Trở thành đối tác chiến lược của các hãng tàu lớn như Maersk, CMA CGM.'
  },
  {
    id: 4,
    year: '2023',
    title: 'Chuyển đổi số toàn diện',
    desc: 'Áp dụng hệ thống quản lý logistics thông minh (LMS), tối ưu hóa quy trình và cam kết giảm phát thải carbon.'
  }
];

const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [
  { id: 1, bl: 'LH-BL-5521', date: '12/05/2024', status: 'Signed', fileName: 'BB_Adjust_5521_Signed.pdf' },
  { id: 2, bl: 'LH-BL-6632', date: '11/05/2024', status: 'Unsigned', fileName: 'BB_Adjust_6632.pdf' },
  { id: 3, bl: 'LH-BL-7711', date: '09/05/2024', status: 'Signed', fileName: 'BB_Adjust_7711_Signed.pdf' },
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
  const [userFiles, setUserFiles] = useState<UserFileRecord[]>([]); // New: Track all user files
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
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [library, setLibrary] = useState<LibraryFolder[]>([
    { 
      id: 1, 
      name: 'Hàng Nhập', 
      files: [
        { id: 101, name: 'Import_Checklist.pdf', url: '#', uploadDate: '2024-01-15' },
        { id: 102, name: 'Manifest_Template.xlsx', url: '#', uploadDate: '2024-02-10' }
      ] 
    },
    { 
      id: 2, 
      name: 'Hàng Xuất', 
      files: [
        { id: 201, name: 'Export_Process.doc', url: '#', uploadDate: '2024-03-01' },
        { id: 202, name: 'SI_Template.pdf', url: '#', uploadDate: '2024-03-05' }
      ] 
    },
    { 
      id: 3, 
      name: 'Hợp đồng & Biểu mẫu', 
      files: [
        { id: 301, name: 'Contract_2024.docx', url: '#', uploadDate: '2024-01-01' },
        { id: 302, name: 'Power_of_Attorney.pdf', url: '#', uploadDate: '2024-01-20' }
      ] 
    }
  ]);
  const [galleryAlbums, setGalleryAlbums] = useState<GalleryAlbum[]>(INITIAL_GALLERY);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>(INITIAL_ADJUSTMENTS);
  
  // Server connection status
  const [isServerOnline, setIsServerOnline] = useState(true);

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
      userFiles,
      carriers,
      decrees,
      projects,
      jobs,
      library,
      galleryAlbums,
      milestones,
      adjustments,
      ...overrides
    };
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Data from Production API with Cache Busting
        const res = await fetch(`${API_BASE_URL}/api/data?t=${new Date().getTime()}`);
        if (res.ok) {
          const db = await res.json();
          // Only update if data exists to avoid wiping local state with empty DB
          if (db.users && db.users.length > 0) setUsers(db.users);
          if (db.notifications) setNotifications(db.notifications);
          if (db.statements) setStatements(db.statements);
          if (db.attendanceRecords) setAttendanceRecords(db.attendanceRecords);
          if (db.guq) setGuqRecords(db.guq);
          if (db.userFiles) setUserFiles(db.userFiles);
          if (db.carriers && db.carriers.length > 0) setCarriers(db.carriers);
          if (db.decrees && db.decrees.length > 0) setDecrees(db.decrees);
          if (db.projects && db.projects.length > 0) setProjects(db.projects);
          if (db.jobs && db.jobs.length > 0) setJobs(db.jobs);
          if (db.library && db.library.length > 0) setLibrary(db.library);
          if (db.galleryAlbums && db.galleryAlbums.length > 0) setGalleryAlbums(db.galleryAlbums);
          if (db.milestones && db.milestones.length > 0) setMilestones(db.milestones);
          if (db.adjustments && db.adjustments.length > 0) setAdjustments(db.adjustments);
          setIsServerOnline(true);
        } else {
            console.warn("Server responded but with error. Using local defaults.");
            setIsServerOnline(false);
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

  const handleUpdateGuq = (newGuq: GUQRecord[]) => {
    setGuqRecords(newGuq);
    syncToServer(getFullState({ guq: newGuq }));
  };

  const handleUpdateUserFiles = (newFiles: UserFileRecord[]) => {
    setUserFiles(newFiles);
    syncToServer(getFullState({ userFiles: newFiles }));
  };

  const handleUpdateCarriers = (newCarriers: Carrier[]) => {
    setCarriers(newCarriers);
    syncToServer(getFullState({ carriers: newCarriers }));
  };

  const handleUpdateDecrees = (newDecrees: Decree[]) => {
    setDecrees(newDecrees);
    syncToServer(getFullState({ decrees: newDecrees }));
  };

  const handleUpdateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    syncToServer(getFullState({ projects: newProjects }));
  };

  const handleUpdateJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    syncToServer(getFullState({ jobs: newJobs }));
  };

  const handleUpdateLibrary = (newLib: LibraryFolder[]) => {
    setLibrary(newLib);
    syncToServer(getFullState({ library: newLib }));
  };

  const handleUpdateGallery = (newAlbums: GalleryAlbum[]) => {
    setGalleryAlbums(newAlbums);
    syncToServer(getFullState({ galleryAlbums: newAlbums }));
  };

  const handleUpdateMilestones = (newMilestones: Milestone[]) => {
    setMilestones(newMilestones);
    syncToServer(getFullState({ milestones: newMilestones }));
  };

  const handleAddAdjustment = (record: AdjustmentRecord) => {
    const newAdjustments = [record, ...adjustments];
    setAdjustments(newAdjustments);
    syncToServer(getFullState({ adjustments: newAdjustments }));
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

  // --- REGISTRATION LOGIC ---
  const handleRegisterUser = (newUser: UserAccount): boolean => {
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return false;
    }

    const userWithId: UserAccount = {
        ...newUser,
        id: Date.now(),
        role: 'Customer', // Enforce Customer role for registration
        status: 'Active',
        failedAttempts: 0
    };

    handleUpdateUsers([...users, userWithId]);
    handleLogin('customer', userWithId, true); // Auto login new user
    return true;
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
                adjustments={adjustments}
                onAddAdjustment={handleAddAdjustment}
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
                library={library}
                onUpdateLibrary={handleUpdateLibrary}
                userFiles={userFiles}
                onUpdateUserFiles={handleUpdateUserFiles}
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
            userFiles={userFiles}
            onUpdateUserFiles={handleUpdateUserFiles}
            adjustments={adjustments}
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
          />
        );
      default:
        return (
          <>
            <Hero 
              projects={projects} 
              onUpdateProjects={handleUpdateProjects} 
              userRole={userRole}
            />
            <WhyChooseUs />
            <About 
              galleryAlbums={galleryAlbums}
              onUpdateGallery={handleUpdateGallery}
              milestones={milestones}
              onUpdateMilestones={handleUpdateMilestones}
              userRole={userRole}
            />
            <Services />
            <SafetyFeatures />
            <Jobs 
              jobs={jobs}
              onUpdateJobs={handleUpdateJobs}
              userRole={userRole}
            />
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
        onRegister={handleRegisterUser}
      />
      <main>
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;

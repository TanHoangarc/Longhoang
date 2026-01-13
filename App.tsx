
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
import AccountPage from './components/AccountPage';

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

const INITIAL_USERS: UserAccount[] = [
  { id: 1, name: 'Nguyễn Văn A (Sales 1)', role: 'Sales', email: 'sales1@longhoanglogistics.com', password: 'Jwckim@111', status: 'Active', failedAttempts: 0, department: 'Sales', position: 'Nhân viên kinh doanh' },
  { id: 2, name: 'Alan (Sales 2)', role: 'Sales', email: 'alan@longhoanglogistics.com', password: 'Jwckim@112', status: 'Active', failedAttempts: 0, department: 'Sales', position: 'Nhân viên kinh doanh' },
  { id: 3, name: 'Kế toán HPH', role: 'Accounting', email: 'acchph@longhoanglogistics.com', password: 'Jwckim@121', status: 'Active', failedAttempts: 0, department: 'Accounting', position: 'Kế toán viên' },
  { id: 4, name: 'Kế toán HCM', role: 'Accounting', email: 'account@longhoanglogistics.com', password: 'Jwckim@122', status: 'Active', failedAttempts: 0, department: 'Accounting', position: 'Kế toán trưởng' },
  { id: 5, name: 'Chuyên viên CT 1', role: 'Document', email: 'docs1@longhoanglogistics.com', password: 'Jwckim@131', status: 'Active', failedAttempts: 0, department: 'Document', position: 'Nhân viên chứng từ' },
  { id: 6, name: 'Chuyên viên CT 2', role: 'Document', email: 'docs2@longhoanglogistics.com', password: 'Jwckim@132', status: 'Active', failedAttempts: 0, department: 'Document', position: 'Nhân viên chứng từ' },
  { id: 7, name: 'Administrator', role: 'Admin', email: 'admin@longhoanglogistics.com', password: 'admin', status: 'Active', failedAttempts: 0, department: 'Board', position: 'Admin' },
];

function App() {
  const [activePage, setActivePage] = useState<'finance' | 'company' | 'management' | 'settings' | 'account' | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null); // Track logged in user
  
  // Lifted User State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

  // Lifted Notifications State
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 1,
      date: '20/05/2024',
      title: 'Thông báo nghỉ Lễ Quốc Khánh 2/9',
      content: 'Toàn thể nhân viên nghỉ lễ Quốc Khánh từ ngày 02/09 đến hết ngày 03/09.',
      attachment: 'Holiday_Schedule.pdf',
      startDate: '2024-09-02',
      expiryDate: '2024-09-03',
      isPinned: true,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      date: '10/01/2024',
      title: 'Thông báo nghỉ Tết Nguyên Đán 2025',
      content: 'Lịch nghỉ Tết âm lịch bắt đầu từ 25/01/2025 đến hết 02/02/2025.',
      attachment: '',
      startDate: '2025-01-25',
      expiryDate: '2025-02-02',
      isPinned: true,
      image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        date: '20/05/2024',
        title: 'Cập nhật phụ phí nhiên liệu tháng 06/2024',
        content: 'Thông báo về việc điều chỉnh phụ phí nhiên liệu (BAF) cho các tuyến vận tải biển quốc tế áp dụng từ ngày 01/06.',
        attachment: 'BAF_Update_June.pdf',
        startDate: '2024-06-01',
        expiryDate: '2025-06-30',
        isPinned: false,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Lifted Statements State (Bảng kê)
  const [statements, setStatements] = useState<StatementData[]>([
     // Sample data
     {
        id: 17165342345,
        month: '2025-07',
        createdDate: '2025-07-02',
        senderName: 'CÔNG TY TNHH DV VT THANH XUÂN ĐÀO',
        receiverName: 'CÔNG TY TNHH LONG HOÀNG',
        totalAmount: 2150000,
        status: 'Draft',
        rows: [
          { id: 1, date: '2025-07-02', plateNumber: '76H00791', from: 'CÁT LÁI', to: 'THỦ ĐỨC - NGUYÊN KHANG', price: 610000, note: 'LH 60', jobNo: 'VNSHALFF0158' },
          { id: 2, date: '2025-07-02', plateNumber: '50H35235', from: 'PHÚ HỮU', to: 'BÌNH THẠNH - PCCC', price: 680000, note: 'LH 80', jobNo: '' },
          { id: 3, date: '2025-07-03', plateNumber: '51D12607', from: 'CÁT LÁI', to: 'THUẬN AN - WORIME', price: 860000, note: 'LH 60', jobNo: 'VNSHALFF0156' },
        ],
        headerInfo: {
          sender: 'CÔNG TY TNHH DV VT THANH XUÂN ĐÀO',
          address: '41/15d/5/10 Đường Gò Cát, Phường Phú Hữu, Tp Thủ Đức, Tp Hồ Chí Minh',
          accountHolder: '',
          accountNumber: '1044115528',
          bank: 'Vietcombank',
          receiver: 'CÔNG TY TNHH LONG HOÀNG',
          invoiceDate: '2025-07-03'
        }
     }
  ]);

  // Lifted Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: 1, userId: 1, userName: 'Nguyễn Văn A (Sales 1)', date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: '17:00', status: 'Present' },
    { id: 2, userId: 2, userName: 'Alan (Sales 2)', date: new Date().toISOString().split('T')[0], checkIn: '08:15', checkOut: null, status: 'Late' },
    // Mock history
    { id: 3, userId: 1, userName: 'Nguyễn Văn A (Sales 1)', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], checkIn: '07:55', checkOut: '17:05', status: 'Present' },
    // Mock Leave
    { 
      id: 4, userId: 1, userName: 'Nguyễn Văn A (Sales 1)', date: '2025-07-10', checkIn: null, checkOut: null, status: 'On Leave', 
      leaveType: 'Paid', leaveDuration: 1, leaveReason: 'Nghỉ phép năm' 
    }
  ]);

  // Initialize session from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('lh_user_role') as UserRole;
    const savedUserJson = localStorage.getItem('lh_current_user');
    if (savedRole) {
      setUserRole(savedRole);
    }
    if (savedUserJson) {
        try {
            setCurrentUser(JSON.parse(savedUserJson));
        } catch (e) {
            console.error("Error parsing user");
        }
    }
  }, []);

  const handleLogin = (role: UserRole, user?: UserAccount) => {
    setUserRole(role);
    if (role) localStorage.setItem('lh_user_role', role);
    if (user) {
        setCurrentUser(user);
        localStorage.setItem('lh_current_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setActivePage(null);
    localStorage.removeItem('lh_user_role');
    localStorage.removeItem('lh_current_user');
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
        return (
            <CompanyPage 
                onClose={() => setActivePage(null)} 
                statements={statements} 
                onUpdateStatements={setStatements}
                currentUser={currentUser}
                attendanceRecords={attendanceRecords}
                onUpdateAttendance={setAttendanceRecords}
                notifications={notifications}
                onUpdateNotifications={setNotifications}
            />
        );
      case 'account':
        return (
            <AccountPage 
                onClose={() => setActivePage(null)} 
                statements={statements}
                onUpdateStatements={setStatements}
                attendanceRecords={attendanceRecords} // Pass all records to manager
                users={users} // Pass users to display full list
                onUpdateAttendance={setAttendanceRecords} // Pass setter to update records
                onUpdateUser={handleUpdateUser} // Pass user update handler
                notifications={notifications} // Pass notifications for holidays
            />
        );
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

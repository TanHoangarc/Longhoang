
import React, { useState, useMemo } from 'react';
import { 
  X, Bell, FileSpreadsheet, BarChart3, Library, LayoutDashboard, 
  BookOpen, Truck, Clock, FileText, MessageSquare, LogOut, ChevronRight,
  AlertCircle, CheckCircle, Calendar, Briefcase, TrendingUp, DollarSign, Filter, Activity, Target, Settings
} from 'lucide-react';
import CompanyNotifications from './company/CompanyNotifications';
import CompanyQuotation from './company/CompanyQuotation';
import CompanyReports from './company/CompanyReports';
import CompanyLibrary from './company/CompanyLibrary';
import CompanyDecrees from './company/CompanyDecrees';
import CompanyManifests from './company/CompanyManifests'; 
import Timekeeping from './attendance/Timekeeping';
import CompanyContract from './company/CompanyContract';
import CompanyRequests from './company/CompanyRequests';
import CompanyActivity from './company/CompanyActivity';
import CompanySettings from './company/CompanySettings';
import { StatementData, UserAccount, AttendanceRecord, SystemNotification, Decree, LibraryFolder, UserFileRecord, ContractRecord, QuotationRequest, GalleryAlbum, Milestone, UserRole } from '../App';

interface CompanyPageProps {
  onClose: () => void;
  statements: StatementData[]; 
  onUpdateStatements: (data: StatementData[]) => void;
  currentUser: UserAccount | null;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  notifications: SystemNotification[];
  onUpdateNotifications: (notifs: SystemNotification[]) => void;
  decrees: Decree[];
  onUpdateDecrees: (decrees: Decree[]) => void;
  library: LibraryFolder[];
  onUpdateLibrary: (lib: LibraryFolder[]) => void;
  userFiles: UserFileRecord[];
  onUpdateUserFiles: (files: UserFileRecord[]) => void;
  contracts: ContractRecord[];
  onUpdateContracts: (contracts: ContractRecord[]) => void;
  quotationRequests: QuotationRequest[];
  onUpdateQuotationRequests: (requests: QuotationRequest[]) => void;
  // Activity Props
  galleryAlbums: GalleryAlbum[];
  onUpdateGallery: (albums: GalleryAlbum[]) => void;
  milestones: Milestone[];
  onUpdateMilestones: (milestones: Milestone[]) => void;
  // User Update Prop
  onUpdateUser: (user: UserAccount) => void;
}

type ViewType = 'dashboard' | 'notifications' | 'quotation' | 'contract' | 'reports' | 'library' | 'decrees' | 'manifests' | 'attendance' | 'requests' | 'activity' | 'settings';

const CompanyPage: React.FC<CompanyPageProps> = ({ 
  onClose, statements, onUpdateStatements, currentUser, attendanceRecords, 
  onUpdateAttendance, notifications, onUpdateNotifications, decrees, onUpdateDecrees,
  library, onUpdateLibrary, userFiles, onUpdateUserFiles, contracts, onUpdateContracts,
  quotationRequests, onUpdateQuotationRequests, galleryAlbums, onUpdateGallery, milestones, onUpdateMilestones, onUpdateUser
}) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [reportFilterType, setReportFilterType] = useState<'week' | 'month' | 'year'>('month');

  // BACKGROUND IMAGE URL (Abstract Blue/Pink - Glassmorphism Style)
  const BG_IMAGE = "https://i.pinimg.com/736x/6d/53/90/6d539064383901fc10736820124e82c2.jpg";

  const handleAddFile = (newFile: UserFileRecord) => {
      onUpdateUserFiles([...userFiles, newFile]);
  };

  const getMappedRole = (role?: string): UserRole => {
    if (!role) return null;
    if (role === 'Admin') return 'admin';
    if (['Accounting', 'Manager'].includes(role)) return 'manager';
    if (role === 'Customer') return 'customer';
    return 'staff';
  };

  // Define all possible items
  const allItems = [
    { id: 'attendance', title: 'KPI hằng ngày', icon: Clock, color: 'text-indigo-600', desc: 'Check-in/Check-out và chấm công', label: 'KPI hằng ngày' },
    { id: 'notifications', title: 'Thông báo', icon: Bell, color: 'text-blue-600', desc: 'Thông tin nội bộ và tin tức chung', label: 'Thông báo' },
    { id: 'requests', title: 'Yêu cầu báo giá', icon: MessageSquare, color: 'text-rose-600', desc: 'Khách hàng yêu cầu từ Website', label: 'Yêu cầu BG' },
    { id: 'decrees', title: 'Nghị định', icon: BookOpen, color: 'text-red-600', desc: 'Cập nhật văn bản pháp luật mới', label: 'Nghị định' },
    { id: 'manifests', title: 'Bảng kê xe tải', icon: Truck, color: 'text-orange-600', desc: 'Xem bảng kê được chia sẻ từ Kế toán', label: 'Bảng kê' },
    { id: 'quotation', title: 'Lập báo giá', icon: FileSpreadsheet, color: 'text-green-600', desc: 'Báo giá hàng nhập/xuất chuyên nghiệp', label: 'Báo giá' },
    { id: 'contract', title: 'Hợp đồng', icon: FileText, color: 'text-teal-600', desc: 'Quản lý và soạn thảo hợp đồng vận chuyển', label: 'Hợp đồng' },
    { id: 'reports', title: 'Báo cáo', icon: BarChart3, color: 'text-purple-600', desc: 'Thống kê sản lượng và doanh thu cá nhân', label: 'Báo cáo' },
    { id: 'library', title: 'Thư viện mẫu', icon: Library, color: 'text-gray-600', desc: 'Kho biểu mẫu và tài liệu chuẩn hóa', label: 'Thư viện' },
    { id: 'activity', title: 'Hoạt động & Văn hóa', icon: Target, color: 'text-pink-600', desc: 'Hành trình phát triển và văn hóa công ty', label: 'Hoạt động' },
    { id: 'settings', title: 'Cài đặt', icon: Settings, color: 'text-slate-600', desc: 'Cập nhật thông tin cá nhân', label: 'Cài đặt' }
  ];

  // Filter items based on role
  const visibleItems = allItems.filter(item => {
    // Account (Accounting) -> Hide Manifests (They have their own portal for this)
    if (item.id === 'manifests' && currentUser?.role === 'Accounting') return false;
    
    // Document -> Hide Quotation & Reports
    if ((item.id === 'quotation' || item.id === 'reports') && currentUser?.role === 'Document') return false;

    return true;
  });

  // --- DASHBOARD CALCULATIONS ---
  const dashboardStats = useMemo(() => {
    if (!currentUser) return { 
        leaveRemaining: 0, 
        pendingManifests: 0, 
        pendingRequests: 0, 
        missingReport: false, 
        upcomingHolidays: [],
        validDecrees: [],
        generalNotifs: [],
        report: { booking: 0, profit: 0, running: 0, revenue: 0 }
    };

    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Leave Balance
    const usedLeave = attendanceRecords
      .filter(r => r.userId === currentUser.id && r.status === 'On Leave' && r.leaveType === 'Paid' && new Date(r.date).getFullYear() === currentYear)
      .reduce((sum, r) => sum + (r.leaveDuration || 1), 0);
    const leaveRemaining = Math.max(0, 12 - usedLeave);

    // 2. Pending Manifests (Shared status)
    const pendingManifests = statements.filter(s => s.status === 'Shared').length;

    // 3. Pending Requests (Assigned to user)
    const pendingRequests = quotationRequests.filter(q => q.assignedToId === currentUser.id && q.status === 'Pending').length;

    // 4. Missing Weekly Report
    const getWeekNumber = (d: Date) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };
    const currentWeek = getWeekNumber(new Date());
    const hasReportThisWeek = userFiles.some(f => {
        if (f.userId !== currentUser.id || f.type !== 'REPORT') return false;
        const parts = f.date.split('/');
        if (parts.length === 3) {
            const fileDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            return getWeekNumber(fileDate) === currentWeek;
        }
        return false;
    });
    const missingReport = !hasReportThisWeek;

    // 5. Notifications & Holidays
    const todayStr = now.toISOString().split('T')[0];
    const upcomingHolidays = notifications.filter(n => {
        const isHolidayType = /nghỉ lễ|tết|holiday|giỗ|quốc khánh|thống nhất/i.test(n.title);
        return isHolidayType && n.startDate && n.startDate >= todayStr;
    });
    const generalNotifs = notifications.filter(n => {
        const isHolidayType = /nghỉ lễ|tết|holiday|giỗ|quốc khánh|thống nhất/i.test(n.title);
        return !isHolidayType; // Everything else
    });

    // 6. Valid Decrees
    const validDecrees = decrees.filter(d => d.expiryDate >= todayStr);

    // 7. Report Summary Logic
    // Helper to check date range
    const isInRange = (dateStr: string) => {
        const d = new Date(dateStr);
        if (reportFilterType === 'year') return d.getFullYear() === currentYear;
        if (reportFilterType === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear;
        if (reportFilterType === 'week') return getWeekNumber(d) === currentWeek && d.getFullYear() === currentYear;
        return false;
    };

    const bookingCount = quotationRequests.filter(q => isInRange(q.date.split('/').reverse().join('-'))).length;
    
    // Mock Profit & Revenue based on Statements (Manifests)
    const relevantStatements = statements.filter(s => isInRange(s.createdDate));
    const revenue = relevantStatements.reduce((sum, s) => sum + s.totalAmount, 0);
    const profit = revenue * 0.15; // Mock 15% margin
    const running = statements.filter(s => s.status !== 'Locked').length;

    return { 
        leaveRemaining, 
        pendingManifests, 
        pendingRequests, 
        missingReport, 
        upcomingHolidays, 
        validDecrees, 
        generalNotifs,
        report: { booking: bookingCount, profit, running, revenue }
    };
  }, [currentUser, attendanceRecords, statements, quotationRequests, userFiles, notifications, decrees, reportFilterType]);


  const renderContent = () => {
    switch (activeView) {
      case 'notifications': return <CompanyNotifications notifications={notifications} onUpdate={onUpdateNotifications} />;
      case 'quotation': return <CompanyQuotation currentUser={currentUser} onAddFile={handleAddFile} userFiles={userFiles} onUpdateUserFiles={onUpdateUserFiles} />;
      case 'contract': return <CompanyContract contracts={contracts} onUpdateContracts={onUpdateContracts} currentUser={currentUser} />;
      case 'reports': return <CompanyReports currentUser={currentUser} />;
      case 'library': return <CompanyLibrary currentUser={currentUser} folders={library} onUpdate={onUpdateLibrary} />;
      case 'decrees': return <CompanyDecrees decrees={decrees} onUpdate={onUpdateDecrees} />;
      case 'manifests': return <CompanyManifests statements={statements} onUpdateStatements={onUpdateStatements} currentUser={currentUser} />;
      case 'attendance': return <Timekeeping currentUser={currentUser} attendanceRecords={attendanceRecords} onUpdateAttendance={onUpdateAttendance} />;
      case 'requests': return <CompanyRequests requests={quotationRequests} onUpdateRequests={onUpdateQuotationRequests} currentUser={currentUser} />;
      case 'activity': return <CompanyActivity galleryAlbums={galleryAlbums} onUpdateGallery={onUpdateGallery} milestones={milestones} onUpdateMilestones={onUpdateMilestones} currentUserRole={getMappedRole(currentUser?.role)} />;
      case 'settings': return <CompanySettings currentUser={currentUser} onUpdateUser={onUpdateUser} />;
      default: return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/30 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                        Xin chào, <span className="text-blue-600">{currentUser?.name || 'Đồng nghiệp'}</span> 👋
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Filter Controls for Report */}
                    <div className="bg-white/50 border border-white/60 rounded-xl p-1 flex shadow-sm">
                        {(['week', 'month', 'year'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setReportFilterType(type)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                    reportFilterType === type 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                }`}
                            >
                                {type === 'week' ? 'Tuần' : type === 'month' ? 'Tháng' : 'Năm'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* REPORT SUMMARY SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Leave Balance */}
                <div className="bg-gradient-to-br from-indigo-500/90 to-purple-600/90 backdrop-blur-md rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform border border-white/20">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/20 p-2 rounded-xl"><Clock size={20} /></div>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">Phép năm {new Date().getFullYear()}</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black">{dashboardStats.leaveRemaining}</h3>
                            <p className="text-xs opacity-90 font-medium">Số ngày còn lại</p>
                        </div>
                    </div>
                    <Clock size={100} className="absolute -bottom-4 -right-4 opacity-10 rotate-12" />
                </div>

                {/* 2. Bookings */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <MessageSquare size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Booking / Leads</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">{dashboardStats.report.booking}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Yêu cầu mới trong {reportFilterType}</p>
                </div>

                {/* 3. Profit (Mock) */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Lợi nhuận (Est)</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">{dashboardStats.report.profit.toLocaleString()} <span className="text-xs font-normal text-slate-400">VNĐ</span></h3>
                    <p className="text-xs text-green-600 mt-1 font-bold">+12% so với kỳ trước</p>
                </div>

                {/* 4. Revenue & Running */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Truck size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Vận hành</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">{dashboardStats.report.running}</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Lô đang chạy</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold">Doanh thu (Est)</p>
                            <p className="text-sm font-bold text-slate-800">{dashboardStats.report.revenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACCESS - Activity Card */}
            <div onClick={() => setActiveView('activity')} className="bg-gradient-to-r from-pink-500/90 to-rose-500/90 backdrop-blur-md rounded-2xl p-6 text-white shadow-lg cursor-pointer hover:-translate-y-1 transition-transform relative overflow-hidden group border border-white/20">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold mb-1 flex items-center">
                            <Target size={24} className="mr-2" /> Hoạt động & Văn hóa
                        </h3>
                        <p className="text-white/90 text-sm font-medium">Khám phá hành trình phát triển và các giá trị cốt lõi của Long Hoang Logistics</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition">
                        <ChevronRight size={24} />
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                    <Target size={150} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: DECREES & ALERTS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Decrees */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                        <div className="p-4 bg-white/40 border-b border-white/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <BookOpen size={18} className="mr-2 text-red-600" /> Văn bản & Nghị định hiệu lực
                            </h3>
                            <span className="text-xs font-bold bg-white/60 border border-white/60 px-2 py-1 rounded text-slate-500">{dashboardStats.validDecrees.length}</span>
                        </div>
                        <div className="divide-y divide-white/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {dashboardStats.validDecrees.map(decree => (
                                <div key={decree.id} className="p-4 hover:bg-white/60 transition flex items-start gap-3">
                                    <div className="mt-1 min-w-[60px] text-[10px] font-bold text-slate-400 border border-white/60 rounded px-1 py-0.5 text-center bg-white/40">
                                        {new Date(decree.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{decree.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{decree.content}</p>
                                    </div>
                                </div>
                            ))}
                            {dashboardStats.validDecrees.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm italic">Hiện không có văn bản mới.</div>
                            )}
                        </div>
                    </div>

                    {/* Holiday Alerts */}
                    {dashboardStats.upcomingHolidays.length > 0 && (
                        <div className="bg-pink-50/80 border border-pink-100 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                            <div className="p-3 bg-pink-100 text-pink-600 rounded-full">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-pink-700">Sắp tới ngày nghỉ lễ!</h4>
                                <p className="text-sm text-pink-600">
                                    {dashboardStats.upcomingHolidays[0].title} ({new Date(dashboardStats.upcomingHolidays[0].startDate).toLocaleDateString('vi-VN')})
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: NOTIFICATIONS */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden h-fit">
                    <div className="p-4 bg-white/40 border-b border-white/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <Bell size={18} className="mr-2 text-blue-600" /> Thông báo khác
                        </h3>
                        <button onClick={() => setActiveView('notifications')} className="text-xs text-blue-600 font-bold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="divide-y divide-white/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {dashboardStats.generalNotifs.slice(0, 5).map(notif => (
                            <div key={notif.id} className="p-4 hover:bg-white/60 transition">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{new Date(notif.date).toLocaleDateString('vi-VN')}</span>
                                    {notif.isPinned && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded font-bold">Ghim</span>}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-2">{notif.title}</h4>
                            </div>
                        ))}
                        {dashboardStats.generalNotifs.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm italic">Không có thông báo mới.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
    }
  };

  return (
    <div className="relative h-screen overflow-hidden font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
          <img src={BG_IMAGE} alt="Glassmorphism Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[5px]"></div>
      </div>
      
      <div className="flex h-full relative z-10">
        {/* SIDEBAR - Ultra Glass */}
        <aside className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/40 flex flex-col flex-shrink-0 shadow-xl z-20">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-white/30">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    L
                </div>
                <div className="ml-3">
                    <h1 className="font-black text-xl tracking-tight text-slate-800">LONG HOANG</h1>
                    <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Internal Portal</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                <button
                    onClick={() => setActiveView('dashboard')}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${
                        activeView === 'dashboard' 
                        ? 'bg-white/80 shadow-lg shadow-blue-100 text-slate-900 font-bold scale-100 border border-white/50' 
                        : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium hover:shadow-sm'
                    }`}
                >
                    <LayoutDashboard size={20} className={`mr-3 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-sm flex-1 text-left">Bàn làm việc</span>
                    {activeView === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
                </button>

                <div className="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Chức năng
                </div>

                {visibleItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as ViewType)}
                        className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${
                            activeView === item.id 
                            ? 'bg-white/80 shadow-lg shadow-blue-100 text-slate-900 font-bold scale-100 border border-white/50' 
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium hover:shadow-sm'
                        }`}
                    >
                        <item.icon size={18} className={`mr-3 ${activeView === item.id ? item.color : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {activeView === item.id && <ChevronRight size={16} className="text-slate-400" />}
                    </button>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-6 border-t border-white/30 bg-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/50">
                        {currentUser?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{currentUser?.role}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg text-slate-500 hover:text-red-500 transition shadow-sm">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative p-6 md:p-10 z-10">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                {/* Content Container - Glass Card */}
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/40 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>
                
                <div className="py-4 text-center text-xs text-slate-500 font-medium bg-white/30 backdrop-blur-sm border-t border-white/20 mt-4 rounded-xl">
                    Hệ thống Quản lý Nội bộ Long Hoang Logistics v3.2.0 • {new Date().getFullYear()}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyPage;

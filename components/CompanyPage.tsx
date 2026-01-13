
import React, { useState } from 'react';
import { 
  X, Bell, FileSpreadsheet, BarChart3, Library, ArrowLeft, LayoutDashboard, ChevronRight, BookOpen, Truck, Clock
} from 'lucide-react';
import CompanyNotifications from './company/CompanyNotifications';
import CompanyQuotation from './company/CompanyQuotation';
import CompanyReports from './company/CompanyReports';
import CompanyLibrary from './company/CompanyLibrary';
import CompanyDecrees from './company/CompanyDecrees';
import CompanyManifests from './company/CompanyManifests'; 
import Timekeeping from './attendance/Timekeeping';
import { StatementData, UserAccount, AttendanceRecord, SystemNotification } from '../App';

interface CompanyPageProps {
  onClose: () => void;
  statements: StatementData[]; 
  onUpdateStatements: (data: StatementData[]) => void;
  currentUser: UserAccount | null;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  notifications: SystemNotification[];
  onUpdateNotifications: (notifs: SystemNotification[]) => void;
}

type ViewType = 'dashboard' | 'notifications' | 'quotation' | 'reports' | 'library' | 'decrees' | 'manifests' | 'attendance';

const CompanyPage: React.FC<CompanyPageProps> = ({ 
  onClose, statements, onUpdateStatements, currentUser, attendanceRecords, onUpdateAttendance, notifications, onUpdateNotifications 
}) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'notifications': return <CompanyNotifications notifications={notifications} onUpdate={onUpdateNotifications} />;
      case 'quotation': return <CompanyQuotation currentUser={currentUser} />;
      case 'reports': return <CompanyReports currentUser={currentUser} />;
      case 'library': return <CompanyLibrary />;
      case 'decrees': return <CompanyDecrees />;
      case 'manifests': return <CompanyManifests statements={statements} onUpdateStatements={onUpdateStatements} />;
      case 'attendance': return <Timekeeping currentUser={currentUser} attendanceRecords={attendanceRecords} onUpdateAttendance={onUpdateAttendance} />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'attendance', title: 'Chấm công', icon: Clock, color: 'bg-indigo-600', desc: 'Check-in/Check-out hàng ngày' },
            { id: 'notifications', title: 'Thông báo', icon: Bell, color: 'bg-blue-500', desc: 'Thông tin nội bộ và tin tức chung' },
            { id: 'decrees', title: 'Nghị định', icon: BookOpen, color: 'bg-red-500', desc: 'Cập nhật văn bản pháp luật mới' },
            { id: 'manifests', title: 'Bảng kê xe tải', icon: Truck, color: 'bg-orange-500', desc: 'Xem bảng kê được chia sẻ từ Kế toán' },
            { id: 'quotation', title: 'Lập báo giá', icon: FileSpreadsheet, color: 'bg-green-500', desc: 'Báo giá hàng nhập/xuất chuyên nghiệp' },
            { id: 'reports', title: 'Báo cáo', icon: BarChart3, color: 'bg-purple-500', desc: 'Thống kê sản lượng và doanh thu cá nhân' },
            { id: 'library', title: 'Thư viện mẫu', icon: Library, color: 'bg-gray-800', desc: 'Kho biểu mẫu và tài liệu chuẩn hóa' }
          ].map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveView(item.id as ViewType)}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              <div className="mt-6 flex items-center text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Truy cập <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#1e2a3b] text-white py-4 px-8 sticky top-0 z-40 shadow-lg border-b border-white/5 print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="LH Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold uppercase tracking-tighter text-sm">Long Hoang <span className="text-primary">Staff</span></span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 ml-6">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Bàn làm việc' },
                { id: 'attendance', icon: Clock, label: 'Chấm công' },
                { id: 'manifests', icon: Truck, label: 'Bảng kê' },
                { id: 'quotation', icon: FileSpreadsheet, label: 'Báo giá' },
                { id: 'reports', icon: BarChart3, label: 'Báo cáo' },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === item.id ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {currentUser && (
                 <div className="hidden md:flex items-center bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                     <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold mr-2">
                         {currentUser.name.charAt(0)}
                     </div>
                     <span className="text-xs font-medium">{currentUser.name}</span>
                 </div>
             )}
             <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                <X size={20} />
             </button>
          </div>
        </div>
      </div>
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl print:py-0 print:px-0 print:max-w-none">
        {activeView !== 'dashboard' && (
          <button 
            onClick={() => setActiveView('dashboard')}
            className="mb-8 flex items-center text-gray-400 hover:text-primary transition font-bold text-xs uppercase tracking-widest group print:hidden"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại Bàn làm việc
          </button>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium print:hidden">
        Hệ thống Quản lý Nội bộ Long Hoang Logistics v3.2.0 • {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default CompanyPage;

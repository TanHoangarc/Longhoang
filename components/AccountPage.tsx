
import React, { useState } from 'react';
import { X, ArrowLeft, LayoutDashboard, FileSpreadsheet, Clock, UserCheck, Database, Plus, ChevronRight, Search, FileText, Lock } from 'lucide-react';
import AccountStatement from './account/AccountStatement';
import AccountData, { Carrier } from './account/AccountData';
import AccountAttendance from './account/AccountAttendance';
import { StatementData, AttendanceRecord, UserAccount, SystemNotification } from '../App';

interface AccountPageProps {
  onClose: () => void;
  statements: StatementData[];
  onUpdateStatements: (data: StatementData[]) => void;
  attendanceRecords: AttendanceRecord[];
  users: UserAccount[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateUser: (user: UserAccount) => void;
  notifications: SystemNotification[];
  carriers: Carrier[];
  onUpdateCarriers: (carriers: Carrier[]) => void;
}

type ViewType = 'dashboard' | 'statement_list' | 'statement_edit' | 'attendance' | 'data';

const AccountPage: React.FC<AccountPageProps> = ({ 
  onClose, statements, onUpdateStatements, attendanceRecords, users, 
  onUpdateAttendance, onUpdateUser, notifications, carriers, onUpdateCarriers 
}) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedStatement, setSelectedStatement] = useState<StatementData | undefined>(undefined);

  const handleCreateNewStatement = () => {
      setSelectedStatement(undefined);
      setActiveView('statement_edit');
  };

  const handleEditStatement = (stmt: StatementData) => {
      setSelectedStatement(stmt);
      setActiveView('statement_edit');
  };

  const handleSaveStatement = (data: StatementData) => {
      // Check if exists
      const exists = statements.find(s => s.id === data.id);
      if (exists) {
          onUpdateStatements(statements.map(s => s.id === data.id ? data : s));
      } else {
          onUpdateStatements([...statements, data]);
      }
      setActiveView('statement_list');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'statement_list':
        // Group statements by Month
        const grouped = statements.reduce((acc, stmt) => {
            if (!acc[stmt.month]) acc[stmt.month] = [];
            acc[stmt.month].push(stmt);
            return acc;
        }, {} as Record<string, StatementData[]>);

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Danh sách Bảng kê</h3>
                        <p className="text-sm text-gray-500">Quản lý và theo dõi bảng kê vận chuyển</p>
                    </div>
                    <button 
                        onClick={handleCreateNewStatement}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg transition"
                    >
                        <Plus size={16} className="mr-2" /> Tạo Bảng kê mới
                    </button>
                </div>

                {/* Filter / Search placeholder */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center shadow-sm">
                    <Search className="text-gray-400 mr-2" size={20} />
                    <input type="text" placeholder="Tìm kiếm theo tên nhà xe..." className="w-full outline-none text-sm" />
                </div>

                <div className="space-y-8">
                    {Object.keys(grouped).sort().reverse().map(month => (
                        <div key={month}>
                            <h4 className="text-lg font-bold text-gray-700 mb-3 border-l-4 border-green-500 pl-3">Tháng {month}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {grouped[month].map(stmt => (
                                    <div 
                                        key={stmt.id}
                                        onClick={() => handleEditStatement(stmt)}
                                        className="bg-white p-5 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                                                <FileSpreadsheet size={20} />
                                            </div>
                                            {stmt.status === 'Shared' && (
                                                <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center">
                                                    <Lock size={10} className="mr-1" /> Shared
                                                </div>
                                            )}
                                            {stmt.status === 'Draft' && (
                                                 <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                    Draft
                                                 </div>
                                            )}
                                        </div>
                                        <h5 className="font-bold text-gray-800 line-clamp-1 group-hover:text-green-600 transition">{stmt.senderName}</h5>
                                        <p className="text-xs text-gray-500 mb-3">Ngày tạo: {stmt.createdDate}</p>
                                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                            <span className="font-black text-gray-800">{stmt.totalAmount.toLocaleString()} đ</span>
                                            <span className="text-[10px] text-gray-400">{stmt.rows.length} chuyến</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {statements.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            Chưa có bảng kê nào. Hãy tạo mới ngay!
                        </div>
                    )}
                </div>
            </div>
        );

      case 'statement_edit': 
        return (
            <AccountStatement 
                carriers={carriers} 
                initialData={selectedStatement}
                onSave={handleSaveStatement}
                onBack={() => setActiveView('statement_list')}
            />
        );

      case 'data': return <AccountData carriers={carriers} onUpdate={onUpdateCarriers} />;
      case 'attendance': return <AccountAttendance attendanceRecords={attendanceRecords} users={users} onUpdate={onUpdateAttendance} onUpdateUser={onUpdateUser} notifications={notifications} />;
      
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            onClick={() => setActiveView('statement_list')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">Bảng kê xe tải</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Tạo, quản lý và in ấn bảng kê vận chuyển xe tải, tính toán VAT tự động.</p>
          </div>

          <div 
            onClick={() => setActiveView('data')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">Dữ liệu nhà xe</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Quản lý danh sách nhà xe, thông tin chuyển khoản và địa chỉ.</p>
          </div>

          <div 
            onClick={() => setActiveView('attendance')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Chấm công</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Quản lý ngày công, tăng ca và phép năm của nhân sự.</p>
          </div>
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
              <span className="font-bold uppercase tracking-tighter text-sm">Account <span className="text-green-500">Portal</span></span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 ml-6">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
                { id: 'statement_list', icon: FileSpreadsheet, label: 'Bảng kê' },
                { id: 'data', icon: Database, label: 'Dữ liệu' },
                { id: 'attendance', icon: UserCheck, label: 'Chấm công' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === item.id || (activeView === 'statement_edit' && item.id === 'statement_list') ? 'bg-white/10 text-green-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl print:py-0 print:px-0 print:max-w-none">
        {activeView !== 'dashboard' && (
          <button 
            onClick={() => setActiveView('dashboard')}
            className="mb-8 flex items-center text-gray-400 hover:text-green-600 transition font-bold text-xs uppercase tracking-widest group print:hidden"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại Tổng quan
          </button>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
      
      <div className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium print:hidden">
        Hệ thống Kế toán Long Hoang Logistics v1.0 • {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default AccountPage;

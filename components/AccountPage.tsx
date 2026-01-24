
import React, { useState } from 'react';
import { 
    X, LayoutDashboard, FileSpreadsheet, DollarSign, UserCheck, 
    LogOut, ChevronRight, Menu, Wallet, Banknote, Search, Filter, Trash2, Calendar
} from 'lucide-react';
import AccountStatement from './account/AccountStatement';
import AccountData, { Carrier } from './account/AccountData';
import AccountAttendance from './account/AccountAttendance';
import AccountDebitNote from './account/AccountDebitNote';
import AccountOverview from './account/AccountOverview';
import AccountWCA from './account/AccountWCA';
import AccountSalary from './account/AccountSalary';
import { StatementData, AttendanceRecord, UserAccount, SystemNotification, DebitNoteRecord, CustomerDef, FeeDef } from '../App';

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
  debitNotes: DebitNoteRecord[]; 
  onUpdateDebitNotes: (notes: DebitNoteRecord[]) => void;
  // Config Props
  customerDefs?: CustomerDef[];
  onUpdateCustomerDefs?: (defs: CustomerDef[]) => void;
  feeDefs?: FeeDef[];
  onUpdateFeeDefs?: (defs: FeeDef[]) => void;
}

type ViewType = 'dashboard' | 'statement_list' | 'statement_edit' | 'attendance' | 'debit_list' | 'debit_edit' | 'wca' | 'salary';

const AccountPage: React.FC<AccountPageProps> = ({ 
  onClose, statements, onUpdateStatements, attendanceRecords, users, 
  onUpdateAttendance, onUpdateUser, notifications, carriers, onUpdateCarriers,
  debitNotes = [], onUpdateDebitNotes, 
  customerDefs = [], onUpdateCustomerDefs = (_defs: CustomerDef[]) => {},
  feeDefs = [], onUpdateFeeDefs = (_defs: FeeDef[]) => {}
}) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedStatement, setSelectedStatement] = useState<StatementData | undefined>(undefined);
  const [selectedDebitNote, setSelectedDebitNote] = useState<DebitNoteRecord | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Statement Filters
  const [stmtFilterMonth, setStmtFilterMonth] = useState<number | 'All'>(new Date().getMonth() + 1);
  const [stmtFilterYear, setStmtFilterYear] = useState<number>(2026); // Default to 2026

  // BACKGROUND IMAGE URL (Abstract Blue/Pink - Glassmorphism Style)
  const BG_IMAGE = "https://i.pinimg.com/736x/6d/53/90/6d539064383901fc10736820124e82c2.jpg";

  // Menu Definition
  const menuItems = [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, color: 'text-blue-600' },
      { id: 'statement_list', label: 'Bảng kê', icon: FileSpreadsheet, color: 'text-green-600' },
      { id: 'debit_list', label: 'Debit Note', icon: DollarSign, color: 'text-orange-600' },
      { id: 'attendance', label: 'Chấm công', icon: UserCheck, color: 'text-indigo-600' },
      { id: 'salary', label: 'Lương', icon: Banknote, color: 'text-emerald-600' },
      { id: 'wca', label: 'WCA', icon: Wallet, color: 'text-purple-600' },
  ];

  // --- STATEMENT HANDLERS ---
  const handleCreateNewStatement = () => {
      setSelectedStatement(undefined);
      setActiveView('statement_edit');
  };

  const handleEditStatement = (stmt: StatementData) => {
      setSelectedStatement(stmt);
      setActiveView('statement_edit');
  };

  const handleDeleteStatement = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Bạn có chắc chắn muốn xóa bảng kê này? Dữ liệu sẽ không thể khôi phục.')) {
          onUpdateStatements(statements.filter(s => s.id !== id));
      }
  };

  const handleSaveStatement = (data: StatementData) => {
      const exists = statements.find(s => s.id === data.id);
      if (exists) {
          onUpdateStatements(statements.map(s => s.id === data.id ? data : s));
      } else {
          onUpdateStatements([...statements, data]);
      }
      setActiveView('statement_list');
  };

  // --- DEBIT NOTE HANDLERS ---
  const handleCreateNewDebit = () => {
      setSelectedDebitNote(undefined);
      setActiveView('debit_edit');
  };

  const handleEditDebit = (note: DebitNoteRecord) => {
      setSelectedDebitNote(note);
      setActiveView('debit_edit');
  };

  const handleDeleteDebit = (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa Debit Note này?')) {
          onUpdateDebitNotes(debitNotes.filter(n => n.id !== id));
      }
  };

  const handleSaveDebit = (data: DebitNoteRecord) => {
      const exists = debitNotes.find(n => n.id === data.id);
      if (exists) {
          onUpdateDebitNotes(debitNotes.map(n => n.id === data.id ? data : n));
      } else {
          onUpdateDebitNotes([...debitNotes, data]);
      }
      setActiveView('debit_list');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'statement_list':
        const filteredStatements = statements.filter(stmt => {
            const matchesSearch = (stmt.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (stmt.senderName || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            // Period filtering
            const [y, m] = stmt.month.split('-').map(Number);
            const matchesMonth = stmtFilterMonth === 'All' || m === stmtFilterMonth;
            const matchesYear = y === stmtFilterYear;

            return matchesSearch && matchesMonth && matchesYear;
        });

        const grouped = filteredStatements.reduce((acc, stmt) => {
            if (!acc[stmt.month]) acc[stmt.month] = [];
            acc[stmt.month].push(stmt);
            return acc;
        }, {} as Record<string, StatementData[]>);

        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 uppercase">QUẢN LÝ BẢNG KÊ</h3>
                        <p className="text-sm text-gray-500">Theo dõi bảng kê vận chuyển xe tải</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 space-x-1">
                            <div className="relative">
                                <Calendar className="absolute left-2 top-2 text-gray-400" size={14} />
                                <select 
                                    className="pl-7 pr-2 py-1 bg-transparent text-xs font-bold outline-none border-none"
                                    value={stmtFilterMonth}
                                    onChange={(e) => setStmtFilterMonth(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                                >
                                    <option value="All">Tất cả tháng</option>
                                    {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                                </select>
                            </div>
                            <div className="w-px bg-gray-200 my-1"></div>
                            <select 
                                className="px-2 py-1 bg-transparent text-xs font-bold outline-none border-none"
                                value={stmtFilterYear}
                                onChange={(e) => setStmtFilterYear(Number(e.target.value))}
                            >
                                {/* Start from 2026 onwards as requested */}
                                {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm bảng kê..." 
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCreateNewStatement}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition-all"
                        >
                            <FileSpreadsheet size={16} className="mr-2" /> Tạo mới
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {Object.keys(grouped).sort().reverse().map(month => (
                        <div key={month}>
                            <h4 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-green-500 pl-3">Tháng {month}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {grouped[month].map(stmt => (
                                    <div 
                                        key={stmt.id}
                                        onClick={() => handleEditStatement(stmt)}
                                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-green-300 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                <FileSpreadsheet size={20} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    stmt.status === 'Locked' ? 'bg-green-100 text-green-700' : 
                                                    stmt.status === 'Shared' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {stmt.status}
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteStatement(stmt.id, e); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                    title="Xóa bảng kê"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h5 className="font-bold text-slate-800 line-clamp-1 group-hover:text-green-600 transition">{stmt.title || stmt.senderName}</h5>
                                        <p className="text-xs text-slate-500 mb-3">Ngày tạo: {stmt.createdDate}</p>
                                        <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                            <span className="font-black text-slate-800">{stmt.totalAmount.toLocaleString()} đ</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{stmt.rows.length} chuyến</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredStatements.length === 0 && (
                        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                            {searchTerm || stmtFilterMonth !== 'All' ? 'Không tìm thấy bảng kê nào phù hợp với bộ lọc.' : 'Chưa có bảng kê nào cho thời kỳ này.'}
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

      case 'debit_list':
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 uppercase">QUẢN LÝ DEBIT NOTE</h3>
                        <p className="text-sm text-gray-500">Quản lý công nợ và báo cáo khách hàng</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm Debit Note..." 
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCreateNewDebit}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition-all"
                        >
                            <DollarSign size={16} className="mr-2" /> Tạo mới
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden w-full animate-in fade-in">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-bold text-slate-400 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Ngày tạo</th>
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Job No</th>
                                <th className="px-6 py-4">HBL</th>
                                <th className="px-6 py-4 text-right">Tổng VND</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {debitNotes.map(note => {
                                const totalVND = note.items.reduce((sum, item) => {
                                    const amount = item.price * item.qty * (1 + item.vat/100);
                                    const vnd = item.currency === 'USD' ? amount * note.roe : amount;
                                    return sum + vnd;
                                }, 0);

                                return (
                                    <tr key={note.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleEditDebit(note)}>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(note.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">{note.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600 font-bold">{note.jobNo}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{note.hbl}</td>
                                        <td className="px-6 py-4 text-right font-black text-slate-700">{totalVND.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDebit(note.id); }} 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <X size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {debitNotes.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400 italic">Chưa có Debit Note nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );

      case 'debit_edit':
        return (
            <AccountDebitNote 
                initialData={selectedDebitNote}
                onSave={handleSaveDebit}
                onBack={() => setActiveView('debit_list')}
                customerDefs={customerDefs}
                onAddCustomer={ (c) => onUpdateCustomerDefs([...customerDefs, c]) }
                feeDefs={feeDefs}
                onAddFee={ (f) => onUpdateFeeDefs([...feeDefs, f]) }
            />
        );
      
      case 'attendance': return <AccountAttendance attendanceRecords={attendanceRecords} users={users} onUpdate={onUpdateAttendance} onUpdateUser={onUpdateUser} notifications={notifications} />;
      case 'salary': return <AccountSalary users={users} attendanceRecords={attendanceRecords} />;
      case 'wca': return <AccountWCA />;
      
      default: return (
        <AccountOverview users={users} attendanceRecords={attendanceRecords} />
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans relative">
      <div className="absolute inset-0 z-0">
          <img src={BG_IMAGE} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[5px]"></div>
      </div>
      
      <div className="flex h-full relative z-10 w-full">
        <aside className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/40 flex flex-col flex-shrink-0 shadow-xl z-20">
            <div className="h-24 flex items-center px-8 border-b border-white/30">
                <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-green-500/30">K</div>
                <div className="ml-3">
                    <h1 className="font-black text-xl tracking-tight text-slate-800">LONG HOÀNG</h1>
                    <p className="text-[10px] font-bold text-green-600 tracking-widest uppercase">Account</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {menuItems.map(item => {
                    const isActive = activeView === item.id || 
                        (activeView === 'statement_edit' && item.id === 'statement_list') ||
                        (activeView === 'debit_edit' && item.id === 'debit_list');

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as ViewType)}
                            className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${
                                isActive 
                                ? 'bg-white/80 shadow-lg shadow-blue-100 text-slate-900 font-bold scale-100 border border-white/50' 
                                : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium hover:shadow-sm'
                            }`}
                        >
                            <div className={`p-2 rounded-xl mr-3 transition-colors ${isActive ? item.color + ' bg-white/50' : 'bg-white/50 text-slate-400 group-hover:text-slate-600'}`}>
                                <item.icon size={20} />
                            </div>
                            <span className="text-sm flex-1 text-left">{item.label}</span>
                            {isActive && <ChevronRight size={16} className="text-slate-400" />}
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/30 bg-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/50">A</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">Accounting Admin</p>
                        <p className="text-[10px] text-slate-500 truncate">Finance Dept.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg text-slate-500 hover:text-red-500 transition shadow-sm">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative p-6 md:p-10 z-10">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/40 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>
                
                <div className="py-4 text-center text-xs text-slate-500 font-medium bg-white/30 backdrop-blur-sm border-t border-white/20 mt-4 rounded-xl">
                    Hệ thống Kế toán Long Hoang Logistics v1.0 • {new Date().getFullYear()}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default AccountPage;

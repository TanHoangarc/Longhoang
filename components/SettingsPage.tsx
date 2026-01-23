
import React, { useState } from 'react';
import { X, Settings, Users, ShieldAlert, Edit, Trash2, Check, AlertCircle, Plus, Save, Lock, Unlock, Key, Mail, User, Clock, AlertTriangle, ShieldCheck, Briefcase, Database, CreditCard, Truck, LogOut, ChevronRight } from 'lucide-react';
import { UserAccount, CustomerDef, FeeDef } from '../App';
import { Carrier } from './account/AccountData';

interface SettingsPageProps {
  onClose: () => void;
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: number) => void;
  currentUser: UserAccount | null;
  // Config Props
  customerDefs: CustomerDef[];
  onUpdateCustomerDefs: (defs: CustomerDef[]) => void;
  feeDefs: FeeDef[];
  onUpdateFeeDefs: (defs: FeeDef[]) => void;
  carriers: Carrier[];
  onUpdateCarriers: (carriers: Carrier[]) => void;
}

type SettingsTab = 'users' | 'customers' | 'security' | 'config';
type ConfigSubTab = 'cust_list' | 'fee_list' | 'carrier_list';

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onClose, isAuthenticated, onLoginSuccess, onLogout,
  users, onAddUser, onUpdateUser, onDeleteUser,
  currentUser,
  customerDefs, onUpdateCustomerDefs,
  feeDefs, onUpdateFeeDefs,
  carriers, onUpdateCarriers
}) => {
  // Admin Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('cust_list');

  // User Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Config Management State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfigItem, setEditingConfigItem] = useState<any | null>(null);
  
  // Form State Users
  const [formData, setFormData] = useState<UserAccount>({
    id: 0,
    name: '',
    englishName: '',
    role: 'Sales',
    email: '',
    password: '',
    status: 'Active',
    failedAttempts: 0
  });

  // Form State Configs
  const [custFormData, setCustFormData] = useState<CustomerDef>({ id: 0, name: '', taxId: '', address: '' });
  const [feeFormData, setFeeFormData] = useState<FeeDef>({ id: 0, name: '', vat: 0, type: 'SERVICE' });
  const [carrierFormData, setCarrierFormData] = useState<Carrier>({ id: 0, name: '', address: '', accountHolder: '', accountNumber: '', bank: '' });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'AdminLH' && password === 'Jwckim@123') {
      onLoginSuccess();
      setLoginError('');
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  // --- CRUD ACTIONS USERS ---

  const handleAddNew = (role: string = 'Sales') => {
    setEditingUser(null);
    setFormData({
      id: Date.now(),
      name: '',
      englishName: '',
      role: role,
      email: role === 'Customer' ? '@gmail.com' : '@longhoanglogistics.com',
      password: 'Jwckim@',
      status: 'Active',
      failedAttempts: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormData({ ...user, englishName: user.englishName || '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) {
      onDeleteUser(id);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (editingUser) {
      // Update existing
      onUpdateUser(formData);
    } else {
      // Create new
      onAddUser({ ...formData, id: Date.now() });
    }
    setIsModalOpen(false);
  };

  // --- CRUD ACTIONS CONFIG (Customers/Fees/Carriers) ---

  const openConfigModal = (item?: any) => {
      setEditingConfigItem(item || null);
      if (configSubTab === 'cust_list') {
          setCustFormData(item || { id: 0, name: '', taxId: '', address: '' });
      } else if (configSubTab === 'carrier_list') {
          setCarrierFormData(item || { id: 0, name: '', address: '', accountHolder: '', accountNumber: '', bank: '' });
      } else {
          // Fix: Default to SERVICE if type is missing (legacy data)
          setFeeFormData(item ? { ...item, type: item.type || 'SERVICE' } : { id: 0, name: '', vat: 8, type: 'SERVICE' });
      }
      setIsConfigModalOpen(true);
  };

  const handleDeleteConfig = (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
          if (configSubTab === 'cust_list') {
              onUpdateCustomerDefs(customerDefs.filter(c => c.id !== id));
          } else if (configSubTab === 'carrier_list') {
              onUpdateCarriers(carriers.filter(c => c.id !== id));
          } else {
              onUpdateFeeDefs(feeDefs.filter(f => f.id !== id));
          }
      }
  };

  const handleSaveConfig = () => {
      if (configSubTab === 'cust_list') {
          if (!custFormData.name) return alert('Vui lòng nhập tên công ty');
          if (editingConfigItem) {
              onUpdateCustomerDefs(customerDefs.map(c => c.id === editingConfigItem.id ? custFormData : c));
          } else {
              onUpdateCustomerDefs([...customerDefs, { ...custFormData, id: Date.now() }]);
          }
      } else if (configSubTab === 'carrier_list') {
          if (!carrierFormData.name) return alert('Vui lòng nhập tên nhà xe');
          if (editingConfigItem) {
              onUpdateCarriers(carriers.map(c => c.id === editingConfigItem.id ? carrierFormData : c));
          } else {
              onUpdateCarriers([...carriers, { ...carrierFormData, id: Date.now() }]);
          }
      } else {
          if (!feeFormData.name) return alert('Vui lòng nhập tên phí');
          if (editingConfigItem) {
              onUpdateFeeDefs(feeDefs.map(f => f.id === editingConfigItem.id ? feeFormData : f));
          } else {
              onUpdateFeeDefs([...feeDefs, { ...feeFormData, id: Date.now() }]);
          }
      }
      setIsConfigModalOpen(false);
  };

  // BACKGROUND IMAGE URL (Abstract Blue/Purple - Glassmorphism Style)
  const BG_IMAGE = "https://i.pinimg.com/1200x/83/6f/7c/836f7cfc772af123841c59e3bf7835a6.jpg";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img src={BG_IMAGE} alt="Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        </div>

        <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/60 relative z-10">
          <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 p-8 text-center text-white">
            <Settings className="mx-auto mb-4 animate-spin-slow" size={48} />
            <h2 className="text-2xl font-bold">Admin System</h2>
            <p className="opacity-80 text-sm mt-2">Cài đặt & Quản trị hệ thống</p>
          </div>
          <div className="p-8">
            {loginError && (
              <div className="mb-6 bg-red-50/80 backdrop-blur border-l-4 border-red-500 p-4 text-red-700 text-sm flex items-center rounded">
                <AlertCircle size={18} className="mr-2" />
                {loginError}
              </div>
            )}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition backdrop-blur-sm" 
                  placeholder="Nhập tài khoản admin" 
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-white/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition backdrop-blur-sm" 
                  placeholder="••••••••" 
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-blue-500/30">
                XÁC THỰC QUẢN TRỊ
              </button>
            </form>
          </div>
          <div className="p-4 flex justify-center bg-white/30">
              <button onClick={onClose} className="text-sm text-gray-600 hover:text-blue-700 transition font-bold">Quay lại trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Filter lists
  const staffList = users.filter(u => u.role !== 'Customer');
  const customerList = users.filter(u => u.role === 'Customer');

  const menuItems = [
      { id: 'users', label: 'Quản lý nhân sự', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100/50' },
      { id: 'customers', label: 'Quản lý khách hàng', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-100/50' },
      { id: 'security', label: 'Nhật ký bảo mật', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100/50' },
      { id: 'config', label: 'Cấu hình chung', icon: Database, color: 'text-purple-600', bg: 'bg-purple-100/50' },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans relative">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
            <img src={BG_IMAGE} alt="Glassmorphism Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[5px]"></div>
        </div>
        
        {/* SIDEBAR - Ultra Glass */}
        <aside className="w-72 bg-white/40 backdrop-blur-2xl border-r border-white/40 flex flex-col flex-shrink-0 shadow-xl z-20">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-white/30">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Settings size={20} />
                </div>
                <div className="ml-3">
                    <h1 className="font-black text-xl tracking-tight text-slate-800">ADMIN</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">System Control</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as SettingsTab)}
                        className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 group ${
                            activeTab === item.id 
                            ? 'bg-white/80 shadow-lg shadow-blue-100 text-slate-900 font-bold scale-100 border border-white/50' 
                            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 font-medium hover:shadow-sm'
                        }`}
                    >
                        <div className={`p-2 rounded-xl mr-3 transition-colors ${activeTab === item.id ? item.bg + ' ' + item.color : 'bg-white/50 text-slate-400 group-hover:text-slate-600'}`}>
                            <item.icon size={20} />
                        </div>
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {activeTab === item.id && <ChevronRight size={16} className="text-slate-400" />}
                    </button>
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-6 border-t border-white/30 bg-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/50">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">Administrator</p>
                        <p className="text-[10px] text-slate-500 truncate">System Owner</p>
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
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
                            {activeTab === 'users' && 'Nhân sự & Phân quyền'}
                            {activeTab === 'customers' && 'Khách hàng đăng ký'}
                            {activeTab === 'security' && 'Nhật ký & Bảo mật'}
                            {activeTab === 'config' && 'Cấu hình hệ thống'}
                        </h2>
                        <p className="text-slate-500 mt-1 font-medium bg-white/30 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                            Quản lý toàn bộ dữ liệu hệ thống tập trung.
                        </p>
                    </div>
                </div>

                {/* CONTENT CONTAINER - Glassmorphism Card */}
                <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/40">
                    
                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                      <>
                          <div className="p-6 md:p-8 border-b border-white/30 flex justify-between items-center bg-white/40">
                              <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-xl shadow-sm"><Users size={20}/></div>
                                <span className="font-bold text-slate-700 text-lg">Danh sách nhân viên</span>
                              </div>
                              <button 
                                onClick={() => handleAddNew('Sales')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
                              >
                                <Plus size={18} className="mr-2" /> Thêm nhân viên
                              </button>
                          </div>
                          <div className="overflow-auto flex-1 p-2">
                              <table className="w-full text-left border-collapse">
                                  <thead className="text-xs font-bold text-slate-500 uppercase bg-white/50 sticky top-0 z-10 backdrop-blur-md">
                                      <tr>
                                          <th className="px-6 py-4 rounded-l-xl">Nhân viên</th>
                                          <th className="px-6 py-4">Vai trò</th>
                                          <th className="px-6 py-4">Mật khẩu</th>
                                          <th className="px-6 py-4">Trạng thái</th>
                                          <th className="px-6 py-4 text-right rounded-r-xl">Thao tác</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm">
                                      {staffList.map(user => (
                                          <tr key={user.id} className="hover:bg-white/60 transition group border-b border-dashed border-slate-200/50 last:border-0">
                                              <td className="px-6 py-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                                                          {user.name.charAt(0)}
                                                      </div>
                                                      <div>
                                                          <div className="font-bold text-slate-800">{user.name}</div>
                                                          <div className="text-xs text-slate-500">{user.email}</div>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    user.role === 'Accounting' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                  }`}>
                                                    {user.role}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <div className="flex items-center text-xs text-slate-400 font-mono bg-white/50 px-3 py-1.5 rounded-lg border border-white/50 w-fit shadow-sm">
                                                    •••••••
                                                  </div>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg w-fit border ${user.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                      {user.status === 'Active' ? <Check size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                                                      {user.status}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                  <div className="flex justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                      <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition bg-white/50 shadow-sm" 
                                                      >
                                                        <Edit size={16} />
                                                      </button>
                                                      <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition bg-white/50 shadow-sm" 
                                                      >
                                                        <Trash2 size={16} />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </>
                    )}

                    {/* CUSTOMERS TAB */}
                    {activeTab === 'customers' && (
                      <>
                          <div className="p-6 md:p-8 border-b border-white/30 flex justify-between items-center bg-white/40">
                              <div className="flex items-center gap-2">
                                  <div className="bg-orange-100 text-orange-600 p-2 rounded-xl shadow-sm"><Briefcase size={20} /></div>
                                  <h3 className="font-bold text-slate-700 text-lg">Danh sách Khách hàng</h3>
                              </div>
                              <div className="text-xs font-bold text-slate-500 bg-white/50 px-4 py-2 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
                                  Tổng: {customerList.length} khách hàng
                              </div>
                          </div>
                          <div className="overflow-auto flex-1 p-2">
                              <table className="w-full text-left border-collapse">
                                  <thead className="text-xs font-bold text-slate-500 uppercase bg-white/50 sticky top-0 z-10 backdrop-blur-md">
                                      <tr>
                                          <th className="px-6 py-4 rounded-l-xl">Khách hàng</th>
                                          <th className="px-6 py-4">Email</th>
                                          <th className="px-6 py-4">Trạng thái</th>
                                          <th className="px-6 py-4 text-right rounded-r-xl">Thao tác</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm">
                                      {customerList.map(user => (
                                          <tr key={user.id} className="hover:bg-white/60 transition group border-b border-dashed border-slate-200/50 last:border-0">
                                              <td className="px-6 py-4">
                                                  <div className="font-bold text-slate-800">{user.name}</div>
                                                  <div className="text-xs text-slate-400">ID: {user.id}</div>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <div className="text-sm text-slate-600 font-medium">{user.email}</div>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg w-fit border ${user.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                      {user.status === 'Active' ? <Check size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                                                      {user.status}
                                                  </span>
                                                  {user.failedAttempts > 0 && <span className="text-[10px] text-orange-500 block mt-1 font-bold">{user.failedAttempts} lần sai pass</span>}
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                  <div className="flex justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                      <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition bg-white/50 shadow-sm" 
                                                      >
                                                        <Edit size={16} />
                                                      </button>
                                                      <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition bg-white/50 shadow-sm" 
                                                      >
                                                        <Trash2 size={16} />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                      {customerList.length === 0 && (
                                          <tr>
                                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                  Chưa có khách hàng nào đăng ký.
                                              </td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </>
                    )}

                    {/* SECURITY LOG TAB */}
                    {activeTab === 'security' && (
                      <>
                          <div className="p-6 md:p-8 border-b border-white/30 flex justify-between items-center bg-white/40">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="bg-red-100 text-red-600 p-2 rounded-xl shadow-sm"><ShieldAlert size={20}/></div>
                                    <h3 className="font-bold text-slate-700 text-lg">Nhật ký bảo mật</h3>
                                </div>
                                <p className="text-xs text-slate-400 ml-9">Theo dõi đăng nhập & Khóa tài khoản</p>
                              </div>
                              <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold border border-orange-100 shadow-sm">
                                 {users.filter(u => u.status === 'Locked').length} tài khoản bị khóa
                              </div>
                          </div>
                          <div className="overflow-auto flex-1 p-2">
                              <table className="w-full text-left border-collapse">
                                  <thead className="text-xs font-bold text-slate-500 uppercase bg-white/50 sticky top-0 z-10 backdrop-blur-md">
                                      <tr>
                                          <th className="px-6 py-4 rounded-l-xl">Tài khoản</th>
                                          <th className="px-6 py-4 text-center">Số lần sai</th>
                                          <th className="px-6 py-4">Lần thử cuối</th>
                                          <th className="px-6 py-4">Trạng thái</th>
                                          <th className="px-6 py-4 text-right rounded-r-xl">Hành động</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-sm">
                                      {users.map(user => {
                                          const isLocked = user.status === 'Locked';
                                          const attempts = user.failedAttempts || 0;
                                          
                                          return (
                                            <tr key={user.id} className={`transition border-b border-dashed border-slate-200/50 last:border-0 ${isLocked ? 'bg-red-50/30' : 'hover:bg-white/60'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block w-8 h-8 leading-8 rounded-full text-xs font-bold shadow-sm ${
                                                        attempts === 0 ? 'bg-slate-100 text-slate-400' : 
                                                        attempts < 3 ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-red-100 text-red-600 animate-pulse'
                                                    }`}>
                                                        {attempts}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-xs text-slate-500">
                                                       <Clock size={12} className="mr-1" />
                                                       {user.lastAttemptTime || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg w-fit border shadow-sm ${isLocked ? 'bg-red-100 text-red-600 border-red-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
                                                        {isLocked ? <Lock size={12} className="mr-1" /> : <ShieldCheck size={12} className="mr-1" />}
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isLocked && (
                                                        <button 
                                                          onClick={() => {
                                                              const updated = { ...user, status: 'Active' as const, failedAttempts: 0 };
                                                              onUpdateUser(updated);
                                                              alert(`Đã mở khóa cho tài khoản ${user.email}`);
                                                          }}
                                                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-green-200/50 transition flex items-center ml-auto"
                                                        >
                                                            <Unlock size={12} className="mr-1" /> Mở khóa
                                                        </button>
                                                    )}
                                                    {!isLocked && attempts > 0 && (
                                                       <button 
                                                          onClick={() => {
                                                              const updated = { ...user, failedAttempts: 0 };
                                                              onUpdateUser(updated);
                                                          }}
                                                          className="text-slate-400 hover:text-blue-600 text-xs font-bold underline"
                                                       >
                                                          Reset lỗi
                                                       </button>
                                                    )}
                                                </td>
                                            </tr>
                                          );
                                      })}
                                  </tbody>
                              </table>
                          </div>
                      </>
                    )}
                    
                    {/* CONFIG TAB */}
                    {activeTab === 'config' && (
                       <>
                          <div className="p-6 md:p-8 border-b border-white/30 flex justify-between items-center bg-white/40">
                              <div className="flex items-center gap-2">
                                  <div className="bg-purple-100 text-purple-600 p-2 rounded-xl shadow-sm"><Database size={20}/></div>
                                  <h3 className="font-bold text-slate-700 text-lg">Dữ liệu dùng chung</h3>
                              </div>
                              
                              <div className="flex bg-white/40 p-1 rounded-xl shadow-inner border border-white/50">
                                  <button 
                                    onClick={() => setConfigSubTab('cust_list')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${configSubTab === 'cust_list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                    Khách hàng
                                  </button>
                                  <button 
                                    onClick={() => setConfigSubTab('carrier_list')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${configSubTab === 'carrier_list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                    Nhà xe
                                  </button>
                                  <button 
                                    onClick={() => setConfigSubTab('fee_list')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${configSubTab === 'fee_list' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                  >
                                    Phí (Debit)
                                  </button>
                              </div>
                          </div>

                          <div className="flex-1 overflow-auto p-6 md:p-8">
                            {/* Customer List Sub-tab */}
                            {configSubTab === 'cust_list' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-sm text-slate-500">Dữ liệu dùng chung cho Debit Note & Hợp đồng</p>
                                        <button onClick={() => openConfigModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition flex items-center">
                                            <Plus size={16} className="mr-1" /> Thêm khách hàng
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {customerDefs.map(c => (
                                            <div key={c.id} className="bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg transition group relative backdrop-blur-sm">
                                                <div className="font-bold text-slate-800 mb-1">{c.name}</div>
                                                <div className="text-xs text-slate-400 font-mono mb-2">{c.taxId}</div>
                                                <div className="text-xs text-slate-500 line-clamp-2">{c.address}</div>
                                                
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openConfigModal(c)} className="p-1.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm"><Edit size={14} /></button>
                                                    <button onClick={() => handleDeleteConfig(c.id)} className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg shadow-sm"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {customerDefs.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-400 italic">Chưa có dữ liệu khách hàng.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Carrier List Sub-tab */}
                            {configSubTab === 'carrier_list' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-sm text-slate-500">Danh sách nhà xe dùng cho Bảng kê</p>
                                        <button onClick={() => openConfigModal()} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/30 transition flex items-center">
                                            <Plus size={16} className="mr-1" /> Thêm nhà xe
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {carriers.map(c => (
                                            <div key={c.id} className="bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm hover:shadow-lg transition group relative backdrop-blur-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Truck size={16} className="text-purple-500" />
                                                    <span className="font-bold text-slate-800">{c.name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-2 mb-2">{c.address}</div>
                                                <div className="bg-white/50 p-2 rounded-lg border border-white/50">
                                                    <div className="font-mono font-bold text-xs text-slate-700">{c.accountNumber}</div>
                                                    <div className="text-[10px] uppercase text-slate-400">{c.bank}</div>
                                                </div>
                                                
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openConfigModal(c)} className="p-1.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm"><Edit size={14} /></button>
                                                    <button onClick={() => handleDeleteConfig(c.id)} className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg shadow-sm"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fee List Sub-tab */}
                            {configSubTab === 'fee_list' && (
                                <div className="animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-sm text-slate-500">Danh mục phí cho Debit Note & Báo giá</p>
                                        <button onClick={() => openConfigModal()} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-orange-500/30 transition flex items-center">
                                            <Plus size={16} className="mr-1" /> Thêm loại phí
                                        </button>
                                    </div>
                                    <div className="bg-white/60 rounded-2xl border border-white/60 overflow-hidden shadow-sm backdrop-blur-sm">
                                        <table className="w-full text-left">
                                            <thead className="text-[10px] font-bold text-slate-400 uppercase bg-white/50">
                                                <tr>
                                                    <th className="px-6 py-3">Tên Phí / Diễn giải</th>
                                                    <th className="px-6 py-3 text-center">VAT Mặc định (%)</th>
                                                    <th className="px-6 py-3 text-center">Loại</th>
                                                    <th className="px-6 py-3 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/50 text-sm">
                                                {feeDefs.map(f => (
                                                    <tr key={f.id} className="hover:bg-white/50 transition">
                                                        <td className="px-6 py-3 font-bold text-slate-800">{f.name}</td>
                                                        <td className="px-6 py-3 text-center font-mono text-slate-600">{f.vat}%</td>
                                                        <td className="px-6 py-3 text-center">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                                                (f.type === 'SERVICE' || !f.type)
                                                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                                            }`}>
                                                                {(f.type === 'SERVICE' || !f.type) ? 'LOGISTICS CHARGE' : 'PAY ON BEHALF'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => openConfigModal(f)} className="text-slate-400 hover:text-blue-500"><Edit size={16} /></button>
                                                                <button onClick={() => handleDeleteConfig(f.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                          </div>
                       </>
                    )}
                </div>
            </div>
        </main>

        {/* --- EDIT/ADD USER MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 ring-1 ring-white/50">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center">
                    {editingUser ? <Edit className="mr-2 text-blue-600" size={20} /> : <Plus className="mr-2 text-green-600" size={20} />}
                    {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên người dùng <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-bold text-slate-700" 
                                placeholder="Nguyễn Văn A"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alias / Tiếng Anh</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-bold text-slate-700" 
                                placeholder="Mr. Andy..."
                                value={formData.englishName}
                                onChange={(e) => setFormData({...formData, englishName: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài khoản (Email) <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-bold text-slate-700" 
                        placeholder="sales@longhoanglogistics.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu (Pass) <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <Key className="absolute left-3 top-3 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-mono text-slate-700" 
                        placeholder="Nhập mật khẩu..."
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                   </div>
                   <p className="text-[10px] text-slate-400 italic text-right mt-1">Admin có thể xem và đặt lại mật khẩu tại đây.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Role */}
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò</label>
                       <select 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition font-bold text-slate-700 appearance-none"
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                       >
                          <option value="Sales">Sales</option>
                          <option value="Accounting">Accounting (Kế toán)</option>
                          <option value="Document">Document (Chứng từ)</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                          <option value="Customer">Customer (Khách hàng)</option>
                       </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                       <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, status: 'Active'})}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${formData.status === 'Active' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                          >
                             <Check size={14} className="mr-1" /> Active
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, status: 'Locked'})}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${formData.status === 'Locked' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                          >
                             <Lock size={14} className="mr-1" /> Locked
                          </button>
                       </div>
                    </div>
                </div>
                
                {formData.failedAttempts > 0 && (
                   <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center text-xs text-orange-700">
                      <AlertTriangle size={16} className="mr-2" />
                      Tài khoản này đang có {formData.failedAttempts} lần đăng nhập sai.
                      <button 
                         type="button"
                         className="ml-auto underline font-bold hover:text-orange-900"
                         onClick={() => setFormData({...formData, failedAttempts: 0})}
                      >
                         Reset
                      </button>
                   </div>
                )}

              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-gray-200 transition"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={handleSaveUser}
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center"
                 >
                    <Save size={18} className="mr-2" /> Lưu thay đổi
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT/ADD CONFIG MODAL --- */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfigModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-gray-50 border-b border-gray-100 p-5 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center">
                    {editingConfigItem ? <Edit className="mr-2 text-blue-600" size={20} /> : <Plus className="mr-2 text-green-600" size={20} />}
                    {configSubTab === 'cust_list' ? 'Thông tin Khách hàng' : configSubTab === 'carrier_list' ? 'Thông tin Nhà xe' : 'Thông tin Phí'}
                 </h3>
                 <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-4">
                {configSubTab === 'cust_list' && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tên Công ty <span className="text-red-500">*</span></label>
                            <input 
                                type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-blue-500 outline-none uppercase" 
                                value={custFormData.name} onChange={e => setCustFormData({...custFormData, name: e.target.value.toUpperCase()})}
                                placeholder="CÔNG TY..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Mã số thuế</label>
                            <input 
                                type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:border-blue-500 outline-none" 
                                value={custFormData.taxId} onChange={e => setCustFormData({...custFormData, taxId: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
                            <textarea 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none h-20 resize-none" 
                                value={custFormData.address} onChange={e => setCustFormData({...custFormData, address: e.target.value})}
                            />
                        </div>
                    </>
                )}

                {configSubTab === 'carrier_list' && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tên Nhà Xe (Sender) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-purple-500 outline-none" 
                                value={carrierFormData.name} onChange={e => setCarrierFormData({...carrierFormData, name: e.target.value})}
                                placeholder="CÔNG TY TNHH..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ</label>
                            <textarea 
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-purple-500 outline-none h-20 resize-none" 
                                value={carrierFormData.address} onChange={e => setCarrierFormData({...carrierFormData, address: e.target.value})}
                                placeholder="Số nhà, đường, phường, quận..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Số tài khoản</label>
                                <input 
                                    type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-mono focus:border-purple-500 outline-none" 
                                    value={carrierFormData.accountNumber} onChange={e => setCarrierFormData({...carrierFormData, accountNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Ngân hàng</label>
                                <input 
                                    type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-purple-500 outline-none" 
                                    value={carrierFormData.bank} onChange={e => setCarrierFormData({...carrierFormData, bank: e.target.value})}
                                    placeholder="Vietcombank..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Chủ tài khoản (Nếu có)</label>
                            <input 
                                type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-purple-500 outline-none" 
                                value={carrierFormData.accountHolder} onChange={e => setCarrierFormData({...carrierFormData, accountHolder: e.target.value})}
                            />
                        </div>
                    </>
                )}

                {configSubTab === 'fee_list' && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Tên Phí / Diễn giải <span className="text-red-500">*</span></label>
                            <input 
                                type="text" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-orange-500 outline-none uppercase" 
                                value={feeFormData.name} onChange={e => setFeeFormData({...feeFormData, name: e.target.value.toUpperCase()})}
                                placeholder="OF, THC, DOC..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">VAT Mặc định (%)</label>
                            <input 
                                type="number" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-orange-500 outline-none" 
                                value={feeFormData.vat} onChange={e => setFeeFormData({...feeFormData, vat: Number(e.target.value)})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Loại phí</label>
                            <select
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-bold focus:border-orange-500 outline-none bg-white"
                                value={feeFormData.type} 
                                onChange={e => setFeeFormData({...feeFormData, type: e.target.value as 'SERVICE' | 'ON_BEHALF'})}
                            >
                                <option value="SERVICE">LOGISTICS CHARGE (PHÍ DỊCH VỤ)</option>
                                <option value="ON_BEHALF">PAY ON BEHALF (CHI HỘ)</option>
                            </select>
                        </div>
                    </>
                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 rounded-lg font-bold text-sm text-slate-500 hover:bg-gray-200 transition"
                 >
                    Hủy
                 </button>
                 <button 
                    onClick={handleSaveConfig}
                    className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-md"
                 >
                    Lưu
                 </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default SettingsPage;

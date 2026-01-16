
import React, { useState } from 'react';
import { X, Settings, Users, ShieldAlert, Edit, Trash2, Check, AlertCircle, Plus, Save, Lock, Unlock, Key, Mail, User, Clock, AlertTriangle, ShieldCheck, Briefcase } from 'lucide-react';
import { UserAccount } from '../App';

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
}

type SettingsTab = 'users' | 'customers' | 'security' | 'config';

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onClose, isAuthenticated, onLoginSuccess, onLogout,
  users, onAddUser, onUpdateUser, onDeleteUser,
  currentUser
}) => {
  // Admin Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Tab State
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  // User Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'AdminLH' && password === 'Jwckim@123') {
      onLoginSuccess();
      setLoginError('');
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  // --- CRUD ACTIONS ---

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-[#f97316] p-8 text-center text-white">
            <Settings className="mx-auto mb-4 animate-spin-slow" size={48} />
            <h2 className="text-2xl font-bold">Admin System</h2>
            <p className="opacity-80 text-sm mt-2">Cài đặt & Quản trị hệ thống</p>
          </div>
          <div className="p-8">
            {loginError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm flex items-center">
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/50" 
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="••••••••" 
                />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-4 rounded-lg transition-all transform active:scale-95 shadow-lg">
                XÁC THỰC QUẢN TRỊ
              </button>
            </form>
          </div>
          <div className="p-4 flex justify-center">
              <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition">Quay lại trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Filter lists
  const staffList = users.filter(u => u.role !== 'Customer');
  const customerList = users.filter(u => u.role === 'Customer');

  return (
    <div className="min-h-[80vh] bg-white p-8 md:p-16 animate-in fade-in duration-500">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-primary p-3 rounded-xl text-white">
                <ShieldAlert size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Quản trị Hệ thống</h2>
                <p className="text-gray-500 flex items-center">
                    <Check size={16} className="text-green-500 mr-1" /> Phiên làm việc AdminLH đang hoạt động
                </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="px-6 py-2 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition">Quay về Home</button>
            <button onClick={onLogout} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition">Đăng xuất</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Settings */}
            <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center space-x-3 p-4 font-bold rounded-lg transition ${activeTab === 'users' ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Users size={20} />
                    <span>Quản lý nhân sự</span>
                </button>
                <button 
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center space-x-3 p-4 font-bold rounded-lg transition ${activeTab === 'customers' ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Briefcase size={20} />
                    <span>Quản lý khách hàng</span>
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 p-4 font-bold rounded-lg transition ${activeTab === 'security' ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <ShieldAlert size={20} />
                    <span>Nhật ký bảo mật</span>
                </button>
                <button 
                  onClick={() => setActiveTab('config')}
                  className={`w-full flex items-center space-x-3 p-4 font-bold rounded-lg transition ${activeTab === 'config' ? 'bg-orange-50 text-primary border border-orange-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <Settings size={20} />
                    <span>Cấu hình chung</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                
                {/* USERS TAB (STAFF) */}
                {activeTab === 'users' && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <h3 className="font-bold text-gray-800">Danh sách nhân sự & Phân quyền</h3>
                          <button 
                            onClick={() => handleAddNew('Sales')}
                            className="text-sm bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded font-bold flex items-center transition shadow-lg shadow-orange-100"
                          >
                            <Plus size={16} className="mr-1" /> Thêm nhân viên
                          </button>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                                  <tr>
                                      <th className="px-6 py-4">Nhân viên</th>
                                      <th className="px-6 py-4">Vai trò</th>
                                      <th className="px-6 py-4">Mật khẩu</th>
                                      <th className="px-6 py-4">Trạng thái</th>
                                      <th className="px-6 py-4 text-right">Thao tác</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {staffList.map(user => (
                                      <tr key={user.id} className="hover:bg-gray-50/50 transition group">
                                          <td className="px-6 py-4">
                                              <div className="font-bold text-gray-800">{user.name}</div>
                                              {user.englishName && <div className="text-xs font-bold text-primary">{user.englishName}</div>}
                                              <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                                                user.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                user.role === 'Accounting' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                              }`}>
                                                {user.role}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center text-xs text-gray-400 font-mono">
                                                <span className="bg-gray-100 px-2 py-1 rounded">•••••••</span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className={`flex items-center text-xs font-bold ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                                  {user.status === 'Active' ? <Check size={14} className="mr-1" /> : <Lock size={14} className="mr-1" />}
                                                  {user.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <div className="flex justify-end space-x-2">
                                                  <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition" 
                                                    title="Chỉnh sửa thông tin"
                                                  >
                                                    <Edit size={16} />
                                                  </button>
                                                  <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" 
                                                    title="Xóa tài khoản"
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
                  </div>
                )}

                {/* CUSTOMERS TAB */}
                {activeTab === 'customers' && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <h3 className="font-bold text-gray-800 flex items-center">
                              <Briefcase size={20} className="mr-2 text-primary" /> Danh sách Khách hàng đăng ký
                          </h3>
                          <div className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
                              Tổng: {customerList.length} khách hàng
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                                  <tr>
                                      <th className="px-6 py-4">Tên Khách hàng</th>
                                      <th className="px-6 py-4">Email đăng nhập</th>
                                      <th className="px-6 py-4">Trạng thái</th>
                                      <th className="px-6 py-4 text-right">Thao tác</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {customerList.map(user => (
                                      <tr key={user.id} className="hover:bg-gray-50/50 transition group">
                                          <td className="px-6 py-4">
                                              <div className="font-bold text-gray-800">{user.name}</div>
                                              <div className="text-xs text-gray-400">ID: {user.id}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-sm text-gray-600 font-medium">{user.email}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className={`flex items-center text-xs font-bold ${user.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                                  {user.status === 'Active' ? <Check size={14} className="mr-1" /> : <Lock size={14} className="mr-1" />}
                                                  {user.status}
                                              </span>
                                              {user.failedAttempts > 0 && <span className="text-[10px] text-orange-500 block mt-1">{user.failedAttempts} lần sai pass</span>}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <div className="flex justify-end space-x-2">
                                                  <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition" 
                                                    title="Chỉnh sửa / Đặt lại mật khẩu"
                                                  >
                                                    <Edit size={16} />
                                                  </button>
                                                  <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" 
                                                    title="Xóa tài khoản"
                                                  >
                                                    <Trash2 size={16} />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {customerList.length === 0 && (
                                      <tr>
                                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                                              Chưa có khách hàng nào đăng ký.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
                )}

                {/* SECURITY LOG TAB */}
                {activeTab === 'security' && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                      <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-gray-800 flex items-center"><ShieldAlert size={20} className="mr-2 text-primary" /> Nhật ký bảo mật</h3>
                            <p className="text-xs text-gray-400 mt-1">Theo dõi hoạt động đăng nhập và cảnh báo khóa tài khoản (Tự động khóa sau 5 lần sai)</p>
                          </div>
                          <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                             {users.filter(u => u.status === 'Locked').length} tài khoản bị khóa
                          </div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left">
                              <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                                  <tr>
                                      <th className="px-6 py-4">Tài khoản</th>
                                      <th className="px-6 py-4 text-center">Số lần sai</th>
                                      <th className="px-6 py-4">Lần thử cuối</th>
                                      <th className="px-6 py-4">Trạng thái</th>
                                      <th className="px-6 py-4 text-right">Hành động</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {users.map(user => {
                                      const isLocked = user.status === 'Locked';
                                      const attempts = user.failedAttempts || 0;
                                      
                                      return (
                                        <tr key={user.id} className={`transition ${isLocked ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{user.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                                                <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block w-8 h-8 leading-8 rounded-full text-xs font-bold ${
                                                    attempts === 0 ? 'bg-gray-100 text-gray-400' : 
                                                    attempts < 3 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-red-100 text-red-600 animate-pulse'
                                                }`}>
                                                    {attempts}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-xs text-gray-500">
                                                   <Clock size={12} className="mr-1" />
                                                   {user.lastAttemptTime || 'Chưa có dữ liệu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center text-xs font-bold ${isLocked ? 'text-red-500' : 'text-green-500'}`}>
                                                    {isLocked ? <Lock size={14} className="mr-1" /> : <ShieldCheck size={14} className="mr-1" />}
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
                                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition flex items-center ml-auto"
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
                                                      className="text-gray-400 hover:text-primary text-xs font-bold underline"
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
                  </div>
                )}
                
                {/* CONFIG TAB (Placeholder) */}
                {activeTab === 'config' && (
                   <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                      <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-xl font-bold text-gray-800">Cấu hình hệ thống</h3>
                      <p className="text-gray-500 mt-2">Tính năng đang được phát triển...</p>
                   </div>
                )}
            </div>
        </div>

        {/* --- EDIT/ADD USER MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    {editingUser ? <Edit className="mr-2 text-primary" size={20} /> : <Plus className="mr-2 text-primary" size={20} />}
                    {editingUser ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tên người dùng <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-bold text-gray-700" 
                                placeholder="Nguyễn Văn A"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alias / Tiếng Anh</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-bold text-gray-700" 
                                placeholder="Mr. Andy..."
                                value={formData.englishName}
                                onChange={(e) => setFormData({...formData, englishName: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản (Email) <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-bold text-gray-700" 
                        placeholder="sales@longhoanglogistics.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                   </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu (Pass) <span className="text-red-500">*</span></label>
                   <div className="relative">
                      <Key className="absolute left-3 top-3 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-mono text-gray-700" 
                        placeholder="Nhập mật khẩu..."
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                   </div>
                   <p className="text-[10px] text-gray-400 italic text-right mt-1">Admin có thể xem và đặt lại mật khẩu tại đây.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Role */}
                    <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</label>
                       <select 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition font-bold text-gray-700 appearance-none"
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
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</label>
                       <div className="flex bg-gray-100 p-1 rounded-xl">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, status: 'Active'})}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${formData.status === 'Active' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                          >
                             <Check size={14} className="mr-1" /> Active
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, status: 'Locked'})}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${formData.status === 'Locked' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
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
                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={handleSaveUser}
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primaryDark transition shadow-lg shadow-orange-200 flex items-center"
                 >
                    <Save size={18} className="mr-2" /> Lưu thay đổi
                 </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;

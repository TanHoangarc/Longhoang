import React, { useState } from 'react';
import { X, Settings, Users, ShieldAlert, Edit, Trash2, Check, AlertCircle } from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

const MOCK_USERS = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Sales', email: 'vana@longhoang.com', status: 'Active' },
  { id: 2, name: 'Trần Thị B', role: 'Ops', email: 'thib@longhoang.com', status: 'Active' },
  { id: 3, name: 'Lê Văn C', role: 'Accounting', email: 'vanc@longhoang.com', status: 'Locked' },
  { id: 4, name: 'Phạm Minh D', role: 'Admin', email: 'minhd@longhoang.com', status: 'Active' },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, isAuthenticated, onLoginSuccess, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'AdminLH' && password === 'Jwckim@123') {
      onLoginSuccess();
      setError('');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
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
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm flex items-center">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
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
                <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 text-primary font-bold rounded-lg transition">
                    <Users size={20} />
                    <span>Quản lý tài khoản</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 text-gray-600 rounded-lg transition">
                    <Settings size={20} />
                    <span>Cấu hình chung</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 text-gray-600 rounded-lg transition">
                    <ShieldAlert size={20} />
                    <span>Nhật ký bảo mật</span>
                </button>
            </div>

            {/* User List Table */}
            <div className="lg:col-span-3">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Danh sách nhân sự & Phân quyền</h3>
                        <button className="text-sm bg-primary text-white px-4 py-2 rounded font-bold">+ Thêm mới</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Nhân viên</th>
                                    <th className="px-6 py-4">Vai trò</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {MOCK_USERS.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 tracking-wide">{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center text-xs font-bold ${user.status === 'Active' ? 'text-green-500' : 'text-red-400'}`}>
                                                <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-primary transition" title="Sửa"><Edit size={16} /></button>
                                                <button className="p-2 text-gray-400 hover:text-red-500 transition" title="Xóa"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
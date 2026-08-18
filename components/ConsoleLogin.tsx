import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface ConsoleLoginProps {
  onLogin: (password: string) => void;
}

const ConsoleLogin: React.FC<ConsoleLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <Lock className="text-blue-500 w-10 h-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Quản trị Website</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Vui lòng đăng nhập để chỉnh sửa nội dung</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-400 text-sm font-bold block mb-2">Mật khẩu truy cập</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Nhập mật khẩu..."
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            Đăng nhập
          </button>
          
          <button 
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full bg-transparent hover:bg-gray-700 text-gray-400 font-bold py-3 rounded-lg transition"
          >
            Quay lại trang chủ
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsoleLogin;

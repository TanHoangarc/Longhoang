
import React from 'react';
import { TrendingUp, Users, Wallet, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { UserAccount, AttendanceRecord } from '../../App';

interface AccountOverviewProps {
  users: UserAccount[];
  attendanceRecords: AttendanceRecord[];
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ users, attendanceRecords }) => {
  const stats = [
    { label: 'Tổng nhân sự', value: users.filter(u => u.role !== 'Customer').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Quỹ WCA', value: '50,000,000', sub: 'VND', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendanceRecords.filter(r => r.date === todayStr && r.status !== 'Absent').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Control Bar Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 uppercase">TỔNG QUAN TÀI CHÍNH</h3>
          <p className="text-sm text-gray-500">Dữ liệu cập nhật hôm nay: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
            <TrendingUp size={14} className="mr-1" /> Hệ thống ổn định
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats Cards */}
        <div className="lg:col-span-1 space-y-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-800">
                    {stat.value} <span className="text-sm font-medium text-gray-500">{stat.sub}</span>
                  </h3>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-white shadow-lg relative overflow-hidden h-48 flex flex-col justify-center">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Phiên bản 2.0</h3>
              <p className="text-gray-400 text-xs mb-4">Cập nhật quản lý quỹ WCA và Lương tự động.</p>
              <button className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg font-bold text-xs transition">Xem hướng dẫn</button>
            </div>
            <TrendingUp size={100} className="absolute right-[-20px] bottom-[-20px] opacity-10" />
          </div>
        </div>

        {/* Right: Attendance Summary & Charts placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center border-b border-gray-50 pb-4">
              <Calendar size={20} className="mr-2 text-primary" /> Trạng thái chấm công hôm nay
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tổng nhân sự</p>
                <p className="text-3xl font-black text-gray-800">{users.filter(u => u.role !== 'Customer').length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <p className="text-xs text-green-500 uppercase font-bold mb-1">Đã Check-in</p>
                <p className="text-3xl font-black text-green-600">{presentToday}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                <p className="text-xs text-orange-500 uppercase font-bold mb-1">Vắng mặt</p>
                <p className="text-3xl font-black text-orange-600">{users.filter(u => u.role !== 'Customer').length - presentToday}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-1">Dòng tiền gần đây</h4>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">Quỹ WCA (Tháng hiện tại)</span>
                  <span className="text-xs font-bold text-blue-600">85% hạn mức</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex items-center text-xs text-green-600 font-bold">
                    <ArrowUpRight size={14} className="mr-1" /> +12.5tr
                  </div>
                  <div className="flex items-center text-xs text-red-500 font-bold">
                    <ArrowDownLeft size={14} className="mr-1" /> -4.2tr
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;

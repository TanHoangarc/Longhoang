
import React from 'react';
import { TrendingUp, Users, Wallet, Calendar } from 'lucide-react';
import { UserAccount, AttendanceRecord } from '../../App';

interface AccountOverviewProps {
  users: UserAccount[];
  attendanceRecords: AttendanceRecord[];
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ users, attendanceRecords }) => {
  // Simple Mock Stats for Dashboard
  const stats = [
      { label: 'Tổng nhân sự', value: users.filter(u => u.role !== 'Customer').length, icon: Users, color: 'bg-blue-500' },
      { label: 'Quỹ WCA', value: '50,000,000', sub: 'VND', icon: Wallet, color: 'bg-indigo-500' }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendanceRecords.filter(r => r.date === todayStr && r.status !== 'Absent').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition">
                    <div className={`p-4 rounded-xl text-white mr-4 shadow-lg ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-800">
                            {stat.value} <span className="text-sm font-medium text-gray-500">{stat.sub}</span>
                        </h3>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar size={20} className="mr-2 text-primary" /> Chấm công hôm nay ({new Date().toLocaleDateString('vi-VN')})
                </h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Tổng nhân viên</p>
                        <p className="text-2xl font-black text-gray-800">{users.filter(u => u.role !== 'Customer').length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Đã Check-in</p>
                        <p className="text-2xl font-black text-green-600">{presentToday}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Vắng / Chưa đến</p>
                        <p className="text-2xl font-black text-orange-500">{users.filter(u => u.role !== 'Customer').length - presentToday}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Hệ thống Kế toán & Nhân sự</h3>
                    <p className="text-gray-400 text-sm mb-6">Phiên bản 2.0 - Cập nhật tính năng Quản lý quỹ WCA và Bảng lương tự động.</p>
                    <button className="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-bold text-sm transition self-start">Xem hướng dẫn</button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <TrendingUp size={150} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default AccountOverview;

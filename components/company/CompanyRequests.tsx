
import React, { useState, useMemo } from 'react';
import { Search, UserCheck, MessageSquare, Phone, CheckCircle, Clock } from 'lucide-react';
import { QuotationRequest, UserAccount } from '../../App';

interface CompanyRequestsProps {
  requests: QuotationRequest[];
  onUpdateRequests: (requests: QuotationRequest[]) => void;
  currentUser: UserAccount | null;
}

const CompanyRequests: React.FC<CompanyRequestsProps> = ({ requests, onUpdateRequests, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter requests based on User Role first
  const visibleRequests = useMemo(() => {
    if (!currentUser) return [];

    // Rule: Admin, Manager, or Board members can see ALL requests
    // Others (Sales staff) can only see requests assigned to them
    const canSeeAll = ['Admin', 'Manager', 'Director'].includes(currentUser.role) || currentUser.department === 'Board';

    if (canSeeAll) {
        return requests;
    } else {
        return requests.filter(req => req.assignedToId === currentUser.id);
    }
  }, [requests, currentUser]);

  // Then filter based on Search Term
  const filteredRequests = visibleRequests.filter(req => 
    req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.phone.includes(searchTerm) ||
    req.assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id: number) => {
    const updated = requests.map(req => {
        if (req.id === id) {
            return { ...req, status: (req.status === 'Pending' ? 'Contacted' : 'Pending') as 'Pending' | 'Contacted' };
        }
        return req;
    });
    onUpdateRequests(updated);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">Yêu cầu Báo giá & Tư vấn</h3>
                <p className="text-sm text-gray-500">
                    {currentUser?.role === 'Admin' || currentUser?.role === 'Manager' 
                        ? 'Danh sách toàn bộ yêu cầu từ khách hàng (Quyền Admin/Quản lý)' 
                        : 'Danh sách khách hàng được phân bổ cho bạn'}
                </p>
            </div>
        </div>

        {/* Filter / Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center shadow-sm">
            <Search className="text-gray-400 mr-2" size={20} />
            <input 
                type="text" 
                placeholder="Tìm kiếm theo tên khách, SĐT..." 
                className="w-full outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                        <tr>
                            <th className="px-6 py-4">Ngày yêu cầu</th>
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Nội dung tư vấn</th>
                            <th className="px-6 py-4">Sales Phụ trách</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredRequests.map(req => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition group">
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {req.date}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 text-sm">{req.customerName}</div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Phone size={10} className="mr-1" /> {req.phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600 max-w-xs break-words">
                                        <MessageSquare size={12} className="inline mr-1 text-blue-400" />
                                        {req.content}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold mr-2">
                                            {req.assignedToName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {req.assignedToId === currentUser?.id ? 'Bạn' : req.assignedToName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {req.status === 'Contacted' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                            <CheckCircle size={12} className="mr-1" /> Đã liên hệ
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 animate-pulse">
                                            <Clock size={12} className="mr-1" /> Chưa liên hệ
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => toggleStatus(req.id)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                                            req.status === 'Pending' 
                                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {req.status === 'Pending' ? 'Xác nhận đã gọi' : 'Đánh dấu chưa gọi'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                    {visibleRequests.length === 0 
                                        ? "Hiện tại chưa có yêu cầu nào được phân công cho bạn." 
                                        : "Không tìm thấy yêu cầu phù hợp."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default CompanyRequests;

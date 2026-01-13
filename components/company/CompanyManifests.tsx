
import React, { useState } from 'react';
import { StatementData } from '../../App';
import { Truck, Search, Calendar, Eye, Printer, ArrowLeft, Lock, Save, Edit, Check } from 'lucide-react';

interface CompanyManifestsProps {
  statements: StatementData[];
  onUpdateStatements: (data: StatementData[]) => void;
}

const CompanyManifests: React.FC<CompanyManifestsProps> = ({ statements, onUpdateStatements }) => {
  const [selectedManifest, setSelectedManifest] = useState<StatementData | null>(null);
  
  // Local state for editing rows in the selected manifest
  const [editingRows, setEditingRows] = useState<any[]>([]);

  // Filter only Shared or Locked statements
  const visibleStatements = statements.filter(s => s.status === 'Shared' || s.status === 'Locked');

  // Group by Month
  const grouped = visibleStatements.reduce((acc, stmt) => {
      if (!acc[stmt.month]) acc[stmt.month] = [];
      acc[stmt.month].push(stmt);
      return acc;
  }, {} as Record<string, StatementData[]>);

  const handleSelectManifest = (stmt: StatementData) => {
      setSelectedManifest(stmt);
      // Create a deep copy of rows for editing
      setEditingRows(JSON.parse(JSON.stringify(stmt.rows)));
  };

  const handleRowChange = (id: number, field: string, value: string) => {
      setEditingRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveManifest = () => {
      if (!selectedManifest) return;
      
      const updatedManifest: StatementData = {
          ...selectedManifest,
          rows: editingRows
      };

      // Update in global state
      const updatedStatements = statements.map(s => s.id === selectedManifest.id ? updatedManifest : s);
      onUpdateStatements(updatedStatements);
      
      // Update local selection to reflect saved state
      setSelectedManifest(updatedManifest);
      alert('Đã cập nhật số Job thành công!');
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}-Thg${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  if (selectedManifest) {
      // DETAIL VIEW: SPLIT SCREEN
      const isLocked = selectedManifest.status === 'Locked';

      return (
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:hidden flex justify-between items-center flex-shrink-0">
                <button onClick={() => setSelectedManifest(null)} className="text-gray-500 hover:text-primary transition flex items-center font-bold text-sm">
                    <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
                </button>
                
                <div className="flex items-center space-x-3">
                    {isLocked ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                            <Lock size={12} className="mr-1" /> Đã Khóa (View Only)
                        </span>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center mr-2">
                                <Edit size={12} className="mr-1" /> Chế độ nhập liệu
                            </span>
                            <button 
                                onClick={handleSaveManifest}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-700 transition"
                            >
                                <Save size={16} className="mr-2" /> Lưu thay đổi
                            </button>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => window.print()}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition"
                    >
                        <Printer size={16} className="mr-2" /> In
                    </button>
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                
                {/* LEFT: PREVIEW (Scrollable) */}
                <div className="flex-1 bg-gray-100 rounded-xl overflow-y-auto border border-gray-200 shadow-inner p-4 lg:p-8 flex justify-center print:w-full print:p-0 print:bg-white print:border-none">
                    <div 
                        className="bg-white w-full max-w-[210mm] shadow-lg print:shadow-none p-8 min-h-full text-black border border-gray-100 origin-top transform scale-90 lg:scale-100"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-2/3">
                            <h2 className="font-bold text-[14px] uppercase">{selectedManifest.headerInfo.sender}</h2>
                            <p className="text-[11px] mt-1">• Địa chỉ: {selectedManifest.headerInfo.address}</p>
                            <p className="text-[11px] mt-1">Thông tin chuyển khoản: {selectedManifest.headerInfo.accountNumber}</p>
                            </div>
                            <div className="w-1/3 text-right">
                            <p className="text-[12px]">Kính Gửi: {selectedManifest.headerInfo.receiver}</p>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h1 className="text-[18px] font-bold uppercase">BẢNG KÊ XE TẢI</h1>
                            <p className="text-[11px] italic">HD: {formatDateHeader(selectedManifest.headerInfo.invoiceDate)}</p>
                        </div>

                        {/* Preview Table */}
                        <table className="w-full border-collapse border border-black text-[11px] table-fixed">
                            <colgroup>
                                <col className="w-[30px]" />
                                <col className="w-[70px]" />
                                <col className="w-[80px]" />
                                <col />
                                <col />
                                <col className="w-[80px]" />
                                <col className="w-[60px]" />
                                <col className="w-[100px]" />
                            </colgroup>
                            <thead>
                            <tr>
                                <th className="border border-black p-1 text-center">STT</th>
                                <th className="border border-black p-1 text-center">NGÀY</th>
                                <th className="border border-black p-1 text-center">BIỂN SỐ</th>
                                <th className="border border-black p-1 text-center">ĐIỂM ĐI</th>
                                <th className="border border-black p-1 text-center">ĐIỂM ĐẾN</th>
                                <th className="border border-black p-1 text-right">GIÁ</th>
                                <th className="border border-black p-1 text-center">NOTE</th>
                                <th className="border border-black p-1 text-center bg-yellow-50">SỐ JOB</th>
                            </tr>
                            </thead>
                            <tbody>
                            {editingRows.map((row, idx) => (
                                <tr key={row.id}>
                                <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black p-1 text-center">{formatDateForDisplay(row.date)}</td>
                                <td className="border border-black p-1 text-center">{row.plateNumber}</td>
                                <td className="border border-black p-1 truncate">{row.from}</td>
                                <td className="border border-black p-1 truncate">{row.to}</td>
                                <td className="border border-black p-1 text-right">{row.price.toLocaleString()}</td>
                                <td className="border border-black p-1 text-center">{row.note}</td>
                                <td className="border border-black p-1 text-center font-bold text-blue-600 bg-yellow-50">{row.jobNo}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: INPUT FORM (Scrollable) - Hidden on Print */}
                <div className="w-full lg:w-[400px] bg-white rounded-xl border border-gray-200 shadow-xl flex flex-col print:hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h4 className="font-bold text-gray-800 flex items-center">
                            <Edit size={16} className="mr-2 text-blue-600" /> Nhập liệu Số Job
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                            {isLocked ? 'Bảng kê đã khóa. Không thể chỉnh sửa.' : 'Nhập mã Job tương ứng cho từng chuyến xe.'}
                        </p>
                    </div>
                    
                    <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-gray-50/50">
                        {editingRows.map((row, idx) => (
                            <div key={row.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 mr-2">#{idx + 1}</span>
                                        <span className="text-xs font-bold text-gray-800">{row.plateNumber}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{formatDateForDisplay(row.date)}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 truncate flex items-center">
                                    {row.from} <ArrowLeft size={10} className="mx-1 rotate-180" /> {row.to}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Số Job</label>
                                    <input 
                                        type="text" 
                                        className={`w-full border rounded px-2 py-1.5 text-sm font-bold uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300'}`}
                                        placeholder="Nhập mã Job..."
                                        value={row.jobNo}
                                        onChange={(e) => handleRowChange(row.id, 'jobNo', e.target.value)}
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isLocked && (
                        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
                            <button 
                                onClick={handleSaveManifest}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg transition uppercase tracking-wider flex items-center justify-center"
                            >
                                <Save size={18} className="mr-2" /> Lưu cập nhật
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">Danh sách Bảng kê</h3>
                <p className="text-sm text-gray-500">Các bảng kê được chia sẻ từ bộ phận Account</p>
            </div>
        </div>

        {/* Filter / Search placeholder */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center shadow-sm">
            <Search className="text-gray-400 mr-2" size={20} />
            <input type="text" placeholder="Tìm kiếm theo tên nhà xe..." className="w-full outline-none text-sm" />
        </div>

        <div className="space-y-8">
            {Object.keys(grouped).sort().reverse().map(month => (
                <div key={month}>
                    <h4 className="text-lg font-bold text-gray-700 mb-3 border-l-4 border-orange-500 pl-3">Tháng {month}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grouped[month].map(stmt => (
                            <div 
                                key={stmt.id}
                                onClick={() => handleSelectManifest(stmt)}
                                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition">
                                        <Truck size={20} />
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${stmt.status === 'Locked' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {stmt.status === 'Locked' ? 'Locked' : 'Shared'}
                                    </div>
                                </div>
                                <h5 className="font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition">{stmt.senderName}</h5>
                                <p className="text-xs text-gray-500 mb-3">Ngày nhận: {stmt.createdDate}</p>
                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-black text-gray-800">{stmt.totalAmount.toLocaleString()} đ</span>
                                    <span className="text-[10px] text-gray-400">{stmt.rows.length} chuyến</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {visibleStatements.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                    <Truck size={48} className="mx-auto mb-3 opacity-20" />
                    Chưa có bảng kê nào được chia sẻ.
                </div>
            )}
        </div>
    </div>
  );
};

export default CompanyManifests;

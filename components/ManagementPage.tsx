
import React, { useState } from 'react';
import { 
  X, FileText, Search, Download, Users, FileCheck, CreditCard, 
  ArrowLeft, Eye, ShieldCheck, Filter, ChevronRight, Package, 
  Ship, Truck, BarChart2, Briefcase, FileOutput, FolderOpen, Calendar, Trash2
} from 'lucide-react';
// Use type import to avoid circular dependency
import type { UserRole, UserAccount, GUQRecord, UserFileRecord, AdjustmentRecord } from '../App';
import { API_BASE_URL } from '../constants';

interface ManagementPageProps {
  onClose: () => void;
  userRole: UserRole;
  users: UserAccount[];
  guqRecords: GUQRecord[]; // Receive real records
  userFiles: UserFileRecord[]; // Receive real user files
  onUpdateUserFiles: (files: UserFileRecord[]) => void;
  adjustments: AdjustmentRecord[]; // Receive real adjustments
  onUpdateAdjustments: (records: AdjustmentRecord[]) => void;
}

type ManagementSection = 'GUQ' | 'CVHC' | 'CVHT' | 'ADJUST' | 'EMPLOYEES';

// Mock Data for other sections (CVHC, CVHT) preserved
const MOCK_CVHC = [
  { id: 1, company: 'Công ty Samsung Vina', bl: 'LH-HBL-20240987', date: '11/05/2024', fileCvhc: 'CVHC_Samsung.pdf', fileEir: 'EIR_Samsung_01.jpg' },
  { id: 2, company: 'VinFast Hải Phòng', bl: 'LH-HBL-20241022', date: '09/05/2024', fileCvhc: 'CVHC_Vinfast.pdf', fileEir: 'EIR_Vinfast_VF8.pdf' },
];

const MOCK_CVHT = [
  { id: 1, company: 'Dệt may Thắng Lợi', bl: 'LH-HBL-99283', amount: '2,500,000', date: '14/05/2024', fileName: 'CVHT_ThangLoi.pdf' },
  { id: 2, company: 'Thực phẩm An Gia', bl: 'LH-HBL-88172', amount: '1,200,000', date: '13/05/2024', fileName: 'CVHT_AnGia.pdf' },
];

// Helper to generate mock details for any user (Shipments only now)
const getMockEmployeeDetails = (user: UserAccount) => {
  return {
    ...user,
    shipments: [
      { code: `LH-S-${user.id}01`, commodity: 'Máy móc', status: 'In Transit' },
      { code: `LH-S-${user.id}02`, commodity: 'Nông sản', status: 'Delivered' }
    ]
  };
};

const ManagementPage: React.FC<ManagementPageProps> = ({ onClose, userRole, users, guqRecords, userFiles, onUpdateUserFiles, adjustments, onUpdateAdjustments }) => {
  const [activeSection, setActiveSection] = useState<ManagementSection>('EMPLOYEES');
  const [adjustFilter, setAdjustFilter] = useState<'All' | 'Signed' | 'Unsigned'>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<ReturnType<typeof getMockEmployeeDetails> | null>(null);
  const [guqSearch, setGuqSearch] = useState('');
  
  // Preview Modal State
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  if (userRole !== 'admin' && userRole !== 'manager') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800">Truy cập bị từ chối</h1>
                  <p className="text-gray-500">Bạn không có quyền truy cập vào trang quản lý này.</p>
                  <button onClick={onClose} className="mt-4 text-primary font-bold">Quay lại</button>
              </div>
          </div>
      );
  }

  // Filter users to show only staff/sales/docs/accounting
  const employeeList = users.filter(u => ['Sales', 'Document', 'Accounting', 'Staff'].includes(u.role) && u.status === 'Active');

  const filteredGuq = guqRecords.filter(r => r.companyName.toLowerCase().includes(guqSearch.toLowerCase()));

  // --- PREVIEW HANDLER ---
  const handlePreview = (fileData: string | { fileName: string, path?: string }, defaultCategory: string = 'UPLOADS') => {
      let url = '';
      let name = '';

      if (typeof fileData === 'string') {
          name = fileData;
          // Assume generic path for strings
          url = `${API_BASE_URL}/files/${defaultCategory}/${fileData}`;
      } else {
          name = fileData.fileName;
          if (fileData.path) {
               // If path is provided by server record (e.g. GUQRecord)
               url = `${API_BASE_URL}/files/${fileData.path}`;
          } else {
               url = `${API_BASE_URL}/files/${defaultCategory}/${fileData.fileName}`;
          }
      }
      setPreviewFile({ url, name });
  };

  // --- DOWNLOAD HANDLER ---
  const handleDownload = (fileName: string, category: string) => {
      const url = `${API_BASE_URL}/files/${category}/${fileName}`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank'); // Open in new tab if browser prefers or direct download fails
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDeleteFile = (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa file này?')) {
          onUpdateUserFiles(userFiles.filter(f => f.id !== id));
      }
  };

  const handleDeleteAdjustment = (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa biên bản này? Hành động này không thể hoàn tác.')) {
          onUpdateAdjustments(adjustments.filter(a => a.id !== id));
      }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'GUQ':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center"><FileText className="mr-2 text-primary" size={20} /> Danh sách Giấy ủy quyền</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
                    <input 
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:border-primary" 
                        placeholder="Tìm tên công ty..." 
                        value={guqSearch}
                        onChange={(e) => setGuqSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                <thead className="text-[10px] font-bold text-gray-400 uppercase bg-white border-b border-gray-100 sticky top-0 z-10">
                    <tr><th className="px-6 py-4">Tên công ty</th><th className="px-6 py-4">Ngày nộp</th><th className="px-6 py-4">File đính kèm</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredGuq.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 font-bold text-gray-800">{item.companyName}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                        <td className="px-6 py-4">
                            <span 
                                onClick={() => handlePreview(item, 'GUQ')}
                                className="text-xs text-blue-600 font-medium underline cursor-pointer hover:text-blue-800"
                            >
                                {item.fileName}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => handlePreview(item, 'GUQ')} className="p-2 text-gray-400 hover:text-primary transition" title="Xem trước">
                                <Eye size={18} />
                            </button>
                        </td>
                    </tr>
                    ))}
                    {filteredGuq.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-gray-400 italic">Chưa có dữ liệu</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        );
      case 'CVHC':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50"><h3 className="font-bold text-gray-800 flex items-center"><FileCheck className="mr-2 text-green-500" size={20} /> Công văn Hoàn cược</h3></div>
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                <tr><th className="px-6 py-4">Tên công ty</th><th className="px-6 py-4">Số Bill (BL)</th><th className="px-6 py-4">Hồ sơ</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_CVHC.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.company}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{item.bl}</td>
                    <td className="px-6 py-4 space-y-1">
                      <div onClick={() => handlePreview(item.fileCvhc, 'CVHC')} className="text-[10px] font-bold text-blue-500 flex items-center cursor-pointer hover:underline"><FileText size={12} className="mr-1" /> {item.fileCvhc}</div>
                      <div onClick={() => handlePreview(item.fileEir, 'CVHC')} className="text-[10px] font-bold text-orange-500 flex items-center cursor-pointer hover:underline"><Package size={12} className="mr-1" /> {item.fileEir}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDownload(item.fileCvhc, 'CVHC')} className="p-2 text-gray-400 hover:text-primary transition" title="Tải xuống">
                            <Download size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'CVHT':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50"><h3 className="font-bold text-gray-800 flex items-center"><CreditCard className="mr-2 text-blue-500" size={20} /> Công văn Hoàn tiền</h3></div>
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                <tr><th className="px-6 py-4">Tên công ty</th><th className="px-6 py-4">Số Bill (BL)</th><th className="px-6 py-4">Số tiền</th><th className="px-6 py-4">Ngày</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_CVHT.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.company}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.bl}</td>
                    <td className="px-6 py-4 font-black text-primary">{item.amount} VNĐ</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => handlePreview(item.fileName, 'CVHT')} className="bg-gray-100 p-2 rounded hover:bg-primary hover:text-white transition" title="Xem trước">
                            <Eye size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'ADJUST':
        const filteredAdjust = adjustments.filter(a => adjustFilter === 'All' || a.status === adjustFilter);
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
               {['All', 'Signed', 'Unsigned'].map(f => (
                 <button key={f} onClick={() => setAdjustFilter(f as any)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${adjustFilter === f ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}>
                   {f === 'All' ? 'Tất cả' : f === 'Signed' ? 'Đã ký' : 'Chưa ký'}
                 </button>
               ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                        <tr><th className="px-6 py-4">Số Biên Bản</th><th className="px-6 py-4">Ngày lập</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredAdjust.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700">{item.bl}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {item.status === 'Signed' ? 'Đã ký điện tử' : 'Chưa ký'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button onClick={() => handlePreview(item.fileName, 'BBDC')} className="text-gray-400 hover:text-primary transition" title="Xem trước">
                                        <Eye size={18} />
                                    </button>
                                    <button onClick={() => handleDownload(item.fileName, 'BBDC')} className="text-gray-400 hover:text-blue-500 transition" title="Tải xuống">
                                        <Download size={18} />
                                    </button>
                                    {userRole === 'admin' && (
                                      <button onClick={() => handleDeleteAdjustment(item.id)} className="text-gray-400 hover:text-red-500 transition" title="Xóa">
                                          <Trash2 size={18} />
                                      </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredAdjust.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-400 italic">Chưa có biên bản nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        );
      case 'EMPLOYEES':
        // Filter files for selected employee
        const employeeFiles = selectedEmployee ? userFiles.filter(f => f.userId === selectedEmployee.id) : [];
        const employeeReports = employeeFiles.filter(f => f.type === 'REPORT');
        const employeeQuotes = employeeFiles.filter(f => f.type === 'QUOTATION');
        const employeeOthers = employeeFiles.filter(f => f.type !== 'REPORT' && f.type !== 'QUOTATION');

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
              <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800 flex items-center"><Users size={18} className="mr-2 text-primary" /> Đội ngũ nhân viên</div>
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {employeeList.map(emp => (
                  <div key={emp.id} onClick={() => setSelectedEmployee(getMockEmployeeDetails(emp))} className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors flex items-center justify-between group ${selectedEmployee?.id === emp.id ? 'bg-orange-50 border-r-4 border-primary' : ''}`}>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">{emp.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{emp.role}</p>
                    </div>
                    <ChevronRight size={16} className={`text-gray-300 group-hover:text-primary transition-transform ${selectedEmployee?.id === emp.id ? 'rotate-90 translate-x-1' : ''}`} />
                  </div>
                ))}
                {employeeList.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm italic">
                    Chưa có nhân viên nào trong hệ thống.
                  </div>
                )}
              </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 space-y-8">
              {selectedEmployee ? (
                <>
                  {/* Summary */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl">{selectedEmployee.name.split(' ').pop()?.charAt(0)}</div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">{selectedEmployee.name}</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedEmployee.role}</p>
                            <p className="text-xs text-gray-400 mt-1">{selectedEmployee.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <span className="block text-xl font-black text-primary">{selectedEmployee.shipments.length}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Lô hàng</span>
                        </div>
                        <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <span className="block text-xl font-black text-blue-600">{employeeReports.length}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Báo cáo</span>
                        </div>
                    </div>
                  </div>

                  {/* Shipments Detail */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center"><Package size={16} className="mr-2" /> Các lô hàng đang quản lý</div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                                <tr><th className="px-6 py-3">Mã lô</th><th className="px-6 py-3">Hàng hóa</th><th className="px-6 py-3">Trạng thái</th><th className="px-6 py-3"></th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {selectedEmployee.shipments.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/30">
                                        <td className="px-6 py-4 font-mono text-xs font-bold">{s.code}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{s.commodity}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{s.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-primary"><Eye size={16} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>

                  {/* Weekly Reports */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center"><BarChart2 size={16} className="mr-2" /> File báo cáo tuần</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                        {employeeReports.map((r, idx) => (
                            <div 
                                key={r.id} 
                                onClick={() => handlePreview(r.fileName, 'REPORTS')}
                                className="border border-gray-100 p-4 rounded-xl hover:bg-orange-50 transition cursor-pointer flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-2 rounded shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-gray-800">{r.description || 'Báo cáo tuần'}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">{r.fileName}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(r.id); }} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                        {employeeReports.length === 0 && <p className="text-sm text-gray-400 italic col-span-2">Chưa có báo cáo nào.</p>}
                    </div>
                  </div>

                  {/* REAL: Quotation Files (PDF) */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center"><FileOutput size={16} className="mr-2" /> Lịch sử Báo giá (PDF)</div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                                <tr><th className="px-6 py-3">File Báo giá</th><th className="px-6 py-3">Khách hàng</th><th className="px-6 py-3">Ngày tạo</th><th className="px-6 py-3 text-right">Thao tác</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {employeeQuotes.map((q) => (
                                    <tr key={q.id} className="hover:bg-gray-50/30">
                                        <td 
                                            className="px-6 py-4 font-mono text-xs font-bold text-blue-600 flex items-center cursor-pointer hover:underline"
                                            onClick={() => handlePreview(q.fileName, 'QUOTATION')} // Assuming mock uses default path logic for now if not real upload
                                        >
                                            <FileText size={14} className="mr-2 text-red-500" />
                                            {q.fileName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-bold">{q.customer || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{q.date}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleDownload(q.fileName, 'QUOTATION')} className="text-gray-400 hover:text-green-600 transition" title="Tải xuống">
                                                <Download size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteFile(q.id)} className="text-gray-400 hover:text-red-500 transition" title="Xóa file">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {employeeQuotes.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-4 text-sm text-gray-400 italic text-center">Chưa có báo giá nào được tạo.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </div>

                  {/* REAL: Other Files (Leave Requests, etc.) */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-700 flex items-center"><FolderOpen size={16} className="mr-2" /> Hồ sơ khác & Đơn từ</div>
                    <div className="grid grid-cols-1 gap-3 p-6">
                        {employeeOthers.map((f) => (
                            <div key={f.id} className="border border-gray-100 p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${f.type === 'LEAVE' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {f.type === 'LEAVE' ? <Calendar size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-gray-800">{f.type === 'LEAVE' ? 'ĐƠN XIN NGHỈ PHÉP' : f.type}</span>
                                        <span className="text-[10px] text-gray-500">{f.description || f.fileName} - {f.date}</span>
                                        <p onClick={() => handlePreview(f.fileName, f.type === 'LEAVE' ? 'LEAVE' : 'UPLOADS')} className="text-[10px] text-blue-500 underline mt-0.5 cursor-pointer hover:text-blue-700">{f.fileName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePreview(f.fileName, f.type === 'LEAVE' ? 'LEAVE' : 'UPLOADS')} className="p-2 bg-white border border-gray-200 rounded text-gray-400 hover:text-primary hover:border-primary transition shadow-sm">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteFile(f.id)} className="p-2 bg-white border border-gray-200 rounded text-gray-400 hover:text-red-500 hover:border-red-200 transition shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {employeeOthers.length === 0 && <p className="text-sm text-gray-400 italic">Chưa có hồ sơ khác.</p>}
                    </div>
                  </div>

                </>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-20">
                    <div className="text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">Chọn một nhân viên để xem chi tiết hoạt động</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar-like Top Navigation */}
      <div className="bg-[#1e2a3b] text-white py-6 px-8 sticky top-0 z-40 shadow-xl border-b border-white/5">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6">
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition"><ArrowLeft size={24} /></button>
            <div className="flex items-center space-x-3">
              <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="LH Logo" className="h-10 w-auto object-contain shadow-lg" />
              <div>
                <span className="font-black uppercase tracking-tighter text-lg leading-none block">Management <span className="text-primary">Portal</span></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userRole} access authorized</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
            {[
              { id: 'EMPLOYEES', label: 'Nhân viên', icon: Users },
              { id: 'GUQ', label: 'GUQ', icon: FileText },
              { id: 'CVHC', label: 'CVHC', icon: FileCheck },
              { id: 'CVHT', label: 'CVHT', icon: CreditCard },
              { id: 'ADJUST', label: 'Biên bản', icon: ShieldCheck }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveSection(tab.id as ManagementSection)}
                className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeSection === tab.id ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">
                    {activeSection === 'EMPLOYEES' && 'Quản lý nhân sự'}
                    {activeSection === 'GUQ' && 'Giấy ủy quyền'}
                    {activeSection === 'CVHC' && 'Hoàn cược'}
                    {activeSection === 'CVHT' && 'Hoàn tiền'}
                    {activeSection === 'ADJUST' && 'Điều chỉnh & Thay thế'}
                </h2>
                <div className="h-1 w-12 bg-primary mt-2"></div>
            </div>
            <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Cập nhật lúc</p>
                <p className="text-sm font-black text-gray-700">{new Date().toLocaleTimeString()}</p>
            </div>
        </div>
        
        {renderSection()}
      </div>

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl flex flex-col shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center truncate">
                        <FileText className="mr-2 text-primary" /> {previewFile.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <a href={previewFile.url} download target="_blank" rel="noreferrer" className="p-2 bg-gray-100 hover:bg-primary hover:text-white rounded-lg transition" title="Tải xuống">
                            <Download size={20} />
                        </a>
                        <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative flex items-center justify-center">
                     {previewFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                         <img src={previewFile.url} alt="Preview" className="w-full h-full object-contain" />
                     ) : previewFile.name.match(/\.pdf$/i) ? (
                         <iframe src={previewFile.url} className="w-full h-full rounded-lg border border-gray-200 bg-white" title="PDF Preview"></iframe>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <FileText size={64} className="mb-4 opacity-50" />
                             <p className="font-bold">Không thể xem trước định dạng này.</p>
                             <a href={previewFile.url} download className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primaryDark transition shadow-md">
                                 Tải xuống để xem
                             </a>
                         </div>
                     )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPage;

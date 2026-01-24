
import React, { useState, useMemo } from 'react';
import { 
  Package, TrendingUp, Ship, BarChart3, Filter, Briefcase, Plus, Save, Edit, Trash2, 
  UserPlus, AlertTriangle, UserMinus, MessageSquare, HelpCircle, FileText, Send, X, Printer, AlertCircle
} from 'lucide-react';
import { UserAccount } from '../../App';

interface Customer {
  id: number;
  companyName: string;
  shipmentInfo: string;
  contact: string;
  status: string;
  classification: 'Check giá' | 'Tiềm năng';
  week: number;
  month: number;
  year: number;
}

interface ExistingCustomer {
  id: number;
  week: number;
  month: number;
  year: number;
  companyName: string;
  profit: number;
  com: number;
  status: 'Đang lấy Booking' | 'Đang vận chuyển' | 'Hoàn thành';
}

interface CompanyReportsProps {
  currentUser: UserAccount | null;
}

const CompanyReports: React.FC<CompanyReportsProps> = ({ currentUser }) => {
  const today = new Date();
  const currentWeek = Math.ceil(today.getDate() / 7);
  
  const [reportFilter, setReportFilter] = useState({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      week: currentWeek as 'All' | number
  });

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, companyName: 'Công ty ABC Việt Nam', shipmentInfo: '3x20GP HCM-BKK', contact: 'Mr. Long - 090xxx', status: 'Đang báo giá', classification: 'Check giá', week: 2, month: 5, year: 2024 },
    { id: 2, companyName: 'Logistics Global Ltd', shipmentInfo: '1.2 tons AIR SGN-FRA', contact: 'Ms. Hoa - hoa@global.com', status: 'Đã chốt', classification: 'Tiềm năng', week: 3, month: 5, year: 2024 },
    { id: 3, companyName: 'Minh Long Corp', shipmentInfo: 'LCL 2 CBM to US', contact: 'Mr. Binh', status: 'Follow', classification: 'Check giá', week: 4, month: 4, year: 2024 },
    { id: 4, companyName: 'Hoang Ha Import Export', shipmentInfo: '40HC to US', contact: 'Ms. Ha', status: 'Mới', classification: 'Check giá', week: 4, month: 5, year: 2024 },
    { id: 5, companyName: 'Viet Food JSC', shipmentInfo: 'Reefer Container', contact: 'Mr. Tuan', status: 'Follow', classification: 'Tiềm năng', week: 4, month: 5, year: 2024 },
  ]);
  
  const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([
      { id: 1, week: 1, month: 5, year: 2024, companyName: 'KH Thân thiết A', profit: 500, com: 50, status: 'Hoàn thành' },
      { id: 2, week: 2, month: 5, year: 2024, companyName: 'Đối tác B', profit: 1200, com: 100, status: 'Đang vận chuyển' },
      { id: 3, week: 2, month: 5, year: 2024, companyName: 'Công ty C', profit: 800, com: 0, status: 'Đang lấy Booking' },
      { id: 4, week: 3, month: 5, year: 2024, companyName: 'Tech Zone VN', profit: 1500, com: 150, status: 'Hoàn thành' },
      { id: 5, week: 3, month: 5, year: 2024, companyName: 'Furniture World', profit: 2000, com: 200, status: 'Đang vận chuyển' },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingExistingId, setEditingExistingId] = useState<number | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportInputs, setReportInputs] = useState({
      difficulties: '',
      lostCustomers: '',
      feedback: '',
      suggestions: ''
  });

  if (!currentUser) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 h-[60vh]">
              <AlertCircle size={48} className="mb-4 text-orange-400" />
              <p className="font-bold text-lg text-gray-600">Vui lòng đăng nhập</p>
              <p className="text-sm mt-1">Bạn cần đăng nhập để sử dụng tính năng báo cáo.</p>
          </div>
      );
  }

  const formatCurrency = (val: number) => val.toLocaleString('en-US');
  const parseCurrency = (val: string) => parseFloat(val.replace(/,/g, '')) || 0;

  const addCustomer = () => {
    const newCust: Customer = {
      id: Date.now(),
      companyName: '',
      shipmentInfo: '',
      contact: '',
      status: 'Mới',
      classification: 'Check giá',
      week: reportFilter.week !== 'All' ? Number(reportFilter.week) : currentWeek,
      month: reportFilter.month,
      year: reportFilter.year
    };
    setCustomers([...customers, newCust]);
    setEditingId(newCust.id);
  };

  const addExistingCustomer = () => {
      const newCust: ExistingCustomer = {
          id: Date.now(),
          week: reportFilter.week !== 'All' ? Number(reportFilter.week) : currentWeek,
          month: reportFilter.month,
          year: reportFilter.year,
          companyName: '',
          profit: 0,
          com: 0,
          status: 'Đang lấy Booking'
      };
      setExistingCustomers([...existingCustomers, newCust]);
      setEditingExistingId(newCust.id);
  };

  const updateCustomer = (id: number, field: keyof Customer, value: any) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const updateExistingCustomer = (id: number, field: keyof ExistingCustomer, value: any) => {
    setExistingCustomers(existingCustomers.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCustomer = (id: number) => setCustomers(customers.filter(c => c.id !== id));
  const deleteExistingCustomer = (id: number) => setExistingCustomers(existingCustomers.filter(c => c.id !== id));

  // Explicit filtering with useMemo to maintain strong typing and avoid inference issues
  const filteredCustomers = useMemo(() => {
    return customers.filter(item => {
        const matchYear = item.year === reportFilter.year;
        const matchMonth = item.month === reportFilter.month;
        const matchWeek = reportFilter.week === 'All' || item.week === Number(reportFilter.week);
        return matchYear && matchMonth && matchWeek;
    });
  }, [customers, reportFilter]);

  const filteredExistingCustomers = useMemo(() => {
    return existingCustomers.filter(item => {
        const matchYear = item.year === reportFilter.year;
        const matchMonth = item.month === reportFilter.month;
        const matchWeek = reportFilter.week === 'All' || item.week === Number(reportFilter.week);
        return matchYear && matchMonth && matchWeek;
    });
  }, [existingCustomers, reportFilter]);

  const stats = useMemo(() => {
      const bookingCount = filteredExistingCustomers.length;
      // Fixed: filteredExistingCustomers is now correctly typed as ExistingCustomer[]
      const profitSum = filteredExistingCustomers.reduce((sum, c) => sum + c.profit, 0);
      const shippingCount = existingCustomers.filter(c => 
          c.month === reportFilter.month && 
          c.year === reportFilter.year && 
          c.status === 'Đang vận chuyển'
      ).length;
      const monthlyRevenue = existingCustomers
          .filter(c => c.month === reportFilter.month && c.year === reportFilter.year)
          .reduce((sum, c) => sum + c.profit, 0);

      return { bookingCount, profitSum, shippingCount, monthlyRevenue };
  }, [existingCustomers, filteredExistingCustomers, reportFilter]);

  const handleSendReport = () => {
      alert(`Báo cáo tuần đã được gửi thành công và lưu vào hồ sơ nhân viên: ${currentUser.name}`);
      setShowReportPreview(false);
  };

  // --- DYNAMIC PAGINATION ALGORITHM ---
  const generatePages = () => {
    const PAGE_HEIGHT = 950; 
    const HEADER_HEIGHT = 120;
    const SECTION_TITLE_HEIGHT = 50;
    const TABLE_HEADER_HEIGHT = 40;
    const ROW_HEIGHT = 45;
    const INPUT_BLOCK_HEIGHT = 120; 
    const SIGNATURE_HEIGHT = 200;
    const TOTAL_ROW_HEIGHT = 50;

    let pages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentHeight = 0;

    const startNewPage = () => {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    };

    currentPage.push(
      <div key="header" className="flex justify-between items-center mb-8 border-b-2 border-gray-900 pb-4 h-[120px]">
          <div>
              <h1 className="text-2xl font-black uppercase tracking-wider">BÁO CÁO CÔNG VIỆC</h1>
              <p className="text-sm font-bold mt-1 uppercase">Tháng {reportFilter.month}/{reportFilter.year} {reportFilter.week !== 'All' ? `- Tuần ${reportFilter.week}` : ''}</p>
          </div>
          <div className="text-right">
              <p className="text-sm font-bold">Người báo cáo: {currentUser.name}</p>
              <p className="text-sm">Ngày báo cáo: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
      </div>
    );
    currentHeight += HEADER_HEIGHT;

    const renderExistingTableHead = () => (
      <thead key="thead-existing">
          <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 w-10 text-center">STT</th>
              <th className="border border-gray-300 p-2 w-28 text-center">Tuần</th>
              <th className="border border-gray-300 p-2">Khách hàng</th>
              <th className="border border-gray-300 p-2 text-right">Profit ($)</th>
              <th className="border border-gray-300 p-2 text-right">COM ($)</th>
              <th className="border border-gray-300 p-2 text-center">Tình trạng</th>
          </tr>
      </thead>
    );

    if (currentHeight + SECTION_TITLE_HEIGHT + TABLE_HEADER_HEIGHT + ROW_HEIGHT > PAGE_HEIGHT) startNewPage();
    currentPage.push(
      <h3 key="title-1" className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-3 h-[50px]">1. Khách hàng hiện tại</h3>
    );
    currentHeight += SECTION_TITLE_HEIGHT;

    let existingRowsBuffer: React.ReactNode[] = [];
    existingRowsBuffer.push(renderExistingTableHead());
    currentHeight += TABLE_HEADER_HEIGHT;

    filteredExistingCustomers.forEach((c, i) => {
       if (currentHeight + ROW_HEIGHT > PAGE_HEIGHT) {
           currentPage.push(
             <table key={`table-exist-${pages.length}`} className="w-full border-collapse border border-gray-300 text-sm mb-4">
                {existingRowsBuffer}
             </table>
           );
           startNewPage();
           existingRowsBuffer = [renderExistingTableHead()];
           currentHeight += TABLE_HEADER_HEIGHT;
       }
       existingRowsBuffer.push(
          <tbody key={`row-exist-${c.id}`}>
            <tr>
                <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                <td className="border border-gray-300 p-2 text-center">W{c.week}/T{c.month}</td>
                <td className="border border-gray-300 p-2 font-bold">{c.companyName}</td>
                <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.profit)}</td>
                <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.com)}</td>
                <td className="border border-gray-300 p-2 text-center">{c.status}</td>
            </tr>
          </tbody>
       );
       currentHeight += ROW_HEIGHT;
    });

    if (currentHeight + TOTAL_ROW_HEIGHT > PAGE_HEIGHT) {
      currentPage.push(<table key={`table-exist-end`} className="w-full border-collapse border border-gray-300 text-sm mb-4">{existingRowsBuffer}</table>);
      startNewPage();
      existingRowsBuffer = [renderExistingTableHead()];
      currentHeight += TABLE_HEADER_HEIGHT;
    }
    
    if (filteredExistingCustomers.length > 0) {
      existingRowsBuffer.push(
        <tbody key="total-exist">
           <tr className="bg-gray-50 font-bold">
              <td colSpan={3} className="border border-gray-300 p-2 text-right uppercase">Tổng cộng:</td>
              <td className="border border-gray-300 p-2 text-right">{formatCurrency(filteredExistingCustomers.reduce((s,c) => s+c.profit, 0))}</td>
              <td className="border border-gray-300 p-2 text-right">{formatCurrency(filteredExistingCustomers.reduce((s,c) => s+c.com, 0))}</td>
              <td className="border border-gray-300 p-2"></td>
          </tr>
        </tbody>
      );
      currentHeight += TOTAL_ROW_HEIGHT;
    } else {
      existingRowsBuffer.push(<tbody><tr><td colSpan={6} className="border border-gray-300 p-2 text-center italic">Không có dữ liệu</td></tr></tbody>);
    }

    currentPage.push(<table key={`table-exist-final`} className="w-full border-collapse border border-gray-300 text-sm mb-4">{existingRowsBuffer}</table>);

    const renderNewTableHead = () => (
      <thead key="thead-new">
          <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 w-10 text-center">STT</th>
              <th className="border border-gray-300 p-2 w-28 text-center">Tuần</th>
              <th className="border border-gray-300 p-2">Tên công ty</th>
              <th className="border border-gray-300 p-2">Thông tin lô hàng</th>
              <th className="border border-gray-300 p-2">Liên hệ</th>
              <th className="border border-gray-300 p-2">Phân loại</th>
          </tr>
      </thead>
    );

    if (currentHeight + SECTION_TITLE_HEIGHT + TABLE_HEADER_HEIGHT + ROW_HEIGHT > PAGE_HEIGHT) startNewPage();
    currentPage.push(
      <h3 key="title-2" className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-3 h-[50px]">2. Khách hàng mới phát triển</h3>
    );
    currentHeight += SECTION_TITLE_HEIGHT;

    let newRowsBuffer: React.ReactNode[] = [];
    newRowsBuffer.push(renderNewTableHead());
    currentHeight += TABLE_HEADER_HEIGHT;

    filteredCustomers.forEach((c, i) => {
        if (currentHeight + ROW_HEIGHT > PAGE_HEIGHT) {
            currentPage.push(
              <table key={`table-new-${pages.length}`} className="w-full border-collapse border border-gray-300 text-sm mb-4">
                 {newRowsBuffer}
              </table>
            );
            startNewPage();
            newRowsBuffer = [renderNewTableHead()];
            currentHeight += TABLE_HEADER_HEIGHT;
        }
        newRowsBuffer.push(
           <tbody key={`row-new-${c.id}`}>
             <tr>
                 <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                 <td className="border border-gray-300 p-2 text-center">W{c.week}/T{c.month}</td>
                 <td className="border border-gray-300 p-2 font-bold">{c.companyName}</td>
                 <td className="border border-gray-300 p-2 whitespace-pre-wrap text-xs">{c.shipmentInfo}</td>
                 <td className="border border-gray-300 p-2 text-xs">{c.contact}</td>
                 <td className="border border-gray-300 p-2 text-center">{c.classification}</td>
             </tr>
           </tbody>
        );
        currentHeight += ROW_HEIGHT;
     });

     if (filteredCustomers.length === 0) {
        newRowsBuffer.push(<tbody><tr><td colSpan={6} className="border border-gray-300 p-2 text-center italic">Không có dữ liệu</td></tr></tbody>);
     }
     currentPage.push(<table key={`table-new-final`} className="w-full border-collapse border border-gray-300 text-sm mb-4">{newRowsBuffer}</table>);

    const inputSections = [
        { title: '3. Khó khăn & Các bộ phận liên quan', value: reportInputs.difficulties },
        { title: '4. Khách hàng bị mất', value: reportInputs.lostCustomers },
        { title: '5. Phản ánh', value: reportInputs.feedback },
        { title: '6. Đề xuất', value: reportInputs.suggestions },
    ];

    inputSections.forEach((section, idx) => {
        if (currentHeight + INPUT_BLOCK_HEIGHT > PAGE_HEIGHT) startNewPage();
        currentPage.push(
            <div key={`input-${idx}`} className="mb-4">
                <h3 className="text-lg font-bold uppercase mb-2 border-l-4 border-black pl-3 h-[30px]">{section.title}</h3>
                <div className="border border-gray-300 p-3 min-h-[60px] text-sm whitespace-pre-wrap h-auto">
                    {section.value || 'Không có.'}
                </div>
            </div>
        );
        currentHeight += INPUT_BLOCK_HEIGHT;
    });

    if (currentHeight + SIGNATURE_HEIGHT > PAGE_HEIGHT) startNewPage();
    currentPage.push(
        <div key="signature" className="mt-8 text-right h-[200px]">
            <p className="font-bold uppercase">Người lập báo cáo</p>
            <div className="h-20"></div>
            <p className="font-bold">{currentUser.name}</p>
            <p className="text-sm italic text-gray-500">{currentUser.position || 'Nhân viên'}</p>
        </div>
    );

    if (currentPage.length > 0) pages.push(currentPage);
    return pages;
  };

  const reportPages = useMemo(() => {
     if (!showReportPreview) return [];
     return generatePages();
  }, [showReportPreview, filteredCustomers, filteredExistingCustomers, reportInputs]);

  const WeeklyReportPreview = () => (
    <div className="fixed inset-0 z-[100] bg-gray-800/95 backdrop-blur-sm flex flex-col items-center pt-4" onClick={() => setShowReportPreview(false)}>
       <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white;
            }
            .print-hidden {
              display: none !important;
            }
            .report-page {
              margin: 0 !important;
              box-shadow: none !important;
              page-break-after: always;
              break-after: page;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            .scroll-container {
              overflow: visible !important;
              height: auto !important;
            }
          }
        `}
      </style>

      <div className="flex gap-2 mb-6 print-hidden w-full max-w-[210mm] px-4" onClick={(e) => e.stopPropagation()}>
         <div className="flex-1 text-white font-bold text-lg flex items-center">
            <FileText className="mr-2" /> Xem trước báo cáo
         </div>
         <button 
              onClick={handleSendReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center text-xs font-bold shadow-lg"
          >
              <Send size={16} className="mr-2" /> Gửi báo cáo ngay
          </button>
          <button 
              onClick={() => window.print()} 
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center text-xs font-bold shadow-lg"
          >
              <Printer size={16} className="mr-2" /> In
          </button>
          <button 
              onClick={() => setShowReportPreview(false)} 
              className="bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition flex items-center text-xs font-bold shadow-lg"
          >
              <X size={16} className="mr-2" /> Đóng
          </button>
      </div>

      <div className="flex-1 w-full overflow-y-auto scroll-container pb-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center space-y-8 print:space-y-0">
            {reportPages.map((pageContent, index) => (
                <div 
                    key={index}
                    className="report-page bg-white w-[210mm] h-[297mm] shadow-2xl relative p-[20mm] text-gray-900 flex flex-col"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                    {index > 0 && (
                        <div className="mb-8 border-b border-gray-300 pb-2 text-right text-xs italic text-gray-500">
                             Báo cáo công việc (Tiếp theo - Trang {index + 1})
                        </div>
                    )}
                    <div className="flex-1">
                        {pageContent}
                    </div>
                    <div className="mt-auto pt-4 text-center text-xs text-gray-400 border-t border-gray-100">
                        Trang {index + 1} / {reportPages.length}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {showReportPreview && <WeeklyReportPreview />}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Booking trong tuần', value: stats.bookingCount, color: 'text-primary', icon: Package, trend: 'Theo bộ lọc' },
          { label: 'Profit trong tuần', value: `$${formatCurrency(stats.profitSum)}`, color: 'text-green-600', icon: TrendingUp, trend: 'Theo bộ lọc' },
          { label: 'Lô hàng đang chạy', value: stats.shippingCount, color: 'text-blue-600', icon: Ship, trend: `Trong tháng ${reportFilter.month}` },
          { label: 'Doanh thu tháng', value: `$${formatCurrency(stats.monthlyRevenue)}`, color: 'text-indigo-600', icon: BarChart3, trend: `Tổng tháng ${reportFilter.month}` }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}><stat.icon size={20} /></div>
            </div>
            <h4 className="text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">{stat.label}</h4>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-500 uppercase"><Filter size={16} className="inline mr-1" /> Bộ lọc:</span>
          </div>
          <div className="flex gap-2">
              <select 
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                  value={reportFilter.month}
                  onChange={(e) => setReportFilter({...reportFilter, month: Number(e.target.value)})}
              >
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
              <select 
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                  value={reportFilter.year}
                  onChange={(e) => setReportFilter({...reportFilter, year: Number(e.target.value)})}
              >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
              </select>
              <select 
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary"
                  value={reportFilter.week}
                  onChange={(e) => setReportFilter({...reportFilter, week: e.target.value === 'All' ? 'All' : Number(e.target.value)})}
              >
                  <option value="All">Tất cả các tuần</option>
                  <option value={1}>Tuần 1</option>
                  <option value={2}>Tuần 2</option>
                  <option value={3}>Tuần 3</option>
                  <option value={4}>Tuần 4</option>
                  <option value={5}>Tuần 5</option>
              </select>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50 gap-4">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Briefcase size={20} /></div>
             <h3 className="font-bold text-gray-800 text-lg">Khách hàng hiện tại</h3>
          </div>
          <button 
              onClick={addExistingCustomer}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-lg shadow-green-100"
          >
              <Plus size={14} className="mr-1" /> Thêm khách hàng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">STT</th>
                <th className="px-6 py-4 w-28">Tuần</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-right">Profit ($)</th>
                <th className="px-6 py-4 text-right">COM ($)</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExistingCustomers.map((cust, idx) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 transition group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                      {editingExistingId === cust.id ? (
                          <select 
                              className="bg-white border rounded px-1 py-1 text-xs outline-none"
                              value={cust.week} 
                              onChange={(e) => updateExistingCustomer(cust.id, 'week', Number(e.target.value))}
                          >
                              {[1,2,3,4,5].map(w => <option key={w} value={w}>W{w}</option>)}
                          </select>
                      ) : (
                          <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                              W{cust.week}/T{cust.month}/{cust.year.toString().slice(-2)}
                          </span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    {editingExistingId === cust.id ? (
                      <input className="w-full text-sm border-b border-primary/30 p-1 outline-none" value={cust.companyName} onChange={(e) => updateExistingCustomer(cust.id, 'companyName', e.target.value)} placeholder="Nhập tên..." />
                    ) : (
                      <div className="text-sm font-bold text-gray-800">{cust.companyName || '—'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingExistingId === cust.id ? (
                      <input 
                          type="text"
                          className="w-full text-sm border-b border-primary/30 p-1 outline-none text-right" 
                          value={formatCurrency(cust.profit)} 
                          onChange={(e) => updateExistingCustomer(cust.id, 'profit', parseCurrency(e.target.value))} 
                      />
                    ) : (
                      <div className="text-sm font-bold text-green-600">{formatCurrency(cust.profit)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingExistingId === cust.id ? (
                      <input 
                          type="text"
                          className="w-full text-sm border-b border-primary/30 p-1 outline-none text-right" 
                          value={formatCurrency(cust.com)} 
                          onChange={(e) => updateExistingCustomer(cust.id, 'com', parseCurrency(e.target.value))} 
                      />
                    ) : (
                      <div className="text-sm font-bold text-gray-500">{formatCurrency(cust.com)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {editingExistingId === cust.id ? (
                        <select 
                          className="text-xs border rounded p-1 outline-none w-full"
                          value={cust.status}
                          onChange={(e) => updateExistingCustomer(cust.id, 'status', e.target.value as any)}
                        >
                            <option value="Đang lấy Booking">Đang lấy Booking</option>
                            <option value="Đang vận chuyển">Đang vận chuyển</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                        </select>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${
                          cust.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                          cust.status === 'Đang vận chuyển' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                          {cust.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingExistingId === cust.id ? (
                        <button onClick={() => setEditingExistingId(null)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={16} /></button>
                      ) : (
                        <button onClick={() => setEditingExistingId(cust.id)} className="p-2 text-gray-400 hover:text-primary rounded-lg"><Edit size={16} /></button>
                      )}
                      <button onClick={() => deleteExistingCustomer(cust.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/50 gap-4">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-primary/10 text-primary rounded-lg"><UserPlus size={20} /></div>
             <h3 className="font-bold text-gray-800 text-lg">Khách hàng mới phát triển</h3>
          </div>
          <button 
              onClick={addCustomer}
              className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-lg shadow-orange-100"
          >
              <Plus size={14} className="mr-1" /> Thêm khách hàng
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Tên công ty</th>
                <th className="px-6 py-4">Thông tin lô hàng</th>
                <th className="px-6 py-4">Thông tin liên lạc</th>
                <th className="px-6 py-4">Tình trạng</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 transition group align-top">
                  <td className="px-6 py-4">
                    {editingId === cust.id ? (
                      <>
                          <input className="w-full text-sm border-b border-primary/30 p-1 outline-none mb-1" value={cust.companyName} onChange={(e) => updateCustomer(cust.id, 'companyName', e.target.value)} placeholder="Nhập tên..." />
                          <select className="text-xs border rounded p-1" value={cust.week} onChange={(e) => updateCustomer(cust.id, 'week', Number(e.target.value))}>{[1,2,3,4,5].map(w => <option key={w} value={w}>Tuần {w}</option>)}</select>
                      </>
                    ) : (
                      <div>
                          <div className="text-sm font-bold text-gray-800">{cust.companyName || '—'}</div>
                          <div className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">W{cust.week}/T{cust.month}/{cust.year.toString().slice(-2)}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === cust.id ? (
                      <textarea 
                          rows={3}
                          className="w-full text-sm border border-gray-200 rounded p-2 outline-none focus:border-primary transition" 
                          value={cust.shipmentInfo} 
                          onChange={(e) => updateCustomer(cust.id, 'shipmentInfo', e.target.value)} 
                          placeholder="Nhập lô hàng (Enter xuống dòng)..." 
                      />
                    ) : (
                      <div className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">{cust.shipmentInfo || '—'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === cust.id ? (
                      <input className="w-full text-sm border-b border-primary/30 p-1 outline-none" value={cust.contact} onChange={(e) => updateCustomer(cust.id, 'contact', e.target.value)} placeholder="Số ĐT/Email..." />
                    ) : (
                      <div className="text-xs text-gray-500">{cust.contact || '—'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === cust.id ? (
                        <input 
                          type="text" 
                          className="w-full text-sm border-b border-primary/30 p-1 outline-none"
                          value={cust.status}
                          onChange={(e) => updateCustomer(cust.id, 'status', e.target.value)}
                          placeholder="Nhập tình trạng..."
                        />
                    ) : (
                      <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                          <span className="text-xs font-medium text-gray-600">{cust.status}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition ${cust.classification === 'Tiềm năng' ? 'bg-orange-50 text-primary' : 'bg-gray-100 text-gray-500'}`}
                      value={cust.classification}
                      onChange={(e) => updateCustomer(cust.id, 'classification', e.target.value as any)}
                    >
                      <option value="Check giá">Check giá</option>
                      <option value="Tiềm năng">Tiềm năng</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === cust.id ? (
                        <button onClick={() => setEditingId(null)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={16} /></button>
                      ) : (
                        <button onClick={() => setEditingId(cust.id)} className="p-2 text-gray-400 hover:text-primary rounded-lg"><Edit size={16} /></button>
                      )}
                      <button onClick={() => deleteCustomer(cust.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={20} /></div>
              <h4 className="font-bold text-gray-800">Khó khăn & Các bộ phận liên quan</h4>
           </div>
           <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100 transition" 
              placeholder="Mô tả khó khăn..."
              value={reportInputs.difficulties}
              onChange={(e) => setReportInputs({...reportInputs, difficulties: e.target.value})}
           ></textarea>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gray-100 text-gray-500 rounded-lg"><UserMinus size={20} /></div>
              <h4 className="font-bold text-gray-800">Khách hàng bị mất (nếu có)</h4>
           </div>
           <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200 transition" 
              placeholder="Lý do..."
              value={reportInputs.lostCustomers}
              onChange={(e) => setReportInputs({...reportInputs, lostCustomers: e.target.value})}
           ></textarea>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><MessageSquare size={20} /></div>
              <h4 className="font-bold text-gray-800">Phản ánh nội bộ / Khách hàng</h4>
           </div>
           <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition" 
              placeholder="Phản ánh..."
              value={reportInputs.feedback}
              onChange={(e) => setReportInputs({...reportInputs, feedback: e.target.value})}
           ></textarea>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
           <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-50 text-green-500 rounded-lg"><HelpCircle size={20} /></div>
              <h4 className="font-bold text-gray-800">Yêu cầu & Đề xuất</h4>
           </div>
           <textarea 
              className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 transition" 
              placeholder="Đề xuất..."
              value={reportInputs.suggestions}
              onChange={(e) => setReportInputs({...reportInputs, suggestions: e.target.value})}
           ></textarea>
        </div>
      </div>

      <div className="flex justify-center pt-8">
          <button 
              onClick={() => setShowReportPreview(true)}
              className="bg-[#1e2a3b] text-white px-12 py-4 rounded-xl font-bold shadow-2xl hover:bg-black transition transform active:scale-95 flex items-center"
          >
              <FileText size={18} className="mr-2" /> GỬI BÁO CÁO TUẦN
          </button>
      </div>
    </div>
  );
};

export default CompanyReports;


import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Bell, FileSpreadsheet, BarChart3, Library, Clock, Plus, Trash2, 
  Upload, FileText, ChevronRight, Download, ArrowLeft, Package, 
  Ship, Truck, LayoutDashboard, FolderPlus, Folder, File, MoreVertical, 
  ShieldAlert, TrendingUp, UserPlus, UserMinus, MessageSquare, 
  AlertTriangle, HelpCircle, Save, Edit, Printer, Mail, Phone, MapPin,
  Pin, PinOff, Calendar, AlertCircle, Info, CheckCircle, Search, Filter,
  Briefcase, DollarSign, Send
} from 'lucide-react';

interface CompanyPageProps {
  onClose: () => void;
}

type ViewType = 'dashboard' | 'notifications' | 'quotation' | 'tracking' | 'reports' | 'library';

interface Customer {
  id: number;
  companyName: string;
  shipmentInfo: string;
  contact: string;
  status: string;
  classification: 'Check giá' | 'Tiềm năng';
  week: number; // 1, 2, 3, 4
  month: number;
  year: number;
}

interface ExistingCustomer {
  id: number;
  week: number; // 1, 2, 3, 4
  month: number;
  year: number;
  companyName: string;
  profit: number;
  com: number;
  status: 'Đang lấy Booking' | 'Đang vận chuyển' | 'Hoàn thành';
}

interface QuoteRow {
  id: number;
  cost: string;
  unit: string;
  qty: number;
  price: number;
  vat: number;
  currency: string;
}

interface QuotationData {
  region: 'Hồ Chí Minh' | 'Hải Phòng';
  pickup: string;
  aod: string;
  term: string;
  weight: string;
  volume: string;
  unit: string;
  commodity: string;
  note: string;
  salerName: string;
  salerPhone: string;
  salerEmail: string;
}

interface SystemNotification {
  id: number;
  date: string;
  title: string;
  content: string;
  attachment?: string;
  expiryDate: string;
  isPinned: boolean;
  image: string;
}

interface Shipment {
  id: number;
  code: string;
  commodity: string;
  pickupAddress: string;
  volume: string;
  currentStep: number; // 0: Lấy hàng, 1: Hải quan, 2: Load tàu, 3: Về kho
  customsFlow: 'green' | 'yellow' | 'red';
  customsStatus: string;
  vesselName: string;
  etd: string;
  eta: string;
  truckingCo: string;
  contCount: string;
  warehouseAddr: string;
  type: 'import' | 'export';
}

const PORTS_HCM = [
  'Cảng Cát Lái (HCM)',
  'Cảng Hiệp Phước (HCM)',
  'Cảng VICT (HCM)',
  'Tân Cảng Phú Hữu (HCM)',
  'ICD Phước Long (HCM)',
  'Sân bay Tân Sơn Nhất (SGN)'
];

const PORTS_HP = [
  'Cảng Tân Vũ (Hải Phòng)',
  'Cảng Chùa Vẽ (Hải Phòng)',
  'Cảng Đình Vũ (Hải Phòng)',
  'Cảng Nam Hải Đình Vũ (Hải Phòng)',
  'Cảng Lạch Huyện (TC-HICT)',
  'Sân bay Cát Bi (HPH)'
];

const CompanyPage: React.FC<CompanyPageProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [quoteType, setQuoteType] = useState<'import' | 'export'>('import');

  // --- SHIPMENTS STATE ---
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: 1,
      code: 'LH-SHPT-2024001',
      commodity: 'Linh kiện điện tử',
      pickupAddress: 'KCN Amata, Biên Hòa, Đồng Nai',
      volume: '15 CBM / 2500 KGS',
      currentStep: 2,
      customsFlow: 'green',
      customsStatus: 'Đã thông quan',
      vesselName: 'ONE FREEDOM / V.2405',
      etd: '20/05/2024',
      eta: '25/05/2024',
      truckingCo: 'Vận tải Long Hoàng',
      contCount: '1x40HC',
      warehouseAddr: 'Kho Cát Lái, Quận 2, HCM',
      type: 'export'
    },
    {
      id: 2,
      code: 'LH-SHPT-2024002',
      commodity: 'Vải dệt may',
      pickupAddress: 'Cảng Shanghai, Trung Quốc',
      volume: '10 CBM / 1200 KGS',
      currentStep: 1,
      customsFlow: 'yellow',
      customsStatus: 'Đang đợi kiểm hóa',
      vesselName: 'EVER GLIVEN / V.099',
      etd: '18/05/2024',
      eta: '24/05/2024',
      truckingCo: 'Logistics Team A',
      contCount: '2x20GP',
      warehouseAddr: 'Kho ICD Sóng Thần, Bình Dương',
      type: 'import'
    }
  ]);

  const [editingShipmentId, setEditingShipmentId] = useState<number | null>(null);

  const handleUpdateShipment = (id: number, field: keyof Shipment, value: any) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addShipment = () => {
    const newShip: Shipment = {
      id: Date.now(),
      code: `LH-SHPT-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
      commodity: '',
      pickupAddress: '',
      volume: '',
      currentStep: 0,
      customsFlow: 'green',
      customsStatus: '',
      vesselName: '',
      etd: '',
      eta: '',
      truckingCo: '',
      contCount: '',
      warehouseAddr: '',
      type: quoteType
    };
    setShipments([newShip, ...shipments]);
    setEditingShipmentId(newShip.id);
  };

  const deleteShipment = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa lô hàng này khỏi danh sách theo dõi?')) {
      setShipments(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- NOTIFICATIONS STATE ---
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 1,
      date: '20/05/2024',
      title: 'Cập nhật phụ phí nhiên liệu tháng 06/2024',
      content: 'Thông báo về việc điều chỉnh phụ phí nhiên liệu (BAF) cho các tuyến vận tải biển quốc tế áp dụng từ ngày 01/06.',
      attachment: 'BAF_Update_June.pdf',
      expiryDate: '2025-06-30',
      isPinned: true,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      date: '15/05/2024',
      title: 'Lịch nghỉ lễ Quốc khánh 2/9',
      content: 'Thông báo lịch trực và vận hành kho bãi trong kỳ nghỉ lễ sắp tới để quý đối tác chủ động kế hoạch.',
      attachment: 'Holiday_Schedule.pdf',
      expiryDate: '2024-09-05',
      isPinned: false,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      date: '10/01/2024',
      title: 'Thông báo hết hạn chương trình khuyến mãi Tết',
      content: 'Chương trình tri ân khách hàng nhân dịp Tết Giáp Thìn đã chính thức khép lại. Cảm ơn quý khách đã đồng hành.',
      expiryDate: '2024-02-15',
      isPinned: false,
      image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const togglePin = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const deleteNotification = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const editNotification = (id: number) => {
    const n = notifications.find(notif => notif.id === id);
    const newTitle = prompt('Nhập tiêu đề mới:', n?.title);
    if (newTitle) {
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, title: newTitle } : notif));
    }
  };

  const addNotification = () => {
    const title = prompt('Nhập tiêu đề thông báo:');
    if (title) {
      const newNotif: SystemNotification = {
        id: Date.now(),
        date: new Date().toLocaleDateString('vi-VN'),
        title: title,
        content: 'Nội dung thông báo mới vừa được tạo.',
        expiryDate: '2024-12-31',
        isPinned: false,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  // --- SUB-COMPONENTS FOR DIFFERENT VIEWS ---

  const NotificationView = () => {
    const sortedNotifications = [...notifications].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });

    return (
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Thông báo hệ thống</h3>
            <p className="text-sm text-gray-500 font-medium">Cập nhật tin tức nội bộ và thông tin vận hành quan trọng</p>
          </div>
          <button 
            onClick={addNotification}
            className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-orange-100 transition-all transform active:scale-95"
          >
            <Plus size={18} className="mr-2" /> Tạo thông báo mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedNotifications.map((notif) => {
            const isExpired = new Date(notif.expiryDate) < new Date();
            
            return (
              <div 
                key={notif.id}
                className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpired ? 'filter grayscale opacity-75' : ''}`}
              >
                {/* Header Image */}
                <div className="h-48 overflow-hidden relative">
                  <img src={notif.image} alt={notif.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {notif.isPinned && (
                      <div className="bg-primary text-white p-2 rounded-lg shadow-lg">
                        <Pin size={14} fill="white" />
                      </div>
                    )}
                    {isExpired && (
                      <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
                        <AlertCircle size={10} className="mr-1" /> Hết hiệu lực
                      </div>
                    )}
                  </div>

                  {/* Date Overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest opacity-80">
                      <Calendar size={12} className="mr-1" /> {notif.date}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                      {notif.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {notif.content}
                    </p>
                  </div>

                  {notif.attachment && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all group/file">
                      <FileText size={16} className="text-gray-400 group-hover/file:text-primary" />
                      <span className="text-xs font-bold text-gray-600 group-hover/file:text-primary transition-colors">{notif.attachment}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-gray-400 uppercase">
                    <span>Hiệu lực đến: {new Date(notif.expiryDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => togglePin(notif.id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-primary transition-colors"
                    title={notif.isPinned ? "Bỏ ghim" : "Ghim thông báo"}
                  >
                    {notif.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button 
                    onClick={() => editNotification(notif.id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-blue-500 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const QuotationView = () => {
    const [rows, setRows] = useState<QuoteRow[]>([{ id: 1, cost: '', unit: 'Lô', qty: 1, price: 0, vat: 10, currency: 'USD' }]);
    const [units, setUnits] = useState(['Lô', 'Bill', 'Bộ', 'Cont', 'CBM', 'Kgs', 'Chuyến']);
    const [currencies, setCurrencies] = useState(['USD', 'VND', 'EUR']);
    const [showPDF, setShowPDF] = useState(false);
    
    const [quoteData, setQuoteData] = useState<QuotationData>({
      region: 'Hồ Chí Minh',
      pickup: '',
      aod: '',
      term: 'FOB',
      weight: '',
      volume: '',
      unit: 'CBM',
      commodity: '',
      note: '',
      salerName: '',
      salerPhone: '',
      salerEmail: ''
    });

    const vats = [0, 5, 8, 10];
    
    const addRow = () => setRows([...rows, { id: Date.now(), cost: '', unit: units[0], qty: 1, price: 0, vat: 10, currency: currencies[0] }]);
    const removeRow = (id: number) => setRows(rows.filter(r => r.id !== id));
    
    const updateRow = (id: number, field: keyof QuoteRow, value: any) => {
      setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleAddUnit = () => {
      const newUnit = prompt('Nhập đơn vị mới:');
      if (newUnit && !units.includes(newUnit)) {
        setUnits([...units, newUnit]);
      }
    };

    const handleAddCurrency = () => {
      const newCurrency = prompt('Nhập loại tiền tệ mới:');
      if (newCurrency && !currencies.includes(newCurrency)) {
        setCurrencies([...currencies, newCurrency.toUpperCase()]);
      }
    };

    const getRowTotalRaw = (row: QuoteRow) => {
      const amount = row.qty * row.price;
      const vatAmount = amount * (row.vat / 100);
      return amount + vatAmount;
    };

    const calculateRowTotal = (row: QuoteRow) => {
      return getRowTotalRaw(row).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const PDFPreview = () => (
      <div 
        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 sm:p-12 overflow-y-auto cursor-pointer"
        onClick={() => setShowPDF(false)}
      >
        <div 
          className="bg-white w-full max-w-[840px] shadow-[0_0_50px_rgba(0,0,0,0.3)] relative flex flex-col print:shadow-none animate-in fade-in zoom-in duration-300 cursor-default"
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          {/* Close & Print Buttons Overlay */}
          <div className="absolute top-0 -right-16 flex flex-col space-y-4 print:hidden">
            <button 
              onClick={() => window.print()}
              className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition active:scale-95"
            >
              <Printer size={24} />
            </button>
            <button 
              onClick={() => setShowPDF(false)}
              className="bg-white text-gray-400 p-4 rounded-full shadow-2xl hover:text-red-500 transition active:scale-95"
            >
              <X size={24} />
            </button>
          </div>

          {/* Letterhead Header Image - Frame with margin */}
          <div className="w-full px-12 pt-12 mb-4">
            <img 
              src="https://i.ibb.co/Kx32Z01D/LH-VIETNAMESE.jpg" 
              alt="Long Hoang Logistics Letterhead" 
              className="w-full h-auto block"
            />
          </div>

          {/* PDF Main Content Area */}
          <div className="px-16 pb-16 flex-1 text-gray-800 text-[14px]">
            {/* Title */}
            <div className="text-center mb-10">
              <h2 className="text-[32px] font-black text-gray-900 uppercase tracking-[0.05em]">BẢNG BÁO GIÁ DỊCH VỤ LOGISTICS</h2>
              <p className="text-[12px] text-gray-400 mt-2 font-bold font-sans">Mã báo giá: LH-QT-20267375 | Ngày: 10/1/2026</p>
            </div>

            {/* Reorganized Info Grid */}
            <div className="grid grid-cols-2 gap-x-12 mb-12 items-start">
              {/* Left Column: Pickup & Term */}
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">PICKUP (NƠI NHẬN):</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.pickup || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">SHIPPING TERM:</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.term || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">AOD (CẢNG ĐÍCH):</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.aod || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">COMMODITY:</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.commodity || '—'}</span>
                </div>
              </div>

              {/* Right Column: Other Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">TRỌNG LƯỢNG (KGS):</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.weight || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">THỂ TÍCH (CBM):</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.volume || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">ĐƠN VỊ VẬN CHUYỂN:</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.unit || '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">KHU VỰC:</span>
                  <span className="text-[14px] font-bold text-gray-900 ml-4">{quoteData.region}</span>
                </div>
              </div>
            </div>

            {/* Costs Table - Colored Orange */}
            <table className="w-full mb-10 border-collapse">
              <thead>
                <tr className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-3 text-center w-12 border border-primary">STT</th>
                  <th className="p-3 text-left border border-primary">CHI TIẾT DỊCH VỤ</th>
                  <th className="p-3 text-center w-20 border border-primary">ĐVT</th>
                  <th className="p-3 text-center w-16 border border-primary">SL</th>
                  <th className="p-3 text-right w-32 border border-primary">ĐƠN GIÁ</th>
                  <th className="p-3 text-center w-16 border border-primary">VAT</th>
                  <th className="p-3 text-right w-40 border border-primary">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody className="text-[15px]">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50/10'}>
                    <td className="p-3 text-center border border-gray-100 text-gray-400">{idx + 1}</td>
                    <td className="p-3 font-bold border border-gray-100">{row.cost || 'Hạng mục chi phí'}</td>
                    <td className="p-3 text-center border border-gray-100 uppercase">{row.unit}</td>
                    <td className="p-3 text-center border border-gray-100">{row.qty}</td>
                    <td className="p-3 text-right border border-gray-100">{row.price.toLocaleString()}</td>
                    <td className="p-3 text-center border border-gray-100">{row.vat}%</td>
                    <td className="p-3 text-right font-black border border-gray-100">
                      {calculateRowTotal(row)} <span className="text-[11px] ml-1 text-gray-400">{row.currency}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-primary">
                <tr>
                  <td colSpan={6} className="p-5 text-right font-bold uppercase text-gray-400 text-[11px] tracking-[0.15em]">TỔNG CỘNG DỰ KIẾN:</td>
                  <td className="p-5 text-right font-black text-[22px] text-primary">
                    {rows.reduce((acc, row) => acc + getRowTotalRaw(row), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="text-[13px] ml-2 text-primary/70">{rows[0]?.currency}</span>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Note & Terms - Note is now ABOVE Terms */}
            <div className="mb-12">
              <div className="mb-6">
                <h4 className="text-[13px] font-black uppercase tracking-widest text-gray-900 mb-2 border-l-4 border-primary pl-4">GHI CHÚ:</h4>
                <div className="bg-gray-50/50 p-4 rounded text-[13px] leading-relaxed text-gray-600 italic border border-gray-100">
                  {quoteData.note || 'Không có ghi chú thêm.'}
                </div>
              </div>
              
              <div>
                <h4 className="text-[13px] font-black uppercase tracking-widest text-gray-900 mb-2 border-l-4 border-primary pl-4">ĐIỀU KHOẢN:</h4>
                <div className="bg-gray-50/50 p-4 rounded text-[13px] leading-relaxed text-gray-600 border border-gray-100">
                  Báo giá có hiệu lực trong vòng 15 ngày kể từ ngày phát hành. Chưa bao gồm thuế VAT (nếu không được chỉ định). Vui lòng xác nhận trước khi booking.
                </div>
              </div>
            </div>

            {/* Signature Area Simplified - Pushed to right */}
            <div className="flex justify-end pt-10">
              <div className="w-1/2 text-right space-y-2">
                <p className="font-black uppercase text-[12px] tracking-[0.2em] mb-4 text-gray-900">NGƯỜI LẬP BÁO GIÁ</p>
                <div className="space-y-1 text-gray-700 font-bold">
                   <p className="text-[17px] text-gray-900">{quoteData.salerName || 'Administrator'}</p>
                   {quoteData.salerPhone && <p className="text-[14px] flex items-center justify-end font-sans"><Phone size={13} className="mr-2 text-primary" /> {quoteData.salerPhone}</p>}
                   {quoteData.salerEmail && <p className="text-[14px] flex items-center justify-end font-sans lowercase"><Mail size={13} className="mr-2 text-primary" /> {quoteData.salerEmail}</p>}
                </div>
                <div className="pt-4 opacity-40 italic text-[11px] text-gray-400">(Long Hoang Logistics Team)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const aodList = quoteData.region === 'Hồ Chí Minh' ? PORTS_HCM : PORTS_HP;

    return (
      <div className="space-y-8">
        {showPDF && <PDFPreview />}
        
        <div className="flex justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setQuoteType('import')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'import' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Nhập
            </button>
            <button 
              onClick={() => setQuoteType('export')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'export' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Xuất
            </button>
          </div>
          <button 
            onClick={() => setShowPDF(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 transition"
          >
            <Download size={16} className="mr-2" /> Xuất File PDF
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Khu vực</label>
              <select 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm font-bold"
                value={quoteData.region}
                onChange={(e) => setQuoteData({...quoteData, region: e.target.value as any, aod: ''})}
              >
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Hải Phòng">Hải Phòng</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Pickup</label>
              <input 
                type="text" 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                placeholder="Địa điểm đóng hàng" 
                value={quoteData.pickup}
                onChange={(e) => setQuoteData({...quoteData, pickup: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">AOD (Cảng đích)</label>
              <select 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                value={quoteData.aod}
                onChange={(e) => setQuoteData({...quoteData, aod: e.target.value})}
              >
                <option value="">Chọn cảng đích...</option>
                {aodList.map(port => <option key={port} value={port}>{port}</option>)}
                <option value="Other">Khác...</option>
              </select>
              {quoteData.aod === 'Other' && (
                <input 
                  type="text" 
                  className="w-full border-b border-gray-200 py-1 focus:border-primary outline-none transition text-sm mt-1" 
                  placeholder="Nhập tên cảng khác"
                  onChange={(e) => setQuoteData({...quoteData, aod: e.target.value})}
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Term</label>
              <select 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                value={quoteData.term}
                onChange={(e) => setQuoteData({...quoteData, term: e.target.value})}
              >
                <option>EXW</option><option>FOB</option><option>CIF</option><option>DDU</option><option>DDP</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Gross Weight (KGS)</label>
              <input 
                type="number" 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                placeholder="0.00" 
                value={quoteData.weight}
                onChange={(e) => setQuoteData({...quoteData, weight: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Volume</label>
              <input 
                type="number" 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                placeholder="0.00" 
                value={quoteData.volume}
                onChange={(e) => setQuoteData({...quoteData, volume: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Đơn vị</label>
              <select 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                value={quoteData.unit}
                onChange={(e) => setQuoteData({...quoteData, unit: e.target.value})}
              >
                <option>CBM</option>
                <option>KGS</option>
                <option>Cont 20GP</option>
                <option>Cont 40GP</option>
                <option>Cont 40HQ</option>
                <option>Cont 45DC</option>
                <option>Pallet</option>
                <option>Carton</option>
                <option>Package</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Commodity</label>
              <input 
                type="text" 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                placeholder="Tên hàng hóa" 
                value={quoteData.commodity}
                onChange={(e) => setQuoteData({...quoteData, commodity: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-8">
            <h4 className="font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">Bảng báo giá chi tiết</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500">
                  <tr>
                    <th className="p-3 border text-center w-12">STT</th>
                    <th className="p-3 border text-left">Các loại chi phí</th>
                    <th className="p-3 border text-left w-32">ĐVT</th>
                    <th className="p-3 border text-center w-20">Số lượng</th>
                    <th className="p-3 border text-right w-32">Đơn giá</th>
                    <th className="p-3 border text-center w-24">VAT (%)</th>
                    <th className="p-3 border text-center w-32">Tiền tệ</th>
                    <th className="p-3 border text-right w-32">Thành tiền</th>
                    <th className="p-3 border text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="p-2 border text-center text-gray-400 text-sm">{idx + 1}</td>
                      <td className="p-1 border">
                        <input 
                          type="text" 
                          className="w-full p-2 outline-none text-sm" 
                          placeholder="Local charge, Freight..." 
                          value={row.cost}
                          onChange={(e) => updateRow(row.id, 'cost', e.target.value)}
                        />
                      </td>
                      <td className="p-1 border">
                        <div className="flex items-center space-x-1">
                          <select 
                            className="w-full p-2 outline-none bg-transparent text-sm"
                            value={row.unit}
                            onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                          >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <button onClick={handleAddUnit} className="text-primary hover:bg-orange-50 p-1 rounded transition">
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-1 border">
                        <input 
                          type="number" 
                          className="w-full p-2 outline-none text-center text-sm" 
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border">
                        <input 
                          type="number" 
                          className="w-full p-2 outline-none text-right text-sm" 
                          placeholder="0"
                          value={row.price}
                          onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border">
                        <div className="flex flex-col">
                          <select 
                            className="w-full p-1 text-sm outline-none bg-transparent"
                            value={vats.includes(row.vat) ? row.vat : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== 'custom') updateRow(row.id, 'vat', parseInt(val));
                            }}
                          >
                            {vats.map(v => <option key={v} value={v}>{v}%</option>)}
                            <option value="custom">Khác...</option>
                          </select>
                          {(!vats.includes(row.vat) || row.vat === undefined) && (
                            <input 
                              type="number" 
                              className="w-full p-1 text-sm outline-none border-t border-gray-100" 
                              placeholder="%"
                              value={row.vat}
                              onChange={(e) => updateRow(row.id, 'vat', parseFloat(e.target.value) || 0)}
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-1 border">
                        <div className="flex items-center space-x-1">
                          <select 
                            className="w-full p-2 outline-none bg-transparent text-sm"
                            value={row.currency}
                            onChange={(e) => updateRow(row.id, 'currency', e.target.value)}
                          >
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button onClick={handleAddCurrency} className="text-primary hover:bg-orange-50 p-1 rounded transition">
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2 border text-right font-bold text-gray-700 text-sm">
                        {calculateRowTotal(row)}
                      </td>
                      <td className="p-2 border text-center">
                        <button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addRow} className="mt-4 text-primary text-sm font-bold flex items-center hover:underline">
                <Plus size={16} className="mr-1" /> Thêm dòng chi phí
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Note (Ghi chú)</label>
                <textarea 
                  className="w-full border border-gray-200 rounded p-3 text-sm focus:border-primary outline-none h-24" 
                  placeholder="Điều kiện báo giá, thời gian hiệu lực..."
                  value={quoteData.note}
                  onChange={(e) => setQuoteData({...quoteData, note: e.target.value})}
                ></textarea>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h5 className="font-bold text-sm text-gray-600 uppercase mb-2">Thông tin liên hệ Sale</h5>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" 
                  placeholder="Tên Saler" 
                  value={quoteData.salerName}
                  onChange={(e) => setQuoteData({...quoteData, salerName: e.target.value})}
                />
                <input 
                  type="text" 
                  className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" 
                  placeholder="Số điện thoại" 
                  value={quoteData.salerPhone}
                  onChange={(e) => setQuoteData({...quoteData, salerPhone: e.target.value})}
                />
                <input 
                  type="email" 
                  className="bg-white border border-gray-200 rounded p-2 text-sm outline-none col-span-2" 
                  placeholder="Email liên hệ" 
                  value={quoteData.salerEmail}
                  onChange={(e) => setQuoteData({...quoteData, salerEmail: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TrackingView = () => {
    const filteredShipments = shipments.filter(s => s.type === quoteType);

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setQuoteType('import')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'import' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Nhập
            </button>
            <button 
              onClick={() => setQuoteType('export')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'export' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Xuất
            </button>
          </div>
          <button 
            onClick={addShipment}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-orange-100 hover:bg-primaryDark transition active:scale-95"
          >
            <Plus size={18} className="mr-2" /> Thêm lô hàng theo dõi
          </button>
        </div>

        <div className="space-y-12">
          {filteredShipments.map(shipment => (
            <div key={shipment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Bar */}
              <div className="bg-gray-50/80 p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-widest leading-none mb-1">Mã vận đơn</span>
                    {editingShipmentId === shipment.id ? (
                      <input 
                        className="font-bold text-gray-800 border-b border-primary/50 outline-none bg-transparent"
                        value={shipment.code}
                        onChange={(e) => handleUpdateShipment(shipment.id, 'code', e.target.value)}
                      />
                    ) : (
                      <span className="font-black text-gray-800 tracking-tight">{shipment.code}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-widest leading-none mb-1">Mô tả hàng hóa</span>
                    <span className="text-xs font-bold text-gray-600 italic">"{shipment.commodity || 'Chưa cập nhật'}"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingShipmentId === shipment.id ? (
                      <button onClick={() => setEditingShipmentId(null)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition"><Save size={16} /></button>
                    ) : (
                      <button onClick={() => setEditingShipmentId(shipment.id)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 rounded-lg shadow-sm transition"><Edit size={16} /></button>
                    )}
                    <button onClick={() => deleteShipment(shipment.id)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-lg shadow-sm transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Editable Fields Grid (Visible only in edit mode) */}
              {editingShipmentId === shipment.id && (
                <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hàng hóa & Thể tích</label>
                    <input 
                      type="text" 
                      placeholder="Tên hàng, số kiện, CBM..." 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                      value={shipment.commodity}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'commodity', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Volume / Gross Weight" 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white mt-1"
                      value={shipment.volume}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'volume', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pickup & Warehouse</label>
                    <input 
                      type="text" 
                      placeholder="Địa chỉ lấy hàng" 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                      value={shipment.pickupAddress}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'pickupAddress', e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Địa chỉ kho đích" 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white mt-1"
                      value={shipment.warehouseAddr}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'warehouseAddr', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tàu / Chuyến / Xe</label>
                    <input 
                      type="text" 
                      placeholder="Tên tàu / Vận chuyển" 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 focus:border-primary outline-none bg-white"
                      value={shipment.vesselName}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'vesselName', e.target.value)}
                    />
                    <div className="flex gap-2 mt-1">
                      <input type="text" placeholder="ETD" className="w-1/2 text-xs p-2 rounded-lg border border-gray-200" value={shipment.etd} onChange={(e) => handleUpdateShipment(shipment.id, 'etd', e.target.value)} />
                      <input type="text" placeholder="ETA" className="w-1/2 text-xs p-2 rounded-lg border border-gray-100" value={shipment.eta} onChange={(e) => handleUpdateShipment(shipment.id, 'eta', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Luồng Hải Quan & Tiến độ</label>
                    <select 
                      className={`w-full text-sm p-2 rounded-lg border font-bold ${shipment.customsFlow === 'green' ? 'bg-green-50 border-green-200 text-green-700' : shipment.customsFlow === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                      value={shipment.customsFlow}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'customsFlow', e.target.value as any)}
                    >
                      <option value="green">Luồng Xanh (Green)</option>
                      <option value="yellow">Luồng Vàng (Yellow)</option>
                      <option value="red">Luồng Đỏ (Red)</option>
                    </select>
                    <select 
                      className="w-full text-sm p-2 rounded-lg border border-gray-200 mt-1 font-bold"
                      value={shipment.currentStep}
                      onChange={(e) => handleUpdateShipment(shipment.id, 'currentStep', parseInt(e.target.value))}
                    >
                      <option value={0}>Bước 1: Lấy hàng</option>
                      <option value={1}>Bước 2: Hải quan</option>
                      <option value={2}>Bước 3: Load tàu/chuyến</option>
                      <option value={3}>Bước 4: Về kho/Giao hàng</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Progress Visualization */}
              <div className="p-8 lg:p-12">
                <div className="relative mb-12">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                    style={{ width: `${(shipment.currentStep / 3) * 100}%` }}
                  ></div>

                  <div className="flex justify-between relative z-10">
                    {[
                      { label: 'Lấy hàng', icon: Package, key: 'pickup' },
                      { label: 'Hải quan', icon: ShieldAlert, key: 'customs' },
                      { label: 'Load tàu', icon: Ship, key: 'loading' },
                      { label: 'Về kho', icon: Truck, key: 'warehouse' }
                    ].map((step, idx) => {
                      const isActive = idx <= shipment.currentStep;
                      const isCurrent = idx === shipment.currentStep;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-500 shadow-sm ${isActive ? 'bg-primary border-orange-200 text-white scale-110' : 'bg-white border-gray-100 text-gray-300'}`}>
                            {isActive && isCurrent ? <div className="animate-ping absolute w-10 h-10 bg-primary/30 rounded-full"></div> : null}
                            <step.icon size={22} className="relative z-10" />
                          </div>
                          <div className="mt-6 text-center max-w-[120px]">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step.label}</p>
                            
                            {/* Step specific info bubbles */}
                            {isActive && (
                              <div className="mt-2 animate-in fade-in zoom-in duration-300">
                                {step.key === 'pickup' && (
                                  <p className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 line-clamp-2">{shipment.pickupAddress || 'Chưa rõ địa chỉ'}</p>
                                )}
                                {step.key === 'customs' && (
                                  <div className={`flex items-center justify-center space-x-1 px-2 py-1 rounded border text-[9px] font-black uppercase ${shipment.customsFlow === 'green' ? 'bg-green-50 border-green-200 text-green-600' : shipment.customsFlow === 'yellow' ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${shipment.customsFlow === 'green' ? 'bg-green-500' : shipment.customsFlow === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                    <span>{shipment.customsFlow === 'green' ? 'Thông quan' : shipment.customsFlow === 'yellow' ? 'Chuyển kiểm' : 'Luồng đỏ'}</span>
                                  </div>
                                )}
                                {step.key === 'loading' && (
                                  <div className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 leading-tight">
                                    <span className="block text-primaryDark">{shipment.vesselName || 'Tàu/Xe'}</span>
                                    <span>{shipment.etd ? `ETD: ${shipment.etd}` : 'Chờ ngày đi'}</span>
                                  </div>
                                )}
                                {step.key === 'warehouse' && (
                                  <p className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Đã nhận kho</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Status Details (Non-edit mode details) */}
                {editingShipmentId !== shipment.id && (
                  <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <MapPin size={12} className="text-primary" />
                        <span>Hành trình lô hàng</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-700">Điểm lấy: <span className="font-medium text-gray-500">{shipment.pickupAddress || '—'}</span></p>
                        <p className="text-xs font-bold text-gray-700">Điểm giao: <span className="font-medium text-gray-500">{shipment.warehouseAddr || '—'}</span></p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Search size={12} className="text-primary" />
                        <span>Trạng thái Hải quan</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${shipment.customsFlow === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : shipment.customsFlow === 'yellow' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                        <div>
                          <p className="text-xs font-bold text-gray-700 uppercase">{shipment.customsFlow === 'green' ? 'Luồng Xanh' : shipment.customsFlow === 'yellow' ? 'Luồng Vàng' : 'Luồng Đỏ'}</p>
                          <p className="text-[11px] text-gray-500 italic mt-0.5">"{shipment.customsStatus || 'Đang xử lý hồ sơ'}"</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={12} className="text-primary" />
                        <span>Dự kiến giao hàng</span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                         <span className="text-xl font-black text-gray-800 tracking-tight">{shipment.eta || '--/--'}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Ngày cập nhật</span>
                      </div>
                      <p className="text-[10px] font-medium text-gray-400">Vận tải: {shipment.truckingCo || 'Chưa chỉ định nhà xe'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredShipments.length === 0 && (
            <div className="bg-white py-20 rounded-2xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
               <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                  <Search size={48} />
               </div>
               <h4 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Không có lô hàng nào</h4>
               <p className="text-sm text-gray-400 mt-1">Vui lòng thêm mã lô hàng để bắt đầu theo dõi tiến trình.</p>
               <button onClick={addShipment} className="mt-6 text-primary font-bold text-sm uppercase hover:underline">Thêm lô hàng ngay</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    // Current Date Context
    const today = new Date();
    
    // Filter State
    const [reportFilter, setReportFilter] = useState({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        week: 'All' as 'All' | number
    });

    // --- NEW CUSTOMERS STATE ---
    const [customers, setCustomers] = useState<Customer[]>([
      { id: 1, companyName: 'Công ty ABC Việt Nam', shipmentInfo: '3x20GP HCM-BKK', contact: 'Mr. Long - 090xxx', status: 'Đang báo giá', classification: 'Check giá', week: 2, month: 5, year: 2024 },
      { id: 2, companyName: 'Logistics Global Ltd', shipmentInfo: '1.2 tons AIR SGN-FRA', contact: 'Ms. Hoa - hoa@global.com', status: 'Đã chốt', classification: 'Tiềm năng', week: 3, month: 5, year: 2024 },
      { id: 3, companyName: 'Minh Long Corp', shipmentInfo: 'LCL 2 CBM to US', contact: 'Mr. Binh', status: 'Follow', classification: 'Check giá', week: 4, month: 4, year: 2024 },
    ]);
    
    // --- EXISTING/CURRENT CUSTOMERS STATE ---
    const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([
        { id: 1, week: 1, month: 5, year: 2024, companyName: 'KH Thân thiết A', profit: 500, com: 50, status: 'Hoàn thành' },
        { id: 2, week: 2, month: 5, year: 2024, companyName: 'Đối tác B', profit: 1200, com: 100, status: 'Đang vận chuyển' },
        { id: 3, week: 2, month: 5, year: 2024, companyName: 'Công ty C', profit: 800, com: 0, status: 'Đang lấy Booking' },
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

    // Helper functions
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
        week: reportFilter.week !== 'All' ? Number(reportFilter.week) : 1,
        month: reportFilter.month,
        year: reportFilter.year
      };
      setCustomers([...customers, newCust]);
      setEditingId(newCust.id);
    };

    const addExistingCustomer = () => {
        const newCust: ExistingCustomer = {
            id: Date.now(),
            week: reportFilter.week !== 'All' ? Number(reportFilter.week) : 1,
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

    // Filter Logic
    const filterData = <T extends { week: number; month: number; year: number }>(data: T[]) => {
        return data.filter(item => {
            const matchYear = item.year === reportFilter.year;
            const matchMonth = item.month === reportFilter.month;
            const matchWeek = reportFilter.week === 'All' || item.week === Number(reportFilter.week);
            return matchYear && matchMonth && matchWeek;
        });
    };

    const filteredCustomers = filterData(customers);
    const filteredExistingCustomers = filterData(existingCustomers);

    // Stats Calculation
    const stats = useMemo(() => {
        // Booking in week (count of current customers matching filter)
        const bookingCount = filteredExistingCustomers.length;
        
        // Profit in week (sum of profit matching filter)
        const profitSum = filteredExistingCustomers.reduce((sum, c) => sum + c.profit, 0);
        
        // Shipments in progress (count of status 'Đang vận chuyển' in the selected month, ignoring week filter usually, but let's follow filter for consistency or all active)
        // Let's count "In Transit" for the whole month for better context
        const shippingCount = existingCustomers.filter(c => 
            c.month === reportFilter.month && 
            c.year === reportFilter.year && 
            c.status === 'Đang vận chuyển'
        ).length;

        // Monthly Revenue (Sum of Profit for the WHOLE month, ignoring week filter)
        const monthlyRevenue = existingCustomers
            .filter(c => c.month === reportFilter.month && c.year === reportFilter.year)
            .reduce((sum, c) => sum + c.profit, 0);

        return { bookingCount, profitSum, shippingCount, monthlyRevenue };
    }, [existingCustomers, filteredExistingCustomers, reportFilter]);

    const handleSendReport = () => {
        alert("Báo cáo tuần đã được gửi thành công và lưu vào hồ sơ nhân viên: Nguyễn Văn Long");
        setShowReportPreview(false);
    };

    const WeeklyReportPreview = () => (
      <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto cursor-pointer" onClick={() => setShowReportPreview(false)}>
         <div 
            className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col print:shadow-none animate-in fade-in zoom-in duration-300 cursor-default p-12 text-gray-900"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
         >
            {/* Report Header */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-gray-900 pb-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider">BÁO CÁO CÔNG VIỆC</h1>
                    <p className="text-sm font-bold mt-1 uppercase">Tháng {reportFilter.month}/{reportFilter.year} {reportFilter.week !== 'All' ? `- Tuần ${reportFilter.week}` : ''}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">Người báo cáo: Nguyễn Văn Long</p>
                    <p className="text-sm">Ngày báo cáo: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>
            </div>

            {/* Existing Customers Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-3">1. Khách hàng hiện tại</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 w-10 text-center">STT</th>
                            <th className="border border-gray-300 p-2 w-28 text-center">Tuần</th>
                            <th className="border border-gray-300 p-2">Khách hàng</th>
                            <th className="border border-gray-300 p-2 text-right">Profit ($)</th>
                            <th className="border border-gray-300 p-2 text-right">COM ($)</th>
                            <th className="border border-gray-300 p-2 text-center">Tình trạng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExistingCustomers.length > 0 ? filteredExistingCustomers.map((c, i) => (
                            <tr key={i}>
                                <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                                <td className="border border-gray-300 p-2 text-center">W{c.week}/T{c.month}/{c.year.toString().slice(-2)}</td>
                                <td className="border border-gray-300 p-2 font-bold">{c.companyName}</td>
                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.profit)}</td>
                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(c.com)}</td>
                                <td className="border border-gray-300 p-2 text-center">{c.status}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="border border-gray-300 p-2 text-center italic">Không có dữ liệu</td></tr>
                        )}
                        {/* Summary Row */}
                        {filteredExistingCustomers.length > 0 && (
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan={3} className="border border-gray-300 p-2 text-right uppercase">Tổng cộng:</td>
                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(filteredExistingCustomers.reduce((s,c) => s+c.profit, 0))}</td>
                                <td className="border border-gray-300 p-2 text-right">{formatCurrency(filteredExistingCustomers.reduce((s,c) => s+c.com, 0))}</td>
                                <td className="border border-gray-300 p-2"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Customers Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold uppercase mb-4 border-l-4 border-black pl-3">2. Khách hàng mới phát triển</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 w-10 text-center">STT</th>
                            <th className="border border-gray-300 p-2 w-28 text-center">Tuần</th>
                            <th className="border border-gray-300 p-2">Tên công ty</th>
                            <th className="border border-gray-300 p-2">Thông tin lô hàng</th>
                            <th className="border border-gray-300 p-2">Liên hệ</th>
                            <th className="border border-gray-300 p-2">Tình trạng</th>
                            <th className="border border-gray-300 p-2">Phân loại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? filteredCustomers.map((c, i) => (
                            <tr key={i}>
                                <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                                <td className="border border-gray-300 p-2 text-center">W{c.week}/T{c.month}/{c.year.toString().slice(-2)}</td>
                                <td className="border border-gray-300 p-2 font-bold">{c.companyName}</td>
                                <td className="border border-gray-300 p-2 whitespace-pre-wrap">{c.shipmentInfo}</td>
                                <td className="border border-gray-300 p-2">{c.contact}</td>
                                <td className="border border-gray-300 p-2">{c.status}</td>
                                <td className="border border-gray-300 p-2 text-center">{c.classification}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} className="border border-gray-300 p-2 text-center italic">Không có dữ liệu trong tuần này</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold uppercase mb-2 border-l-4 border-black pl-3">3. Khó khăn & Các bộ phận liên quan</h3>
                    <div className="border border-gray-300 p-4 min-h-[80px] text-sm whitespace-pre-wrap">{reportInputs.difficulties || 'Không có.'}</div>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase mb-2 border-l-4 border-black pl-3">4. Khách hàng bị mất</h3>
                    <div className="border border-gray-300 p-4 min-h-[80px] text-sm whitespace-pre-wrap">{reportInputs.lostCustomers || 'Không có.'}</div>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase mb-2 border-l-4 border-black pl-3">5. Phản ánh</h3>
                    <div className="border border-gray-300 p-4 min-h-[80px] text-sm whitespace-pre-wrap">{reportInputs.feedback || 'Không có.'}</div>
                </div>
                <div>
                    <h3 className="text-lg font-bold uppercase mb-2 border-l-4 border-black pl-3">6. Đề xuất</h3>
                    <div className="border border-gray-300 p-4 min-h-[80px] text-sm whitespace-pre-wrap">{reportInputs.suggestions || 'Không có.'}</div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-right">
                <p className="font-bold uppercase">Người lập báo cáo</p>
                <div className="h-20"></div>
                <p>Nguyễn Văn Long</p>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 print:hidden flex flex-col gap-2">
                <div className="flex gap-2">
                    <button 
                        onClick={() => window.print()} 
                        className="bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition flex items-center text-xs font-bold"
                    >
                        <Printer size={16} className="mr-2" /> In
                    </button>
                    <button 
                        onClick={() => setShowReportPreview(false)} 
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center text-xs font-bold"
                    >
                        <X size={16} className="mr-2" /> Đóng
                    </button>
                </div>
                <button 
                    onClick={handleSendReport}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm font-bold shadow-lg mt-2"
                >
                    <Send size={16} className="mr-2" /> Gửi báo cáo ngay
                </button>
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

        {/* Filter Controls */}
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
                </select>
            </div>
        </div>

        {/* --- EXISTING CUSTOMERS TABLE --- */}
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
                                {[1,2,3,4].map(w => <option key={w} value={w}>W{w}</option>)}
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

        {/* --- NEW CUSTOMERS TABLE --- */}
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
                            <select className="text-xs border rounded p-1" value={cust.week} onChange={(e) => updateCustomer(cust.id, 'week', Number(e.target.value))}>{[1,2,3,4].map(w => <option key={w} value={w}>Tuần {w}</option>)}</select>
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

  const LibraryView = () => {
    const [folders] = useState([
      { name: 'Hàng Nhập', files: ['Import_Checklist.pdf', 'Manifest_Template.xlsx'] },
      { name: 'Hàng Xuất', files: ['Export_Process.doc', 'SI_Template.pdf'] },
      { name: 'Hợp đồng & Biểu mẫu', files: ['Contract_2024.docx', 'Power_of_Attorney.pdf'] }
    ]);

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Thư viện mẫu chuẩn</h3>
          <div className="flex space-x-3">
             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition">
              <FolderPlus size={16} className="mr-2" /> Thêm thư mục
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-primaryDark transition">
              <Upload size={16} className="mr-2" /> Tải lên tài liệu
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Folder className="text-primary fill-primary/10" size={24} />
                  <span className="font-bold text-gray-800">{folder.name}</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {folder.files.map((file, fidx) => (
                  <div key={fidx} className="flex items-center justify-between p-2 hover:bg-orange-50 rounded group/file cursor-pointer transition">
                    <div className="flex items-center space-x-3">
                      <File className="text-gray-400 group-hover/file:text-primary transition-colors" size={16} />
                      <span className="text-sm text-gray-600 font-medium">{file}</span>
                    </div>
                    <Download size={14} className="text-gray-300 group-hover/file:text-primary opacity-0 group-hover/file:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'notifications': return <NotificationView />;
      case 'quotation': return <QuotationView />;
      case 'tracking': return <TrackingView />;
      case 'reports': return <ReportsView />;
      case 'library': return <LibraryView />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'notifications', title: 'Thông báo', icon: Bell, color: 'bg-blue-500', desc: 'Thông tin nội bộ và tin tức chung' },
            { id: 'quotation', title: 'Lập báo giá', icon: FileSpreadsheet, color: 'bg-green-500', desc: 'Báo giá hàng nhập/xuất chuyên nghiệp' },
            { id: 'tracking', title: 'Tiến độ', icon: Clock, color: 'bg-orange-500', desc: 'Theo dõi hành trình lô hàng thời gian thực' },
            { id: 'reports', title: 'Báo cáo', icon: BarChart3, color: 'bg-purple-500', desc: 'Thống kê sản lượng và doanh thu cá nhân' },
            { id: 'library', title: 'Thư viện mẫu', icon: Library, color: 'bg-gray-800', desc: 'Kho biểu mẫu và tài liệu chuẩn hóa' }
          ].map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveView(item.id as ViewType)}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              <div className="mt-6 flex items-center text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Truy cập <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#1e2a3b] text-white py-4 px-8 sticky top-0 z-40 shadow-lg border-b border-white/5 print:hidden">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="LH Logo" className="h-8 w-auto object-contain" />
              <span className="font-bold uppercase tracking-tighter text-sm">Long Hoang <span className="text-primary">Staff</span></span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 ml-6">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Bàn làm việc' },
                { id: 'quotation', icon: FileSpreadsheet, label: 'Báo giá' },
                { id: 'tracking', icon: Clock, label: 'Tiến độ' },
                { id: 'reports', icon: BarChart3, label: 'Báo cáo' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === item.id ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl print:py-0 print:px-0 print:max-w-none">
        {activeView !== 'dashboard' && (
          <button 
            onClick={() => setActiveView('dashboard')}
            className="mb-8 flex items-center text-gray-400 hover:text-primary transition font-bold text-xs uppercase tracking-widest group print:hidden"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại Bàn làm việc
          </button>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium print:hidden">
        Hệ thống Quản lý Nội bộ Long Hoang Logistics v3.2.0 • {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default CompanyPage;

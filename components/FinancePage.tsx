
import React, { useState } from 'react';
import { 
  X, FileText, RefreshCw, CreditCard, ClipboardEdit, 
  Upload, CheckCircle, Search, Printer, Download, 
  ArrowRight, Phone, MapPin, User, Building, Landmark,
  Calendar, FileCheck, ShieldCheck, Mail, Anchor, Plus, Edit, Trash2, Filter, FileSignature,
  AlertTriangle, Clock, Info, PenTool, ChevronDown, Save, Eye
} from 'lucide-react';
import { GUQRecord, UserAccount } from '../App';
import { API_BASE_URL } from '../constants';

// --- HELPER FUNCTIONS FOR VIETNAMESE CURRENCY READING ---
const DOCSO = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const CHUSO = ['linh', 'mười', 'lăm', 'mốt', 'tư'];

function docSo3ChuSo(baso: number): string {
    let tram, chuc, donvi;
    let ketqua = '';
    tram = Math.floor(baso / 100);
    chuc = Math.floor((baso % 100) / 10);
    donvi = baso % 10;
    
    if (tram === 0 && chuc === 0 && donvi === 0) return '';
    
    if (tram !== 0) {
        ketqua += DOCSO[tram] + ' trăm ';
        if ((chuc === 0) && (donvi !== 0)) ketqua += ' linh ';
    }
    
    if ((chuc !== 0) && (chuc !== 1)) {
        ketqua += DOCSO[chuc] + ' mươi';
        if ((chuc === 0) && (donvi !== 0)) ketqua += ' linh ';
    }
    
    if (chuc === 1) ketqua += ' mười ';
    
    switch (donvi) {
        case 1:
            if ((chuc !== 0) && (chuc !== 1)) ketqua += ' mốt ';
            else ketqua += DOCSO[donvi];
            break;
        case 5:
            if (chuc === 0) ketqua += DOCSO[donvi];
            else ketqua += ' lăm ';
            break;
        default:
            if (donvi !== 0) ketqua += ' ' + DOCSO[donvi];
            break;
    }
    return ketqua;
}

function docTienBangChu(soTien: number): string {
    if (soTien === 0) return 'Không đồng';
    let lan = 0;
    let i = 0;
    let so = 0;
    let ketqua = '';
    let tmp = '';
    const Tien = new Array();
    let ViTri = new Array();
    
    if (soTien < 0) return 'Số tiền âm';
    if (soTien > 8999999999999999) return 'Số quá lớn';
    
    ViTri[5] = 1000000000000000;
    ViTri[4] = 1000000000000;
    ViTri[3] = 1000000000;
    ViTri[2] = 1000000;
    ViTri[1] = 1000;
    ViTri[0] = 1;
    
    if (soTien > 0) {
        lan = 5;
    } else {
        lan = 0;
    }
    
    for (i = lan; i >= 0; i--) {
        tmp = Math.floor(soTien / ViTri[i]).toString();
        so = parseFloat(tmp);
        if (so > 0) {
            Tien[i] = docSo3ChuSo(so);
            soTien = soTien - parseFloat(tmp) * ViTri[i];
        }
    }
    
    if (Tien[5] && Tien[5].length > 0) ketqua += Tien[5] + ' triệu ';
    if (Tien[4] && Tien[4].length > 0) ketqua += Tien[4] + ' nghìn tỷ ';
    if (Tien[3] && Tien[3].length > 0) ketqua += Tien[3] + ' tỷ ';
    if (Tien[2] && Tien[2].length > 0) ketqua += Tien[2] + ' triệu ';
    if (Tien[1] && Tien[1].length > 0) ketqua += Tien[1] + ' nghìn ';
    if (Tien[0] && Tien[0].length > 0) ketqua += Tien[0];
    
    // Capitalize first letter and trim
    ketqua = ketqua.trim();
    return ketqua.charAt(0).toUpperCase() + ketqua.slice(1) + ' đồng';
}

interface FinancePageProps {
  onClose: () => void;
  guqRecords: GUQRecord[];
  onUpdateGuq: (records: GUQRecord[]) => void;
  currentUser: UserAccount | null;
}

type ModalType = 'GUQ' | 'CVHC' | 'CVHT' | 'ADJUST' | null;
type GuqStatus = 'idle' | 'valid' | 'expired' | 'not_found';
type CvhcStatus = 'idle' | 'found' | 'not_found';

// Mock database for CVHC (Refund Request) - Kept mock for CVHC as request only asked for GUQ
const MOCK_CVHC_DB = [
  { id: 1, companyName: 'Công ty Samsung Vina', bl: 'LH-HBL-20240987', date: '11/05/2024', status: 'Pending' },
  { id: 2, companyName: 'VinFast Hải Phòng', bl: 'LH-HBL-20241022', date: '09/05/2024', status: 'Processing' },
];

interface CvhcCreationData {
  companyName: string;
  paymentDate: string;
  amount: string;
  amountInWords: string;
  hbl: string;
  containerNo: string;
  beneficiary: string;
  accountNumber: string;
  bank: string;
}

interface CvhtData {
  companyName: string;
  taxId: string;
  address: string;
  paymentDate: string;
  amount: string;
  hbl: string;
  reason: string;
  beneficiary: string;
  accountNumber: string;
  bank: string;
  refundType: 'wrong' | 'excess';
  excessAmount: string;
  amountInWords: string;
}

const FinancePage: React.FC<FinancePageProps> = ({ onClose, guqRecords, onUpdateGuq, currentUser }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [blSearch, setBlSearch] = useState('');
  const [isBlFound, setIsBlFound] = useState<boolean | null>(null);
  const [adjustChoice, setAdjustChoice] = useState<'sign' | 'download' | null>(null);

  // --- GUQ STATE ---
  const [guqSearchTerm, setGuqSearchTerm] = useState('');
  const [guqStatus, setGuqStatus] = useState<GuqStatus>('idle');
  const [foundGuq, setFoundGuq] = useState<GUQRecord | null>(null);
  const [newGuqFile, setNewGuqFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- CVHC STATE ---
  const [cvhcSearchTerm, setCvhcSearchTerm] = useState('');
  const [cvhcStatus, setCvhcStatus] = useState<CvhcStatus>('idle');
  const [foundCvhc, setFoundCvhc] = useState<typeof MOCK_CVHC_DB[0] | null>(null);
  const [cvhcMode, setCvhcMode] = useState<'upload' | 'create'>('upload'); // 'upload' or 'create'
  
  // CVHC Upload State
  const [cvhcUploadData, setCvhcUploadData] = useState({ companyName: '', hbl: '', fileCvhc: null as File | null, fileEir: null as File | null });
  
  // CVHC Creation Form State
  const [cvhcCreateData, setCvhcCreateData] = useState<CvhcCreationData>({
    companyName: '',
    paymentDate: '', amount: '', amountInWords: '', hbl: '', containerNo: '',
    beneficiary: '', accountNumber: '', bank: ''
  });

  // CVHT State
  const [cvhtMode, setCvhtMode] = useState<'create'>('create');
  const [cvhtData, setCvhtData] = useState<CvhtData>({
    companyName: '', taxId: '', address: '',
    paymentDate: '', amount: '', hbl: '',
    reason: '', beneficiary: '', accountNumber: '', bank: '',
    refundType: 'wrong',
    excessAmount: '',
    amountInWords: ''
  });

  const handleBlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBlFound(blSearch.toUpperCase().startsWith('LH'));
  };

  // --- GUQ HANDLERS ---

  const handleGuqSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guqSearchTerm.trim()) return;

    // Search in the real props data
    const result = guqRecords.find(item => 
      item.companyName.toLowerCase().includes(guqSearchTerm.toLowerCase())
    );

    if (result) {
      const submitDate = new Date(result.date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (submitDate < oneYearAgo) {
        setGuqStatus('expired');
      } else {
        setGuqStatus('valid');
      }
      setFoundGuq(result);
    } else {
      setGuqStatus('not_found');
      setFoundGuq(null);
    }
    setNewGuqFile(null);
  };

  const handleGuqUpload = async () => {
    if (!newGuqFile || !guqSearchTerm) return alert('Vui lòng chọn file và nhập tên công ty!');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', newGuqFile);
    formData.append('user', currentUser?.englishName || 'Unknown');
    formData.append('metadata', JSON.stringify({
        companyName: guqSearchTerm,
        date: new Date().toISOString().split('T')[0]
    }));

    try {
        // Updated to use absolute API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/upload?category=GUQ`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Đã cập nhật Giấy ủy quyền thành công!`);
            
            // Update global state via prop callback
            onUpdateGuq([...guqRecords, data.record]);
            
            setGuqStatus('valid');
            setFoundGuq(data.record);
            setNewGuqFile(null);
        } else {
            alert('Upload thất bại. Vui lòng thử lại.');
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi kết nối Server.');
    } finally {
        setIsUploading(false);
    }
  };

  // --- CVHC HANDLERS ---

  const handleCvhcSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvhcSearchTerm.trim()) return;

    const result = MOCK_CVHC_DB.find(item => item.bl.toLowerCase().trim() === cvhcSearchTerm.toLowerCase().trim());

    if (result) {
      setCvhcStatus('found');
      setFoundCvhc(result);
    } else {
      setCvhcStatus('not_found');
      setFoundCvhc(null);
      // Pre-fill HBL in both upload and create forms
      setCvhcUploadData(prev => ({ ...prev, hbl: cvhcSearchTerm }));
      setCvhcCreateData(prev => ({ ...prev, hbl: cvhcSearchTerm }));
    }
  };

  const handleCvhcUploadSubmit = () => {
    if (!cvhcUploadData.companyName || !cvhcUploadData.hbl) return alert('Vui lòng nhập đủ thông tin!');
    if (!cvhcUploadData.fileCvhc || !cvhcUploadData.fileEir) return alert('Vui lòng đính kèm đủ 2 file: CVHC và EIR!');
    
    alert(`Đã tiếp nhận hồ sơ hoàn cược cho BL: ${cvhcUploadData.hbl}`);
    setCvhcStatus('found');
    setFoundCvhc({
        id: Date.now(),
        companyName: cvhcUploadData.companyName,
        bl: cvhcUploadData.hbl,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'New'
    });
  };

  const handleCvhcAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let words = '';
    if (val && !isNaN(Number(val))) {
        words = docTienBangChu(Number(val));
    }
    setCvhcCreateData({
        ...cvhcCreateData,
        amount: val,
        amountInWords: words
    });
  };

  const handleCvhtAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'amount' | 'excessAmount') => {
    const val = e.target.value;
    // Calculate words for the field that matters (Refund Amount usually)
    let words = cvhtData.amountInWords;
    
    // Logic: The refund amount depends on type
    const targetAmount = field === 'excessAmount' ? val : (field === 'amount' && cvhtData.refundType === 'wrong' ? val : cvhtData.amount);
    
    if (targetAmount && !isNaN(Number(targetAmount))) {
        words = docTienBangChu(Number(targetAmount));
    }

    setCvhtData({
        ...cvhtData,
        [field]: val,
        amountInWords: words
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modalTitle = {
      'GUQ': 'Quản lý Giấy ủy quyền',
      'CVHC': 'Nộp Công văn Hoàn cược',
      'CVHT': 'Lập Công văn Hoàn tiền',
      'ADJUST': 'Biên bản Điều chỉnh/Thay thế'
    }[activeModal];

    // Expand width for editor modes
    const modalWidth = (activeModal === 'CVHC' && cvhcMode === 'create') || activeModal === 'CVHT' 
        ? 'max-w-[1400px] h-[90vh]' 
        : activeModal === 'GUQ' ? 'max-w-2xl' : 'max-w-4xl';
    
    // For CVHT Logic
    const cvhtRefundAmount = cvhtData.refundType === 'excess' ? cvhtData.excessAmount : cvhtData.amount;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={() => { setActiveModal(null); setGuqStatus('idle'); setCvhcStatus('idle'); }}></div>
        <div className={`bg-white w-full ${modalWidth} rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 print:w-full print:h-full print:rounded-none print:shadow-none print:static`}>
          
          {/* Modal Header - Hidden on Print */}
          <div className="bg-primary p-6 text-white flex justify-between items-center print:hidden flex-shrink-0">
            <h3 className="text-xl font-bold flex items-center">
              {activeModal === 'GUQ' && <FileSignature className="mr-2" />}
              {activeModal === 'CVHC' && <RefreshCw className="mr-2" />}
              {activeModal === 'CVHT' && <CreditCard className="mr-2" />}
              {activeModal === 'ADJUST' && <ClipboardEdit className="mr-2" />}
              {modalTitle}
            </h3>
            <button onClick={() => { setActiveModal(null); setGuqStatus('idle'); setCvhcStatus('idle'); setAdjustChoice(null); setIsBlFound(null); }} className="p-1 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 md:p-8 overflow-y-auto flex-grow print:p-0 print:overflow-visible">
            {activeModal === 'GUQ' && (
              <div className="space-y-8">
                {/* Search Section */}
                <form onSubmit={handleGuqSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Nhập tên công ty để kiểm tra..." 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary transition font-bold text-gray-700"
                      value={guqSearchTerm}
                      onChange={(e) => { setGuqSearchTerm(e.target.value); setGuqStatus('idle'); }}
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primaryDark text-white px-4 rounded-xl font-bold transition shadow-md"
                    >
                      Kiểm tra
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 ml-4 italic">* Hệ thống sẽ tra cứu dữ liệu từ bộ phận Management (Realtime)</p>
                </form>

                {/* Result Section */}
                <div className="min-h-[200px]">
                  {guqStatus === 'idle' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-bold">Vui lòng nhập tên công ty để tra cứu trạng thái GUQ</p>
                    </div>
                  )}

                  {guqStatus === 'valid' && foundGuq && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in slide-in-from-bottom-4">
                      <div className="flex items-center text-green-700 font-bold mb-4 text-lg">
                        <CheckCircle size={28} className="mr-3" />
                        <span>Giấy ủy quyền Hợp lệ</span>
                      </div>
                      <div className="space-y-3 pl-10">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase block">Tên công ty</span>
                          <span className="text-gray-800 font-bold">{foundGuq.companyName}</span>
                        </div>
                        <div className="flex gap-8">
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block">Ngày nộp</span>
                            <span className="text-gray-800 font-medium">{foundGuq.date}</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase block">File đính kèm</span>
                            <a href="#" className="text-blue-600 font-bold underline text-sm flex items-center hover:text-blue-800">
                              <FileText size={14} className="mr-1" /> {foundGuq.fileName}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(guqStatus === 'expired' || guqStatus === 'not_found') && (
                    <div className="animate-in slide-in-from-bottom-4 space-y-6">
                      {/* Alert Box */}
                      <div className={`border rounded-2xl p-6 flex items-start gap-4 ${guqStatus === 'expired' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className={`p-2 rounded-full ${guqStatus === 'expired' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                          <AlertTriangle size={24} />
                        </div>
                        <div>
                          <h4 className={`text-lg font-bold ${guqStatus === 'expired' ? 'text-red-700' : 'text-orange-700'}`}>
                            {guqStatus === 'expired' ? 'Giấy ủy quyền đã hết hạn!' : 'Chưa tìm thấy Giấy ủy quyền'}
                          </h4>
                          <p className={`text-sm mt-1 ${guqStatus === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                            {guqStatus === 'expired' 
                              ? `Bản ghi nhận ngày ${foundGuq?.date} đã quá hạn hiệu lực (1 năm). Vui lòng cập nhật bản mới.`
                              : `Hệ thống không tìm thấy dữ liệu GUQ cho công ty này. Vui lòng nộp hồ sơ mới.`
                            }
                          </p>
                        </div>
                      </div>

                      {/* Upload Form */}
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <h5 className="font-bold text-gray-800 mb-4 flex items-center uppercase text-sm tracking-wider">
                          <Upload size={16} className="mr-2" /> Nộp bản scan mới
                        </h5>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary hover:bg-white transition cursor-pointer group"
                          onClick={() => document.getElementById('guq-upload')?.click()}
                        >
                          <Upload size={32} className="mx-auto text-gray-400 group-hover:text-primary mb-3 transition" />
                          <p className="text-sm font-bold text-gray-600">
                            {newGuqFile ? newGuqFile.name : 'Click để chọn file hoặc kéo thả vào đây'}
                          </p>
                          <input 
                            type="file" 
                            id="guq-upload" 
                            className="hidden" 
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => setNewGuqFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        <button 
                          onClick={handleGuqUpload}
                          className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition shadow-lg ${newGuqFile ? 'bg-primary hover:bg-primaryDark' : 'bg-gray-300 cursor-not-allowed'}`}
                          disabled={!newGuqFile || isUploading}
                        >
                          {isUploading ? 'Đang xử lý...' : (guqStatus === 'expired' ? 'Cập nhật GUQ Mới' : 'Nộp Hồ Sơ Mới')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'CVHC' && (
              <div className="space-y-6 h-full flex flex-col">
                {/* Search Bar - Hidden if creating */}
                {cvhcMode !== 'create' && (
                  <form onSubmit={handleCvhcSearch} className="relative mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Nhập số HBL để kiểm tra (VD: LH-HBL-20240987)..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary transition font-bold text-gray-700"
                        value={cvhcSearchTerm}
                        onChange={(e) => { setCvhcSearchTerm(e.target.value); setCvhcStatus('idle'); }}
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primaryDark text-white px-4 rounded-xl font-bold transition shadow-md"
                      >
                        Kiểm tra
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 ml-4 italic">* Hệ thống sẽ tra cứu dữ liệu từ bộ phận Management</p>
                  </form>
                )}

                {/* Conditional Content */}
                {cvhcStatus === 'idle' && cvhcMode !== 'create' && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                        <RefreshCw size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-bold">Vui lòng nhập số HBL để kiểm tra tình trạng hoàn cược</p>
                    </div>
                )}

                {cvhcStatus === 'found' && foundCvhc && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center text-green-700 font-bold mb-4 text-lg">
                            <CheckCircle size={28} className="mr-3" />
                            <span>Đã nhận Công văn hoàn cược</span>
                        </div>
                        <div className="space-y-3 pl-10 text-sm text-gray-600">
                            <p>Chúng tôi đã nhận được hồ sơ CVHC của <strong>{foundCvhc.companyName}</strong> cho lô hàng <strong>{foundCvhc.bl}</strong>.</p>
                            <div className="flex items-center gap-2 mt-4 bg-white/50 p-3 rounded-lg border border-green-100">
                                <Clock className="text-green-600" size={16} />
                                <span className="font-bold text-green-700">Thời gian hoàn tiền dự kiến: 1-2 tuần làm việc.</span>
                            </div>
                            <p className="text-xs italic mt-2">Vui lòng chờ Long Hoang kiểm tra và xử lý.</p>
                        </div>
                    </div>
                )}

                {(cvhcStatus === 'not_found' || cvhcMode === 'create') && (
                    <div className={`animate-in slide-in-from-bottom-4 space-y-6 flex-grow flex flex-col ${cvhcMode === 'create' ? 'h-full' : ''}`}>
                        {/* Alert only if not creating */}
                        {cvhcMode !== 'create' && (
                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4">
                              <div className="p-2 rounded-full bg-orange-100 text-orange-500">
                                  <Info size={24} />
                              </div>
                              <div>
                                  <h4 className="text-lg font-bold text-orange-700">Chưa nhận được hồ sơ</h4>
                                  <p className="text-sm mt-1 text-orange-600">
                                      Hệ thống chưa ghi nhận CVHC cho số HBL này. Vui lòng nộp hồ sơ mới.
                                  </p>
                              </div>
                          </div>
                        )}

                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-xl print:hidden flex-shrink-0">
                            <button 
                                onClick={() => setCvhcMode('upload')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${cvhcMode === 'upload' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Upload size={16} className="mr-2" /> Tải file có sẵn
                            </button>
                            <button 
                                onClick={() => setCvhcMode('create')}
                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${cvhcMode === 'create' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <PenTool size={16} className="mr-2" /> Soạn thảo trực tuyến
                            </button>
                        </div>

                        {/* UPLOAD FORM */}
                        {cvhcMode === 'upload' && (
                            <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in zoom-in duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase">Tên công ty</label>
                                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition" placeholder="..." value={cvhcUploadData.companyName} onChange={(e) => setCvhcUploadData({...cvhcUploadData, companyName: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase">Số HBL</label>
                                        <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition font-bold text-gray-700" placeholder="LH-HBL..." value={cvhcUploadData.hbl} onChange={(e) => setCvhcUploadData({...cvhcUploadData, hbl: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div 
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${cvhcUploadData.fileCvhc ? 'border-primary bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                        onClick={() => document.getElementById('cvhc-upload')?.click()}
                                    >
                                        <FileCheck size={24} className={`mx-auto mb-2 ${cvhcUploadData.fileCvhc ? 'text-primary' : 'text-gray-400'}`} />
                                        <span className="text-xs font-bold text-gray-600 block">{cvhcUploadData.fileCvhc ? cvhcUploadData.fileCvhc.name : 'Tải file CVHC'}</span>
                                        <input type="file" id="cvhc-upload" className="hidden" onChange={(e) => setCvhcUploadData({...cvhcUploadData, fileCvhc: e.target.files?.[0] || null})} />
                                    </div>
                                    <div 
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${cvhcUploadData.fileEir ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                        onClick={() => document.getElementById('eir-upload')?.click()}
                                    >
                                        <FileText size={24} className={`mx-auto mb-2 ${cvhcUploadData.fileEir ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <span className="text-xs font-bold text-gray-600 block">{cvhcUploadData.fileEir ? cvhcUploadData.fileEir.name : 'Tải file EIR'}</span>
                                        <input type="file" id="eir-upload" className="hidden" onChange={(e) => setCvhcUploadData({...cvhcUploadData, fileEir: e.target.files?.[0] || null})} />
                                    </div>
                                </div>
                                <button onClick={handleCvhcUploadSubmit} className="w-full bg-[#1e2a3b] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition-all uppercase tracking-wider mt-4">Xác nhận nộp hồ sơ</button>
                            </div>
                        )}

                        {/* CREATE FORM - SPLIT SCREEN */}
                        {cvhcMode === 'create' && (
                             <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 pt-4">
                                {/* LEFT: LIVE PREVIEW */}
                                <div className="flex-1 bg-gray-200/50 rounded-xl p-8 overflow-y-auto border border-gray-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
                                    <div 
                                      className="bg-white w-full max-w-[210mm] shadow-xl p-12 min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0"
                                      style={{ fontFamily: '"Times New Roman", Times, serif' }}
                                    >
                                        {/* Header */}
                                        <div className="text-center mb-8 mt-4">
                                          <h3 className="text-[16px] font-bold uppercase mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                                          <h4 className="text-[15px] font-bold underline underline-offset-4">Độc lập – Tự do – Hạnh Phúc</h4>
                                        </div>

                                        <div className="text-center mb-10">
                                            <h1 className="text-[24px] font-bold uppercase mb-2">CÔNG VĂN HOÀN CƯỢC</h1>
                                        </div>

                                        <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                                            {/* Top Left Company Info Positioned Absolute in standard template, but handling inline here for flow or absolute relative to paper */}
                                            <div className="absolute top-12 left-12 text-left print:static print:mb-4">
                                                <p className="font-bold uppercase text-[13px]">{cvhcCreateData.companyName || '....................'}</p>
                                                <p className="text-[11px] italic mt-1">V/v: chuyển trả lại tiền cược vỏ</p>
                                            </div>

                                            <div className="space-y-1 mt-12">
                                                <p className="indent-8">
                                                    <span className="font-bold">Kính gửi : </span> 
                                                    <span className="uppercase font-bold">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span>
                                                </p>
                                                <p className="indent-8">
                                                    <span className="font-bold">Kính gửi : </span> 
                                                    <span className="uppercase font-bold">KIMBERRY MERCHANT LINE</span>
                                                </p>
                                            </div>

                                            <div className="indent-8">
                                                Lời đầu tiên xin gửi tới quý Công ty lời chào trân trọng nhất và cảm ơn quý công ty đã giúp đỡ chúng tôi trong thời gian qua.
                                            </div>

                                            <div className="mt-4 indent-8">
                                                Ngày {cvhcCreateData.paymentDate ? new Date(cvhcCreateData.paymentDate).toLocaleDateString('vi-VN') : '.../.../202...'}, Công ty chúng tôi có làm thủ tục cược vỏ cho lô hàng dưới đây qua quý công ty:
                                            </div>

                                            <div className="pl-8 space-y-1 font-bold">
                                                <p>- Số bill (B/L No): {cvhcCreateData.hbl || '................'}</p>
                                                <p>- Số container (Cont No): {cvhcCreateData.containerNo || '................'}</p>
                                                <p>- Số tiền: {Number(cvhcCreateData.amount || 0).toLocaleString()} VNĐ (Bằng chữ: {cvhcCreateData.amountInWords || '................'})</p>
                                            </div>

                                            <p className="mt-4 indent-8">
                                                Sau khi rút hàng xong, công ty chúng tôi đã hoàn trả vỏ container về đúng bãi quy định theo yêu cầu của hãng tàu.
                                            </p>

                                            <p className="mt-4 indent-8">
                                                Bằng công văn này, Công ty chúng tôi xin được rút lại tiền cược và đề nghị quý hãng chuyển tiền vào:
                                            </p>

                                            <div className="pl-8 space-y-2 font-bold mt-4">
                                                <p>- Người thụ hưởng: {cvhcCreateData.beneficiary || '................................................'}</p>
                                                <p>- Số TK: {cvhcCreateData.accountNumber || '................................................'}</p>
                                                <p>- Ngân hàng: {cvhcCreateData.bank || '................................................'}</p>
                                            </div>

                                            <p className="mt-2 text-[14px] italic text-justify pl-8 uppercase">
                                              Yêu cầu Khách hàng cung cấp tên đăng ký giao dịch E-Bank với ngân hàng chính xác nhất (Khi cung cấp sai, chậm trễ trong việc hoàn cược chúng tôi <span className="font-bold">không chịu trách nhiệm</span>)
                                            </p>
                                        </div>

                                        <div className="flex justify-between mt-16 px-4">
                                            <div className="text-left italic">
                                                <p>Xin chân thành cảm ơn.</p>
                                                <p>Trân trọng kính chào.</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="italic mb-4">Tp. Hồ Chí Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                                                <p className="font-bold uppercase">ĐẠI DIỆN THEO PHÁP LUẬT</p>
                                                <p className="text-[12px] italic text-gray-400 mt-12">(Ký, đóng dấu, ghi rõ họ tên)</p>
                                            </div>
                                        </div>
                                        
                                        {/* Legal Footer Note */}
                                        <div className="absolute bottom-10 left-12 right-12 border-t border-gray-300 pt-2 print:relative print:mt-12">
                                            <p className="text-[11px] italic text-justify text-gray-600">
                                                <span className="font-bold underline">Lưu ý:</span> Công văn xin hoàn cược phải do người đại diện pháp luật (Giám đốc hoặc Tổng Giám đốc) ký, trường hợp uỷ quyền cho cá nhân khác ký, Khách hàng phải có giấy uỷ quyền của Giám đốc cho cá nhân này.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: INPUTS */}
                                <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-xl print:hidden">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                                       <h4 className="font-bold text-gray-800 flex items-center"><PenTool size={16} className="mr-2" /> Nhập thông tin</h4>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Tên công ty (*)</label>
                                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhcCreateData.companyName} onChange={(e) => setCvhcCreateData({...cvhcCreateData, companyName: e.target.value})} placeholder="Công ty..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Ngày thanh toán</label>
                                            <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhcCreateData.paymentDate} onChange={(e) => setCvhcCreateData({...cvhcCreateData, paymentDate: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Số tiền hoàn (VNĐ) (*)</label>
                                            <input type="number" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={cvhcCreateData.amount} onChange={handleCvhcAmountChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Bằng chữ</label>
                                            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-100 rounded-lg text-xs italic text-gray-500 min-h-[38px]">{cvhcCreateData.amountInWords || '...'}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Số HBL</label>
                                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold uppercase focus:border-primary transition" value={cvhcCreateData.hbl} onChange={(e) => setCvhcCreateData({...cvhcCreateData, hbl: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase">Số Container</label>
                                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold uppercase focus:border-primary transition" placeholder="TCLU..." value={cvhcCreateData.containerNo} onChange={(e) => setCvhcCreateData({...cvhcCreateData, containerNo: e.target.value})} />
                                        </div>
                                        
                                        <div className="border-t border-gray-100 pt-3 mt-1 space-y-4">
                                            <label className="text-[10px] font-black text-primary uppercase block">Thông tin thụ hưởng</label>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase">Người thụ hưởng (*)</label>
                                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm uppercase focus:border-primary transition" value={cvhcCreateData.beneficiary} onChange={(e) => setCvhcCreateData({...cvhcCreateData, beneficiary: e.target.value})} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase">Số tài khoản (*)</label>
                                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-mono focus:border-primary transition" value={cvhcCreateData.accountNumber} onChange={(e) => setCvhcCreateData({...cvhcCreateData, accountNumber: e.target.value})} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase">Tại ngân hàng</label>
                                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhcCreateData.bank} onChange={(e) => setCvhcCreateData({...cvhcCreateData, bank: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                        <button onClick={handlePrint} className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                                            <Printer size={18} className="mr-2" /> In & Tải xuống
                                        </button>
                                    </div>
                                </div>
                             </div>
                        )}
                    </div>
                )}
              </div>
            )}

            {activeModal === 'CVHT' && (
               <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                  {/* LEFT: LIVE PREVIEW */}
                  <div className="flex-1 bg-gray-200/50 rounded-xl p-8 overflow-y-auto border border-gray-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
                      <div 
                        className="bg-white w-full max-w-[210mm] shadow-xl p-12 min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                      >
                        {/* Header */}
                        <div className="text-center mb-8">
                          <h3 className="text-[16px] font-bold uppercase mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                          <h4 className="text-[15px] font-bold underline underline-offset-4">Độc lập – Tự do – Hạnh Phúc</h4>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-[24px] font-bold uppercase mb-2">CÔNG VĂN HOÀN TIỀN THỪA</h1>
                            <p className="text-[14px] italic font-bold">(V/v hoàn trả lại số tiền thanh toán thừa)</p>
                        </div>

                        <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                            <p>
                                <span className="font-bold">Kính gửi : </span> 
                                <span className="uppercase font-bold">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span>
                            </p>

                            <div className="space-y-2 mt-4">
                                <p>Chúng tôi là: <span className="font-bold uppercase">{cvhtData.companyName || '................................................'}</span></p>
                                <p>Địa chỉ: <span>{cvhtData.address || '................................................'}</span></p>
                                <p>Mã số thuế: <span className="font-bold">{cvhtData.taxId || '................................................'}</span></p>
                            </div>

                            <p className="mt-4">
                                Ngày {cvhtData.paymentDate ? new Date(cvhtData.paymentDate).toLocaleDateString('vi-VN') : '.../.../202...'}, Công ty chúng tôi đã chuyển khoản số tiền 
                                <span className="font-bold px-1">{Number(cvhtData.amount || 0).toLocaleString()} VNĐ</span> 
                                thanh toán cho lô hàng HBL số 
                                <span className="font-bold px-1">{cvhtData.hbl || '..........'}</span>
                                vào tài khoản Quý công ty:
                            </p>

                            <div className="my-2 italic text-gray-700">
                                <p>- Tên tài khoản: CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</p>
                                <p>- Số tài khoản: 19135447033015</p>
                                <p>- Ngân hàng: Techcombank Chi Nhánh Gia Định</p>
                            </div>

                            <p className="mt-2">Tuy nhiên vì lý do: {cvhtData.reason || '................................................'}.</p>

                            <p className="mt-4">Kính đề nghị Quý công ty chuyển khoản lại số tiền thừa {Number(cvhtRefundAmount || 0).toLocaleString()} VNĐ cho công ty chúng tôi như bên dưới:</p>

                            <div className="pl-4 space-y-2 font-bold mt-2">
                                <p>- Số tiền: {Number(cvhtRefundAmount || 0).toLocaleString()} VNĐ</p>
                                <p>- Người thụ hưởng: {cvhtData.beneficiary || '................................................'}</p>
                                <p>- Số TK: {cvhtData.accountNumber || '................................................'}</p>
                                <p>- Ngân hàng: {cvhtData.bank || '................................................'}</p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-16 px-4">
                            <div className="text-left italic">
                                <p>Xin chân thành cảm ơn.</p>
                                <p>Trân trọng kính chào.</p>
                            </div>
                            <div className="text-center">
                                <p className="italic mb-4">Tp. Hồ Chí Minh, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                                <p className="font-bold uppercase">ĐẠI DIỆN THEO PHÁP LUẬT</p>
                                <p className="text-[12px] italic text-gray-400 mt-12">(Ký, đóng dấu, ghi rõ họ tên)</p>
                            </div>
                        </div>
                      </div>
                  </div>

                  {/* RIGHT: INPUTS */}
                  <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-xl print:hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                         <h4 className="font-bold text-gray-800 flex items-center"><PenTool size={16} className="mr-2" /> Nhập thông tin</h4>
                      </div>
                      <div className="p-6 overflow-y-auto space-y-4 flex-1">
                          {/* Payment Type Toggle */}
                          <div className="flex gap-4 mb-2 p-1 bg-gray-50 rounded-lg">
                              <label className="flex-1 flex items-center justify-center cursor-pointer p-2 rounded-md hover:bg-white transition">
                                  <input 
                                      type="radio" 
                                      name="refundType" 
                                      className="mr-2 accent-primary"
                                      checked={cvhtData.refundType === 'wrong'} 
                                      onChange={() => setCvhtData({...cvhtData, refundType: 'wrong'})} 
                                  />
                                  <span className="text-xs font-bold text-gray-600">Thanh toán nhầm</span>
                              </label>
                              <label className="flex-1 flex items-center justify-center cursor-pointer p-2 rounded-md hover:bg-white transition">
                                  <input 
                                      type="radio" 
                                      name="refundType" 
                                      className="mr-2 accent-primary"
                                      checked={cvhtData.refundType === 'excess'} 
                                      onChange={() => setCvhtData({...cvhtData, refundType: 'excess'})} 
                                  />
                                  <span className="text-xs font-bold text-gray-600">Thanh toán dư</span>
                              </label>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Tên công ty (*)</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhtData.companyName} onChange={(e) => setCvhtData({...cvhtData, companyName: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Mã số thuế (*)</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhtData.taxId} onChange={(e) => setCvhtData({...cvhtData, taxId: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Địa chỉ</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhtData.address} onChange={(e) => setCvhtData({...cvhtData, address: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Ngày thanh toán</label>
                            <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhtData.paymentDate} onChange={(e) => setCvhtData({...cvhtData, paymentDate: e.target.value})} />
                          </div>
                          
                          {/* Amount Fields based on type */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">
                                {cvhtData.refundType === 'excess' ? 'Số tiền đã chuyển khoản (VNĐ) (*)' : 'Số tiền hoàn (VNĐ) (*)'}
                            </label>
                            <input type="number" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={cvhtData.amount} onChange={(e) => setCvhtData({...cvhtData, amount: e.target.value})} />
                          </div>

                          {cvhtData.refundType === 'excess' && (
                              <div className="space-y-1 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-primary uppercase">Số tiền dư cần hoàn (VNĐ) (*)</label>
                                <input type="number" className="w-full px-3 py-2 bg-orange-50 border border-orange-100 text-primary rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={cvhtData.excessAmount} onChange={(e) => setCvhtData({...cvhtData, excessAmount: e.target.value})} />
                              </div>
                          )}

                           <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Số HBL</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold uppercase focus:border-primary transition" value={cvhtData.hbl} onChange={(e) => setCvhtData({...cvhtData, hbl: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Lý do hoàn tiền (*)</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" placeholder="VD: Thanh toán thừa tiền cược..." value={cvhtData.reason} onChange={(e) => setCvhtData({...cvhtData, reason: e.target.value})} />
                          </div>
                          
                          <div className="border-t border-gray-100 pt-3 mt-1 space-y-4">
                              <label className="text-[10px] font-black text-primary uppercase block">Thông tin thụ hưởng</label>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase">Người thụ hưởng (*)</label>
                                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm uppercase focus:border-primary transition" value={cvhtData.beneficiary} onChange={(e) => setCvhtData({...cvhtData, beneficiary: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase">Số tài khoản (*)</label>
                                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-mono focus:border-primary transition" value={cvhtData.accountNumber} onChange={(e) => setCvhtData({...cvhtData, accountNumber: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase">Tại ngân hàng</label>
                                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={cvhtData.bank} onChange={(e) => setCvhtData({...cvhtData, bank: e.target.value})} />
                              </div>
                          </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                          <button onClick={handlePrint} className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                              <Printer size={18} className="mr-2" /> In & Tải xuống
                          </button>
                      </div>
                  </div>
               </div>
            )}
            {activeModal === 'ADJUST' && (
              <div className="space-y-8">
                <form onSubmit={handleBlSearch} className="relative">
                  <input type="text" className="w-full pl-4 pr-32 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary transition" placeholder="Nhập số BL..." value={blSearch} onChange={(e) => { setBlSearch(e.target.value); setIsBlFound(null); }} />
                  <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-bold">KIỂM TRA</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const features = [
    { type: 'GUQ', title: 'Giấy ủy quyền', icon: FileSignature, desc: 'Quản lý & Tra cứu trạng thái GUQ.' },
    { type: 'CVHC', title: 'Nộp CVHC (Hoàn cược)', icon: RefreshCw, desc: 'Gửi yêu cầu hoàn cược vỏ container.' },
    { type: 'CVHT', title: 'Lập CVHT (Hoàn tiền)', icon: CreditCard, desc: 'Yêu cầu hoàn trả thanh toán thừa/nhầm.' },
    { type: 'ADJUST', title: 'Điều chỉnh hóa đơn', icon: ClipboardEdit, desc: 'Biên bản điều chỉnh/thay thế chứng từ.' },
  ];

  return (
    <div className="min-h-[80vh] bg-white p-8 md:p-16">
      <div className="container mx-auto max-w-6xl">
        {renderModal()}
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Finance Portal</h2>
            <p className="text-gray-500 mt-2 font-medium">Trung tâm Xử lý Tài chính & Chứng từ của Khách hàng</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              onClick={() => setActiveModal(f.type as ModalType)}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{f.desc}</p>
              <div className="mt-8 flex items-center text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                Thực hiện <ArrowRight size={14} className="ml-2" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-[#1e2a3b] rounded-3xl p-12 text-white flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
           <div className="relative z-10 flex-1">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary"><Landmark size={24} /></div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Hỗ trợ tài chính & Thanh toán</h3>
             </div>
             <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
               Nếu có bất kỳ thắc mắc nào về quy trình hoàn cược, điều chỉnh chứng từ hoặc khiếu nại thanh toán, đội ngũ Kế toán của chúng tôi luôn sẵn sàng hỗ trợ bạn.
             </p>
           </div>
           <div className="relative z-10 flex flex-col items-center bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 min-w-[300px]">
             <span className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-4">Hotline Kế toán 24/7</span>
             <a href="tel:02873032678" className="text-4xl font-black tracking-tighter hover:text-primary transition group flex items-center">
                <Phone className="mr-4 group-hover:animate-bounce" size={32} />
                028 7303 2678
             </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;

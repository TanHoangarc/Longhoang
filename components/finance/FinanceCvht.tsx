
import React, { useState, useEffect } from 'react';
import { PenTool, Printer, Search, CheckCircle, Info, CreditCard, AlertTriangle, Upload, FileCheck, FileText, Download } from 'lucide-react';
import { docTienBangChu } from './utils';
import { API_BASE_URL } from '../../constants';
import { CVHTRecord } from '../../App';

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

interface FinanceCvhtProps {
    mode?: 'lookup' | 'create';
    records: CVHTRecord[];
}

const FinanceCvht: React.FC<FinanceCvhtProps> = ({ mode = 'lookup', records = [] }) => {
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
  const [foundResult, setFoundResult] = useState<CVHTRecord | null>(null);

  // Quick Upload State (Lookup Mode)
  const [uploadCompanyName, setUploadCompanyName] = useState('');
  const [fileCvht, setFileCvht] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State (Create Mode)
  const [cvhtData, setCvhtData] = useState<CvhtData>({
    companyName: '', taxId: '', address: '',
    paymentDate: '', amount: '', hbl: '',
    reason: '', beneficiary: '', accountNumber: '', bank: '',
    refundType: 'wrong',
    excessAmount: '',
    amountInWords: ''
  });
  
  // Bank Selection for Long Hoang (Recipient of original payment)
  const [companyBank, setCompanyBank] = useState<'TCB' | 'MB'>('TCB');

  useEffect(() => {
      if (mode === 'lookup') {
          setSearchStatus('idle');
          setSearchTerm('');
          setUploadCompanyName('');
          setFileCvht(null);
      }
  }, [mode]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      
      const res = records.find(i => i.hbl.toLowerCase() === searchTerm.toLowerCase() || i.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
      if (res) {
          setSearchStatus('found');
          setFoundResult(res);
      } else {
          setSearchStatus('not_found');
          setFoundResult(null);
          // Auto fill form if switching to create
          setCvhtData(prev => ({...prev, hbl: searchTerm.startsWith('LH-') ? searchTerm : '' }));
      }
  };

  const handleQuickUpload = async () => {
      if (!uploadCompanyName) return alert('Vui lòng nhập tên công ty!');
      if (!fileCvht) return alert('Vui lòng tải file scan CVHT!');

      setIsUploading(true);
      
      // Simulate API call
      setTimeout(() => {
          setIsUploading(false);
          alert(`Đã cập nhật hồ sơ hoàn tiền cho: ${uploadCompanyName}`);
          setSearchStatus('found');
          setFoundResult({
              id: Date.now(),
              companyName: uploadCompanyName,
              bl: searchTerm || 'N/A',
              amount: '...',
              status: 'Pending',
              date: new Date().toLocaleDateString('en-GB'),
              fileName: fileCvht.name
          });
          setFileCvht(null);
      }, 1500);
  };

  const handleCvhtAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'amount' | 'excessAmount') => {
    const val = e.target.value;
    let words = cvhtData.amountInWords;
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

  const handleDownloadFile = (fileName: string) => {
      const url = `${API_BASE_URL}/files/CVHT/${fileName}`;
      window.open(url, '_blank');
  };

  const cvhtRefundAmount = cvhtData.refundType === 'excess' ? cvhtData.excessAmount : cvhtData.amount;

  // LOOKUP VIEW
  if (mode === 'lookup') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
            
            {/* LEFT COLUMN: Inputs */}
            <div className="flex flex-col space-y-6 pt-4">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nhập số HBL hoặc Tên công ty..." 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setSearchStatus('idle'); }}
                        />
                    </div>
                </form>

                <button 
                    onClick={handleSearch}
                    className="w-full sm:w-auto px-10 py-4 bg-[#5f8087] hover:bg-[#4a6b74] text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-slate-300 self-start"
                >
                    Kiểm tra
                </button>

                {/* Conditional Upload Inputs when Not Found */}
                {searchStatus === 'not_found' && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nộp hồ sơ mới</p>
                        
                        <input 
                            type="text" 
                            placeholder="Tên công ty..." 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all"
                            value={uploadCompanyName}
                            onChange={(e) => setUploadCompanyName(e.target.value)}
                        />

                        <div 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => document.getElementById('cvht-file')?.click()}
                        >
                            <input type="file" id="cvht-file" className="hidden" onChange={(e) => setFileCvht(e.target.files?.[0] || null)} />
                            <span className={`font-bold ${fileCvht ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                                {fileCvht ? fileCvht.name : 'Chọn File Scan CVHT'}
                            </span>
                            {fileCvht ? <FileCheck className="text-green-600" size={20} /> : <Upload className="text-slate-400" size={20} />}
                        </div>

                        <button 
                            onClick={handleQuickUpload}
                            disabled={isUploading}
                            className="w-full px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg mt-2"
                        >
                            {isUploading ? 'Đang tải lên...' : 'Gửi hồ sơ'}
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Result Card */}
            <div className="relative">
                <div className="bg-[#5f8087] rounded-[2.5rem] p-10 h-full min-h-[450px] flex flex-col text-white relative overflow-hidden shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">Kết quả tra cứu</h2>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {searchStatus === 'idle' && (
                            <div className="text-white/60">
                                <p className="text-sm leading-relaxed mb-4">
                                    Nhập số HBL hoặc tên công ty vào ô bên trái để kiểm tra tình trạng hoàn tiền.
                                </p>
                                <p className="text-sm leading-relaxed">
                                    Dữ liệu được cập nhật từ bộ phận kế toán.
                                </p>
                            </div>
                        )}

                        {searchStatus === 'found' && foundResult && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Tìm Thấy Hồ Sơ</h3>
                                    </div>
                                    <p className="text-white/80 text-sm">Hồ sơ đang được xử lý.</p>
                                </div>
                                
                                <div className="space-y-4 text-sm text-white/90">
                                    <div className="bg-white/10 p-4 rounded-2xl">
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Công ty</span>
                                        <span className="font-bold text-lg">{foundResult.companyName}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 p-4 rounded-2xl">
                                            <span className="block text-[10px] uppercase opacity-60 mb-1">Số HBL</span>
                                            <span className="font-bold">{foundResult.bl}</span>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl">
                                            <span className="block text-[10px] uppercase opacity-60 mb-1">Số tiền</span>
                                            <span className="font-bold">{foundResult.amount} VND</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl">
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Trạng thái</span>
                                        <span className={`font-bold uppercase ${foundResult.status === 'Completed' ? 'text-green-300' : 'text-yellow-300'}`}>
                                            {foundResult.status === 'Completed' ? 'Đã hoàn tiền' : 'Chờ xử lý'}
                                        </span>
                                    </div>

                                    {/* UNC File Download if Completed */}
                                    {foundResult.status === 'Completed' && foundResult.uncFile && (
                                        <div 
                                            onClick={() => handleDownloadFile(foundResult.uncFile!)}
                                            className="bg-green-500/20 p-4 rounded-2xl border border-green-400/50 cursor-pointer hover:bg-green-500/30 transition flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="block text-[10px] uppercase opacity-80 text-green-200 mb-1">Ủy nhiệm chi</span>
                                                <span className="font-bold text-white flex items-center"><FileText size={14} className="mr-2"/> {foundResult.uncFile}</span>
                                            </div>
                                            <Download size={20} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {searchStatus === 'not_found' && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <AlertTriangle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Chưa Tìm Thấy</h3>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        Hệ thống chưa có dữ liệu hoàn tiền cho thông tin này. <br/>
                                        Vui lòng sử dụng form bên trái để nộp hồ sơ mới hoặc chuyển sang tab "Lập CVHT" để soạn thảo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // CREATE VIEW (ONLINE FORM)
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0 pt-4 animate-in slide-in-from-bottom-4">
        
        {/* LEFT: INPUTS (New Style) */}
        <div className="w-full lg:w-[400px] flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-2 rounded-t-xl sticky top-0 z-10">
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center">
                    <PenTool className="mr-2 text-slate-500" size={20} /> Soạn thảo CVHT
                </h3>
            </div>
            
            <div className="space-y-4 pb-10">
                {/* Payment Type Toggle */}
                <div className="flex gap-4 p-1 bg-[#dce5eb] rounded-[1.5rem]">
                    <label className="flex-1 flex items-center justify-center cursor-pointer py-3 rounded-[1.2rem] hover:bg-white/50 transition">
                        <input 
                            type="radio" 
                            name="refundType" 
                            className="mr-2 accent-primary"
                            checked={cvhtData.refundType === 'wrong'} 
                            onChange={() => setCvhtData({...cvhtData, refundType: 'wrong'})} 
                        />
                        <span className="text-xs font-bold text-slate-600">Thanh toán nhầm</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center cursor-pointer py-3 rounded-[1.2rem] hover:bg-white/50 transition">
                        <input 
                            type="radio" 
                            name="refundType" 
                            className="mr-2 accent-primary"
                            checked={cvhtData.refundType === 'excess'} 
                            onChange={() => setCvhtData({...cvhtData, refundType: 'excess'})} 
                        />
                        <span className="text-xs font-bold text-slate-600">Thanh toán dư</span>
                    </label>
                </div>

                {/* Company Bank Toggle */}
                <div className="space-y-1 mt-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngân hàng đã chuyển (Long Hoang)</label>
                    <div className="flex gap-4 p-1 bg-[#dce5eb] rounded-[1.5rem]">
                        <label className="flex-1 flex items-center justify-center cursor-pointer py-3 rounded-[1.2rem] hover:bg-white/50 transition">
                            <input 
                                type="radio" 
                                name="companyBank" 
                                className="mr-2 accent-primary"
                                checked={companyBank === 'TCB'} 
                                onChange={() => setCompanyBank('TCB')} 
                            />
                            <span className="text-xs font-bold text-slate-600">Techcombank</span>
                        </label>
                        <label className="flex-1 flex items-center justify-center cursor-pointer py-3 rounded-[1.2rem] hover:bg-white/50 transition">
                            <input 
                                type="radio" 
                                name="companyBank" 
                                className="mr-2 accent-primary"
                                checked={companyBank === 'MB'} 
                                onChange={() => setCompanyBank('MB')} 
                            />
                            <span className="text-xs font-bold text-slate-600">MB Bank</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tên công ty (*)</label>
                    <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.companyName} onChange={(e) => setCvhtData({...cvhtData, companyName: e.target.value})} placeholder="Công ty..." />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mã số thuế</label>
                        <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.taxId} onChange={(e) => setCvhtData({...cvhtData, taxId: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngày thanh toán</label>
                        <input type="date" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.paymentDate} onChange={(e) => setCvhtData({...cvhtData, paymentDate: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Địa chỉ</label>
                    <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.address} onChange={(e) => setCvhtData({...cvhtData, address: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                        {cvhtData.refundType === 'excess' ? 'Số tiền đã chuyển (VNĐ)' : 'Số tiền hoàn (VNĐ)'}
                    </label>
                    <input type="number" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.amount} onChange={(e) => handleCvhtAmountChange(e, 'amount')} />
                </div>

                {cvhtData.refundType === 'excess' && (
                    <div className="space-y-1 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-bold text-primary uppercase ml-2">Số tiền dư cần hoàn (VNĐ)</label>
                        <input type="number" className="w-full px-5 py-3 bg-orange-50 border-2 border-orange-100 text-primary rounded-[1.5rem] outline-none font-bold text-sm focus:border-primary transition-all" value={cvhtData.excessAmount} onChange={(e) => handleCvhtAmountChange(e, 'excessAmount')} />
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số HBL</label>
                    <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm uppercase focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.hbl} onChange={(e) => setCvhtData({...cvhtData, hbl: e.target.value})} />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Lý do hoàn tiền (*)</label>
                    <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="VD: Thanh toán thừa..." value={cvhtData.reason} onChange={(e) => setCvhtData({...cvhtData, reason: e.target.value})} />
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Thông tin thụ hưởng</label>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Người thụ hưởng (*)</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm uppercase focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.beneficiary} onChange={(e) => setCvhtData({...cvhtData, beneficiary: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số tài khoản (*)</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-mono font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.accountNumber} onChange={(e) => setCvhtData({...cvhtData, accountNumber: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tại ngân hàng</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhtData.bank} onChange={(e) => setCvhtData({...cvhtData, bank: e.target.value})} />
                        </div>
                    </div>
                </div>

                <button onClick={() => window.print()} className="w-full bg-[#1e2a3b] hover:bg-black text-white py-4 rounded-[1.5rem] font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center mt-4">
                    <Printer size={18} className="mr-2" /> In & Tải xuống
                </button>
            </div>
        </div>

        {/* RIGHT: LIVE PREVIEW (A4) */}
        <div className="flex-1 bg-slate-100 rounded-[2rem] p-8 overflow-y-auto border border-slate-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
            <div 
                className="bg-white w-full max-w-[210mm] shadow-2xl p-12 min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
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
                        <p>- Số tài khoản: {companyBank === 'TCB' ? '19135447033015' : '345673979999'}</p>
                        <p>- Ngân hàng: {companyBank === 'TCB' ? 'Techcombank Chi Nhánh Gia Định' : 'MB Chi nhánh Hồ Chí Minh'}</p>
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
    </div>
  );
};

export default FinanceCvht;


import React, { useState } from 'react';
import { Search, CheckCircle, RefreshCw, Info, Upload, PenTool, FileCheck, FileText, Printer } from 'lucide-react';
import { docTienBangChu } from './utils';

// Mock database for CVHC
const MOCK_CVHC_DB = [
  { id: 1, companyName: 'Công ty Samsung Vina', bl: 'LH-HBL-20240987', date: '11/05/2024', status: 'Pending' },
  { id: 2, companyName: 'VinFast Hải Phòng', bl: 'LH-HBL-20241022', date: '09/05/2024', status: 'Processing' },
];

type CvhcStatus = 'idle' | 'found' | 'not_found';

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

const FinanceCvhc: React.FC = () => {
  const [cvhcSearchTerm, setCvhcSearchTerm] = useState('');
  const [cvhcStatus, setCvhcStatus] = useState<CvhcStatus>('idle');
  const [foundCvhc, setFoundCvhc] = useState<typeof MOCK_CVHC_DB[0] | null>(null);
  const [cvhcMode, setCvhcMode] = useState<'upload' | 'create'>('upload'); 
  
  const [cvhcUploadData, setCvhcUploadData] = useState({ companyName: '', hbl: '', fileCvhc: null as File | null, fileEir: null as File | null });
  
  const [cvhcCreateData, setCvhcCreateData] = useState<CvhcCreationData>({
    companyName: '',
    paymentDate: '', amount: '', amountInWords: '', hbl: '', containerNo: '',
    beneficiary: '', accountNumber: '', bank: ''
  });

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

  return (
    <div className="space-y-6 h-full flex flex-col">
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
                        <span className="font-bold text-green-700">Thời gian hoàn tiền dự kiến: 1-2 tuần làm việc.</span>
                    </div>
                    <p className="text-xs italic mt-2">Vui lòng chờ Long Hoang kiểm tra và xử lý.</p>
                </div>
            </div>
        )}

        {(cvhcStatus === 'not_found' || cvhcMode === 'create') && (
            <div className={`animate-in slide-in-from-bottom-4 space-y-6 flex-grow flex flex-col ${cvhcMode === 'create' ? 'h-full' : ''}`}>
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

                {cvhcMode === 'create' && (
                        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 pt-4">
                        {/* LEFT: LIVE PREVIEW */}
                        <div className="flex-1 bg-gray-200/50 rounded-xl p-8 overflow-y-auto border border-gray-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
                            <div 
                                className="bg-white w-full max-w-[210mm] shadow-xl p-12 min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0"
                                style={{ fontFamily: '"Times New Roman", Times, serif' }}
                            >
                                <div className="text-center mb-8 mt-4">
                                    <h3 className="text-[16px] font-bold uppercase mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                                    <h4 className="text-[15px] font-bold underline underline-offset-4">Độc lập – Tự do – Hạnh Phúc</h4>
                                </div>

                                <div className="text-center mb-10">
                                    <h1 className="text-[24px] font-bold uppercase mb-2">CÔNG VĂN HOÀN CƯỢC</h1>
                                </div>

                                <div className="space-y-4 text-[15px] leading-relaxed text-justify">
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
                                <button onClick={() => window.print()} className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                                    <Printer size={18} className="mr-2" /> In & Tải xuống
                                </button>
                            </div>
                        </div>
                        </div>
                )}
            </div>
        )}
    </div>
  );
};

export default FinanceCvhc;

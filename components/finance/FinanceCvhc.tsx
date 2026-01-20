
import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, RefreshCw, Info, Upload, PenTool, FileCheck, FileText, Printer, AlertTriangle, Download } from 'lucide-react';
import { docTienBangChu } from './utils';
import { API_BASE_URL } from '../../constants';
import { CVHCRecord } from '../../App';

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

interface FinanceCvhcProps {
    mode?: 'lookup' | 'create';
    records: CVHCRecord[];
}

const FinanceCvhc: React.FC<FinanceCvhcProps> = ({ mode = 'lookup', records = [] }) => {
  // Lookup State
  const [cvhcSearchTerm, setCvhcSearchTerm] = useState('');
  const [cvhcStatus, setCvhcStatus] = useState<CvhcStatus>('idle');
  const [foundCvhc, setFoundCvhc] = useState<CVHCRecord | null>(null);
  
  // Upload State (For Lookup Not Found)
  const [uploadCompanyName, setUploadCompanyName] = useState('');
  const [fileCvhc, setFileCvhc] = useState<File | null>(null);
  const [fileEir, setFileEir] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Create Form State
  const [cvhcCreateData, setCvhcCreateData] = useState<CvhcCreationData>({
    companyName: '',
    paymentDate: '', amount: '', amountInWords: '', hbl: '', containerNo: '',
    beneficiary: '', accountNumber: '', bank: ''
  });

  useEffect(() => {
      if (mode === 'lookup') {
          setCvhcStatus('idle');
          setCvhcSearchTerm('');
          setUploadCompanyName('');
          setFileCvhc(null);
          setFileEir(null);
      }
  }, [mode]);

  const handleCvhcSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvhcSearchTerm.trim()) return;

    const result = records.find(item => item.bl.toLowerCase().trim() === cvhcSearchTerm.toLowerCase().trim());

    if (result) {
      setCvhcStatus('found');
      setFoundCvhc(result);
    } else {
      setCvhcStatus('not_found');
      setFoundCvhc(null);
      setUploadCompanyName(''); // Reset for new entry
    }
  };

  const handleQuickUpload = async () => {
      if (!uploadCompanyName || !cvhcSearchTerm) return alert('Vui lòng nhập tên công ty!');
      if (!fileCvhc || !fileEir) return alert('Vui lòng tải đủ 2 file (CVHC và EIR)!');

      setIsUploading(true);
      
      // Simulate API call
      setTimeout(() => {
          setIsUploading(false);
          alert(`Đã cập nhật hồ sơ hoàn cược cho HBL: ${cvhcSearchTerm}`);
          // Mock success
          setCvhcStatus('found');
          setFoundCvhc({
              id: Date.now(),
              companyName: uploadCompanyName,
              bl: cvhcSearchTerm,
              date: new Date().toLocaleDateString('en-GB'),
              status: 'Pending',
              fileCvhc: fileCvhc.name,
              fileEir: fileEir.name
          });
          setFileCvhc(null);
          setFileEir(null);
      }, 1500);
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

  const handleDownloadFile = (fileName: string) => {
      const url = `${API_BASE_URL}/files/CVHC/${fileName}`;
      window.open(url, '_blank');
  };

  // RENDER LOOKUP VIEW (Styled like FinanceGuq)
  if (mode === 'lookup') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
            
            {/* LEFT COLUMN: Inputs */}
            <div className="flex flex-col space-y-6 pt-4">
                <form onSubmit={handleCvhcSearch} className="w-full">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nhập số HBL để kiểm tra..." 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all uppercase"
                            value={cvhcSearchTerm}
                            onChange={(e) => { setCvhcSearchTerm(e.target.value); setCvhcStatus('idle'); }}
                        />
                    </div>
                </form>

                <button 
                    onClick={handleCvhcSearch}
                    className="w-full sm:w-auto px-10 py-4 bg-[#5f8087] hover:bg-[#4a6b74] text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-slate-300 self-start"
                >
                    Kiểm tra
                </button>

                {/* Conditional Upload Inputs when Not Found */}
                {cvhcStatus === 'not_found' && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nộp hồ sơ mới</p>
                        
                        <input 
                            type="text" 
                            placeholder="Tên công ty..." 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all"
                            value={uploadCompanyName}
                            onChange={(e) => setUploadCompanyName(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                className="px-6 py-5 bg-[#dce5eb] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => document.getElementById('cvhc-file')?.click()}
                            >
                                <input type="file" id="cvhc-file" className="hidden" onChange={(e) => setFileCvhc(e.target.files?.[0] || null)} />
                                {fileCvhc ? <FileCheck className="text-green-600 mb-2" /> : <Upload className="text-slate-400 mb-2" />}
                                <span className="text-xs font-bold text-slate-600 text-center">{fileCvhc ? fileCvhc.name : 'File CVHC'}</span>
                            </div>

                            <div 
                                className="px-6 py-5 bg-[#dce5eb] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => document.getElementById('eir-file')?.click()}
                            >
                                <input type="file" id="eir-file" className="hidden" onChange={(e) => setFileEir(e.target.files?.[0] || null)} />
                                {fileEir ? <FileCheck className="text-green-600 mb-2" /> : <Upload className="text-slate-400 mb-2" />}
                                <span className="text-xs font-bold text-slate-600 text-center">{fileEir ? fileEir.name : 'File EIR'}</span>
                            </div>
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
                        {cvhcStatus === 'idle' && (
                            <div className="text-white/60">
                                <p className="text-sm leading-relaxed mb-4">
                                    Nhập số HBL vào ô bên trái để kiểm tra tình trạng Hoàn cược trong hệ thống.
                                </p>
                                <p className="text-sm leading-relaxed">
                                    Dữ liệu được cập nhật từ bộ phận chứng từ & kế toán.
                                </p>
                            </div>
                        )}

                        {cvhcStatus === 'found' && foundCvhc && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Đã Nhận Hồ Sơ</h3>
                                    </div>
                                    <p className="text-white/80 text-sm">
                                        {foundCvhc.status === 'Completed' ? 'Hồ sơ đã hoàn tất.' : 'Hồ sơ đang được xử lý.'}
                                    </p>
                                </div>
                                
                                <div className="space-y-4 text-sm text-white/90">
                                    <div className="bg-white/10 p-4 rounded-2xl">
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Số HBL</span>
                                        <span className="font-bold text-lg">{foundCvhc.bl}</span>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl">
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Doanh nghiệp</span>
                                        <span className="font-bold">{foundCvhc.companyName}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/10 p-4 rounded-2xl">
                                            <span className="block text-[10px] uppercase opacity-60 mb-1">Ngày nộp</span>
                                            <span className="font-bold">{foundCvhc.date}</span>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl">
                                            <span className="block text-[10px] uppercase opacity-60 mb-1">Trạng thái</span>
                                            <span className={`font-bold uppercase ${foundCvhc.status === 'Completed' ? 'text-green-300' : 'text-yellow-300'}`}>
                                                {foundCvhc.status === 'Completed' ? 'Đã hoàn' : 'Chờ xử lý'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* UNC File Download if Completed */}
                                    {foundCvhc.status === 'Completed' && foundCvhc.uncFile && (
                                        <div 
                                            onClick={() => handleDownloadFile(foundCvhc.uncFile!)}
                                            className="bg-green-500/20 p-4 rounded-2xl border border-green-400/50 cursor-pointer hover:bg-green-500/30 transition flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="block text-[10px] uppercase opacity-80 text-green-200 mb-1">Ủy nhiệm chi</span>
                                                <span className="font-bold text-white flex items-center"><FileText size={14} className="mr-2"/> {foundCvhc.uncFile}</span>
                                            </div>
                                            <Download size={20} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {cvhcStatus === 'not_found' && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <AlertTriangle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Chưa Tìm Thấy</h3>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        Hệ thống chưa có dữ liệu cho HBL này. <br/>
                                        Vui lòng điền thông tin và tải lên file scan ở cột bên trái để nộp hồ sơ mới.
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

  // RENDER CREATE VIEW (ONLINE FORM)
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0 pt-4 animate-in slide-in-from-bottom-4">
        
        {/* LEFT: INPUTS (Styled like FinanceGuq) */}
        <div className="w-full lg:w-[400px] flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-2 rounded-t-xl sticky top-0 z-10">
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center">
                    <PenTool className="mr-2 text-slate-500" size={20} /> Soạn thảo CVHC
                </h3>
            </div>
            
            <div className="space-y-4 pb-10">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tên công ty (*)</label>
                    <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.companyName} onChange={(e) => setCvhcCreateData({...cvhcCreateData, companyName: e.target.value})} placeholder="Công ty..." />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngày thanh toán</label>
                        <input type="date" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.paymentDate} onChange={(e) => setCvhcCreateData({...cvhcCreateData, paymentDate: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số tiền hoàn</label>
                        <input type="number" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.amount} onChange={handleCvhcAmountChange} placeholder="VNĐ" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Bằng chữ</label>
                    <div className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-xs italic text-slate-500 min-h-[46px] flex items-center">
                        {cvhcCreateData.amountInWords || '...'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số HBL</label>
                        <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm uppercase focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.hbl} onChange={(e) => setCvhcCreateData({...cvhcCreateData, hbl: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số Container</label>
                        <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm uppercase focus:ring-2 focus:ring-slate-300 transition-all" placeholder="TCLU..." value={cvhcCreateData.containerNo} onChange={(e) => setCvhcCreateData({...cvhcCreateData, containerNo: e.target.value})} />
                    </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Thông tin thụ hưởng</label>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Người thụ hưởng (*)</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm uppercase focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.beneficiary} onChange={(e) => setCvhcCreateData({...cvhcCreateData, beneficiary: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số tài khoản (*)</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-mono font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.accountNumber} onChange={(e) => setCvhcCreateData({...cvhcCreateData, accountNumber: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tại ngân hàng</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={cvhcCreateData.bank} onChange={(e) => setCvhcCreateData({...cvhcCreateData, bank: e.target.value})} />
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
    </div>
  );
};

export default FinanceCvhc;

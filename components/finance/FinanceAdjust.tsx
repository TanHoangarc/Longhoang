
import React, { useState, useEffect } from 'react';
import { Search, Printer, Download, Save, X, PenTool, Eye, RefreshCcw, CheckSquare, Square, Stamp, FileSignature, CheckCircle, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';

// Define locally to avoid Circular Dependency with App.tsx
interface AdjustmentRecord {
  id: number;
  bl: string;
  date: string;
  status: 'Signed' | 'Unsigned';
  fileName: string;
}

interface AdjustFormData {
    companyB: string;
    address: string;
    taxId: string;
    representative: string;
    position: string;
    invoiceNo: string;
    invoiceDate: string;
    reason: string;
    // New fields to match the image requirements
    templateNo?: string;
    symbol?: string;
}

interface FinanceAdjustProps {
    adjustments?: AdjustmentRecord[];
    onAddAdjustment?: (record: AdjustmentRecord) => void;
    mode?: 'lookup' | 'create';
}

const FinanceAdjust: React.FC<FinanceAdjustProps> = ({ adjustments = [], onAddAdjustment, mode = 'lookup' }) => {
  const [blSearch, setBlSearch] = useState('');
  const [status, setStatus] = useState<'idle' | 'found' | 'not_found' | 'create'>('idle');
  const [foundAdjustments, setFoundAdjustments] = useState<AdjustmentRecord[]>([]);
  const [signType, setSignType] = useState<'digital' | 'wet'>('digital'); // Trạng thái hình thức ký
  const [isSigning, setIsSigning] = useState(false); // Trạng thái đang ký (loading)
  const [generatedReportNo, setGeneratedReportNo] = useState(''); // Store report number to prevent re-render flickering
  const [sequenceNumber, setSequenceNumber] = useState(1); // Counter for sequential report numbers
  
  const [formData, setFormData] = useState<AdjustFormData>({
      companyB: '',
      address: '',
      taxId: '',
      representative: '',
      position: '',
      invoiceNo: '',
      invoiceDate: '',
      reason: '',
      templateNo: '1',
      symbol: 'C25TYY'
  });

  // Sync mode prop
  useEffect(() => {
      if (mode === 'lookup') {
          setStatus('idle');
          setBlSearch('');
      } else if (mode === 'create') {
          handleCreate();
      }
  }, [mode]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!blSearch.trim()) return;
      
      const results = adjustments.filter(a => (a.bl || '').toLowerCase().includes(blSearch.toLowerCase()));
      if (results.length > 0) {
          setFoundAdjustments(results);
          setStatus('found');
      } else {
          setStatus('not_found');
          setFoundAdjustments([]);
      }
  };

  const handleCreate = () => {
      // Generate sequential report number: BBDC00001/2026
      const reportId = `BBDC${sequenceNumber.toString().padStart(5, '0')}/2026`;
      setGeneratedReportNo(reportId);
      setSequenceNumber(prev => prev + 1); // Increment for the next report
      setStatus('create');
  };

  const handleBackToSearch = () => {
      setStatus('idle');
      setBlSearch('');
  };

  // Hàm giả lập mở chữ ký số
  const handleTriggerSign = () => {
      if (signType !== 'digital') return;
      
      setIsSigning(true);
      // Giả lập delay mở phần mềm ký số (Token)
      setTimeout(() => {
          setIsSigning(false);
          alert('Hệ thống đang mở Plugin ký số (USB Token)...\nVui lòng chọn chứng thư số để ký.');
      }, 1500);
  };

  const handleSaveAndPrint = () => {
      if (onAddAdjustment) {
          const newRecord: AdjustmentRecord = {
              id: Date.now(),
              bl: generatedReportNo, // Use generatedReportNo as the identifier
              date: new Date().toLocaleDateString('en-GB'),
              status: signType === 'digital' ? 'Signed' : 'Unsigned',
              fileName: `BB_Adjust_${generatedReportNo.replace(/\//g, '-')}.pdf`
          };
          onAddAdjustment(newRecord);
          alert('Biên bản đã được lưu vào hệ thống quản lý.');
      }
      window.print();
  };

  const formatPreviewDate = (dateStr: string) => {
      if (!dateStr) return '.../.../......';
      const parts = dateStr.split('-'); // Expects YYYY-MM-DD
      if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
  };

  // LOOKUP VIEW
  if (status !== 'create') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
            
            {/* LEFT COLUMN: Inputs */}
            <div className="flex flex-col space-y-6 pt-4">
                <form onSubmit={handleSearch} className="w-full">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Nhập số biên bản (VD: BBDC00001)..." 
                            className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all uppercase"
                            value={blSearch}
                            onChange={(e) => { setBlSearch(e.target.value); setStatus('idle'); }}
                        />
                    </div>
                </form>

                <button 
                    onClick={handleSearch}
                    className="w-full sm:w-auto px-10 py-4 bg-[#5f8087] hover:bg-[#4a6b74] text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-slate-300 self-start"
                >
                    Kiểm tra
                </button>

                {/* Conditional Create Button when Not Found */}
                {status === 'not_found' && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Không tìm thấy dữ liệu?</p>
                        <button 
                            onClick={handleCreate}
                            className="w-full px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center"
                        >
                            <PenTool size={18} className="mr-2" /> Lập biên bản mới
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: Result Card */}
            <div className="relative">
                <div className="bg-[#5f8087] rounded-[2.5rem] p-10 h-full min-h-[450px] flex flex-col text-white relative overflow-hidden shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">Kết quả tra cứu</h2>
                    
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {status === 'idle' && (
                            <div className="text-white/60">
                                <p className="text-sm leading-relaxed mb-4">
                                    Nhập số biên bản vào ô bên trái để kiểm tra tình trạng ký số hoặc tải về bản lưu trữ.
                                </p>
                                <p className="text-sm leading-relaxed">
                                    Hệ thống lưu trữ các biên bản điều chỉnh hóa đơn điện tử.
                                </p>
                            </div>
                        )}

                        {status === 'found' && foundAdjustments.length > 0 && (
                            <div className="animate-in zoom-in duration-300 space-y-6">
                                <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Tìm Thấy {foundAdjustments.length} Biên Bản</h3>
                                    </div>
                                    <p className="text-white/80 text-sm">Biên bản đã được lưu trên hệ thống.</p>
                                </div>
                                
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {foundAdjustments.map((item, idx) => (
                                        <div key={item.id} className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-mono font-bold text-lg">{item.bl}</span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${item.status === 'Signed' ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                    {item.status === 'Signed' ? 'Đã ký' : 'Chưa ký'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-white/80 mb-3">
                                                <span>Ngày lập: {item.date}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition">
                                                    <Eye size={14} className="mr-1"/> Xem
                                                </button>
                                                <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-xl text-xs font-bold flex items-center justify-center transition">
                                                    <Download size={14} className="mr-1"/> Tải về
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {status === 'not_found' && (
                            <div className="animate-in zoom-in duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <AlertTriangle className="text-white mr-2" size={24} />
                                        <h3 className="text-xl font-bold">Chưa Tìm Thấy</h3>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">
                                        Hệ thống chưa có dữ liệu cho số biên bản này. <br/>
                                        Vui lòng nhấn nút "Lập biên bản mới" bên trái để tạo hồ sơ.
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
        
        {/* LEFT: INPUTS (Styled like FinanceGuq) */}
        <div className="w-full lg:w-[400px] flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-2 rounded-t-xl sticky top-0 z-10 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center">
                    <PenTool className="mr-2 text-slate-500" size={20} /> Soạn thảo Biên bản
                </h3>
                <button onClick={handleBackToSearch} className="text-xs text-slate-400 hover:text-primary underline font-bold">Tra cứu</button>
            </div>
            
            <div className="space-y-4 pb-10">
                
                {/* Section: Company B Info */}
                <div className="pt-2">
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Thông tin Bên B (Mua)</label>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tên công ty (*)</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.companyB} onChange={(e) => setFormData({...formData, companyB: e.target.value})} placeholder="Tên công ty..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Địa chỉ</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mã số thuế</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Đại diện</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.representative} onChange={(e) => setFormData({...formData, representative: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Chức vụ</label>
                            <input 
                                type="text" 
                                list="position-list"
                                className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" 
                                value={formData.position} 
                                onChange={(e) => setFormData({...formData, position: e.target.value})} 
                                placeholder="Giám đốc..."
                            />
                            <datalist id="position-list">
                                <option value="Tổng giám đốc" />
                                <option value="Giám Đốc" />
                                <option value="Phó Giám Đốc" />
                            </datalist>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200 my-2"></div>

                {/* Section: Invoice Info */}
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Thông tin Hóa đơn</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số hóa đơn</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.invoiceNo} onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngày hóa đơn</label>
                                <input type="date" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mẫu số</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.templateNo} onChange={(e) => setFormData({...formData, templateNo: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ký hiệu</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all uppercase" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Lý do điều chỉnh (*)</label>
                            <textarea className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all h-24 pt-3" placeholder="VD: Sai tên hàng hóa..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                        </div>
                    </div>
                </div>

                {/* Signature Toggle */}
                <div className="flex gap-4 p-1 bg-[#dce5eb] rounded-[1.5rem]">
                    <button 
                        onClick={() => setSignType('digital')}
                        className={`flex-1 py-3 rounded-[1.2rem] text-xs font-bold transition flex items-center justify-center ${signType === 'digital' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <FileSignature size={14} className="mr-1" /> Ký điện tử
                    </button>
                    <button 
                        onClick={() => setSignType('wet')}
                        className={`flex-1 py-3 rounded-[1.2rem] text-xs font-bold transition flex items-center justify-center ${signType === 'wet' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Stamp size={14} className="mr-1" /> Ký mộc
                    </button>
                </div>

                <button onClick={handleSaveAndPrint} className="w-full bg-[#1e2a3b] hover:bg-black text-white py-4 rounded-[1.5rem] font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center mt-4">
                    <Printer size={18} className="mr-2" /> Lưu & In Biên Bản
                </button>
            </div>
        </div>

        {/* RIGHT: LIVE PREVIEW (A4) */}
        <div className="flex-1 bg-slate-100 rounded-[2rem] p-8 overflow-y-auto border border-slate-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
            <div 
                className="bg-white w-full max-w-[210mm] shadow-2xl p-[20mm_20mm] min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0 flex flex-col"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
                {/* Header Title */}
                <div className="text-center mb-6">
                    <h1 className="text-[18px] font-bold uppercase mb-2">BIÊN BẢN ĐIỀU CHỈNH HÓA ĐƠN</h1>
                    <p className="text-[14px] italic border-b border-dotted border-gray-400 inline-block px-12">Số biên bản: {generatedReportNo}</p>
                </div>

                {/* Legal Bases - Italic */}
                <div className="space-y-1 text-[13px] italic mb-6 text-justify">
                    <p>- Căn cứ Nghị định 123/2020/NĐ-CP ngày 19/10/2020 của Chính phủ quy định về hóa đơn, chứng từ.</p>
                    <p>- Căn cứ Nghị định 70/2025/NĐ-CP ngày 20/03/2025 của Chính phủ sửa đổi, bổ sung một số điều của Nghị định 123/2020/NĐ-CP ngày 19/10/2020 của Chính phủ quy định về hóa đơn, chứng từ.</p>
                    <p>- Căn cứ Thông tư 32/2025/TT-BTC ngày 31/05/2025 của Bộ Tài chính hướng dẫn thực hiện Nghị định số 123/2020/NĐ-CP ngày 19/10/2020 của Chính phủ quy định về hóa đơn, chứng từ, Nghị định số 70/2025/NĐ-CP ngày 20/03/2025 sửa đổi, bổ sung một số điều Nghị định số 123/2020/NĐ-CP.</p>
                    <p>- Căn cứ vào thỏa thuận giữa các bên.</p>
                </div>

                <div className="border-t border-dotted border-gray-400 mb-6"></div>

                {/* Date Line */}
                <p className="mb-6 text-[14px]">Hôm nay, ngày <span className="font-bold underline">{new Date().getDate().toString().padStart(2, '0')}</span> tháng <span className="font-bold underline">{(new Date().getMonth() + 1).toString().padStart(2, '0')}</span> năm <span className="font-bold underline">{new Date().getFullYear()}</span> chúng tôi gồm có:</p>

                {/* Party A */}
                <div className="mb-6 text-[13px]">
                    <div className="flex mb-3">
                        <span className="font-bold w-[120px] shrink-0">Bên A (Bên bán):</span>
                        <span className="font-bold uppercase">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span>
                    </div>
                    <div className="flex mb-2">
                        <span className="w-[120px] shrink-0">Địa chỉ:</span>
                        <span>Số 132 – 134 Đường Nguyễn Gia Trí, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh, Việt Nam</span>
                    </div>
                    <div className="flex gap-8 mb-2">
                        <div className="flex flex-1">
                            <span className="w-[120px] shrink-0">Mã số thuế:</span>
                            <span>0316113070</span>
                        </div>
                        <div className="flex flex-1">
                            <span className="w-[100px] shrink-0">Số điện thoại:</span>
                            <span>02873042677</span>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-1">
                            <span className="w-[120px] shrink-0">Đại diện:</span>
                            <span className="font-bold uppercase">NGUYỄN THỊ KIỀU DIỄM</span>
                        </div>
                        <div className="flex flex-1">
                            <span className="w-[100px] shrink-0">Chức vụ:</span>
                            <span className="font-bold uppercase">GIÁM ĐỐC</span>
                        </div>
                    </div>
                </div>

                {/* Party B */}
                <div className="mb-6 text-[13px]">
                    <div className="flex mb-3">
                        <span className="font-bold w-[120px] shrink-0">Bên B (Bên mua):</span>
                        <span className="font-bold uppercase">{formData.companyB || '................................................................'}</span>
                    </div>
                    <div className="flex mb-2">
                        <span className="w-[120px] shrink-0">Địa chỉ:</span>
                        <span>{formData.address || '................................................................'}</span>
                    </div>
                    <div className="flex gap-8 mb-2">
                        <div className="flex flex-1">
                            <span className="w-[120px] shrink-0">Mã số thuế:</span>
                            <span>{formData.taxId || '....................'}</span>
                        </div>
                        <div className="flex flex-1">
                            <span className="w-[100px] shrink-0">Số điện thoại:</span>
                            <span className="border-b border-dotted border-gray-400 w-full inline-block"></span>
                        </div>
                    </div>
                    <div className="flex gap-8">
                        <div className="flex flex-1">
                            <span className="w-[120px] shrink-0">Đại diện:</span>
                            <span className="font-bold uppercase">{formData.representative || '....................'}</span>
                        </div>
                        <div className="flex flex-1">
                            <span className="w-[100px] shrink-0">Chức vụ:</span>
                            <span className="font-bold capitalize">{formData.position || '....................'}</span>
                        </div>
                    </div>
                </div>

                <p className="text-[13px] mb-4 text-justify">Hai bên thống nhất lập biên bản này để điều chỉnh hóa đơn theo quy định.</p>

                {/* Invoice Info Line */}
                <div className="text-[13px] border-b border-dotted border-gray-400 pb-1 mb-6 flex items-center flex-wrap">
                    <span className="font-bold mr-2">Hóa đơn bị điều chỉnh:</span>
                    <span className="mr-1">Mẫu số</span>
                    <span className="font-bold mr-2">{formData.templateNo || '1'}</span>, 
                    <span className="mx-1">ký hiệu</span>
                    <span className="font-bold mr-2">{formData.symbol || 'C25TYY'}</span>, 
                    <span className="mx-1">số</span>
                    <span className="font-bold text-blue-600 mr-2">{formData.invoiceNo || '00000000'}</span>, 
                    <span className="mx-1">ngày</span>
                    <span className="font-bold">{formatPreviewDate(formData.invoiceDate)}</span>
                </div>

                {/* Reason Box */}
                <div className="flex mb-4 text-[13px]">
                    <span className="font-bold w-[120px] shrink-0 pt-2">Lý do điều chỉnh:</span>
                    <div className="w-full min-h-[60px] p-2 border border-gray-200 rounded italic bg-gray-50/50">
                        {formData.reason || '................................................................................................'}
                    </div>
                </div>

                <p className="text-[13px] font-bold mb-8">Chúng tôi cam kết và hoàn toàn chịu trách nhiệm về việc điều chỉnh hóa đơn này.</p>

                {/* Signatures */}
                <div className="flex justify-between px-4 mt-auto mb-12">
                    <div className="text-center w-1/2 flex flex-col items-center">
                        <p className="font-bold text-[13px] uppercase">ĐẠI DIỆN BÊN A</p>
                        <p className="italic text-[12px] mb-4">({signType === 'digital' ? 'Chữ ký số' : 'Ký tên, đóng dấu'})</p>
                        
                        {signType === 'digital' ? (
                            <div className="border-2 border-primary text-primary px-4 py-2 rounded mt-2 text-[11px] font-bold flex flex-col items-center opacity-80 min-w-[160px] min-h-[80px] justify-center">
                                <p className="uppercase text-[10px]">Digitally signed by</p>
                                <p className="uppercase text-[12px] my-1">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</p>
                                <p className="text-[9px]">Date: {new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                        ) : (
                            <div className="h-24"></div>
                        )}
                        
                        {signType === 'digital' && (
                            <div className="mt-4 flex flex-col items-center gap-2 print:hidden">
                                <button 
                                    onClick={handleTriggerSign}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded text-xs font-bold flex items-center transition"
                                    disabled={isSigning}
                                >
                                    <PenTool size={12} className="mr-1" /> 
                                    {isSigning ? 'Đang kết nối Token...' : 'Ký điện tử'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="text-center w-1/2 flex flex-col items-center">
                        <p className="font-bold text-[13px] uppercase">ĐẠI DIỆN BÊN B</p>
                        <p className="italic text-[12px] mb-4">({signType === 'digital' ? 'Chữ ký số' : 'Ký tên, đóng dấu'})</p>
                        
                        {signType === 'digital' ? (
                            <div className="border-2 border-gray-400 text-gray-400 px-4 py-2 rounded mt-2 text-[11px] font-bold flex flex-col items-center opacity-50 min-w-[160px] min-h-[80px] justify-center border-dashed">
                                <p className="uppercase text-[10px] mb-1">Chờ ký số...</p>
                                <p className="uppercase text-[12px] my-1">{formData.companyB || 'TÊN CÔNG TY B'}</p>
                            </div>
                        ) : (
                            <div className="h-24"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FinanceAdjust;

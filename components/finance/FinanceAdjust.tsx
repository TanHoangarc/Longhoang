
import React, { useState } from 'react';
import { Search, Printer, Download, Save, X, PenTool, Eye, RefreshCcw, CheckSquare, Square, Stamp, FileSignature } from 'lucide-react';
import { AdjustmentRecord } from '../../App';

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
}

const FinanceAdjust: React.FC<FinanceAdjustProps> = ({ adjustments = [], onAddAdjustment }) => {
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

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!blSearch.trim()) return;
      
      const results = adjustments.filter(a => a.bl.toLowerCase().includes(blSearch.toLowerCase()));
      if (results.length > 0) {
          setFoundAdjustments(results);
          setStatus('found');
      } else {
          setStatus('not_found');
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
              bl: formData.invoiceNo || generatedReportNo,
              date: new Date().toLocaleDateString('en-GB'),
              status: signType === 'digital' ? 'Signed' : 'Unsigned',
              fileName: `BB_Adjust_${generatedReportNo.replace(/\//g, '-')}.pdf`
          };
          onAddAdjustment(newRecord);
          alert('Biên bản đã được lưu vào hệ thống quản lý.');
      }
      window.print();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {status !== 'create' && (
            <div className="space-y-6">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        className="w-full pl-4 pr-32 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary transition" 
                        placeholder="Nhập số BL..." 
                        value={blSearch} 
                        onChange={(e) => { setBlSearch(e.target.value); setStatus('idle'); }} 
                    />
                    <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition">KIỂM TRA</button>
                </form>

                {status === 'found' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                                <tr><th className="px-6 py-4">Số BL</th><th className="px-6 py-4">Ngày lập</th><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4 text-right">Thao tác</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {foundAdjustments.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-mono text-sm font-bold text-gray-700">{item.bl}</td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.status === 'Signed' ? 'Đã ký điện tử' : 'Chưa ký'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button className="text-gray-400 hover:text-primary transition" title="Xem trước">
                                                <Eye size={18} />
                                            </button>
                                            <button className="text-gray-400 hover:text-blue-500 transition" title="Tải xuống">
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {status === 'not_found' && (
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 font-bold mb-4">Không tìm thấy biên bản nào cho số BL này.</p>
                        <button 
                            onClick={handleCreate}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primaryDark transition flex items-center"
                        >
                            <PenTool size={18} className="mr-2" /> Lập biên bản mới
                        </button>
                    </div>
                )}
            </div>
        )}

        {status === 'create' && (
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 flex-grow">
                {/* LEFT: LIVE PREVIEW (A4) */}
                <div className="flex-1 bg-gray-200/50 rounded-xl p-8 overflow-y-auto border border-gray-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
                    <div 
                        className="bg-white w-full max-w-[210mm] shadow-xl p-[20mm_20mm] min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0 flex flex-col"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        {/* Header Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-[18px] font-bold uppercase mb-2">BIÊN BẢN ĐIỀU CHỈNH HÓA ĐƠN</h1>
                            <p className="text-[14px] italic border-b border-dotted border-gray-400 inline-block px-12">Số biên bản: {generatedReportNo}</p>
                        </div>

                        {/* Legal Bases - Italic */}
                        <div className="space-y-1 text-[13px] italic mb-6">
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

                        <p className="text-[13px] mb-4">Hai bên thống nhất lập biên bản này để điều chỉnh hóa đơn theo quy định.</p>

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
                            <span className="font-bold">{formData.invoiceDate ? new Date(formData.invoiceDate).toLocaleDateString('en-GB') : '.../.../......'}</span>
                        </div>

                        {/* Reason Box */}
                        <div className="flex mb-4 text-[13px]">
                            <span className="font-bold w-[120px] shrink-0 pt-2">Lý do điều chỉnh:</span>
                            <div className="w-full h-[60px] p-2">
                                {formData.reason}
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

                {/* RIGHT: INPUTS */}
                <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-xl print:hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 flex items-center"><PenTool size={16} className="mr-2" /> Thông tin Bên B & Hóa đơn</h4>
                        <button onClick={handleBackToSearch} className="text-xs text-gray-500 hover:text-primary underline">Quay lại tìm kiếm</button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Công ty Bên B (*)</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.companyB} onChange={(e) => setFormData({...formData, companyB: e.target.value})} placeholder="Tên công ty..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Địa chỉ</label>
                            <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Mã số thuế</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Đại diện</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.representative} onChange={(e) => setFormData({...formData, representative: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Chức vụ</label>
                            <input 
                                type="text" 
                                list="position-list"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" 
                                value={formData.position} 
                                onChange={(e) => setFormData({...formData, position: e.target.value})} 
                                placeholder="Chọn hoặc nhập..."
                            />
                            <datalist id="position-list">
                                <option value="Tổng giám đốc" />
                                <option value="Giám Đốc" />
                                <option value="Phó Giám Đốc" />
                            </datalist>
                        </div>
                        
                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Số hóa đơn</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={formData.invoiceNo} onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Ngày hóa đơn</label>
                                <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.invoiceDate} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Mẫu số</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition" value={formData.templateNo} onChange={(e) => setFormData({...formData, templateNo: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase">Ký hiệu</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition uppercase" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Lý do điều chỉnh (*)</label>
                            <textarea className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm focus:border-primary transition h-24" placeholder="VD: Sai tên hàng hóa..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}></textarea>
                        </div>

                        {/* Signature Type Toggle */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Hình thức ký biên bản</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSignType('digital')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${signType === 'digital' ? 'bg-white border border-primary text-primary shadow-sm' : 'bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200'}`}
                                >
                                    <FileSignature size={14} className="mr-1" /> Ký điện tử
                                </button>
                                <button 
                                    onClick={() => setSignType('wet')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center ${signType === 'wet' ? 'bg-white border border-primary text-primary shadow-sm' : 'bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200'}`}
                                >
                                    <Stamp size={14} className="mr-1" /> Ký mộc
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <button onClick={handleSaveAndPrint} className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                            <Printer size={18} className="mr-2" /> Lưu & In Biên Bản
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FinanceAdjust;

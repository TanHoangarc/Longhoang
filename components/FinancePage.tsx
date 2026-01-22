
import React, { useState } from 'react';
import { ArrowLeft, FileText, RefreshCw, CreditCard, PenTool, Info, ChevronDown } from 'lucide-react';
// Use type import to avoid circular dependency
import type { GUQRecord, UserAccount, AdjustmentRecord, CVHCRecord, CVHTRecord } from '../App';
import FinanceGuq from './finance/FinanceGuq';
import FinanceCvhc from './finance/FinanceCvhc';
import FinanceCvht from './finance/FinanceCvht';
import FinanceAdjust from './finance/FinanceAdjust';

interface FinancePageProps {
  onClose: () => void;
  guqRecords: GUQRecord[];
  onUpdateGuq: (records: GUQRecord[]) => void;
  cvhcRecords?: CVHCRecord[];
  cvhtRecords?: CVHTRecord[];
  currentUser: UserAccount | null;
  adjustments?: AdjustmentRecord[];
  onAddAdjustment?: (record: AdjustmentRecord) => void;
}

type TabType = 'GUQ' | 'CVHC' | 'CVHT' | 'ADJUST' | 'INTRO';
type ActionType = 'lookup' | 'create';

const FinanceIntro = () => (
  <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-lg shadow-slate-200/50 border border-slate-100 rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-full mb-4">
          <Info size={32} />
      </div>
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">Quy Định & Hướng Dẫn Tài Chính Kimberry</h2>
      <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
      <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm">
          Vui lòng đọc kỹ các quy định dưới đây về quy trình thanh toán, hoàn cược và xuất hóa đơn để đảm bảo quyền lợi của Quý khách hàng.
      </p>
    </div>
    
    <div className="space-y-8 text-slate-700 text-sm leading-relaxed">
      {/* Section 1 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">1</div>
        <div className="pt-2">
          <p>Mọi yêu cầu liên quan đến hàng nhập, khách hàng vui lòng <span className="font-bold text-blue-700">reply all</span> email gửi thông báo hàng đến của KML và không bỏ bất kỳ email nào của KML khỏi email đang làm việc để đảm bảo yêu cầu của khách hàng được gửi đến nhân viên phụ trách.</p>
        </div>
      </div>

      {/* Section 2 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">2</div>
        <div className="pt-2">
          <p>Kimberry sử dụng <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">lệnh giấy</span> đối với hàng nhập về HPH, <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">EDO</span> đối với hàng nhập về HCM.</p>
        </div>
      </div>

      {/* Section 3 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">3</div>
        <div className="w-full pt-2">
          <p className="mb-3 font-bold text-slate-900">Mức cược container:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hàng nhập về HPH</p>
                  <p className="font-bold text-slate-800">3,000,000 VND <span className="text-slate-400 font-normal">/ 20GP</span></p>
                  <p className="font-bold text-slate-800">6,000,000 VND <span className="text-slate-400 font-normal">/ 40HQ</span></p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hàng nhập về HCM</p>
                  <p className="font-bold text-slate-800">1,000,000 VND <span className="text-slate-400 font-normal">/ 20GP</span></p>
                  <p className="font-bold text-slate-800">2,000,000 VND <span className="text-slate-400 font-normal">/ 40HQ</span></p>
              </div>
          </div>
          <p className="italic text-slate-500 mt-2 text-xs pl-1">* Với các lô hàng miễn cược, KML sẽ thông báo trực tiếp trên email gửi AN.</p>
        </div>
      </div>

      {/* Section 4 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">4</div>
        <div className="w-full pt-2">
          <p className="mb-4">Tài khoản nhận cược, tài khoản nhận thanh toán LCC như dưới đây. Khách hàng vui lòng <span className="font-bold text-red-500 underline decoration-red-200 underline-offset-4">tách riêng LCC và cược container</span>. Khách hàng chỉ thanh toán theo tài khoản này và không thanh toán theo tài khoản trên hóa đơn.</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
             <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-y-3 gap-x-4 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center">Beneficiary</span>
                <span className="font-bold uppercase text-blue-900 text-sm md:text-base">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span>
                
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center">Account No</span>
                <span className="font-mono font-black text-2xl text-blue-600 tracking-wider">345673979999</span>
                
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider self-center">Bank</span>
                <span className="font-bold text-slate-800">MB BANK - CHI NHÁNH HCM</span>
             </div>
          </div>
        </div>
      </div>

      {/* Section 5 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">5</div>
        <div className="w-full pt-2">
          <p className="font-bold mb-3 text-slate-900">Hồ sơ hoàn cược:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <p className="font-bold text-xs uppercase text-blue-600 mb-2 flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Hàng về Hải Phòng (HPH)</p>
                <p className="text-slate-600">Phơi phiếu nâng hạ bản gốc, công văn hoàn cược, UNC cược cont.</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs italic text-slate-400">Gửi về văn phòng KML Hải Phòng.</p>
                </div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <p className="font-bold text-xs uppercase text-green-600 mb-2 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Hàng về Hồ Chí Minh (HCM)</p>
                <p className="text-slate-600">Bản scan công văn hoàn cược, bản scan phiếu nâng/hạ, UNC cược.</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1">
                    <a href="mailto:doc_hph@kimberryline.com" className="text-xs text-blue-500 hover:underline font-medium">doc_hph@kimberryline.com</a>
                    <a href="mailto:fin_vn@kimberryline.com" className="text-xs text-blue-500 hover:underline font-medium">fin_vn@kimberryline.com</a>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Section 6 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">6</div>
        <div className="pt-2">
            <p>Quý khách vui lòng kiểm tra cẩn thận các phí <span className="font-bold text-red-500">LOCAL CHARGE</span> trên AN/HÓA ĐƠN NHÁP trước khi báo xuất hóa đơn. KIMBERY sẽ không giải quyết những vấn đề hủy hóa đơn khi đã có sự xác nhận từ khách hàng.</p>
        </div>
      </div>

      {/* Section 7 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">7</div>
        <div className="pt-2">
            <p>Vui lòng xem kỹ AN (Số cont // Loại cont // T. Lượng // K. Lượng // Cảng đi // Cảng đến...) nếu có sai khác, đề nghị khách hàng phản hồi lại bằng cách reply email gửi thông báo hàng đến.</p>
        </div>
      </div>

      {/* Section 8 */}
      <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white rounded-full flex items-center justify-center font-bold transition-colors duration-300">8</div>
        <div className="w-full pt-2">
           <p className="mb-2"><span className="font-bold text-slate-900">Để nhận hóa đơn thanh toán:</span> Khách hàng reply email Thông báo hàng đến, đính kèm AN + cung cấp thông tin xuất hóa đơn và add các email sau:</p>
           <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-mono text-xs">acchph@longhoanglogistics.com</span>
              <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-mono text-xs">fin_vn@kimberryline.com</span>
           </div>
           <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                <p className="font-bold text-red-600 text-xs uppercase">Khách hàng xác nhận hóa đơn nháp để bộ phận kế toán gửi hóa đơn chính thức.</p>
           </div>
        </div>
      </div>

    </div>
  </div>
);

const FinancePage: React.FC<FinancePageProps> = ({ onClose, guqRecords, onUpdateGuq, cvhcRecords, cvhtRecords, currentUser, adjustments, onAddAdjustment }) => {
  const [activeTab, setActiveTab] = useState<TabType>('INTRO');
  const [subAction, setSubAction] = useState<ActionType>('lookup');

  const tabs = [
    { id: 'GUQ', label: 'Giấy Ủy Quyền', icon: FileText, hasSub: false },
    { id: 'CVHC', label: 'Hoàn Cược', icon: RefreshCw, hasSub: true, subLabelCreate: 'Lập CVHC' },
    { id: 'CVHT', label: 'Hoàn Tiền', icon: CreditCard, hasSub: true, subLabelCreate: 'Lập CVHT' },
    { id: 'ADJUST', label: 'Điều Chỉnh HĐ', icon: PenTool, hasSub: true, subLabelCreate: 'Lập Biên bản' },
  ];

  const handleTabClick = (tabId: string) => {
      setActiveTab(tabId as TabType);
      setSubAction('lookup'); // Reset to default lookup when clicking main tab
  };

  const handleSubClick = (e: React.MouseEvent, tabId: string, action: ActionType) => {
      e.stopPropagation();
      setActiveTab(tabId as TabType);
      setSubAction(action);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'INTRO':
        return <FinanceIntro />;
      case 'GUQ':
        return <FinanceGuq guqRecords={guqRecords} onUpdateGuq={onUpdateGuq} currentUser={currentUser} />;
      case 'CVHC':
        return <FinanceCvhc mode={subAction} records={cvhcRecords || []} />;
      case 'CVHT':
        return <FinanceCvht mode={subAction} records={cvhtRecords || []} />;
      case 'ADJUST':
        return <FinanceAdjust adjustments={adjustments || []} onAddAdjustment={onAddAdjustment} mode={subAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 relative">
      
      {/* 1. TOP BACKGROUND SECTION (Blue-gray) - Fixed Height */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-[#dce5eb] z-0">
          {/* Decorative Arrows (Top Left) */}
          <div className="absolute top-12 left-10 opacity-20 hidden md:block">
              <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 border-t-2 border-r-2 border-slate-900 transform rotate-45"></div>
                  ))}
              </div>
          </div>
          {/* Decorative Arrows (Bottom Right of colored section) */}
          <div className="absolute bottom-20 right-10 opacity-20 hidden md:block">
              <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 border-t-2 border-r-2 border-slate-900 transform rotate-45"></div>
                  ))}
              </div>
          </div>
      </div>

      {/* 2. HEADER CONTENT (Fixed Height 450px to push flow down) */}
      <div className="relative z-10 h-[450px] flex flex-col justify-center items-center text-center px-6">
         {/* Back Button */}
         <button 
            onClick={onClose} 
            className="absolute left-6 top-10 group flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm"
         >
            <div className="w-8 h-8 rounded-full bg-white/50 border border-slate-300 flex items-center justify-center mr-2 shadow-sm group-hover:bg-white">
                <ArrowLeft size={16} />
            </div>
            Back
         </button>

         <div className="mt-8">
             <h1 className="text-6xl md:text-7xl font-black text-black tracking-tight mb-4">Finance</h1>
             
             {/* Wavy Line Decoration */}
             <div className="flex justify-center mb-6 opacity-60">
                <svg width="80" height="15" viewBox="0 0 80 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 7.5C12 7.5 12 2.5 22 2.5C32 2.5 32 7.5 42 7.5C52 7.5 52 2.5 62 2.5C72 2.5 72 7.5 82 7.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
             </div>

             <p className="text-slate-500 font-medium text-xs md:text-sm max-w-lg mx-auto leading-relaxed uppercase tracking-wider">
                Hệ thống xử lý nghiệp vụ tài chính chuyên nghiệp
             </p>
         </div>
      </div>

      {/* 3. NAVIGATION BAR (Flush Left, Vertically Centered on Division Line) */}
      {/* -translate-y-1/2 pulls it up by 50% of its height. Since it starts after the 450px header, it sits exactly on the line. */}
      <div className="relative z-30 transform -translate-y-1/2">
         <div className="inline-flex bg-white rounded-r-[3rem] py-4 pl-8 pr-16 border-t border-r border-slate-100 shadow-sm relative">
             <div className="flex items-center gap-4">
                {tabs.map((tab) => (
                  <div key={tab.id} className="relative group">
                      <button 
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-black text-xs md:text-sm uppercase tracking-widest transition-all duration-300 border-b-2 ${
                            activeTab === tab.id 
                            ? 'text-slate-900 border-slate-900' 
                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200'
                        }`}
                      >
                          <tab.icon size={18} className={activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'} />
                          {tab.label}
                          {tab.hasSub && <ChevronDown size={12} className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />}
                      </button>
                      
                      {/* Submenu Dropdown on Hover */}
                      {tab.hasSub && (
                          <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden flex flex-col py-1">
                                  <button 
                                    onClick={(e) => handleSubClick(e, tab.id, 'lookup')}
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center"
                                  >
                                      <SearchIcon className="mr-2" size={14} /> Tra cứu
                                  </button>
                                  <div className="h-px bg-slate-50 mx-2"></div>
                                  <button 
                                    onClick={(e) => handleSubClick(e, tab.id, 'create')}
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors flex items-center"
                                  >
                                      <PlusIcon className="mr-2" size={14} /> {tab.subLabelCreate}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
                ))}
             </div>
         </div>
      </div>

      {/* 4. MAIN CONTENT AREA (White Background) */}
      <div className="relative z-20 bg-white min-h-[500px]">
         <div className="container mx-auto px-4 md:px-20 pb-16">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                {renderContent()}
            </div>
         </div>
      </div>

    </div>
  );
};

// Simple Icons for submenu
const SearchIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const PlusIcon = ({ className, size }: { className?: string, size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default FinancePage;

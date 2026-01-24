
import React, { useState } from 'react';
import { ArrowLeft, FileText, RefreshCw, CreditCard, PenTool, Info, ChevronDown, Search, Plus } from 'lucide-react';
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
    { id: 'GUQ', label: 'Giấy Ủy Quyền', icon: FileText, desc: 'Tra cứu & Cập nhật' },
    { id: 'CVHC', label: 'Hoàn Cược', icon: RefreshCw, hasSub: true, subLabelCreate: 'Lập CVHC', desc: 'Quản lý cược vỏ' },
    { id: 'CVHT', label: 'Hoàn Tiền', icon: CreditCard, hasSub: true, subLabelCreate: 'Lập CVHT', desc: 'Xử lý hoàn tiền' },
    { id: 'ADJUST', label: 'Điều Chỉnh HĐ', icon: PenTool, hasSub: true, subLabelCreate: 'Lập Biên bản', desc: 'Hóa đơn điện tử' },
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
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* 1. HERO SECTION */}
      <div className="relative h-[400px] w-full bg-[#111827] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
              <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2072&auto=format&fit=crop" 
                  alt="Finance Banner" 
                  className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center pb-16">
              <button 
                  onClick={onClose} 
                  className="absolute top-8 left-4 text-white/70 hover:text-white flex items-center transition group"
              >
                  <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20">
                      <ArrowLeft size={20} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">Back to Home</span>
              </button>

              <div className="max-w-3xl animate-in slide-in-from-bottom-8 duration-700">
                  <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                      Finance <span className="text-primary">Portal</span>
                  </h1>
                  <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                      Hệ thống quản lý tài chính tập trung. Tra cứu, lập hồ sơ và theo dõi trạng thái xử lý các nghiệp vụ tài chính Logistics.
                  </p>
              </div>
          </div>
      </div>

      {/* 2. NAVIGATION BAR (Taller -> Shorter by half) */}
      <div className="container mx-auto px-4 relative z-20 -mt-10">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 grid grid-cols-1 md:grid-cols-4 gap-1.5">
              {tabs.map((tab) => (
                  <div key={tab.id} className="relative group">
                      <button
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center p-2.5 rounded-lg transition-all duration-300 ${
                              activeTab === tab.id 
                              ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2' 
                              : 'bg-white hover:bg-gray-50 text-slate-600'
                          }`}
                      >
                          <div className={`p-2 rounded-lg mr-3 ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-slate-500 group-hover:text-primary group-hover:bg-orange-50'}`}>
                              <tab.icon size={20} />
                          </div>
                          <div className="text-left">
                              <span className={`block font-bold text-xs uppercase tracking-wider ${activeTab === tab.id ? 'text-white' : 'text-slate-800'}`}>{tab.label}</span>
                              <span className={`text-[10px] hidden md:block ${activeTab === tab.id ? 'text-white/80' : 'text-slate-400'}`}>{tab.desc}</span>
                          </div>
                          
                          {tab.hasSub && (
                              <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-50 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
                          )}
                      </button>

                      {/* Dropdown for Sub-actions (Hover) */}
                      {tab.hasSub && (
                          <div className="absolute left-0 right-0 top-full pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                                  <button 
                                      onClick={(e) => handleSubClick(e, tab.id, 'lookup')}
                                      className="w-full px-4 py-2 text-left text-[11px] font-bold text-slate-600 hover:bg-gray-50 hover:text-primary transition-colors flex items-center"
                                  >
                                      <Search size={12} className="mr-3 text-slate-400" /> Tra cứu
                                  </button>
                                  <div className="h-px bg-gray-50 mx-2"></div>
                                  <button 
                                      onClick={(e) => handleSubClick(e, tab.id, 'create')}
                                      className="w-full px-4 py-2 text-left text-[11px] font-bold text-slate-600 hover:bg-gray-50 hover:text-primary transition-colors flex items-center"
                                  >
                                      <Plus size={12} className="mr-3 text-slate-400" /> {tab.subLabelCreate}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="container mx-auto px-4 py-12 min-h-[500px]">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              {renderContent()}
          </div>
      </div>

    </div>
  );
};

export default FinancePage;

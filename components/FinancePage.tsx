
import React, { useState } from 'react';
import { X, RefreshCw, CreditCard, ClipboardEdit, FileSignature, ArrowRight, Phone, Landmark } from 'lucide-react';
// Use type import to avoid circular dependency
import type { GUQRecord, UserAccount, AdjustmentRecord } from '../App';
import FinanceGuq from './finance/FinanceGuq';
import FinanceCvhc from './finance/FinanceCvhc';
import FinanceCvht from './finance/FinanceCvht';
import FinanceAdjust from './finance/FinanceAdjust';

interface FinancePageProps {
  onClose: () => void;
  guqRecords: GUQRecord[];
  onUpdateGuq: (records: GUQRecord[]) => void;
  currentUser: UserAccount | null;
  adjustments?: AdjustmentRecord[];
  onAddAdjustment?: (record: AdjustmentRecord) => void;
}

type ModalType = 'GUQ' | 'CVHC' | 'CVHT' | 'ADJUST' | null;

const FinancePage: React.FC<FinancePageProps> = ({ onClose, guqRecords, onUpdateGuq, currentUser, adjustments, onAddAdjustment }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const renderModal = () => {
    if (!activeModal) return null;

    const modalTitle = {
      'GUQ': 'Quản lý Giấy ủy quyền',
      'CVHC': 'Nộp Công văn Hoàn cược',
      'CVHT': 'Lập Công văn Hoàn tiền',
      'ADJUST': 'Biên bản Điều chỉnh/Thay thế'
    }[activeModal];

    const modalWidth = activeModal === 'GUQ' ? 'max-w-2xl' : 'max-w-[1400px] h-[90vh]';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={() => setActiveModal(null)}></div>
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
            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 md:p-8 overflow-y-auto flex-grow print:p-0 print:overflow-visible">
            {activeModal === 'GUQ' && <FinanceGuq guqRecords={guqRecords} onUpdateGuq={onUpdateGuq} currentUser={currentUser} />}
            {activeModal === 'CVHC' && <FinanceCvhc />}
            {activeModal === 'CVHT' && <FinanceCvht />}
            {activeModal === 'ADJUST' && <FinanceAdjust adjustments={adjustments || []} onAddAdjustment={onAddAdjustment} />}
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

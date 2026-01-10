import React from 'react';
import { X, FileText, RefreshCw, CreditCard, ClipboardEdit } from 'lucide-react';

interface FinancePageProps {
  onClose: () => void;
}

const FinancePage: React.FC<FinancePageProps> = ({ onClose }) => {
  const features = [
    { title: 'Giấy ủy quyền', icon: FileText, desc: 'Lập và quản lý các loại giấy ủy quyền giao nhận hàng hóa.' },
    { title: 'Nộp CVHC (Hoàn cược)', icon: RefreshCw, desc: 'Gửi yêu cầu hoàn cược vỏ container và các phí liên quan.' },
    { title: 'Lập CVHT (Hoàn tiền)', icon: CreditCard, desc: 'Yêu cầu hoàn trả các khoản thanh toán thừa hoặc nhầm lẫn.' },
    { title: 'Biên bản điều chỉnh/thay thế', icon: ClipboardEdit, desc: 'Điều chỉnh thông tin hóa đơn hoặc thay thế chứng từ.' },
  ];

  return (
    <div className="min-h-[80vh] bg-white p-8 md:p-16">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Finance Dashboard</h2>
            <p className="text-gray-500">Chào mừng khách hàng trở lại. Chọn tính năng bạn cần thực hiện.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <f.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#1e2a3b] rounded-2xl p-10 text-white flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1">
             <h3 className="text-2xl font-bold mb-4">Hỗ trợ tài chính & Thanh toán</h3>
             <p className="text-gray-300">Nếu có thắc mắc về các quy trình hoàn cược hoặc điều chỉnh hóa đơn, vui lòng liên hệ bộ phận kế toán của chúng tôi.</p>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-primary font-bold text-xl">Hotline Kế toán</span>
             <span className="text-3xl font-extrabold">028 7303 2678</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
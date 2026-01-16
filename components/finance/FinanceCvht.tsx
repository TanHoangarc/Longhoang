
import React, { useState } from 'react';
import { PenTool, Printer } from 'lucide-react';
import { docTienBangChu } from './utils';

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

const FinanceCvht: React.FC = () => {
  const [cvhtData, setCvhtData] = useState<CvhtData>({
    companyName: '', taxId: '', address: '',
    paymentDate: '', amount: '', hbl: '',
    reason: '', beneficiary: '', accountNumber: '', bank: '',
    refundType: 'wrong',
    excessAmount: '',
    amountInWords: ''
  });

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

  const cvhtRefundAmount = cvhtData.refundType === 'excess' ? cvhtData.excessAmount : cvhtData.amount;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        {/* LEFT: LIVE PREVIEW */}
        <div className="flex-1 bg-gray-200/50 rounded-xl p-8 overflow-y-auto border border-gray-200 shadow-inner flex justify-center print:bg-white print:p-0 print:border-none print:shadow-none print:w-full print:block">
            <div 
            className="bg-white w-full max-w-[210mm] shadow-xl p-12 min-h-[297mm] text-gray-900 relative print:shadow-none print:w-full print:max-w-none print:p-0"
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
                <input type="number" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={cvhtData.amount} onChange={(e) => handleCvhtAmountChange(e, 'amount')} />
                </div>

                {cvhtData.refundType === 'excess' && (
                    <div className="space-y-1 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-primary uppercase">Số tiền dư cần hoàn (VNĐ) (*)</label>
                    <input type="number" className="w-full px-3 py-2 bg-orange-50 border border-orange-100 text-primary rounded-lg outline-none text-sm font-bold focus:border-primary transition" value={cvhtData.excessAmount} onChange={(e) => handleCvhtAmountChange(e, 'excessAmount')} />
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
                <button onClick={() => window.print()} className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                    <Printer size={18} className="mr-2" /> In & Tải xuống
                </button>
            </div>
        </div>
    </div>
  );
};

export default FinanceCvht;

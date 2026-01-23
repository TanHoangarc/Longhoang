
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../App';
import { Save, User, Mail, Briefcase, Phone, CreditCard, Building2, Lock, ShieldCheck, FileText } from 'lucide-react';

interface CompanySettingsProps {
  currentUser: UserAccount | null;
  onUpdateUser: (user: UserAccount) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ currentUser, onUpdateUser }) => {
  const [formData, setFormData] = useState<Partial<UserAccount>>({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        phone: currentUser.phone || '',
        bankAccount: currentUser.bankAccount || '',
        bankName: currentUser.bankName || ''
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    if (!currentUser) return;
    
    // Validate if necessary (e.g. phone number format)
    
    const updatedUser: UserAccount = {
      ...currentUser,
      phone: formData.phone,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName
    };

    onUpdateUser(updatedUser);
    alert('Đã cập nhật thông tin cá nhân thành công!');
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân và liên hệ</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-primaryDark text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition flex items-center"
        >
          <Save size={18} className="mr-2" /> Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Read-Only Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-800">Thông tin định danh</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                  Họ và tên <Lock size={12} className="ml-1 text-gray-300" />
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={currentUser.name} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                  Tên tiếng Anh / Alias <Lock size={12} className="ml-1 text-gray-300" />
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={currentUser.englishName || ''} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                  Email đăng nhập <Lock size={12} className="ml-1 text-gray-300" />
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={currentUser.email} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 flex items-center">
                  Vai trò hệ thống <Lock size={12} className="ml-1 text-gray-300" />
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={currentUser.role} 
                    disabled 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <div className="mt-0.5 text-blue-500"><FileText size={16} /></div>
              <p className="text-xs text-blue-700 leading-relaxed">
                Các thông tin trên được quản lý bởi Admin. Nếu có sai sót, vui lòng liên hệ bộ phận Hành chính - Nhân sự để cập nhật.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <User size={20} />
              </div>
              <h3 className="font-bold text-gray-800">Thông tin liên lạc & Ngân hàng</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition" size={18} />
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Nhập số điện thoại..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Thông tin tài khoản nhận lương / công tác phí</label>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Số tài khoản
                    </label>
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition" size={18} />
                      <input 
                        type="text" 
                        value={formData.bankAccount || ''}
                        onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                        placeholder="VD: 1903..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-mono font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Ngân hàng
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition" size={18} />
                      <input 
                        type="text" 
                        list="bank-list"
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        placeholder="VD: Techcombank..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                      />
                      <datalist id="bank-list">
                        <option value="Techcombank" />
                        <option value="Vietcombank" />
                        <option value="MB Bank" />
                        <option value="VPBank" />
                        <option value="ACB" />
                        <option value="BIDV" />
                        <option value="VietinBank" />
                        <option value="TPBank" />
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;

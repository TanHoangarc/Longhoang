
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '../../App';
import { Save, User, Mail, Briefcase, Phone, CreditCard, Building2, Lock, ShieldCheck, FileText, Copy, Check, Info, Hash } from 'lucide-react';

interface CompanySettingsProps {
  currentUser: UserAccount | null;
  onUpdateUser: (user: UserAccount) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ currentUser, onUpdateUser }) => {
  const [formData, setFormData] = useState<Partial<UserAccount>>({});
  const [isCopied, setIsCopied] = useState(false);
  const signatureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        phone: currentUser.phone || '',
        line: currentUser.line || '',
        bankAccount: currentUser.bankAccount || '',
        bankName: currentUser.bankName || ''
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    if (!currentUser) return;
    
    const updatedUser: UserAccount = {
      ...currentUser,
      phone: formData.phone,
      line: formData.line,
      bankAccount: formData.bankAccount,
      bankName: formData.bankName
    };

    onUpdateUser(updatedUser);
    alert('Đã cập nhật thông tin cá nhân thành công!');
  };

  const copySignature = () => {
    if (signatureRef.current) {
      const range = document.createRange();
      range.selectNode(signatureRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        try {
          document.execCommand('copy');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error('Không thể sao chép chữ ký', err);
        }
        selection.removeAllRanges();
      }
    }
  };

  if (!currentUser) return null;

  // Logic determined if it should be Mr. or Ms. (simple detection)
  const isFemale = /Thị|Hoa|Lan|Hương|Diễm|Kiều|Phương|Nhi/i.test(currentUser.name);
  const prefix = isFemale ? 'Ms.' : 'Mr.';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Cài đặt cá nhân</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Cập nhật hồ sơ và thiết lập chữ ký email Outlook chuyên nghiệp</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition flex items-center transform active:scale-95"
        >
          <Save size={18} className="mr-2" /> Lưu thông tin
        </button>
      </div>

      {/* Row 1: System Info & Contact/Bank Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Info Box */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Thông tin hệ thống</h3>
            </div>
            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center">
                  Họ và tên <Lock size={10} className="ml-1 opacity-50"/>
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-slate-800 font-bold">
                  {currentUser.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center">
                      Chức vụ <Lock size={10} className="ml-1 opacity-50"/>
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-wide">
                      {currentUser.position || 'Nhân viên'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center">
                      Tên tiếng Anh <Lock size={10} className="ml-1 opacity-50"/>
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-slate-600 font-bold text-xs uppercase tracking-wide">
                      {currentUser.englishName || 'Staff'}
                    </div>
                  </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 flex items-center">
                  Email công vụ <Lock size={10} className="ml-1 opacity-50"/>
                </label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-slate-500 font-mono text-sm">
                  {currentUser.email}
                </div>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-gray-400 italic">
              * Thông tin hệ thống được quản lý bởi bộ phận Admin/Nhân sự.
            </p>
        </div>

        {/* Contact & Bank Info Box */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
                <User size={20} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Thông tin liên lạc & Ngân hàng</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center">
                    Số điện thoại Zalo
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition" size={18} />
                    <input 
                      type="text" 
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="VD: 090..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 flex items-center">
                    Số máy lẻ (Line)
                  </label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition" size={18} />
                    <input 
                      type="text" 
                      value={formData.line || ''}
                      onChange={(e) => setFormData({...formData, line: e.target.value})}
                      placeholder="VD: 1000"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-2 border-t border-gray-50">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-4">Thông tin chuyển khoản lương</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Số tài khoản</label>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-3 text-gray-400 group-focus-within:text-primary transition" size={18} />
                      <input 
                        type="text" 
                        value={formData.bankAccount || ''}
                        onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                        placeholder="Số tài khoản..."
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-mono font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Ngân hàng</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-3 text-gray-400 group-focus-within:text-primary transition" size={18} />
                      <input 
                        type="text" 
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                        placeholder="Techcombank..."
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 font-bold text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-auto pt-6 text-[10px] text-orange-500 font-medium">
               Vui lòng cập nhật thông tin liên lạc để hoàn thiện mẫu chữ ký bên dưới.
            </p>
        </div>
      </div>

      {/* Row 2: Signature Preview (Full Width) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 text-primary rounded-xl shadow-sm">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">Chữ ký Email Outlook</h3>
                <p className="text-xs text-gray-500 font-medium">Mẫu chuẩn Long Hoang Logistics (WCA Member ID: 130841)</p>
              </div>
           </div>
           <button 
            onClick={copySignature}
            className={`px-8 py-3 rounded-2xl text-sm font-black flex items-center transition-all shadow-lg transform active:scale-95 ${isCopied ? 'bg-green-500 text-white shadow-green-100' : 'bg-gray-900 text-white hover:bg-black shadow-slate-200'}`}
           >
             {isCopied ? <><Check size={18} className="mr-2"/> ĐÃ SAO CHÉP</> : <><Copy size={18} className="mr-2"/> SAO CHÉP CHỮ KÝ</>}
           </button>
        </div>

        <div className="p-10 md:p-16 overflow-x-auto flex justify-center bg-[#fafafa]">
           {/* THE ACTUAL SIGNATURE CONTENT TO BE COPIED */}
           <div ref={signatureRef} className="bg-white p-8 shadow-sm rounded-lg border border-white">
              <p style={{ color: '#003366', fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>Thanks and Regards!</p>
              <div style={{ width: '100%', height: '1.5px', background: 'red', marginBottom: '15px' }}></div>
              
              <table style={{ fontFamily: 'Arial, sans-serif', borderCollapse: 'collapse', minWidth: '600px' }}>
                <tbody>
                  <tr>
                    {/* Logo Left Column */}
                    <td style={{ verticalAlign: 'top', paddingRight: '30px', width: '150px', textAlign: 'center' }}>
                      <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" width="140" alt="Long Hoang Logistics" style={{ display: 'block', marginBottom: '15px' }} />
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <img src="https://i.ibb.co/TDzPtv30/wca-leading-the-world-in-logistics-partnering-logo-1.jpg" width="65" alt="WCA" style={{ display: 'inline-block' }} />
                        <img src="https://i.ibb.co/ZRbtsg6h/images.png" width="45" alt="FIATA" style={{ display: 'inline-block' }} />
                      </div>
                      <div style={{ color: '#f97316', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                        ID WCA: 130841
                      </div>
                    </td>

                    {/* Divider Line */}
                    <td style={{ width: '1px', background: '#f97316', verticalAlign: 'top' }}></td>

                    {/* Info Right Column */}
                    <td style={{ verticalAlign: 'top', paddingLeft: '30px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', marginBottom: '2px' }}>
                        {prefix} {currentUser.name} {currentUser.englishName ? `| ${currentUser.englishName}` : ''}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#444', marginBottom: '6px', textTransform: 'uppercase' }}>{currentUser.position || 'Nhân viên'}</div>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f97316', textDecoration: 'underline', textTransform: 'uppercase', marginBottom: '12px' }}>LONG HOANG LOGISTICS CO., LTD</div>
                      
                      <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(to right, #f97316, #ea580c)', marginBottom: '15px' }}></div>

                      <table style={{ fontSize: '13px', color: '#333', borderCollapse: 'collapse', width: '100%' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '3px 0', verticalAlign: 'middle' }}>
                              <span style={{ color: '#f97316', marginRight: '10px', fontSize: '16px' }}>📞</span>
                              <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>028 7303 2677 {formData.line ? `(${formData.line})` : ''}</span> | {formData.phone || 'chưa nhập'} (zalo)
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 0', verticalAlign: 'middle' }}>
                              <span style={{ color: '#f97316', marginRight: '10px', fontSize: '16px' }}>✉️</span>
                              <a href={`mailto:${currentUser.email}`} style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 'bold' }}>{currentUser.email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 0', verticalAlign: 'middle' }}>
                              <span style={{ color: '#f97316', marginRight: '10px', fontSize: '16px' }}>🌐</span>
                              <a href="https://www.longhoanglogistics.com" style={{ color: '#000', textDecoration: 'underline', fontWeight: 'bold' }}>www.longhoanglogistics.com</a>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', verticalAlign: 'top' }}>
                              <span style={{ color: '#f97316', marginRight: '10px', fontSize: '16px', float: 'left' }}>📍</span>
                              <div style={{ marginLeft: '26px' }}>
                                <span style={{ color: 'red', fontWeight: 'bold' }}>Head office:</span> 132 – 134 Nguyen Gia Tri Str, Thanh My Tay Ward, Binh Thanh Dist, HCMC, Vietnam.
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', verticalAlign: 'top' }}>
                                <div style={{ marginLeft: '26px' }}>
                                    <span style={{ color: '#0066cc', fontWeight: 'bold' }}>Branch Hai Phong:</span> Floor 3A, Plot No. 17, Area B1 – Lot 7B Le Hong Phong Street, Dong Khe Ward, Ngo Quyen District, Hai Phong City, Viet Nam
                                </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>
        
        <div className="p-6 bg-blue-50 border-t border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
            <Info size={20} />
          </div>
          <div>
              <h4 className="font-bold text-blue-800 text-sm mb-1">Hướng dẫn cài đặt chữ ký:</h4>
              <p className="text-[12px] text-blue-700 leading-relaxed">
                1. Nhấn nút <b>"SAO CHÉP CHỮ KÝ"</b> bên trên. <br/>
                2. Mở ứng dụng Outlook, vào menu <b>File > Options > Mail > Signatures</b>. <br/>
                3. Tạo chữ ký mới (New), nhấn <b>Ctrl+V</b> để dán nội dung vào ô soạn thảo. <br/>
                4. Nhấn <b>OK</b> để lưu lại. Hệ thống sẽ tự động hiển thị chữ ký này trong mỗi email mới của bạn.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;

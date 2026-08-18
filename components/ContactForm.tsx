import React, { useState } from 'react';
import { MapPin, Phone, Edit, Save, X } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'hcm',
    name: 'Chi nhánh HCM (Headoffice)',
    address: '132-134 Nguyễn Gia Trí, P.25, Q.Bình Thạnh, Tp.HCM',
    phone: '028 7303 2677'
  },
  {
    id: 'hph',
    name: 'Chi nhánh HPH',
    address: 'Floor 3A, Plot No. 17, Area B1 - Lot 7B Le Hong Phong Street, Dong Khe Ward, Ngo Quyen District, Hai Phong City, Viet Nam',
    phone: '028 7302 7689'
  }
];

interface ContactFormProps {
  onSubmitRequest?: (name: string, phone: string, content: string) => boolean;
  userRole?: string | null;
  branches?: Branch[];
  onUpdateBranches?: (b: Branch[]) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmitRequest, userRole, branches, onUpdateBranches }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');

  const displayBranches = branches && branches.length > 0 ? branches : DEFAULT_BRANCHES;
  
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Branch>>({});
  
  const isAdmin = userRole === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !content) {
        alert('Vui lòng điền đầy đủ thông tin (Tên, Số điện thoại, Nội dung)!');
        return;
    }
    if (onSubmitRequest) {
        const success = onSubmitRequest(name, phone, content);
        if (success) {
            alert('Yêu cầu của bạn đã được gửi thành công! Nhân viên kinh doanh sẽ liên hệ sớm nhất.');
            setName('');
            setPhone('');
            setContent('');
        }
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setEditData({ ...branch });
  };

  const handleSave = () => {
    if (onUpdateBranches) {
      const updated = displayBranches.map(b => b.id === editingBranchId ? { ...b, ...editData } as Branch : b);
      onUpdateBranches(updated);
    }
    setEditingBranchId(null);
  };

  return (
    <section id="contact" className="relative py-24 bg-gray-900">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-30">
        <iframe 
          src="https://maps.google.com/maps?q=132%20Nguy%E1%BB%85n%20Gia%20Tr%C3%AD%2C%20P.25%2C%20Q.B%C3%ACnh%20Th%E1%BA%A1nh%2C%20Tp.HCM&t=m&z=16&output=embed&iwloc=near"
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy"
          title="Google Map Location"
        ></iframe>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-white mb-4">Liên hệ với chúng tôi</h2>
           <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
           <p className="text-gray-300 max-w-2xl mx-auto">
             Mạng lưới văn phòng rộng khắp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.
           </p>
        </div>

        {/* Office Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {displayBranches.map(branch => (
              <div key={branch.id} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:bg-white/20 transition duration-300 flex flex-col relative group">
                {isAdmin && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEdit(branch)} className="bg-white text-gray-800 p-2 rounded-full shadow hover:bg-primary hover:text-white">
                      <Edit size={16} />
                    </button>
                  </div>
                )}
                
                {editingBranchId === branch.id ? (
                  <div className="space-y-3 bg-white p-4 rounded text-gray-800 absolute inset-0 z-20">
                    <input className="w-full border p-2 rounded font-bold" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Tên chi nhánh"/>
                    <textarea className="w-full border p-2 rounded text-sm" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="Địa chỉ" rows={2}/>
                    <input className="w-full border p-2 rounded text-sm" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Hotline"/>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center"><Save size={16} className="mr-1"/> Lưu</button>
                      <button onClick={() => setEditingBranchId(null)} className="flex-1 bg-red-500 text-white p-2 rounded flex items-center justify-center"><X size={16} className="mr-1"/> Hủy</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <span className="w-2 h-8 bg-primary mr-3 rounded-sm"></span>
                        {branch.name}
                    </h3>
                    <div className="space-y-4 text-gray-300 flex-grow">
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{branch.address}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                            <a href={`tel:${branch.phone.replace(/[^0-9]/g, '')}`} className="hover:text-primary transition font-semibold text-white">{branch.phone}</a>
                        </div>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
             <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-white">Yêu cầu gọi lại tư vấn</h3>
             </div>
             <div className="bg-white p-2 rounded-lg shadow-2xl">
                <form className="flex flex-col md:flex-row gap-2" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Tên của bạn" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Số điện thoại" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                     <input 
                        type="text" 
                        placeholder="Nội dung cần tư vấn" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="bg-primary hover:bg-primaryDark text-white px-8 py-4 font-bold rounded transition transform active:scale-95"
                    >
                        Gửi Yêu Cầu
                    </button>
                </form>
             </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

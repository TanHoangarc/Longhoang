import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, MapPin, Phone, Mail, Youtube, Edit, Save, X } from 'lucide-react';

interface FooterInfo {
  desc1: string;
  desc2: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  youtube: string;
}

const DEFAULT_FOOTER: FooterInfo = {
  desc1: 'Hơn 6 năm kinh nghiệm trong lĩnh vực vận tải và Logistics. Chúng tôi cam kết mang lại giá trị bền vững cho đối tác.',
  desc2: 'Chúng tôi làm việc 7 ngày một tuần, mỗi ngày kể cả ngày lễ lớn. Liên hệ với chúng tôi để biết thêm chi tiết.',
  phone: '028 7303 2677',
  email: 'info@longhoanglogistics.com',
  address: '132-134 Nguyễn Gia Trí, P.25, Q.Bình Thạnh, Tp.HCM',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com'
};

interface FooterProps {
  userRole?: string | null;
  footerInfo?: FooterInfo;
  onUpdateFooter?: (info: FooterInfo) => void;
}

const Footer: React.FC<FooterProps> = ({ userRole, footerInfo, onUpdateFooter }) => {
  const isAdmin = userRole === 'admin';
  const displayInfo = footerInfo || DEFAULT_FOOTER;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<FooterInfo>>({});

  const startEdit = () => {
    setIsEditing(true);
    setEditData({ ...displayInfo });
  };

  const saveEdit = () => {
    if (onUpdateFooter) {
      onUpdateFooter({ ...displayInfo, ...editData } as FooterInfo);
    }
    setIsEditing(false);
  };

  return (
    <footer className="bg-[#111827] text-gray-400 py-16 border-t border-gray-800 relative group">
      {isAdmin && !isEditing && (
        <button onClick={startEdit} className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow z-20 opacity-0 group-hover:opacity-100 transition hover:bg-primary hover:text-white">
          <Edit size={16} />
        </button>
      )}

      {isEditing && (
        <div className="absolute inset-0 z-30 bg-gray-900/95 p-8 flex flex-col justify-center max-w-4xl mx-auto rounded overflow-y-auto max-h-screen my-10 border border-gray-700">
          <h3 className="text-white text-xl font-bold mb-4">Chỉnh sửa Footer</h3>
          <div className="space-y-4 text-sm text-gray-800">
            <input className="w-full p-2 rounded" value={editData.desc1} onChange={e => setEditData({...editData, desc1: e.target.value})} placeholder="Mô tả 1"/>
            <input className="w-full p-2 rounded" value={editData.desc2} onChange={e => setEditData({...editData, desc2: e.target.value})} placeholder="Mô tả 2"/>
            <input className="w-full p-2 rounded" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="Hotline"/>
            <input className="w-full p-2 rounded" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} placeholder="Email"/>
            <input className="w-full p-2 rounded" value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} placeholder="Địa chỉ chính"/>
            <input className="w-full p-2 rounded" value={editData.facebook} onChange={e => setEditData({...editData, facebook: e.target.value})} placeholder="Link Facebook"/>
            <input className="w-full p-2 rounded" value={editData.youtube} onChange={e => setEditData({...editData, youtube: e.target.value})} placeholder="Link Youtube"/>
            
            <div className="flex gap-4 pt-4">
              <button onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold">Lưu thay đổi</button>
              <button onClick={() => setIsEditing(false)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded font-bold">Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div>
            <div className="mb-6 flex items-center">
                 <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" alt="Long Hoang Logistics Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="mb-6 leading-relaxed text-sm">
              {displayInfo.desc1}
            </p>
            <p className="text-xs">
              {displayInfo.desc2}
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Điều hướng</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-primary transition">Dịch vụ</a></li>
              <li><a href="#" className="hover:text-primary transition">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-primary transition">Tin tức</a></li>
              <li><a href="#" className="hover:text-primary transition">Dự án</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Thông tin liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
                <span className="leading-relaxed">{displayInfo.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary mr-3 flex-shrink-0" />
                <span className="leading-relaxed">{displayInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary mr-3 flex-shrink-0" />
                <span className="leading-relaxed">{displayInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Kết nối với chúng tôi</h3>
            <p className="text-sm mb-4">Đăng ký để nhận thông tin mới nhất về dịch vụ và ưu đãi.</p>
            <form className="flex mb-6" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="bg-gray-800 text-white px-4 py-3 rounded-l focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primaryDark px-4 py-3 rounded-r text-white transition flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
            
            <div className="flex space-x-4 mt-6">
              <a href={displayInfo.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition text-gray-400 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href={displayInfo.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition text-gray-400 hover:text-white">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Long Hoang Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

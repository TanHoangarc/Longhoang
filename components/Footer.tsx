import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, MapPin, Phone, Mail, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-400 py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold text-white mb-6 flex items-center">
                 <span className="text-primary mr-1">LONG</span>HOANG
            </div>
            <p className="mb-6 leading-relaxed text-sm">
              Hơn 30 năm kinh nghiệm trong lĩnh vực vận tải và Logistics. Chúng tôi cam kết mang lại giá trị bền vững cho đối tác.
            </p>
            <p className="text-xs">
              Chúng tôi làm việc 7 ngày một tuần, mỗi ngày kể cả ngày lễ lớn. Liên hệ với chúng tôi để biết thêm chi tiết.
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
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-6">Liên hệ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                    <h4 className="text-primary font-bold uppercase text-xs tracking-wider mb-2">Chi nhánh HCM</h4>
                    <div className="flex items-start">
                        <MapPin size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>132-134 Nguyễn Gia Trí, P.25, Q.Bình Thạnh, Tp.HCM</span>
                    </div>
                    <div className="flex items-center">
                        <Phone size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                        <span>028 7303 2677</span>
                    </div>
                </div>
                 <div className="space-y-3">
                    <h4 className="text-primary font-bold uppercase text-xs tracking-wider mb-2">Chi nhánh Hải Phòng</h4>
                    <div className="flex items-start">
                        <MapPin size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Floor 3A, Plot No. 17, Area B1, Le Hong Phong St, Ngo Quyen Dist, Hai Phong</span>
                    </div>
                    <div className="flex items-center">
                        <Phone size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                        <span>028 7302 7689</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-6 mt-8 border-t border-gray-800 pt-6">
               <div className="flex items-center">
                    <Mail size={16} className="text-primary mr-2" />
                    <span>info@longhoanglogistics.com</span>
               </div>
               <div className="flex space-x-4">
                <a href="https://www.facebook.com/longhoanglogistics/?modal=admin_todo_tour" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition"><Facebook size={20} /></a>
                <a href="https://www.youtube.com/channel/UCI6fi78pgFbdYH6W4KaV98Q?view_as=subscriber" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition"><Youtube size={20} /></a>
                <a href="#" className="text-white hover:text-primary transition"><Instagram size={20} /></a>
               </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Long Hoang Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
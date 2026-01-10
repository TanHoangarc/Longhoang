import React, { useState, useEffect } from 'react';
import { X, Award, Users, TrendingUp, Calendar } from 'lucide-react';

const MILESTONES = [
  {
    year: '1993',
    title: 'Thành lập công ty',
    desc: 'Khởi đầu với một văn phòng nhỏ tại TP.HCM và đội ngũ 10 nhân sự đầy nhiệt huyết, tập trung vào vận tải nội địa.'
  },
  {
    year: '2005',
    title: 'Mở rộng quy mô',
    desc: 'Khai trương chi nhánh Hải Phòng và Đà Nẵng, chính thức sở hữu đội xe container riêng gồm 50 đầu kéo.'
  },
  {
    year: '2015',
    title: 'Vươn ra biển lớn',
    desc: 'Thiết lập mạng lưới đại lý tại 120 quốc gia. Trở thành đối tác chiến lược của các hãng tàu lớn như Maersk, CMA CGM.'
  },
  {
    year: '2023',
    title: 'Chuyển đổi số toàn diện',
    desc: 'Áp dụng hệ thống quản lý logistics thông minh (LMS), tối ưu hóa quy trình và cam kết giảm phát thải carbon.'
  }
];

const GALLERIES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Office
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Meeting
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Warehouse
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Teamwork
];

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Images Section */}
          <div className="lg:w-1/2 relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Warehouse worker" 
                className="w-full h-64 object-cover rounded-lg shadow-md hover:scale-105 transition duration-500"
              />
               <img 
                src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Container ship" 
                className="w-full h-64 object-cover rounded-lg shadow-md mt-8 hover:scale-105 transition duration-500"
              />
            </div>
            {/* Experience Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-xl rounded-lg text-center z-10 border-t-4 border-primary min-w-[150px] animate-bounce-slow">
              <span className="block text-4xl font-extrabold text-primary">30+</span>
              <span className="text-sm font-semibold text-gray-600 uppercase">Năm kinh nghiệm</span>
            </div>
          </div>

          {/* Text Section */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Về Long Hoang Logistics</h2>
            <div className="w-20 h-1 bg-primary mb-6"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 italic border-l-4 border-primary pl-4">
              "Hơn hết, chúng tôi tin rằng sự thay đổi thực sự là có thể và ngày mai không nhất thiết phải giống như hôm nay."
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Giải quyết các vấn đề xã hội đòi hỏi các nhà lãnh đạo từ các tổ chức, doanh nghiệp, tổ chức phi lợi nhuận và chính phủ phải hình dung lại các hệ thống và mối quan hệ định hình thế giới của chúng ta. Chúng tôi phấn đấu để hiểu sâu sắc về cách tạo ra sự thay đổi xã hội thông qua các giải pháp logistics hiệu quả.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Tại Long Hoang Logistics, chúng tôi cung cấp các giải pháp vận chuyển đa phương thức, giúp kết nối hàng hóa của bạn đến mọi nơi trên thế giới một cách nhanh chóng và an toàn nhất.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded font-medium transition shadow-md flex items-center gap-2 group"
            >
              Đọc thêm
              <Users size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detailed View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-lg">
                    <TrendingUp className="text-primary" size={24} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800">Hành trình phát triển & Văn hóa</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-10">
              
              {/* Introduction */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                 <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-primary">
                    <Award className="text-primary mb-4" size={32} />
                    <h4 className="font-bold text-lg mb-2">Tầm Nhìn</h4>
                    <p className="text-gray-600 text-sm">Trở thành biểu tượng niềm tin hàng đầu Việt Nam về các giải pháp Logistics và chuỗi cung ứng toàn cầu.</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <Users className="text-blue-500 mb-4" size={32} />
                    <h4 className="font-bold text-lg mb-2">Sứ Mệnh</h4>
                    <p className="text-gray-600 text-sm">Kết nối giao thương, tối ưu hóa giá trị cho khách hàng thông qua dịch vụ chuyên nghiệp và tận tâm.</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                    <TrendingUp className="text-green-500 mb-4" size={32} />
                    <h4 className="font-bold text-lg mb-2">Giá Trị Cốt Lõi</h4>
                    <p className="text-gray-600 text-sm">Tín - Tâm - Tốc - Tinh. Chúng tôi đặt uy tín lên hàng đầu và lấy khách hàng làm trọng tâm.</p>
                 </div>
              </div>

              {/* Timeline */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                  <Calendar className="mr-3 text-primary" /> Lịch sử hình thành
                </h3>
                <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-12">
                  {MILESTONES.map((milestone, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-primary"></div>
                      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                         <span className="text-primary font-extrabold text-xl md:w-24 flex-shrink-0">{milestone.year}</span>
                         <div>
                            <h4 className="text-lg font-bold text-gray-800">{milestone.title}</h4>
                            <p className="text-gray-500 mt-1">{milestone.desc}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-8">Hình ảnh hoạt động</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {GALLERIES.map((img, idx) => (
                    <div key={idx} className="overflow-hidden rounded-lg h-48 group relative">
                       <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-gray-500 italic">"Chúng tôi không chỉ vận chuyển hàng hóa, chúng tôi vận chuyển niềm tin."</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;
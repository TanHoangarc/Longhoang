import React, { useState, useEffect } from 'react';
import { X, ArrowRight, MapPin, Calendar, Tag } from 'lucide-react';

const PROJECTS = [
  {
    title: "Vận chuyển Tuabin Gió - Dự án Điện gió Bạc Liêu",
    category: "Hàng siêu trường siêu trọng",
    location: "Bạc Liêu, Việt Nam",
    date: "T8/2023",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    desc: "Vận chuyển và lắp đặt thành công 10 trụ tuabin gió với chiều dài cánh quạt lên đến 70m, đảm bảo an toàn tuyệt đối trên địa hình phức tạp."
  },
  {
    title: "Xuất khẩu 500 Container Gạo đi Châu Âu",
    category: "Vận tải biển (FCL)",
    location: "Cảng Cát Lái - Rotterdam",
    date: "T11/2023",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    desc: "Hoàn tất thủ tục hải quan và vận chuyển lô hàng nông sản chủ lực đúng tiến độ, đáp ứng tiêu chuẩn khắt khe của EU."
  },
  {
    title: "Dây chuyền sản xuất Nhà máy VinFast",
    category: "Logistics Dự án",
    location: "Hải Phòng, Việt Nam",
    date: "T5/2022",
    image: "https://images.unsplash.com/photo-1565514020176-db793306c52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    desc: "Vận chuyển thiết bị robot và dây chuyền lắp ráp tự động từ cảng Hải Phòng về khu công nghiệp, hỗ trợ lắp đặt tận nơi."
  },
  {
    title: "Vận chuyển Vắc-xin & Thiết bị Y tế",
    category: "Vận tải hàng không (Cold Chain)",
    location: "Nội Bài - Tân Sơn Nhất",
    date: "T2/2021",
    image: "https://images.unsplash.com/photo-1584036561566-b93a945c50f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    desc: "Giải pháp chuỗi cung ứng lạnh (Cold Chain) đảm bảo nhiệt độ ổn định cho lô hàng vắc-xin và thiết bị y tế khẩn cấp."
  }
];

const Hero = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isProjectModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isProjectModalOpen]);

  return (
    <section className="relative h-[600px] sm:h-[700px] flex items-center bg-gray-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="Logistics warehouse" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-4">
             <div className="h-1 w-12 bg-primary"></div>
             <span className="text-primary font-bold tracking-widest uppercase text-sm">Long Hoang Logistics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            KẾT NỐI <br/>
            DOANH NGHIỆP CỦA BẠN <br/>
            VỚI THẾ GIỚI
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl border-l-4 border-primary pl-4">
            Đã là một thực tế được chứng minh từ lâu rằng giải pháp vận chuyển thông minh sẽ giúp doanh nghiệp tiết kiệm chi phí và tối ưu hóa lợi nhuận.
          </p>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-primary hover:bg-primaryDark text-white px-8 py-4 rounded font-bold text-lg transition transform hover:-translate-y-1 shadow-lg shadow-orange-500/30"
          >
            Xem dịch vụ
          </button>
        </div>
      </div>
      
      {/* Decorative dots element from image */}
      <div className="absolute bottom-10 right-10 hidden lg:block opacity-30">
        <div className="grid grid-cols-6 gap-2">
            {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ))}
        </div>
      </div>

      {/* Projects Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsProjectModalOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-xl sticky top-0 z-20">
              <div>
                <span className="text-primary font-bold uppercase text-xs tracking-wider">Dự án đã thực hiện</span>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">Các dự án tiêu biểu</h2>
              </div>
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 bg-gray-50 rounded-b-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PROJECTS.map((project, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                    {/* Image Wrapper */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase">
                        {project.category}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MapPin size={16} className="text-primary mr-1" />
                          {project.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="text-primary mr-1" />
                          {project.date}
                        </div>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                        {project.desc}
                      </p>

                      <button className="flex items-center text-primary font-bold uppercase text-sm tracking-wide hover:underline mt-auto">
                        Xem chi tiết dự án <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* CTA in Modal */}
              <div className="mt-12 bg-[#1e2a3b] rounded-lg p-8 text-center text-white relative overflow-hidden">
                 <div className="relative z-10">
                   <h3 className="text-2xl font-bold mb-4">Bạn có dự án cần vận chuyển?</h3>
                   <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Liên hệ ngay với đội ngũ chuyên gia của Long Hoang Logistics để được tư vấn giải pháp tối ưu nhất cho dự án của bạn.</p>
                   <a href="#contact" onClick={() => setIsProjectModalOpen(false)} className="inline-block bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded font-bold transition">
                     Liên hệ ngay
                   </a>
                 </div>
                 {/* Background decoration */}
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Tag size={120} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
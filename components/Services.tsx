import React, { useState, useEffect } from 'react';
import { ArrowRight, X, CheckCircle2, Phone } from 'lucide-react';
import { SERVICES } from '../constants';

const Services = () => {
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedService(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedService]);

  const handleConsultClick = () => {
    setSelectedService(null);
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      setTimeout(() => {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <section id="services" className="bg-[#1f2937]">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-2">Dịch vụ của chúng tôi</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
             Cung cấp giải pháp Logistics toàn diện, linh hoạt và tối ưu chi phí cho mọi nhu cầu vận chuyển.
          </p>
        </div>

        {/* Grid Wrapper */}
        <div className="bg-gray-700 gap-[1px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-gray-700">
          {SERVICES.map((service, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedService(service)}
              className="group relative h-96 overflow-hidden cursor-pointer bg-[#1f2937]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-30 group-hover:opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] via-transparent to-transparent opacity-90"></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end transition-all duration-300">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 text-primary font-bold mb-3 opacity-80 group-hover:opacity-100">
                     <span>{service.id}</span>
                     <div className="h-[1px] w-8 bg-primary"></div>
                  </div>
                  
                  <h3 className="text-white text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center text-primary font-semibold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform translate-x-[-10px] group-hover:translate-x-0">
                    Xem chi tiết <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </div>
              
              {/* Hover Top Line */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-primary transition-all duration-500 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedService(null)}
          ></div>
          
          <div className="bg-white w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[90vh] md:max-h-[800px]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-black/50 p-2 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>

            {/* Image Side */}
            <div className="md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={selectedService.image} 
                alt={selectedService.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:hidden">
                 <h3 className="text-white text-2xl font-bold shadow-black drop-shadow-lg">{selectedService.title}</h3>
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white flex flex-col">
              <div className="mb-6 hidden md:block">
                <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2 block">Dịch vụ {selectedService.id}</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{selectedService.title}</h2>
                <div className="w-20 h-1.5 bg-primary"></div>
              </div>

              <div className="prose prose-lg text-gray-600 mb-8 flex-grow">
                <p className="leading-relaxed text-lg mb-6">
                  {selectedService.description}
                </p>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    Tại sao chọn chúng tôi?
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle2 size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Chi phí cạnh tranh, báo giá trọn gói minh bạch.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Đội ngũ chuyên gia tư vấn giải pháp tối ưu nhất.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Hệ thống theo dõi đơn hàng (Tracking) 24/7.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                      <span className="text-sm md:text-base">Cam kết bảo hiểm và an toàn hàng hóa 100%.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleConsultClick}
                  className="flex-1 bg-primary hover:bg-primaryDark text-white px-6 py-4 rounded font-bold text-center transition flex items-center justify-center space-x-2"
                >
                  <span>Nhận Báo Giá Ngay</span>
                  <ArrowRight size={18} />
                </button>
                <a 
                  href="tel:02873032677" 
                  className="flex-1 border border-gray-300 hover:border-primary hover:text-primary text-gray-700 px-6 py-4 rounded font-bold text-center transition flex items-center justify-center space-x-2"
                >
                  <Phone size={18} />
                  <span>028 7303 2677</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
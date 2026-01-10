import React from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const Testimonials = () => {
  const testimonial = TESTIMONIALS[0];

  return (
    <section className="py-20 bg-[#111827] text-white relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="World map" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
        <div className="md:w-1/3 mb-10 md:mb-0">
          <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
          <div className="h-1 w-16 bg-primary mb-6"></div>
          <p className="text-gray-400">
            Sự hài lòng của khách hàng là thước đo thành công của chúng tôi.
          </p>
          <button className="mt-6 text-primary font-medium hover:text-white transition">Xem tất cả đánh giá</button>
        </div>

        <div className="md:w-2/3 md:pl-12">
          <div className="bg-white text-gray-800 p-8 md:p-12 rounded shadow-2xl relative">
            <div className="absolute -top-6 left-8 bg-primary text-white p-3 rounded shadow-lg">
              <Quote size={24} fill="currentColor" />
            </div>
            
            <p className="text-lg md:text-xl italic text-gray-600 mb-8 leading-relaxed">
              "{testimonial.text}"
            </p>
            
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-primary font-bold text-lg">{testimonial.author}</h4>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition">
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 border border-gray-200 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
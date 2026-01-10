import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FEATURES } from '../constants';

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tại sao khách hàng chọn chúng tôi</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="bg-white p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow rounded-lg group">
              <div className="mb-6 inline-block p-4 bg-orange-50 rounded-full group-hover:bg-primary transition-colors duration-300">
                <feature.icon size={32} className="text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <a href="#" className="inline-flex items-center text-primary font-semibold hover:text-primaryDark transition group-hover:translate-x-1 duration-300">
                Xem thêm <ArrowRight size={16} className="ml-2" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
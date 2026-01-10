import React from 'react';
import { SAFETY_FEATURES } from '../constants';

const SafetyFeatures = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Hàng hóa của bạn an toàn với chúng tôi</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Chúng tôi cam kết mang lại sự an tâm tuyệt đối cho khách hàng thông qua quy trình quản lý chuyên nghiệp và đội ngũ tận tâm.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SAFETY_FEATURES.map((item, index) => (
            <div key={index} className="flex flex-col items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <item.icon className="text-primary mb-4 w-10 h-10 stroke-1" />
              <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SafetyFeatures;
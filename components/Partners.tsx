import React from 'react';
import { Anchor } from 'lucide-react';

const Partners = () => {
  return (
    <section className="py-12 bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
            <span className="text-gray-400 uppercase tracking-widest text-sm font-semibold">Đối tác của chúng tôi</span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Placeholder Logos created with text/icons for demo purposes */}
          {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="flex items-center space-x-2 group">
                <Anchor size={32} className="text-gray-600 group-hover:text-primary transition-colors" />
                <span className="text-xl font-bold text-gray-600 group-hover:text-gray-900">PARTNER {i}</span>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
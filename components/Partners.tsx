
import React from 'react';

const PARTNERS = [
  { 
    name: 'FIATA', 
    logo: 'https://i.ibb.co/ZRbtsg6h/images.png',
    height: 'h-16'
  },
  { 
    name: 'CHUBB', 
    logo: 'https://i.ibb.co/Y7ZRktRW/Logo-chubb.png',
    height: 'h-10'
  },
  { 
    name: 'GLA', 
    logo: 'https://i.ibb.co/bRdHkCrz/gla-global-logistics-alliance-logo.jpg',
    height: 'h-14'
  },
  { 
    name: 'VLA', 
    logo: 'https://i.ibb.co/WTRpCX1/Logo-VLA-High-Quality.png',
    height: 'h-14'
  },
  { 
    name: 'WCA', 
    logo: 'https://i.ibb.co/TDzPtv30/wca-leading-the-world-in-logistics-partnering-logo-1.jpg',
    height: 'h-12'
  }
];

const Partners = () => {
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <span className="text-gray-400 uppercase tracking-widest text-xs font-bold bg-gray-50 px-4 py-2 rounded-full">Thành viên & Đối tác chiến lược</span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {PARTNERS.map((partner, i) => (
             <div key={i} className="group grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer flex items-center justify-center p-4 hover:bg-gray-50 rounded-xl">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className={`${partner.height} w-auto object-contain transition-transform duration-300 group-hover:scale-110`}
                  onError={(e) => {
                    // Fallback if image fails to load
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                        e.currentTarget.style.display = 'none';
                        // Add classes first before modifying innerText to avoid potential null reference issues if DOM updates abruptly
                        parent.classList.add('font-bold', 'text-xl', 'text-gray-600');
                        parent.innerText = partner.name;
                    }
                  }}
                />
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;

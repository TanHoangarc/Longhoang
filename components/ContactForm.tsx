
import React, { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

interface ContactFormProps {
  onSubmitRequest?: (name: string, phone: string, content: string) => boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmitRequest }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !content) {
        alert('Vui lòng điền đầy đủ thông tin (Tên, Số điện thoại, Nội dung)!');
        return;
    }

    if (onSubmitRequest) {
        const success = onSubmitRequest(name, phone, content);
        if (success) {
            alert('Yêu cầu của bạn đã được gửi thành công! Nhân viên kinh doanh sẽ liên hệ sớm nhất.');
            setName('');
            setPhone('');
            setContent('');
        }
    }
  };

  return (
    <section id="contact" className="relative py-24 bg-gray-900">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-30">
        <iframe 
          src="https://maps.google.com/maps?q=132%20Nguy%E1%BB%85n%20Gia%20Tr%C3%AD%2C%20P.25%2C%20Q.B%C3%ACnh%20Th%E1%BA%A1nh%2C%20Tp.HCM&t=m&z=16&output=embed&iwloc=near"
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy"
          title="Google Map Location"
        ></iframe>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-white mb-4">Liên hệ với chúng tôi</h2>
           <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
           <p className="text-gray-300 max-w-2xl mx-auto">
             Mạng lưới văn phòng rộng khắp, sẵn sàng hỗ trợ bạn mọi lúc mọi nơi.
           </p>
        </div>

        {/* Office Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {/* HCM Branch */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:bg-white/20 transition duration-300 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="w-2 h-8 bg-primary mr-3 rounded-sm"></span>
                    Chi nhánh HCM (Headoffice)
                </h3>
                <div className="space-y-4 text-gray-300 flex-grow">
                    <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <span className="leading-relaxed">132-134 Nguyễn Gia Trí, P.25, Q.Bình Thạnh, Tp.HCM</span>
                    </div>
                    <div className="flex items-center">
                        <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <a href="tel:02873032677" className="hover:text-primary transition font-semibold text-white">028 7303 2677</a>
                    </div>
                </div>
            </div>

            {/* HPH Branch */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:bg-white/20 transition duration-300 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="w-2 h-8 bg-primary mr-3 rounded-sm"></span>
                    Chi nhánh HPH
                </h3>
                <div className="space-y-4 text-gray-300 flex-grow">
                    <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-primary mr-3 mt-1 flex-shrink-0" />
                        <span className="leading-relaxed">Floor 3A, Plot No. 17, Area B1 - Lot 7B Le Hong Phong Street, Dong Khe Ward, Ngo Quyen District, Hai Phong City, Viet Nam</span>
                    </div>
                    <div className="flex items-center">
                        <Phone className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <a href="tel:02873027689" className="hover:text-primary transition font-semibold text-white">028 7302 7689</a>
                    </div>
                </div>
            </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
             <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-white">Yêu cầu gọi lại tư vấn</h3>
             </div>
             <div className="bg-white p-2 rounded-lg shadow-2xl">
                <form className="flex flex-col md:flex-row gap-2" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Tên của bạn" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Số điện thoại" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                     <input 
                        type="text" 
                        placeholder="Nội dung cần tư vấn" 
                        className="flex-1 bg-gray-50 px-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition rounded text-gray-700"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="bg-primary hover:bg-primaryDark text-white font-bold px-8 py-4 rounded transition shadow-md whitespace-nowrap"
                    >
                        GỬI YÊU CẦU
                    </button>
                </form>
             </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

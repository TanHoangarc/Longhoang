import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const JOBS = [
  { title: "Nhân viên Kinh doanh Logistics", location: "Hà Nội", type: "Toàn thời gian" },
  { title: "Lái xe Container (Bằng FC)", location: "Hải Phòng", type: "Toàn thời gian" },
  { title: "Chuyên viên Chứng từ XNK", location: "Hồ Chí Minh", type: "Toàn thời gian" },
  { title: "Kế toán kho", location: "Hà Nội", type: "Toàn thời gian" }
];

const Jobs = () => {
  return (
    <section id="jobs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
           <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tuyển dụng</h2>
              <div className="w-16 h-1 bg-primary mb-6"></div>
              <p className="text-gray-500 mb-6">
                Gia nhập đội ngũ Long Hoang Logistics để phát triển sự nghiệp trong môi trường chuyên nghiệp, năng động.
              </p>
              <button className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded font-medium transition shadow-md">
                Xem tất cả vị trí
              </button>
           </div>
           <div className="md:w-2/3 grid grid-cols-1 gap-4">
              {JOBS.map((job, index) => (
                <div key={index} className="border border-gray-100 p-6 rounded-lg hover:border-primary/50 hover:shadow-md transition bg-gray-50 hover:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center group">
                   <div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                         <span className="flex items-center"><MapPin size={14} className="mr-1" /> {job.location}</span>
                         <span className="flex items-center"><Clock size={14} className="mr-1" /> {job.type}</span>
                      </div>
                   </div>
                   <button className="mt-4 sm:mt-0 text-primary font-medium hover:underline text-sm uppercase tracking-wide">Ứng tuyển</button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  );
};

export default Jobs;
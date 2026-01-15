
import React, { useState, useEffect } from 'react';
import { X, Award, Users, TrendingUp, Calendar, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { GalleryAlbum, UserRole } from '../App';

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

interface AboutProps {
  galleryAlbums?: GalleryAlbum[];
  onUpdateGallery?: (albums: GalleryAlbum[]) => void;
  userRole?: UserRole;
}

const About: React.FC<AboutProps> = ({ galleryAlbums = [], onUpdateGallery, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Gallery States
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const ITEMS_PER_PAGE = 4;
  
  // Preview Album Modal
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Add Album Modal
  const [isAddAlbumOpen, setIsAddAlbumOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState({ title: '', cover: '', images: '' });

  // Can Add?
  const canEdit = userRole === 'admin' || userRole === 'manager';

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || selectedAlbum || isAddAlbumOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, selectedAlbum, isAddAlbumOpen]);

  // Navigation Logic for Main Gallery
  const handleNextAlbums = () => {
    if (visibleStartIndex + ITEMS_PER_PAGE < galleryAlbums.length) {
      setVisibleStartIndex(prev => prev + 1);
    }
  };

  const handlePrevAlbums = () => {
    if (visibleStartIndex > 0) {
      setVisibleStartIndex(prev => prev - 1);
    }
  };

  // Logic for Preview Modal Navigation
  const handleNextImage = () => {
    if (selectedAlbum && currentImageIndex < selectedAlbum.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedAlbum && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Add Album Logic
  const handleSaveAlbum = () => {
    if (!newAlbumData.title || !newAlbumData.cover) return alert('Vui lòng nhập tiêu đề và ảnh bìa');
    
    // Process images textarea
    const imagesArray = newAlbumData.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    // If no specific images added, use cover as the first image
    if (imagesArray.length === 0) imagesArray.push(newAlbumData.cover);

    const newAlbum: GalleryAlbum = {
      id: Date.now(),
      title: newAlbumData.title,
      cover: newAlbumData.cover,
      images: imagesArray,
      date: new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
    };

    if (onUpdateGallery) {
      onUpdateGallery([newAlbum, ...galleryAlbums]);
    }
    
    setIsAddAlbumOpen(false);
    setNewAlbumData({ title: '', cover: '', images: '' });
  };

  const handleDeleteAlbum = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa Album này?')) {
      if (onUpdateGallery) {
        onUpdateGallery(galleryAlbums.filter(a => a.id !== id));
      }
    }
  };

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
              <span className="block text-4xl font-extrabold text-primary">6+</span>
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

              {/* Gallery with Album Navigation */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <ImageIcon className="mr-3 text-primary" /> Hình ảnh hoạt động
                    </h3>
                    
                    <div className="flex items-center gap-3">
                        {canEdit && (
                            <button 
                                onClick={() => setIsAddAlbumOpen(true)}
                                className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow transition mr-4"
                            >
                                <Plus size={16} className="mr-2" /> Thêm Album
                            </button>
                        )}
                        <button 
                            onClick={handlePrevAlbums} 
                            disabled={visibleStartIndex === 0}
                            className={`p-2 rounded-full border border-gray-200 transition ${visibleStartIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={handleNextAlbums}
                            disabled={visibleStartIndex + ITEMS_PER_PAGE >= galleryAlbums.length}
                            className={`p-2 rounded-full border border-gray-200 transition ${visibleStartIndex + ITEMS_PER_PAGE >= galleryAlbums.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {galleryAlbums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {galleryAlbums.slice(visibleStartIndex, visibleStartIndex + ITEMS_PER_PAGE).map((album) => (
                        <div 
                            key={album.id} 
                            onClick={() => { setSelectedAlbum(album); setCurrentImageIndex(0); }}
                            className="group relative cursor-pointer h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <img 
                                src={album.cover} 
                                alt={album.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity"></div>
                            
                            {/* Album Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                <span className="text-[10px] font-bold text-primary bg-white/20 backdrop-blur-sm px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                                    {album.date}
                                </span>
                                <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">{album.title}</h4>
                                <div className="flex items-center text-gray-300 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ImageIcon size={12} className="mr-1" /> {album.images.length} ảnh/video
                                </div>
                            </div>

                            {/* Delete Button (Admin) */}
                            {canEdit && (
                                <button 
                                    onClick={(e) => handleDeleteAlbum(album.id, e)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    title="Xóa Album"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                        Chưa có album nào.
                    </div>
                )}
              </div>

            </div>
            
            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-gray-500 italic">"Chúng tôi không chỉ vận chuyển hàng hóa, chúng tôi vận chuyển niềm tin."</p>
            </div>
          </div>
        </div>
      )}

      {/* ALBUM PREVIEW MODAL */}
      {selectedAlbum && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 bg-black/95 backdrop-blur-md">
              <button 
                onClick={() => setSelectedAlbum(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-50"
              >
                  <X size={32} />
              </button>

              <div className="w-full h-full flex flex-col">
                  {/* Main Display */}
                  <div className="flex-1 flex items-center justify-center relative px-4 md:px-20">
                      <button 
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                        className={`absolute left-4 md:left-8 p-3 rounded-full transition ${currentImageIndex === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
                      >
                          <ChevronLeft size={40} />
                      </button>

                      <div className="max-h-[80vh] max-w-full relative shadow-2xl">
                          <img 
                            src={selectedAlbum.images[currentImageIndex]} 
                            alt={`Slide ${currentImageIndex}`} 
                            className="max-h-[80vh] max-w-full object-contain rounded-lg"
                          />
                          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                              {currentImageIndex + 1} / {selectedAlbum.images.length}
                          </div>
                      </div>

                      <button 
                        onClick={handleNextImage}
                        disabled={currentImageIndex === selectedAlbum.images.length - 1}
                        className={`absolute right-4 md:right-8 p-3 rounded-full transition ${currentImageIndex === selectedAlbum.images.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white hover:bg-white/20'}`}
                      >
                          <ChevronRight size={40} />
                      </button>
                  </div>

                  {/* Thumbnails & Info */}
                  <div className="h-32 bg-black/40 border-t border-white/10 flex flex-col p-4">
                      <div className="flex justify-between items-center mb-4 px-4 text-white">
                          <h3 className="font-bold text-lg">{selectedAlbum.title}</h3>
                          <span className="text-sm opacity-70">{selectedAlbum.date}</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
                          {selectedAlbum.images.map((img, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition ${currentImageIndex === idx ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                              >
                                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ADD ALBUM MODAL */}
      {isAddAlbumOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddAlbumOpen(false)}></div>
              <div className="bg-white rounded-xl w-full max-w-lg relative z-20 overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-800">Thêm Album mới</h3>
                      <button onClick={() => setIsAddAlbumOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên Album</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary font-bold"
                            placeholder="VD: Tiệc tất niên 2024..."
                            value={newAlbumData.title}
                            onChange={(e) => setNewAlbumData({...newAlbumData, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ảnh bìa (URL)</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                            placeholder="https://..."
                            value={newAlbumData.cover}
                            onChange={(e) => setNewAlbumData({...newAlbumData, cover: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Danh sách ảnh/video (URL)</label>
                          <textarea 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm font-mono h-32"
                            placeholder="Dán link ảnh tại đây, mỗi link một dòng..."
                            value={newAlbumData.images}
                            onChange={(e) => setNewAlbumData({...newAlbumData, images: e.target.value})}
                          ></textarea>
                          <p className="text-[10px] text-gray-400 mt-1">* Hỗ trợ link ảnh và video (chỉ hiển thị thumbnail nếu là ảnh)</p>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => setIsAddAlbumOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm hover:bg-gray-200 rounded-lg transition">Hủy</button>
                      <button onClick={handleSaveAlbum} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primaryDark transition shadow-lg">Lưu Album</button>
                  </div>
              </div>
          </div>
      )}

    </section>
  );
};

export default About;

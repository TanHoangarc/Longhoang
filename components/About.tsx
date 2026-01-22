
import React, { useState, useEffect } from 'react';
import { X, Award, Users, TrendingUp, Calendar, ChevronLeft, ChevronRight, Play, Image as ImageIcon, Plus, Trash2, Edit, Save, Pin, PinOff, Upload, Loader2, CheckCircle } from 'lucide-react';
import { GalleryAlbum, UserRole, Milestone } from '../App';
import { API_BASE_URL } from '../constants';

interface AboutProps {
  galleryAlbums?: GalleryAlbum[];
  onUpdateGallery?: (albums: GalleryAlbum[]) => void;
  milestones?: Milestone[];
  onUpdateMilestones?: (milestones: Milestone[]) => void;
  userRole?: UserRole;
}

const About: React.FC<AboutProps> = ({ 
  galleryAlbums = [], 
  onUpdateGallery, 
  milestones = [], 
  onUpdateMilestones, 
  userRole 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Gallery States
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const ITEMS_PER_PAGE = 4;
  
  // Preview Album Modal
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Album Management (Add/Edit)
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
  const [albumFormData, setAlbumFormData] = useState({ title: '', cover: '', images: '', date: '' });
  
  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Milestone Management Modal
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestoneData, setNewMilestoneData] = useState<Milestone>({
    id: 0,
    year: '',
    title: '',
    desc: ''
  });

  // Can Edit?
  const canEdit = userRole === 'admin' || userRole === 'manager';

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen || selectedAlbum || isAlbumModalOpen || isMilestoneModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, selectedAlbum, isAlbumModalOpen, isMilestoneModalOpen]);

  // --- YOUTUBE HELPERS ---
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : url;
  };

  // Helper to parse date for sorting (MM/YYYY or YYYY)
  const parseDateScore = (dateStr: string) => {
      if (!dateStr) return 0;
      const parts = dateStr.split('/');
      if (parts.length === 2) { // MM/YYYY
          return parseInt(parts[1]) * 100 + parseInt(parts[0]); 
      }
      // Try parsing as Year
      const year = parseInt(dateStr);
      return isNaN(year) ? 0 : year * 100;
  };

  // Sort albums: Pinned First, then Newest to Oldest
  const sortedAlbums = [...galleryAlbums].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return parseDateScore(b.date) - parseDateScore(a.date);
  });

  // Navigation Logic for Main Gallery
  const handleNextAlbums = () => {
    if (visibleStartIndex + ITEMS_PER_PAGE < sortedAlbums.length) {
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

  // --- ALBUM MANAGEMENT HANDLERS ---

  const handleOpenAddAlbum = () => {
      setEditingAlbumId(null);
      setAlbumFormData({ title: '', cover: '', images: '', date: '' });
      setSelectedFiles([]);
      setIsAlbumModalOpen(true);
  };

  const handleEditAlbum = (album: GalleryAlbum, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingAlbumId(album.id);
      setAlbumFormData({
          title: album.title,
          cover: album.cover,
          images: album.images.join('\n'),
          date: album.date
      });
      setSelectedFiles([]);
      setIsAlbumModalOpen(true);
  };

  const handleTogglePin = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (onUpdateGallery) {
          onUpdateGallery(galleryAlbums.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setSelectedFiles(Array.from(e.target.files));
      }
  };

  const handleSaveAlbum = async () => {
    if (!albumFormData.title) return alert('Vui lòng nhập tiêu đề!');
    if (!albumFormData.cover && !albumFormData.images && selectedFiles.length === 0) return alert('Vui lòng thêm ít nhất 1 ảnh (Link hoặc Tải lên)');
    
    setIsUploading(true);

    // 1. Process Uploaded Files
    const uploadedUrls: string[] = [];
    if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                // Upload to GALLERY folder
                const res = await fetch(`${API_BASE_URL}/api/upload?category=GALLERY`, {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    // Construct full URL
                    uploadedUrls.push(`${API_BASE_URL}/files/GALLERY/${data.record.fileName}`);
                }
            } catch (error) {
                console.error("Upload failed for", file.name, error);
            }
        }
    }

    // 2. Process Existing Textarea URLs
    const textUrls = albumFormData.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    
    // 3. Combine All Images
    const allImages = [...textUrls, ...uploadedUrls];
    
    // 4. Handle Cover Image
    let finalCover = albumFormData.cover;
    // If no cover set but we have images, take the first one
    if (!finalCover && allImages.length > 0) {
        finalCover = allImages[0];
    }

    // 5. Update State
    if (onUpdateGallery) {
        if (editingAlbumId) {
            // Update Existing
            onUpdateGallery(galleryAlbums.map(a => a.id === editingAlbumId ? {
                ...a,
                title: albumFormData.title,
                cover: finalCover,
                images: allImages,
                date: albumFormData.date || a.date
            } : a));
        } else {
            // Create New
            const newAlbum: GalleryAlbum = {
                id: Date.now(),
                title: albumFormData.title,
                cover: finalCover,
                images: allImages,
                date: albumFormData.date || new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
                isPinned: false
            };
            onUpdateGallery([newAlbum, ...galleryAlbums]);
        }
    }
    
    setIsUploading(false);
    setIsAlbumModalOpen(false);
    setEditingAlbumId(null);
    setAlbumFormData({ title: '', cover: '', images: '', date: '' });
    setSelectedFiles([]);
  };

  const handleDeleteAlbum = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa Album này?')) {
      if (onUpdateGallery) {
        onUpdateGallery(galleryAlbums.filter(a => a.id !== id));
      }
    }
  };

  // --- MILESTONE HANDLERS ---
  const handleAddMilestone = () => {
    setEditingMilestone(null);
    setNewMilestoneData({ id: 0, year: '', title: '', desc: '' });
    // Keep modal open, just clear form
  };

  const handleSaveMilestone = () => {
    if (!newMilestoneData.year || !newMilestoneData.title) return alert('Vui lòng nhập năm và tiêu đề!');
    
    if (onUpdateMilestones) {
        if (editingMilestone) {
            onUpdateMilestones(milestones.map(m => m.id === editingMilestone.id ? { ...newMilestoneData, id: editingMilestone.id } : m));
        } else {
            onUpdateMilestones([...milestones, { ...newMilestoneData, id: Date.now() }]);
        }
    }
    
    // Reset form
    setEditingMilestone(null);
    setNewMilestoneData({ id: 0, year: '', title: '', desc: '' });
  };

  const handleEditMilestone = (m: Milestone) => {
    setEditingMilestone(m);
    setNewMilestoneData({ ...m });
  };

  const handleDeleteMilestone = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mốc này?')) {
        if (onUpdateMilestones) {
            onUpdateMilestones(milestones.filter(m => m.id !== id));
        }
        if (editingMilestone?.id === id) {
            setEditingMilestone(null);
            setNewMilestoneData({ id: 0, year: '', title: '', desc: '' });
        }
    }
  };

  // Sort milestones by year (Newest to Oldest)
  const sortedMilestones = [...milestones].sort((a, b) => parseInt(b.year) - parseInt(a.year));

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
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Calendar className="mr-3 text-primary" /> Lịch sử hình thành
                    </h3>
                    {canEdit && (
                        <button 
                            onClick={() => setIsMilestoneModalOpen(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition"
                        >
                            <Edit size={14} className="mr-2" /> Quản lý lịch sử
                        </button>
                    )}
                </div>
                
                <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-12">
                  {sortedMilestones.map((milestone) => (
                    <div key={milestone.id} className="relative pl-8 md:pl-12">
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
                                onClick={handleOpenAddAlbum}
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
                            disabled={visibleStartIndex + ITEMS_PER_PAGE >= sortedAlbums.length}
                            className={`p-2 rounded-full border border-gray-200 transition ${visibleStartIndex + ITEMS_PER_PAGE >= sortedAlbums.length ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {sortedAlbums.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sortedAlbums.slice(visibleStartIndex, visibleStartIndex + ITEMS_PER_PAGE).map((album) => {
                        const videoId = getYouTubeId(album.cover);
                        const displayImage = videoId ? getYouTubeThumbnail(album.cover) : album.cover;

                        return (
                        <div 
                            key={album.id} 
                            onClick={() => { setSelectedAlbum(album); setCurrentImageIndex(0); }}
                            className="group relative cursor-pointer h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <img 
                                src={displayImage} 
                                alt={album.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            {/* Play Icon if video cover */}
                            {videoId && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                        <Play size={20} className="text-white fill-white ml-1" />
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity"></div>
                            
                            {/* Pinned Badge */}
                            {album.isPinned && (
                                <div className="absolute top-2 left-2 z-10 bg-primary text-white p-1.5 rounded-full shadow-md">
                                    <Pin size={12} fill="white" />
                                </div>
                            )}

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

                            {/* Actions Overlay (Admin) */}
                            {canEdit && (
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button 
                                        onClick={(e) => handleEditAlbum(album, e)}
                                        className="p-2 bg-white/90 text-blue-600 rounded-lg shadow-sm hover:bg-white"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleTogglePin(album.id, e)}
                                        className="p-2 bg-white/90 text-gray-600 rounded-lg shadow-sm hover:bg-white hover:text-primary"
                                        title={album.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                                    >
                                        {album.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteAlbum(album.id, e)}
                                        className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-white"
                                        title="Xóa Album"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )})}
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

      {/* MILESTONE MANAGEMENT MODAL */}
      {isMilestoneModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMilestoneModalOpen(false)}></div>
              <div className="bg-white rounded-2xl w-full max-w-4xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-200 shadow-2xl">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <Calendar size={20} className="mr-2 text-primary" /> Quản lý Lịch sử hình thành
                      </h3>
                      <button onClick={() => setIsMilestoneModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                      {/* Left: Form */}
                      <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                          <h4 className="font-bold text-gray-700 mb-4">{editingMilestone ? 'Chỉnh sửa mốc' : 'Thêm mốc mới'}</h4>
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Năm</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary font-bold"
                                    placeholder="2024"
                                    value={newMilestoneData.year}
                                    onChange={(e) => setNewMilestoneData({...newMilestoneData, year: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tiêu đề</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary"
                                    placeholder="Thành lập chi nhánh..."
                                    value={newMilestoneData.title}
                                    onChange={(e) => setNewMilestoneData({...newMilestoneData, title: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mô tả</label>
                                  <textarea 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary h-24 text-sm"
                                    placeholder="Mô tả chi tiết..."
                                    value={newMilestoneData.desc}
                                    onChange={(e) => setNewMilestoneData({...newMilestoneData, desc: e.target.value})}
                                  ></textarea>
                              </div>
                              <div className="flex gap-2">
                                  {editingMilestone && (
                                      <button 
                                        onClick={handleAddMilestone}
                                        className="flex-1 py-2 bg-gray-200 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-300 transition"
                                      >
                                          Hủy sửa
                                      </button>
                                  )}
                                  <button 
                                    onClick={handleSaveMilestone}
                                    className="flex-1 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primaryDark transition flex items-center justify-center shadow-lg"
                                  >
                                      {editingMilestone ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                                      {editingMilestone ? 'Cập nhật' : 'Thêm mới'}
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Right: List */}
                      <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
                          <h4 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                              <span>Danh sách mốc thời gian</span>
                              <span className="text-xs font-normal text-gray-400">{milestones.length} mốc</span>
                          </h4>
                          <div className="space-y-3">
                              {sortedMilestones.map((m) => (
                                  <div key={m.id} className={`p-4 rounded-xl border transition flex justify-between items-start group ${editingMilestone?.id === m.id ? 'bg-orange-50 border-primary' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">{m.year}</span>
                                              <span className="font-bold text-gray-800">{m.title}</span>
                                          </div>
                                          <p className="text-sm text-gray-500 line-clamp-2">{m.desc}</p>
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleEditMilestone(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                          <button onClick={() => handleDeleteMilestone(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                      </div>
                                  </div>
                              ))}
                              {milestones.length === 0 && (
                                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                      Chưa có dữ liệu.
                                  </div>
                              )}
                          </div>
                      </div>
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

                      <div className="max-h-[80vh] max-w-full relative shadow-2xl flex items-center justify-center">
                          {(() => {
                              const currentUrl = selectedAlbum.images[currentImageIndex];
                              const videoId = getYouTubeId(currentUrl);
                              if (videoId) {
                                  return (
                                      <iframe 
                                          className="w-[80vw] h-[45vw] max-h-[80vh] max-w-[1200px] rounded-lg"
                                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                          title="YouTube video player"
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                          allowFullScreen
                                      ></iframe>
                                  );
                              } else {
                                  return (
                                      <img 
                                        src={currentUrl} 
                                        alt={`Slide ${currentImageIndex}`} 
                                        className="max-h-[80vh] max-w-full object-contain rounded-lg"
                                      />
                                  );
                              }
                          })()}
                          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm pointer-events-none">
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
                          {selectedAlbum.images.map((img, idx) => {
                              const thumbVideoId = getYouTubeId(img);
                              const thumbSrc = thumbVideoId ? getYouTubeThumbnail(img) : img;
                              
                              return (
                                <div 
                                    key={idx} 
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition relative ${currentImageIndex === idx ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={thumbSrc} className="w-full h-full object-cover" alt="thumbnail" />
                                    {thumbVideoId && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                            <Play size={16} className="text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* ADD/EDIT ALBUM MODAL */}
      {isAlbumModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isUploading && setIsAlbumModalOpen(false)}></div>
              <div className="bg-white rounded-xl w-full max-w-lg relative z-20 overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          {editingAlbumId ? <Edit size={20} className="mr-2 text-blue-600"/> : <Plus size={20} className="mr-2 text-green-600"/>}
                          {editingAlbumId ? 'Chỉnh sửa Album' : 'Thêm Album mới'}
                      </h3>
                      <button onClick={() => !isUploading && setIsAlbumModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên Album</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary font-bold"
                            placeholder="VD: Tiệc tất niên 2024..."
                            value={albumFormData.title}
                            onChange={(e) => setAlbumFormData({...albumFormData, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Thời gian</label>
                              <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                                placeholder="VD: 05/2024"
                                value={albumFormData.date}
                                onChange={(e) => setAlbumFormData({...albumFormData, date: e.target.value})}
                              />
                          </div>
                          <div className="sm:col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ảnh bìa (URL hoặc Link YouTube)</label>
                              <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                                placeholder="https://..."
                                value={albumFormData.cover}
                                onChange={(e) => setAlbumFormData({...albumFormData, cover: e.target.value})}
                              />
                          </div>
                      </div>
                      
                      {/* UPLOAD SECTION */}
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                          <label className="text-xs font-bold text-primary uppercase block mb-2 flex items-center">
                              <Upload size={14} className="mr-1"/> Tải ảnh từ máy tính (Ổ E)
                          </label>
                          <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-primary hover:file:bg-orange-50 cursor-pointer"
                              onChange={handleFileSelect}
                          />
                          {selectedFiles.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 font-medium">
                                  <CheckCircle size={12} className="inline mr-1 text-green-500"/>
                                  Đã chọn {selectedFiles.length} file (Sẽ được tải lên khi nhấn Lưu)
                              </div>
                          )}
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Dán Link ảnh (URL) hoặc Link Video YouTube</label>
                          <textarea 
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm font-mono h-24"
                            placeholder="Dán link ảnh hoặc link YouTube (VD: https://youtu.be/...) tại đây, mỗi link một dòng..."
                            value={albumFormData.images}
                            onChange={(e) => setAlbumFormData({...albumFormData, images: e.target.value})}
                          ></textarea>
                          <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ hiển thị video trực tiếp từ YouTube.</p>
                      </div>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button 
                        onClick={() => !isUploading && setIsAlbumModalOpen(false)} 
                        className="px-4 py-2 text-gray-500 font-bold text-sm hover:bg-gray-200 rounded-lg transition"
                        disabled={isUploading}
                      >
                          Hủy
                      </button>
                      <button 
                        onClick={handleSaveAlbum} 
                        className={`px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primaryDark transition shadow-lg flex items-center ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isUploading}
                      >
                          {isUploading && <Loader2 size={16} className="mr-2 animate-spin" />}
                          {isUploading ? 'Đang tải lên...' : (editingAlbumId ? 'Cập nhật' : 'Lưu Album')}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </section>
  );
};

export default About;

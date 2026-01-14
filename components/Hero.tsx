
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, MapPin, Calendar, Tag, Plus, Edit, Trash2, Image as ImageIcon, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, UserRole } from '../App';

interface HeroProps {
  projects: Project[];
  onUpdateProjects: (projects: Project[]) => void;
  userRole: UserRole;
}

const Hero: React.FC<HeroProps> = ({ projects, onUpdateProjects, userRole }) => {
  // Main Modal (List & View)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Edit/Add Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // View Detail Project (for Album viewing)
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Form State
  const [formData, setFormData] = useState<Project>({
    id: 0,
    title: '',
    category: '',
    location: '',
    date: '',
    images: [],
    desc: ''
  });
  
  // Image Input State (TextArea for URLs)
  const [imageUrls, setImageUrls] = useState('');

  // Can Edit? (Admin, Manager, Sales)
  const canEdit = userRole === 'admin' || userRole === 'manager' || userRole === 'staff';

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isProjectModalOpen || isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isProjectModalOpen, isEditModalOpen]);

  // --- CRUD HANDLERS ---

  const handleAddNew = () => {
    setEditingProject(null);
    setFormData({
      id: Date.now(),
      title: '',
      category: 'Dự án Logistics',
      location: '',
      date: new Date().toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      images: [],
      desc: ''
    });
    setImageUrls('');
    setIsEditModalOpen(true);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData(project);
    setImageUrls(project.images.join('\n'));
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      onUpdateProjects(projects.filter(p => p.id !== id));
      // If currently viewing deleted project, go back to list
      if (viewingProject?.id === id) setViewingProject(null);
    }
  };

  const handleSave = () => {
    if (!formData.title) return alert('Vui lòng nhập tiêu đề dự án');
    
    // Process Images
    const processedImages = imageUrls
        .split(/[\n,]+/) // Split by newline or comma
        .map(url => url.trim())
        .filter(url => url.length > 0);

    const finalProject: Project = {
        ...formData,
        images: processedImages.length > 0 ? processedImages : ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"] // Fallback image
    };

    if (editingProject) {
        onUpdateProjects(projects.map(p => p.id === editingProject.id ? finalProject : p));
    } else {
        onUpdateProjects([finalProject, ...projects]);
    }
    
    setIsEditModalOpen(false);
  };

  // --- RENDER HELPERS ---

  const renderDetailView = (project: Project) => {
    return (
        <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-10 duration-300">
            {/* Header Detail */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                <button 
                    onClick={() => setViewingProject(null)}
                    className="flex items-center text-gray-500 hover:text-primary transition font-bold text-sm"
                >
                    <ChevronLeft size={20} className="mr-1" /> Quay lại danh sách
                </button>
                <div className="flex items-center space-x-2">
                    {canEdit && (
                        <>
                            <button onClick={(e) => handleEdit(project, e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><Edit size={18} /></button>
                            <button onClick={(e) => handleDelete(project.id, e)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 size={18} /></button>
                        </>
                    )}
                    <button onClick={() => setIsProjectModalOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"><X size={20} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                    <span className="text-primary font-bold uppercase text-xs tracking-widest bg-orange-50 px-3 py-1 rounded-full mb-4 inline-block">{project.category}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-6 leading-tight">{project.title}</h2>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                        <div className="flex items-center"><MapPin size={18} className="text-primary mr-2" /> {project.location}</div>
                        <div className="flex items-center"><Calendar size={18} className="text-primary mr-2" /> {project.date}</div>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-lg mb-10 whitespace-pre-line">{project.desc}</p>

                    {/* Album Grid */}
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><ImageIcon size={20} className="mr-2 text-primary" /> Album ảnh dự án</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.images.map((img, idx) => (
                            <div key={idx} className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group relative ${idx === 0 ? 'md:col-span-2 md:h-[400px]' : 'h-64'}`}>
                                <img src={img} alt={`Project ${idx}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <section className="relative h-[600px] sm:h-[700px] flex items-center bg-gray-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://plus.unsplash.com/premium_photo-1661962773421-6b97ceec1f0e?q=80&w=1147&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Logistics warehouse" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-4">
             <div className="h-1 w-12 bg-primary"></div>
             <span className="text-primary font-bold tracking-widest uppercase text-sm">Long Hoang Logistics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            KẾT NỐI <br/>
            DOANH NGHIỆP CỦA BẠN <br/>
            VỚI THẾ GIỚI
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl border-l-4 border-primary pl-4">
            Đã là một thực tế được chứng minh từ lâu rằng giải pháp vận chuyển thông minh sẽ giúp doanh nghiệp tiết kiệm chi phí và tối ưu hóa lợi nhuận.
          </p>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-primary hover:bg-primaryDark text-white px-8 py-4 rounded font-bold text-lg transition transform hover:-translate-y-1 shadow-lg shadow-orange-500/30"
          >
            Xem dịch vụ & Dự án
          </button>
        </div>
      </div>
      
      {/* Decorative dots element from image */}
      <div className="absolute bottom-10 right-10 hidden lg:block opacity-30">
        <div className="grid grid-cols-6 gap-2">
            {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>
            ))}
        </div>
      </div>

      {/* Projects Modal (Main) */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsProjectModalOpen(false)}
          ></div>

          <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl relative z-10 h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            {viewingProject ? (
                renderDetailView(viewingProject)
            ) : (
                <>
                    {/* List View Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-xl sticky top-0 z-20">
                    <div>
                        <span className="text-primary font-bold uppercase text-xs tracking-wider">Dự án đã thực hiện</span>
                        <h2 className="text-2xl font-bold text-gray-800 mt-1">Các dự án tiêu biểu</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        {canEdit && (
                            <button 
                                onClick={handleAddNew}
                                className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg transition"
                            >
                                <Plus size={16} className="mr-2" /> Thêm dự án
                            </button>
                        )}
                        <button 
                            onClick={() => setIsProjectModalOpen(false)}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    </div>

                    {/* List View Body */}
                    <div className="overflow-y-auto p-6 bg-gray-50 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {projects.map((project) => (
                            <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group relative">
                                {/* Image Wrapper */}
                                <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => setViewingProject(project)}>
                                    <img 
                                        src={project.images[0]} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded shadow-md uppercase">
                                        {project.category}
                                    </div>
                                    {project.images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                                            <ImageIcon size={12} className="mr-1" /> +{project.images.length - 1} ảnh
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow relative">
                                    {/* Edit Actions Overlay on Hover (Admin only) */}
                                    {canEdit && (
                                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button onClick={(e) => handleEdit(project, e)} className="p-2 bg-white/90 text-blue-600 rounded-lg shadow hover:bg-blue-50"><Edit size={16} /></button>
                                            <button onClick={(e) => handleDelete(project.id, e)} className="p-2 bg-white/90 text-red-500 rounded-lg shadow hover:bg-red-50"><Trash2 size={16} /></button>
                                        </div>
                                    )}

                                    <h3 
                                        className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors cursor-pointer"
                                        onClick={() => setViewingProject(project)}
                                    >
                                        {project.title}
                                    </h3>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                        <MapPin size={16} className="text-primary mr-1" />
                                        {project.location}
                                        </div>
                                        <div className="flex items-center">
                                        <Calendar size={16} className="text-primary mr-1" />
                                        {project.date}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed mb-6 flex-grow line-clamp-3">
                                        {project.desc}
                                    </p>

                                    <button 
                                        onClick={() => setViewingProject(project)}
                                        className="flex items-center text-primary font-bold uppercase text-sm tracking-wide hover:underline mt-auto"
                                    >
                                        Xem chi tiết <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                            ))}
                        </div>
                        
                        {/* CTA in Modal */}
                        <div className="mt-12 bg-[#1e2a3b] rounded-lg p-8 text-center text-white relative overflow-hidden">
                            <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Bạn có dự án cần vận chuyển?</h3>
                            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Liên hệ ngay với đội ngũ chuyên gia của Long Hoang Logistics để được tư vấn giải pháp tối ưu nhất cho dự án của bạn.</p>
                            <a href="#contact" onClick={() => setIsProjectModalOpen(false)} className="inline-block bg-primary hover:bg-primaryDark text-white px-8 py-3 rounded font-bold transition">
                                Liên hệ ngay
                            </a>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Tag size={120} />
                            </div>
                        </div>
                    </div>
                </>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
              <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          {editingProject ? <Edit className="mr-2 text-blue-600" size={20} /> : <Plus className="mr-2 text-green-600" size={20} />}
                          {editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
                      </h3>
                      <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên dự án <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary font-bold text-gray-800"
                            placeholder="Nhập tên dự án..."
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Hạng mục</label>
                              <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm"
                                placeholder="VD: Hàng siêu trường..."
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Thời gian</label>
                              <input 
                                type="text" 
                                className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm"
                                placeholder="VD: T8/2023"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Địa điểm</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm"
                            placeholder="VD: Cảng Cát Lái - Rotterdam"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Album ảnh (URLs)</label>
                          <textarea 
                            className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-xs font-mono h-24"
                            placeholder="Dán link ảnh tại đây (mỗi link một dòng hoặc cách nhau bằng dấu phẩy)..."
                            value={imageUrls}
                            onChange={e => setImageUrls(e.target.value)}
                          ></textarea>
                          <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ nhiều ảnh để tạo Album.</p>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Mô tả chi tiết</label>
                          <textarea 
                            className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-primary text-sm h-32"
                            placeholder="Mô tả chi tiết về dự án..."
                            value={formData.desc}
                            onChange={e => setFormData({...formData, desc: e.target.value})}
                          ></textarea>
                      </div>
                  </div>

                  <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                      <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition">Hủy bỏ</button>
                      <button onClick={handleSave} className="px-6 py-2 bg-primary hover:bg-primaryDark text-white text-sm font-bold rounded-lg shadow-lg transition flex items-center">
                          <Save size={16} className="mr-2" /> Lưu dự án
                      </button>
                  </div>
              </div>
          </div>
      )}
    </section>
  );
};

export default Hero;

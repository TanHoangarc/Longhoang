
import React, { useState } from 'react';
import { 
  BookOpen, Plus, Calendar, Pin, AlertCircle, PinOff, Edit, Trash2, X, Image as ImageIcon, RefreshCcw, FileText, Upload 
} from 'lucide-react';
import { Decree } from '../../App';
import { API_BASE_URL } from '../../constants';

interface CompanyDecreesProps {
  decrees: Decree[];
  onUpdate: (decrees: Decree[]) => void;
}

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Law/Documents
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Gavel
  "https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Books
  "https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"  // Pen
];

const CompanyDecrees: React.FC<CompanyDecreesProps> = ({ decrees, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDecreeFile, setNewDecreeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newDecreeData, setNewDecreeData] = useState({
    title: '',
    content: '',
    image: STOCK_IMAGES[0],
    attachment: '',
    expiryDate: ''
  });

  const togglePin = (id: number) => {
    onUpdate(decrees.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const deleteDecree = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa nghị định này?')) {
      onUpdate(decrees.filter(n => n.id !== id));
    }
  };

  const editDecree = (id: number) => {
    const n = decrees.find(d => d.id === id);
    const newTitle = prompt('Nhập tiêu đề mới:', n?.title);
    if (newTitle) {
      onUpdate(decrees.map(d => d.id === id ? { ...d, title: newTitle } : d));
    }
  };

  const openModal = () => {
    setNewDecreeData({
      title: '',
      content: '',
      image: STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)],
      attachment: '',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setNewDecreeFile(null);
    setIsModalOpen(true);
  };

  const ensureImageSuffix = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('auto=format') && url.includes('w=800')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&w=800&q=80`;
  };

  const handleCreate = async () => {
    if (!newDecreeData.title.trim() || !newDecreeData.content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung!');
      return;
    }

    setIsUploading(true);
    let finalAttachmentName = newDecreeData.attachment;

    // 1. Upload file if exists
    if (newDecreeFile) {
        try {
            const formData = new FormData();
            formData.append('file', newDecreeFile);
            // Updated to use absolute API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/api/upload?category=NGHIDINH`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                finalAttachmentName = data.record.fileName;
            } else {
                alert('Lỗi tải file. Vui lòng thử lại.');
                setIsUploading(false);
                return;
            }
        } catch (e) {
            console.error(e);
            alert('Lỗi kết nối khi tải file.');
            setIsUploading(false);
            return;
        }
    }

    // 2. Save Decree
    const newDecree: Decree = {
      id: Date.now(),
      date: new Date().toLocaleDateString('vi-VN'),
      title: newDecreeData.title,
      content: newDecreeData.content,
      attachment: finalAttachmentName || undefined,
      expiryDate: newDecreeData.expiryDate,
      isPinned: false,
      image: ensureImageSuffix(newDecreeData.image) || STOCK_IMAGES[0]
    };

    onUpdate([newDecree, ...decrees]);
    setIsUploading(false);
    setIsModalOpen(false);
  };

  const handleRandomImage = () => {
    const randomImg = STOCK_IMAGES[Math.floor(Math.random() * STOCK_IMAGES.length)];
    setNewDecreeData({ ...newDecreeData, image: randomImg });
  };

  const sortedDecrees = [...decrees].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Nghị định & Văn bản pháp luật</h3>
          <p className="text-sm text-gray-500 font-medium">Hệ thống văn bản, thông tư và nghị định mới nhất về Logistics</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-orange-100 transition-all transform active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Thêm nghị định mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedDecrees.map((item) => {
          const isExpired = new Date(item.expiryDate) < new Date();
          
          return (
            <div 
              key={item.id}
              className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpired ? 'filter grayscale opacity-75' : ''}`}
            >
              {/* Header Image with Blur and Overlay Text */}
              <div className="h-48 overflow-hidden relative">
                {/* Blurred Image */}
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transform scale-110 filter blur-[3px] transition-transform duration-700 group-hover:scale-125" 
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                
                {/* Centered Title */}
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <h4 className="text-white text-xl md:text-2xl font-black uppercase tracking-wider leading-tight drop-shadow-xl select-none">
                        {item.title}
                    </h4>
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.isPinned && (
                    <div className="bg-primary text-white p-2 rounded-lg shadow-lg">
                      <Pin size={14} fill="white" />
                    </div>
                  )}
                  {isExpired && (
                    <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
                      <AlertCircle size={10} className="mr-1" /> Hết hiệu lực
                    </div>
                  )}
                </div>

                {/* Date Overlay */}
                <div className="absolute bottom-4 left-4 text-white/80">
                  <div className="flex items-center text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={12} className="mr-1" /> {item.date}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-4">
                <div>
                  {/* Content only, since title is on image */}
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {item.attachment && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all group/file">
                    <FileText size={16} className="text-gray-400 group-hover/file:text-primary" />
                    <span className="text-xs font-bold text-gray-600 group-hover/file:text-primary transition-colors">{item.attachment}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-gray-400 uppercase">
                  <span>Hiệu lực đến: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => togglePin(item.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-primary transition-colors"
                  title={item.isPinned ? "Bỏ ghim" : "Ghim"}
                >
                  {item.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button 
                  onClick={() => editDecree(item.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-blue-500 transition-colors"
                  title="Sửa tiêu đề"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => deleteDecree(item.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="mr-2 text-primary" /> Thêm nghị định mới
                </h3>
                <button onClick={() => !isUploading && setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
             </div>
             
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Tiêu đề (Hiển thị trên ảnh) <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition font-bold text-gray-700"
                    placeholder="VD: NGHỊ ĐỊNH 15/2022..."
                    value={newDecreeData.title}
                    onChange={(e) => setNewDecreeData({...newDecreeData, title: e.target.value.toUpperCase()})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-500 uppercase">Ảnh nền (URL)</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-sm"
                          placeholder="https://..."
                          value={newDecreeData.image}
                          onChange={(e) => setNewDecreeData({...newDecreeData, image: e.target.value})}
                          onBlur={() => setNewDecreeData(prev => ({...prev, image: ensureImageSuffix(prev.image)}))}
                        />
                        <button 
                          onClick={handleRandomImage}
                          className="p-2 bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-primary rounded-xl transition"
                          title="Chọn ảnh ngẫu nhiên"
                        >
                          <RefreshCcw size={20} />
                        </button>
                     </div>
                     {/* Preview with Blur Effect */}
                     <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mt-2 relative group">
                        {newDecreeData.image ? (
                           <>
                             <img src={ensureImageSuffix(newDecreeData.image)} alt="Preview" className="w-full h-full object-cover filter blur-[2px]" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                                <span className="text-white font-bold text-center text-xs uppercase">{newDecreeData.title || 'Tiêu đề hiển thị ở đây'}</span>
                             </div>
                           </>
                        ) : (
                           <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={24} /></div>
                        )}
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Ngày hết hạn</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-sm"
                          value={newDecreeData.expiryDate}
                          onChange={(e) => setNewDecreeData({...newDecreeData, expiryDate: e.target.value})}
                        />
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">File văn bản đính kèm</label>
                        <div className="relative group">
                            <div className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${newDecreeData.attachment ? 'border-primary bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary'}`}>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewDecreeFile(file);
                                            setNewDecreeData({ ...newDecreeData, attachment: file.name });
                                        }
                                    }}
                                />
                                <div className="flex items-center space-x-2">
                                    {newDecreeData.attachment ? (
                                        <>
                                            <FileText size={20} className="text-primary" />
                                            <span className="text-sm font-bold text-primary truncate max-w-[150px]">{newDecreeData.attachment}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} className="text-gray-400 group-hover:text-primary" />
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-primary">Tải file PDF/DOC</span>
                                        </>
                                    )}
                                </div>
                            </div>
                             {newDecreeData.attachment && (
                                <button 
                                    onClick={() => { setNewDecreeData({...newDecreeData, attachment: ''}); setNewDecreeFile(null); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 z-10"
                                    title="Xóa file"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                     </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Nội dung tóm tắt <span className="text-red-500">*</span></label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition min-h-[120px]"
                    placeholder="Mô tả nội dung chính của nghị định..."
                    value={newDecreeData.content}
                    onChange={(e) => setNewDecreeData({...newDecreeData, content: e.target.value})}
                  ></textarea>
                </div>
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  onClick={() => !isUploading && setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
                  disabled={isUploading}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleCreate}
                  className={`px-6 py-2 rounded-xl font-bold text-white transition shadow-lg shadow-orange-200 ${isUploading ? 'bg-gray-400' : 'bg-primary hover:bg-primaryDark'}`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang lưu...' : 'Lưu nghị định'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDecrees;


import React, { useState } from 'react';
import { 
  Bell, Plus, Calendar, Pin, AlertCircle, PinOff, Edit, Trash2, X, Image as ImageIcon, RefreshCcw, FileText, Upload 
} from 'lucide-react';
import { SystemNotification } from '../../App';
import { API_BASE_URL } from '../../constants';

const LOGISTICS_IMAGES = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

interface CompanyNotificationsProps {
  notifications: SystemNotification[];
  onUpdate: (notifs: SystemNotification[]) => void;
}

const CompanyNotifications: React.FC<CompanyNotificationsProps> = ({ notifications, onUpdate }) => {
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNotifFile, setNewNotifFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newNotifData, setNewNotifData] = useState({
    title: '',
    content: '',
    image: LOGISTICS_IMAGES[0],
    attachment: '',
    startDate: '',
    expiryDate: ''
  });

  const togglePin = (id: number) => {
    onUpdate(notifications.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const deleteNotification = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      onUpdate(notifications.filter(n => n.id !== id));
    }
  };

  const editNotification = (id: number) => {
    const n = notifications.find(notif => notif.id === id);
    if (n) {
      setEditingId(id);
      setNewNotifData({
        title: n.title,
        content: n.content,
        image: n.image,
        attachment: n.attachment || '',
        startDate: n.startDate,
        expiryDate: n.expiryDate
      });
      setNewNotifFile(null);
      setIsNotifModalOpen(true);
    }
  };

  const addNotification = () => {
    setEditingId(null);
    setNewNotifData({
      title: '',
      content: '',
      image: LOGISTICS_IMAGES[Math.floor(Math.random() * LOGISTICS_IMAGES.length)],
      attachment: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setNewNotifFile(null);
    setIsNotifModalOpen(true);
  };

  const ensureImageSuffix = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.includes('auto=format') && url.includes('w=800')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=format&fit=crop&w=800&q=80`;
  };

  const handleSaveNotification = async () => {
    if (!newNotifData.title.trim() || !newNotifData.content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung thông báo!');
      return;
    }

    if (newNotifData.startDate > newNotifData.expiryDate) {
        alert('Ngày bắt đầu không được lớn hơn ngày hết hạn!');
        return;
    }

    setIsUploading(true);
    let finalAttachmentName = newNotifData.attachment;

    // 1. Upload file if newly selected
    if (newNotifFile) {
        try {
            const formData = new FormData();
            formData.append('file', newNotifFile);
            // Updated to use absolute API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/api/upload?category=THONGBAO`, {
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

    if (editingId) {
      // Update existing
      onUpdate(notifications.map(n => n.id === editingId ? {
        ...n,
        title: newNotifData.title,
        content: newNotifData.content,
        image: ensureImageSuffix(newNotifData.image),
        attachment: finalAttachmentName,
        startDate: newNotifData.startDate,
        expiryDate: newNotifData.expiryDate
      } : n));
    } else {
      // Create new
      const newNotif: SystemNotification = {
        id: Date.now(),
        date: new Date().toLocaleDateString('vi-VN'),
        title: newNotifData.title,
        content: newNotifData.content,
        attachment: finalAttachmentName || undefined,
        startDate: newNotifData.startDate,
        expiryDate: newNotifData.expiryDate,
        isPinned: false,
        image: ensureImageSuffix(newNotifData.image) || LOGISTICS_IMAGES[0]
      };
      onUpdate([newNotif, ...notifications]);
    }

    setIsUploading(false);
    setIsNotifModalOpen(false);
  };

  const handleRandomImage = () => {
    const randomImg = LOGISTICS_IMAGES[Math.floor(Math.random() * LOGISTICS_IMAGES.length)];
    setNewNotifData({ ...newNotifData, image: randomImg });
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Thông báo hệ thống</h3>
          <p className="text-sm text-gray-500 font-medium">Cập nhật tin tức nội bộ và thông tin vận hành quan trọng</p>
        </div>
        <button 
          onClick={addNotification}
          className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-orange-100 transition-all transform active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Tạo thông báo mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedNotifications.map((notif) => {
          const isExpired = new Date(notif.expiryDate) < new Date();
          
          return (
            <div 
              key={notif.id}
              className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpired ? 'filter grayscale opacity-75' : ''}`}
            >
              {/* Header Image */}
              <div className="h-48 overflow-hidden relative">
                <img src={notif.image} alt={notif.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {notif.isPinned && (
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
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center text-[10px] font-bold uppercase tracking-widest opacity-80">
                    <Calendar size={12} className="mr-1" /> {notif.date}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                    {notif.content}
                  </p>
                </div>

                {notif.attachment && (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all group/file">
                    <FileText size={16} className="text-gray-400 group-hover/file:text-primary" />
                    <span className="text-xs font-bold text-gray-600 group-hover/file:text-primary transition-colors">{notif.attachment}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-gray-400 uppercase">
                  <span>
                      Hiệu lực: {new Date(notif.startDate).toLocaleDateString('vi-VN')} - {new Date(notif.expiryDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => togglePin(notif.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-primary transition-colors"
                  title={notif.isPinned ? "Bỏ ghim" : "Ghim thông báo"}
                >
                  {notif.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button 
                  onClick={() => editNotification(notif.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-gray-600 hover:text-blue-500 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => deleteNotification(notif.id)}
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

      {/* CREATE/EDIT NOTIFICATION MODAL */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setIsNotifModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Bell className="mr-2 text-primary" /> {editingId ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                </h3>
                <button onClick={() => !isUploading && setIsNotifModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
             </div>
             
             <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase">Tiêu đề thông báo <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition font-bold text-gray-700"
                    placeholder="Nhập tiêu đề (VD: Nghỉ lễ 2/9...)"
                    value={newNotifData.title}
                    onChange={(e) => setNewNotifData({...newNotifData, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-gray-500 uppercase">Ảnh bìa (URL)</label>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-sm"
                          placeholder="https://..."
                          value={newNotifData.image}
                          onChange={(e) => setNewNotifData({...newNotifData, image: e.target.value})}
                          onBlur={() => setNewNotifData(prev => ({...prev, image: ensureImageSuffix(prev.image)}))}
                        />
                        <button 
                          onClick={handleRandomImage}
                          className="p-2 bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-primary rounded-xl transition"
                          title="Chọn ảnh ngẫu nhiên"
                        >
                          <RefreshCcw size={20} />
                        </button>
                     </div>
                     {/* Preview */}
                     <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mt-2 relative group">
                        {newNotifData.image ? (
                           <img src={ensureImageSuffix(newNotifData.image)} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={24} /></div>
                        )}
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Ngày bắt đầu</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-sm"
                              value={newNotifData.startDate}
                              onChange={(e) => setNewNotifData({...newNotifData, startDate: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Ngày kết thúc</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-sm"
                              value={newNotifData.expiryDate}
                              onChange={(e) => setNewNotifData({...newNotifData, expiryDate: e.target.value})}
                            />
                         </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">File đính kèm</label>
                        <div className="relative group">
                            <div className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${newNotifData.attachment ? 'border-primary bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary'}`}>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewNotifFile(file);
                                            setNewNotifData({ ...newNotifData, attachment: file.name });
                                        }
                                    }}
                                />
                                <div className="flex items-center space-x-2">
                                    {newNotifData.attachment ? (
                                        <>
                                            <FileText size={20} className="text-primary" />
                                            <span className="text-sm font-bold text-primary truncate max-w-[150px]">{newNotifData.attachment}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} className="text-gray-400 group-hover:text-primary" />
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-primary">Chọn file tải lên</span>
                                        </>
                                    )}
                                </div>
                            </div>
                             {newNotifData.attachment && (
                                <button 
                                    onClick={() => { setNewNotifData({...newNotifData, attachment: ''}); setNewNotifFile(null); }}
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
                  <label className="text-sm font-bold text-gray-500 uppercase">Nội dung chi tiết <span className="text-red-500">*</span></label>
                  <textarea 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition min-h-[120px]"
                    placeholder="Nhập nội dung thông báo..."
                    value={newNotifData.content}
                    onChange={(e) => setNewNotifData({...newNotifData, content: e.target.value})}
                  ></textarea>
                </div>
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                <button 
                  onClick={() => !isUploading && setIsNotifModalOpen(false)}
                  className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
                  disabled={isUploading}
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSaveNotification}
                  className={`px-6 py-2 rounded-xl font-bold text-white transition shadow-lg shadow-orange-200 ${isUploading ? 'bg-gray-400' : 'bg-primary hover:bg-primaryDark'}`}
                  disabled={isUploading}
                >
                  {isUploading ? 'Đang tải lên...' : (editingId ? 'Lưu thay đổi' : 'Đăng thông báo')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyNotifications;

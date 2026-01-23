
import React, { useState } from 'react';
import { 
  Image as ImageIcon, ChevronLeft, ChevronRight, Play, Plus, Edit, Trash2, X, Save, Pin, Upload, Loader2
} from 'lucide-react';
import { GalleryAlbum, Milestone, UserRole } from '../../App';
import { API_BASE_URL } from '../../constants';

interface CompanyActivityProps {
  galleryAlbums: GalleryAlbum[];
  onUpdateGallery: (albums: GalleryAlbum[]) => void;
  milestones: Milestone[];
  onUpdateMilestones: (milestones: Milestone[]) => void;
  currentUserRole: UserRole;
}

const CompanyActivity: React.FC<CompanyActivityProps> = ({ 
  galleryAlbums, onUpdateGallery, currentUserRole 
}) => {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'manager';

  // --- GALLERY STATE ---
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- MODAL STATES ---
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<number | null>(null);
  const [albumFormData, setAlbumFormData] = useState({ title: '', cover: '', images: '', date: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // --- HELPERS ---
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

  const sortedAlbums = [...galleryAlbums].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // --- GALLERY ACTIONS ---
  const handleSaveAlbum = async () => {
    if (!albumFormData.title) return alert('Vui lòng nhập tiêu đề!');
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`${API_BASE_URL}/api/upload?category=GALLERY`, { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    uploadedUrls.push(`${API_BASE_URL}/files/GALLERY/${data.record.fileName}`);
                }
            } catch (error) { console.error(error); }
        }
    }

    const textUrls = albumFormData.images.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    const allImages = [...textUrls, ...uploadedUrls];
    let finalCover = albumFormData.cover;
    if (!finalCover && allImages.length > 0) finalCover = allImages[0];

    if (editingAlbumId) {
        onUpdateGallery(galleryAlbums.map(a => a.id === editingAlbumId ? { ...a, title: albumFormData.title, cover: finalCover, images: allImages, date: albumFormData.date } : a));
    } else {
        onUpdateGallery([{ id: Date.now(), title: albumFormData.title, cover: finalCover, images: allImages, date: albumFormData.date || new Date().toLocaleDateString('vi-VN'), isPinned: false }, ...galleryAlbums]);
    }
    
    setIsUploading(false);
    setIsAlbumModalOpen(false);
    setEditingAlbumId(null);
    setAlbumFormData({ title: '', cover: '', images: '', date: '' });
    setSelectedFiles([]);
  };

  const handleDeleteAlbum = (id: number) => {
      if (confirm('Xóa album này?')) onUpdateGallery(galleryAlbums.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Hình ảnh & Hoạt động</h2>
            <p className="text-gray-500 mt-2 text-sm">Những khoảnh khắc đáng nhớ của Long Hoang Logistics</p>
        </div>
      </div>

      {/* GALLERY */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <ImageIcon className="mr-3 text-primary" /> Album ảnh
            </h3>
            {canEdit && (
                <button 
                    onClick={() => { setEditingAlbumId(null); setAlbumFormData({title:'',cover:'',images:'',date:''}); setIsAlbumModalOpen(true); }}
                    className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow transition"
                >
                    <Plus size={16} className="mr-2" /> Thêm Album
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedAlbums.map((album) => {
                const videoId = getYouTubeId(album.cover);
                const displayImage = videoId ? getYouTubeThumbnail(album.cover) : album.cover;
                return (
                    <div 
                        key={album.id} 
                        onClick={() => { setSelectedAlbum(album); setCurrentImageIndex(0); }}
                        className="group relative cursor-pointer h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        <img src={displayImage} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {videoId && <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"><div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"><Play size={20} className="text-white ml-1" /></div></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                        {album.isPinned && <div className="absolute top-2 left-2 z-10 bg-primary text-white p-1.5 rounded-full shadow-md"><Pin size={12} /></div>}
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <span className="text-[10px] font-bold text-primary bg-white/20 backdrop-blur-sm px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">{album.date}</span>
                            <h4 className="text-white font-bold text-lg leading-tight line-clamp-2">{album.title}</h4>
                            <div className="flex items-center text-gray-300 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon size={12} className="mr-1" /> {album.images.length} items</div>
                        </div>
                        {canEdit && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={(e) => { e.stopPropagation(); setEditingAlbumId(album.id); setAlbumFormData({ title: album.title, cover: album.cover, images: album.images.join('\n'), date: album.date }); setIsAlbumModalOpen(true); }} className="p-2 bg-white/90 text-blue-600 rounded-lg shadow-sm hover:bg-white"><Edit size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }} className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-white"><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* ALBUM PREVIEW MODAL */}
      {selectedAlbum && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
              <button onClick={() => setSelectedAlbum(null)} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 z-50"><X size={32} /></button>
              <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-5xl aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-2xl">
                      {getYouTubeId(selectedAlbum.images[currentImageIndex]) ? (
                          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(selectedAlbum.images[currentImageIndex])}?autoplay=1`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      ) : (
                          <img src={selectedAlbum.images[currentImageIndex]} className="max-w-full max-h-full object-contain" />
                      )}
                      <button onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : prev)} className="absolute left-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20"><ChevronLeft size={32}/></button>
                      <button onClick={() => setCurrentImageIndex(prev => prev < selectedAlbum.images.length - 1 ? prev + 1 : prev)} className="absolute right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20"><ChevronRight size={32}/></button>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto max-w-4xl pb-2">
                      {selectedAlbum.images.map((img, idx) => (
                          <div key={idx} onClick={() => setCurrentImageIndex(idx)} className={`h-16 w-24 flex-shrink-0 rounded cursor-pointer overflow-hidden border-2 ${currentImageIndex === idx ? 'border-primary' : 'border-transparent opacity-50'}`}>
                              <img src={getYouTubeThumbnail(img)} className="w-full h-full object-cover" />
                          </div>
                      ))}
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
                      <h3 className="text-lg font-bold text-gray-800">{editingAlbumId ? 'Chỉnh sửa Album' : 'Thêm Album mới'}</h3>
                      <button onClick={() => !isUploading && setIsAlbumModalOpen(false)}><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <input type="text" className="w-full border rounded-lg p-2 text-sm font-bold" placeholder="Tên Album..." value={albumFormData.title} onChange={e => setAlbumFormData({...albumFormData, title: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="Thời gian (VD: 05/2024)" value={albumFormData.date} onChange={e => setAlbumFormData({...albumFormData, date: e.target.value})} />
                          <input type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="Ảnh bìa (URL)..." value={albumFormData.cover} onChange={e => setAlbumFormData({...albumFormData, cover: e.target.value})} />
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                          <label className="text-xs font-bold text-primary uppercase block mb-2 flex items-center"><Upload size={14} className="mr-1"/> Tải ảnh lên</label>
                          <input type="file" multiple accept="image/*" className="w-full text-sm text-gray-500" onChange={e => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
                      </div>
                      <textarea className="w-full border rounded-lg p-2 text-xs font-mono h-24" placeholder="Dán link ảnh/video (mỗi dòng 1 link)..." value={albumFormData.images} onChange={e => setAlbumFormData({...albumFormData, images: e.target.value})}></textarea>
                  </div>
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button onClick={() => !isUploading && setIsAlbumModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold text-sm">Hủy</button>
                      <button onClick={handleSaveAlbum} className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg flex items-center" disabled={isUploading}>{isUploading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save size={16} className="mr-2"/>} Lưu</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CompanyActivity;

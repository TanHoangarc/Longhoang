
import React, { useState } from 'react';
import { FolderPlus, Upload, Folder, FileText, Download, X, Plus, Trash2, ExternalLink, HardDrive } from 'lucide-react';
import { API_BASE_URL } from '../../constants';
import { UserAccount, LibraryFolder, LibraryFile } from '../../App';

interface CompanyLibraryProps {
  currentUser: UserAccount | null;
  folders: LibraryFolder[];
  onUpdate: (folders: LibraryFolder[]) => void;
}

const CompanyLibrary: React.FC<CompanyLibraryProps> = ({ currentUser, folders, onUpdate }) => {
  // Modal States
  const [isAddFolderModal, setIsAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- HANDLERS ---

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return alert('Vui lòng nhập tên thư mục!');
    
    const newFolder: LibraryFolder = {
      id: Date.now(),
      name: newFolderName,
      files: []
    };
    
    onUpdate([...folders, newFolder]);
    setNewFolderName('');
    setIsAddFolderModal(false);
  };

  const handleDeleteFolder = (folderId: number) => {
    if (!currentUser || currentUser.role !== 'Admin') {
        alert('Chỉ Admin mới có quyền xóa thư mục!');
        return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa thư mục này và toàn bộ tài liệu bên trong không?')) {
        onUpdate(folders.filter(f => f.id !== folderId));
    }
  };

  const openUploadModal = (folderId: number | null = null) => {
    setTargetFolderId(folderId || (folders.length > 0 ? folders[0].id : null));
    setFileToUpload(null);
    setIsUploadModal(true);
  };

  const handleUploadFile = async () => {
    if (!fileToUpload || targetFolderId === null) return alert('Vui lòng chọn file và thư mục!');
    
    const targetFolder = folders.find(f => f.id === targetFolderId);
    if (!targetFolder) return;

    setIsUploading(true);
    
    try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        // Ensure folder name is URL safe, save to specific category
        const categoryPath = `LIBRARY/${targetFolder.name}`;
        
        const response = await fetch(`${API_BASE_URL}/api/upload?category=${categoryPath}`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            
            const newFile: LibraryFile = {
                id: Date.now(),
                name: data.record.originalName || data.record.fileName,
                // Construct URL to access the file
                url: `${API_BASE_URL}/files/${categoryPath}/${data.record.fileName}`,
                uploadDate: new Date().toISOString().split('T')[0]
            };

            onUpdate(folders.map(f => {
                if (f.id === targetFolderId) {
                    return { ...f, files: [...f.files, newFile] };
                }
                return f;
            }));

            setIsUploadModal(false);
            setFileToUpload(null);
        } else {
            alert('Lỗi tải lên file. Vui lòng thử lại.');
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi kết nối Server.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteFile = (folderId: number, fileId: number) => {
    if (!currentUser || currentUser.role !== 'Admin') return;
    if (confirm('Bạn có chắc chắn muốn xóa file này không?')) {
        onUpdate(folders.map(f => {
            if (f.id === folderId) {
                return { ...f, files: f.files.filter(file => file.id !== fileId) };
            }
            return f;
        }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Thư viện mẫu</h3>
            <p className="text-sm text-gray-500 font-medium">Lưu trữ và chia sẻ tài liệu nội bộ</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={() => setIsAddFolderModal(true)}
             className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
           >
            <FolderPlus size={18} className="mr-2 text-yellow-500" /> Thêm thư mục
          </button>
          <button 
             onClick={() => openUploadModal(null)}
             className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-primaryDark transition shadow-lg shadow-orange-100"
           >
            <Upload size={18} className="mr-2" /> Tải lên tài liệu
          </button>
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => (
          <div key={folder.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
            {/* Folder Header */}
            <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center group-hover:bg-orange-50/50 transition">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                    <Folder size={24} fill="currentColor" className="opacity-80" />
                </div>
                <div>
                    <span className="font-bold text-gray-800 block">{folder.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{folder.files.length} tài liệu</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => openUploadModal(folder.id)}
                    className="p-2 bg-white text-gray-400 hover:text-primary rounded-lg border border-gray-100 hover:border-primary transition shadow-sm"
                    title="Load tài liệu vào thư mục này"
                  >
                      <Upload size={16} />
                  </button>
                  
                  {currentUser?.role === 'Admin' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                        className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-lg border border-gray-100 hover:border-red-200 transition shadow-sm"
                        title="Xóa thư mục"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
              </div>
            </div>

            {/* File List */}
            <div className="p-4 space-y-2 h-64 overflow-y-auto custom-scrollbar">
              {folder.files.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <HardDrive size={32} className="mb-2 opacity-20" />
                      <p className="text-xs font-medium">Chưa có tài liệu</p>
                  </div>
              )}
              {folder.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group/file transition border border-transparent hover:border-gray-100">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 flex-1 min-w-0"
                  >
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-500 flex-shrink-0">
                        <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-gray-700 group-hover/file:text-primary transition-colors truncate block">
                            {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center">
                            {file.uploadDate}
                        </span>
                    </div>
                  </a>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                      <a 
                        href={file.url} 
                        download 
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Tải về"
                      >
                        <Download size={14} />
                      </a>
                      {currentUser?.role === 'Admin' && (
                          <button 
                            onClick={() => handleDeleteFile(folder.id, file.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Xóa file (Admin)"
                          >
                            <Trash2 size={14} />
                          </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ADD FOLDER MODAL */}
      {isAddFolderModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddFolderModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                   <FolderPlus size={18} className="mr-2 text-yellow-500" /> Tạo thư mục mới
                </h3>
                <button onClick={() => setIsAddFolderModal(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tên thư mục</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition"
                      placeholder="VD: Quy trình ISO..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                    />
                </div>
                <button 
                  onClick={handleCreateFolder}
                  className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-3 rounded-xl shadow-lg transition"
                >
                  Tạo Thư Mục
                </button>
             </div>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {isUploadModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploading && setIsUploadModal(false)}></div>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center">
                   <Upload size={18} className="mr-2 text-primary" /> Tải lên tài liệu
                </h3>
                <button onClick={() => !isUploading && setIsUploadModal(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
             </div>
             
             <div className="p-6 space-y-5">
                {/* Folder Select */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Lưu vào thư mục</label>
                    <select 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none bg-white transition"
                      value={targetFolderId || ''}
                      onChange={(e) => setTargetFolderId(Number(e.target.value))}
                      disabled={isUploading}
                    >
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {/* File Drop Area */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Chọn file</label>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition group ${fileToUpload ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}
                        onClick={() => document.getElementById('lib-upload')?.click()}
                    >
                        <input 
                            type="file" 
                            id="lib-upload" 
                            className="hidden" 
                            onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                            disabled={isUploading}
                        />
                        {fileToUpload ? (
                            <div className="text-primary font-bold text-sm flex flex-col items-center">
                                <FileText size={32} className="mb-2" />
                                {fileToUpload.name}
                                <span className="text-xs font-normal text-gray-500 mt-1">{(fileToUpload.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center group-hover:text-primary transition">
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm font-bold">Nhấn để chọn file</span>
                                <span className="text-xs mt-1">PDF, Word, Excel, Image...</span>
                            </div>
                        )}
                    </div>
                </div>

                <button 
                  onClick={handleUploadFile}
                  disabled={!fileToUpload || isUploading}
                  className={`w-full py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center ${!fileToUpload || isUploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-primaryDark text-white'}`}
                >
                  {isUploading ? 'Đang tải lên...' : 'Xác nhận tải lên'}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyLibrary;

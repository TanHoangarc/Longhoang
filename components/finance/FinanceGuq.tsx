
import React, { useState } from 'react';
import { Search, CheckCircle, FileText, AlertTriangle, Upload, FileCheck, ArrowRight, X } from 'lucide-react';
import { GUQRecord, UserAccount } from '../../App';
import { API_BASE_URL } from '../../constants';

interface FinanceGuqProps {
  guqRecords: GUQRecord[];
  onUpdateGuq: (records: GUQRecord[]) => void;
  currentUser: UserAccount | null;
}

type GuqStatus = 'idle' | 'valid' | 'expired' | 'not_found';

const FinanceGuq: React.FC<FinanceGuqProps> = ({ guqRecords, onUpdateGuq, currentUser }) => {
  const [guqSearchTerm, setGuqSearchTerm] = useState('');
  const [guqStatus, setGuqStatus] = useState<GuqStatus>('idle');
  const [foundGuq, setFoundGuq] = useState<GUQRecord | null>(null);
  const [newGuqFile, setNewGuqFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleGuqSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guqSearchTerm.trim()) return;

    const result = guqRecords.find(item => 
      item.companyName.toLowerCase().includes(guqSearchTerm.toLowerCase())
    );

    if (result) {
      const submitDate = new Date(result.date);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (submitDate < oneYearAgo) {
        setGuqStatus('expired');
      } else {
        setGuqStatus('valid');
      }
      setFoundGuq(result);
    } else {
      setGuqStatus('not_found');
      setFoundGuq(null);
    }
    setNewGuqFile(null);
  };

  const handleGuqUpload = async () => {
    if (!newGuqFile || !guqSearchTerm) return alert('Vui lòng chọn file và nhập tên công ty!');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', newGuqFile);
    formData.append('user', currentUser?.englishName || 'Unknown');
    formData.append('metadata', JSON.stringify({
        companyName: guqSearchTerm,
        date: new Date().toISOString().split('T')[0]
    }));

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload?category=GUQ`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Đã cập nhật Giấy ủy quyền thành công!`);
            onUpdateGuq([...guqRecords, data.record]);
            setGuqStatus('valid');
            setFoundGuq(data.record);
            setNewGuqFile(null);
        } else {
            alert('Upload thất bại. Vui lòng thử lại.');
        }
    } catch (e) {
        console.error(e);
        alert('Lỗi kết nối Server.');
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
        
        {/* LEFT COLUMN: Inputs (Matches the gray input fields in reference) */}
        <div className="flex flex-col space-y-6 pt-4">
            
            {/* Search Input */}
            <form onSubmit={handleGuqSearch} className="w-full">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Nhập tên công ty..." 
                        className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-slate-300 transition-all"
                        value={guqSearchTerm}
                        onChange={(e) => { setGuqSearchTerm(e.target.value); setGuqStatus('idle'); }}
                    />
                </div>
            </form>

            {/* File Upload Input (Only show if Not Found) */}
            {guqStatus === 'not_found' && (
                <div 
                    className="w-full px-8 py-5 bg-[#dce5eb] rounded-[2rem] flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity animate-in fade-in slide-in-from-top-2"
                    onClick={() => document.getElementById('guq-upload')?.click()}
                >
                    <input 
                        type="file" 
                        id="guq-upload" 
                        className="hidden" 
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setNewGuqFile(e.target.files?.[0] || null)}
                    />
                    <span className={`font-bold ${newGuqFile ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                        {newGuqFile ? newGuqFile.name : 'Chọn File Scan (Nếu nộp mới)'}
                    </span>
                    {newGuqFile ? <FileCheck className="text-green-600" size={20} /> : <Upload className="text-slate-400" size={20} />}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4">
                <button 
                    onClick={handleGuqSearch}
                    className="px-10 py-4 bg-[#5f8087] hover:bg-[#4a6b74] text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-slate-300"
                >
                    Kiểm tra
                </button>
                {newGuqFile && (
                    <button 
                        onClick={handleGuqUpload}
                        disabled={isUploading}
                        className="px-10 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
                    >
                        {isUploading ? 'Đang tải...' : 'Cập nhật'}
                    </button>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN: Info Card (Matches the "Our Newsletters" box) */}
        <div className="relative">
            <div className="bg-[#5f8087] rounded-[2.5rem] p-10 h-full min-h-[450px] flex flex-col text-white relative overflow-hidden shadow-2xl">
                
                <h2 className="text-2xl font-bold mb-4">Kết quả tra cứu</h2>
                
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    {guqStatus === 'idle' && (
                        <div className="text-white/60">
                            <p className="text-sm leading-relaxed mb-4">
                                Nhập tên doanh nghiệp vào ô bên trái để kiểm tra tình trạng Giấy ủy quyền (GUQ) trong hệ thống.
                            </p>
                            <p className="text-sm leading-relaxed">
                                Dữ liệu được đồng bộ Real-time từ bộ phận chứng từ.
                            </p>
                        </div>
                    )}

                    {guqStatus === 'valid' && foundGuq && (
                        <div className="animate-in zoom-in duration-300">
                            <div className="mb-6">
                                <div className="flex items-center mb-2">
                                    <CheckCircle className="text-white mr-2" size={24} />
                                    <h3 className="text-xl font-bold">Hợp Lệ</h3>
                                </div>
                                <p className="text-white/80 text-sm">Giấy ủy quyền đang có hiệu lực.</p>
                            </div>
                            
                            <div className="space-y-4 text-sm text-white/90">
                                <div className="bg-white/10 p-4 rounded-2xl">
                                    <span className="block text-[10px] uppercase opacity-60 mb-1">Doanh nghiệp</span>
                                    <span className="font-bold text-lg">{foundGuq.companyName}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 p-4 rounded-2xl">
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Ngày nộp</span>
                                        <span className="font-bold">{foundGuq.date}</span>
                                    </div>
                                    <a 
                                        href={`${API_BASE_URL}/files/${foundGuq.path || `GUQ/${foundGuq.fileName}`}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition cursor-pointer flex flex-col justify-center"
                                    >
                                        <span className="block text-[10px] uppercase opacity-60 mb-1">Tài liệu</span>
                                        <span className="font-bold flex items-center"><FileText size={14} className="mr-1"/> Xem File</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {(guqStatus === 'expired' || guqStatus === 'not_found') && (
                        <div className="animate-in zoom-in duration-300">
                            <div className="mb-6">
                                <div className="flex items-center mb-2">
                                    <AlertTriangle className="text-white mr-2" size={24} />
                                    <h3 className="text-xl font-bold">
                                        {guqStatus === 'expired' ? 'Đã Hết Hạn' : 'Chưa Tìm Thấy'}
                                    </h3>
                                </div>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {guqStatus === 'expired' 
                                        ? `GUQ của công ty này đã quá hạn 1 năm. Vui lòng nộp lại hồ sơ mới.`
                                        : 'Hệ thống chưa có dữ liệu. Vui lòng tải lên bản scan GUQ mới nhất.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default FinanceGuq;


import React, { useState } from 'react';
import { Search, CheckCircle, FileText, AlertTriangle, Upload, FileSignature } from 'lucide-react';
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
    <div className="space-y-8 h-full flex flex-col">
        <form onSubmit={handleGuqSearch} className="relative">
            <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Nhập tên công ty để kiểm tra..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary transition font-bold text-gray-700"
                value={guqSearchTerm}
                onChange={(e) => { setGuqSearchTerm(e.target.value); setGuqStatus('idle'); }}
            />
            <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primaryDark text-white px-4 rounded-xl font-bold transition shadow-md"
            >
                Kiểm tra
            </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-4 italic">* Hệ thống sẽ tra cứu dữ liệu từ bộ phận Management (Realtime)</p>
        </form>

        <div className="min-h-[200px] flex-grow">
            {guqStatus === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                <FileSignature size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">Vui lòng nhập tên công ty để tra cứu trạng thái GUQ</p>
            </div>
            )}

            {guqStatus === 'valid' && foundGuq && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center text-green-700 font-bold mb-4 text-lg">
                <CheckCircle size={28} className="mr-3" />
                <span>Giấy ủy quyền Hợp lệ</span>
                </div>
                <div className="space-y-3 pl-10">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Tên công ty</span>
                    <span className="text-gray-800 font-bold">{foundGuq.companyName}</span>
                </div>
                <div className="flex gap-8">
                    <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Ngày nộp</span>
                    <span className="text-gray-800 font-medium">{foundGuq.date}</span>
                    </div>
                    <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">File đính kèm</span>
                    <a 
                        href={`${API_BASE_URL}/files/${foundGuq.path || `GUQ/${foundGuq.fileName}`}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold underline text-sm flex items-center hover:text-blue-800"
                    >
                        <FileText size={14} className="mr-1" /> {foundGuq.fileName}
                    </a>
                    </div>
                </div>
                </div>
            </div>
            )}

            {(guqStatus === 'expired' || guqStatus === 'not_found') && (
            <div className="animate-in slide-in-from-bottom-4 space-y-6">
                <div className={`border rounded-2xl p-6 flex items-start gap-4 ${guqStatus === 'expired' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className={`p-2 rounded-full ${guqStatus === 'expired' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h4 className={`text-lg font-bold ${guqStatus === 'expired' ? 'text-red-700' : 'text-orange-700'}`}>
                    {guqStatus === 'expired' ? 'Giấy ủy quyền đã hết hạn!' : 'Chưa tìm thấy Giấy ủy quyền'}
                    </h4>
                    <p className={`text-sm mt-1 ${guqStatus === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                    {guqStatus === 'expired' 
                        ? `Bản ghi nhận ngày ${foundGuq?.date} đã quá hạn hiệu lực (1 năm). Vui lòng cập nhật bản mới.`
                        : `Hệ thống không tìm thấy dữ liệu GUQ cho công ty này. Vui lòng nộp hồ sơ mới.`
                    }
                    </p>
                </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h5 className="font-bold text-gray-800 mb-4 flex items-center uppercase text-sm tracking-wider">
                    <Upload size={16} className="mr-2" /> Nộp bản scan mới
                </h5>
                <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary hover:bg-white transition cursor-pointer group"
                    onClick={() => document.getElementById('guq-upload')?.click()}
                >
                    <Upload size={32} className="mx-auto text-gray-400 group-hover:text-primary mb-3 transition" />
                    <p className="text-sm font-bold text-gray-600">
                    {newGuqFile ? newGuqFile.name : 'Click để chọn file hoặc kéo thả vào đây'}
                    </p>
                    <input 
                    type="file" 
                    id="guq-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setNewGuqFile(e.target.files?.[0] || null)}
                    />
                </div>
                <button 
                    onClick={handleGuqUpload}
                    className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition shadow-lg ${newGuqFile ? 'bg-primary hover:bg-primaryDark' : 'bg-gray-300 cursor-not-allowed'}`}
                    disabled={!newGuqFile || isUploading}
                >
                    {isUploading ? 'Đang xử lý...' : (guqStatus === 'expired' ? 'Cập nhật GUQ Mới' : 'Nộp Hồ Sơ Mới')}
                </button>
                </div>
            </div>
            )}
        </div>
    </div>
  );
};

export default FinanceGuq;

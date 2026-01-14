
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Edit, Save, Plus, Trash2, Send, Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Job, UserRole } from '../App';
import { API_BASE_URL } from '../constants';

interface JobsProps {
  jobs: Job[];
  onUpdateJobs: (jobs: Job[]) => void;
  userRole: UserRole;
}

const Jobs: React.FC<JobsProps> = ({ jobs, onUpdateJobs, userRole }) => {
  const isAdmin = userRole === 'admin';
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Job>>({});

  // Application Modal
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantCV, setApplicantCV] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Prevent scroll on modal
  useEffect(() => {
    document.body.style.overflow = applyingJob ? 'hidden' : 'unset';
  }, [applyingJob]);

  // --- ADMIN ACTIONS ---
  const startEdit = (job: Job) => {
    setEditingJobId(job.id);
    setEditData({ ...job });
  };

  const saveEdit = () => {
    if (editingJobId !== null) {
      onUpdateJobs(jobs.map(j => j.id === editingJobId ? { ...j, ...editData } as Job : j));
      setEditingJobId(null);
    }
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setEditData({});
  };

  // --- APPLICATION ACTIONS ---
  const handleApplyClick = (job: Job) => {
    setApplyingJob(job);
    setApplicantName('');
    setApplicantPhone('');
    setApplicantEmail('');
    setApplicantCV(null);
  };

  const handleSendApplication = async () => {
    if (!applyingJob || !applicantName || !applicantPhone || !applicantEmail) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (!applicantCV) {
      alert('Vui lòng tải lên CV của bạn!');
      return;
    }

    setIsUploading(true);

    // 1. Upload CV to Server
    try {
      const formData = new FormData();
      formData.append('file', applicantCV);
      formData.append('metadata', JSON.stringify({
        applicantName,
        jobTitle: applyingJob.title,
        jobId: applyingJob.id,
        date: new Date().toISOString()
      }));

      const res = await fetch(`${API_BASE_URL}/api/upload?category=CV`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      console.log('CV Uploaded:', data);

      // 2. Open Mail Client with predefined content
      const receiver = applyingJob.branch === 'HCM' 
        ? 'teddy.diem@longhoanglogistics.com' 
        : 'Leo.nguyen@longhoanglogistics.com';
      
      const subject = encodeURIComponent(`Ứng tuyển vị trí ${applyingJob.title} - ${applicantName}`);
      const body = encodeURIComponent(
        `Kính gửi Bộ phận Tuyển dụng Long Hoang Logistics (${applyingJob.branch}),\n\n` +
        `Tôi tên là: ${applicantName}\n` +
        `Số điện thoại: ${applicantPhone}\n` +
        `Email: ${applicantEmail}\n\n` +
        `Tôi xin ứng tuyển vào vị trí ${applyingJob.title}.\n` +
        `CV của tôi đã được tải lên hệ thống máy chủ (File: ${data.record.fileName}).\n\n` +
        `Mong sớm nhận được phản hồi từ Quý công ty.\n` +
        `Trân trọng.`
      );

      window.location.href = `mailto:${receiver}?subject=${subject}&body=${body}`;
      
      alert('Hồ sơ đã được tải lên Server! Đang mở trình soạn thảo email để bạn gửi xác nhận.');
      setApplyingJob(null);

    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi tải hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

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
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                <h4 className="font-bold text-gray-800 mb-2">Liên hệ tuyển dụng</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-bold">HCM:</span> teddy.diem@longhoanglogistics.com</p>
                  <p><span className="font-bold">HPH:</span> Leo.nguyen@longhoanglogistics.com</p>
                </div>
              </div>
           </div>
           
           <div className="md:w-2/3 grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-gray-100 p-6 rounded-lg hover:border-primary/50 hover:shadow-md transition bg-gray-50 hover:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center group relative">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">{job.title}</h3>
                        {/* Admin Badge */}
                        {job.quantity === 0 && <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Đã đủ</span>}
                        {job.quantity > 0 && <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Đang tuyển: {job.quantity}</span>}
                      </div>
                      
                      <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                         <span className="flex items-center"><MapPin size={14} className="mr-1" /> {job.branch === 'HCM' ? 'Hồ Chí Minh' : 'Hải Phòng'}</span>
                         <span className="flex items-center"><Clock size={14} className="mr-1" /> {job.type}</span>
                      </div>
                   </div>

                   <div className="mt-4 sm:mt-0 flex items-center gap-3">
                      {/* Admin Controls */}
                      {isAdmin ? (
                        editingJobId === job.id ? (
                          <div className="flex items-center gap-2 bg-white p-2 rounded shadow-lg absolute right-0 top-0 sm:relative z-10 border border-gray-200 animate-in fade-in zoom-in">
                             <select 
                                className="border rounded px-2 py-1 text-xs"
                                value={editData.branch}
                                onChange={e => setEditData({...editData, branch: e.target.value as 'HCM' | 'HPH'})}
                             >
                               <option value="HCM">HCM</option>
                               <option value="HPH">HPH</option>
                             </select>
                             <input 
                                type="number" 
                                className="w-16 border rounded px-2 py-1 text-xs"
                                value={editData.quantity}
                                onChange={e => setEditData({...editData, quantity: Number(e.target.value)})}
                                min={0}
                             />
                             <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={16}/></button>
                             <button onClick={cancelEdit} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(job)} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded-full shadow-sm">
                            <Edit size={16} />
                          </button>
                        )
                      ) : (
                        /* User Apply Button */
                        job.quantity > 0 ? (
                          <button 
                            onClick={() => handleApplyClick(job)}
                            className="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition transform active:scale-95"
                          >
                            Ứng tuyển
                          </button>
                        ) : (
                          <button disabled className="bg-gray-200 text-gray-400 px-6 py-2 rounded-lg font-bold text-sm cursor-not-allowed">
                            Đã đủ
                          </button>
                        )
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* APPLICATION MODAL */}
      {applyingJob && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isUploading && setApplyingJob(null)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-[#1e2a3b] p-6 flex justify-between items-center text-white">
               <div>
                 <h3 className="font-bold text-lg uppercase tracking-wider">Ứng tuyển vị trí</h3>
                 <p className="text-primary font-bold text-xl mt-1">{applyingJob.title}</p>
                 <span className="text-xs bg-white/10 px-2 py-1 rounded mt-2 inline-block">Chi nhánh: {applyingJob.branch}</span>
               </div>
               <button onClick={() => !isUploading && setApplyingJob(null)} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-5">
               <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Họ và tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition font-bold"
                    placeholder="Nguyễn Văn A"
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition"
                        placeholder="090..."
                        value={applicantPhone}
                        onChange={e => setApplicantPhone(e.target.value)}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition"
                        placeholder="email@example.com"
                        value={applicantEmail}
                        onChange={e => setApplicantEmail(e.target.value)}
                      />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Hồ sơ năng lực (CV) <span className="text-red-500">*</span></label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${applicantCV ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary hover:bg-orange-50'}`}
                    onClick={() => document.getElementById('cv-upload')?.click()}
                  >
                     {applicantCV ? (
                       <div className="flex flex-col items-center text-green-700">
                          <CheckCircle size={32} className="mb-2" />
                          <span className="font-bold text-sm">{applicantCV.name}</span>
                          <span className="text-xs opacity-70">Nhấn để thay đổi</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <span className="font-bold text-sm">Tải lên CV (PDF, DOCX)</span>
                       </div>
                     )}
                     <input 
                        type="file" 
                        id="cv-upload" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setApplicantCV(e.target.files?.[0] || null)}
                     />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">* File sẽ được lưu vào hệ thống ServerLH/CV</p>
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
               <button 
                  onClick={() => !isUploading && setApplyingJob(null)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition"
                  disabled={isUploading}
               >
                  Hủy bỏ
               </button>
               <button 
                  onClick={handleSendApplication}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition flex items-center shadow-lg ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primaryDark'}`}
                  disabled={isUploading}
               >
                  {isUploading ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      <Send size={18} className="mr-2" /> Nộp hồ sơ
                    </>
                  )}
               </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Jobs;

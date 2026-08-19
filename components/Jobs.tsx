import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Edit, 
  Save, 
  Send, 
  X, 
  CheckCircle, 
  Mail
} from 'lucide-react';
import { Job, UserRole } from '../App';

interface JobsProps {
  jobs: Job[];
  onUpdateJobs: (jobs: Job[]) => void;
  userRole: UserRole;
}

const getMailtoLink = (job: Job): string => {
  const receiverEmail = job.branch === 'HCM' 
    ? 'teddy.diem@longhoanglogistics.com' 
    : 'Vincent@longhoanglogistics.com';

  const branchName = job.branch === 'HCM' 
    ? 'Chi nhánh Hồ Chí Minh (HCM)' 
    : 'Chi nhánh Hải Phòng (HPH)';

  const subject = `[ỨNG TUYỂN] Vị trí ${job.title} - Chi nhánh ${job.branch === 'HCM' ? 'Hồ Chí Minh' : 'Hải Phòng'}`;

  const body = 
`Kính gửi: Bộ phận Tuyển dụng Long Hoàng Logistics (${branchName}),

Tôi xin gửi thư này để ứng tuyển vào vị trí [${job.title}] tại Quý công ty.

--- THÔNG TIN ỨNG VIÊN ---
• Họ và tên: [Vui lòng điền Họ và tên của bạn]
• Số điện thoại: [Vui lòng điền Số điện thoại liên hệ]
• Email: [Vui lòng điền Email của bạn]
• Vị trí ứng tuyển: ${job.title}
• Khu vực làm việc: ${branchName}
• Mức lương đăng tuyển: ${job.salary}
• Hình thức làm việc: ${job.type}

Tôi xin đính kèm theo thư này Hồ sơ năng lực (CV) cùng các bằng cấp/chứng chỉ liên quan để Quý công ty tiện tham khảo và đánh giá.

Rất mong sớm nhận được phản hồi từ Quý công ty và có cơ hội tham gia buổi phỏng vấn trực tiếp.

Xin chân thành cảm ơn Quý công ty!

Trân trọng,
[Họ và tên của bạn]
[Số điện thoại liên hệ]`;

  return `mailto:${receiverEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const Jobs: React.FC<JobsProps> = ({ jobs, onUpdateJobs, userRole }) => {
  const isAdmin = userRole === 'admin';
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Job>>({});

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

  return (
    <section id="jobs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12">
           {/* Left column: Recruitment intro & contact info */}
           <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Tuyển dụng</h2>
              <div className="w-16 h-1 bg-primary mb-6"></div>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Gia nhập đội ngũ Long Hoàng Logistics để phát triển sự nghiệp trong môi trường chuyên nghiệp, năng động và nhiều cơ hội thăng tiến.
              </p>
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Mail size={16} className="text-primary mr-2" />
                  Email tuyển dụng theo khu vực
                </h4>
                <div className="space-y-2.5 text-sm text-gray-600">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100">
                    <span className="font-bold text-gray-800 text-xs">HCM:</span>
                    <a 
                      href="mailto:teddy.diem@longhoanglogistics.com?subject=%5B%E1%BB%A8NG%20TUY%E1%BB%82N%5D%20Li%C3%AAn%20h%E1%BB%87%20Tuy%E1%BB%83n%20d%E1%BB%A5ng%20Long%20Ho%C3%A0ng%20Logistics%20(HCM)" 
                      className="text-primary font-medium hover:underline text-xs"
                    >
                      teddy.diem@longhoanglogistics.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-orange-100">
                    <span className="font-bold text-gray-800 text-xs">HPH:</span>
                    <a 
                      href="mailto:Vincent@longhoanglogistics.com?subject=%5B%E1%BB%A8NG%20TUY%E1%BB%82N%5D%20Li%C3%AAn%20h%E1%BB%87%20Tuy%E1%BB%83n%20d%E1%BB%A5ng%20Long%20Ho%C3%A0ng%20Logistics%20(HPH)" 
                      className="text-primary font-medium hover:underline text-xs"
                    >
                      Vincent@longhoanglogistics.com
                    </a>
                  </div>
                </div>
              </div>
           </div>
           
           {/* Right column: Recruitment postings */}
           <div className="md:w-2/3 grid grid-cols-1 gap-4">
              {jobs.map((job) => {
                const mailtoHref = getMailtoLink(job);

                return (
                  <div key={job.id} className="border border-gray-200 p-6 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gray-50/50 hover:bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center group relative">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">{job.title}</h3>
                          {/* Status Badge */}
                          {job.quantity === 0 && (
                            <span className="bg-gray-200 text-gray-500 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase">
                              Đã đủ
                            </span>
                          )}
                          {job.quantity > 0 && (
                            <span className="bg-green-100 text-green-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center">
                              <CheckCircle size={10} className="mr-1" /> Đang tuyển: {job.quantity}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                           <span className="flex items-center">
                             <MapPin size={14} className="mr-1 text-primary" /> 
                             {job.branch === 'HCM' ? 'Hồ Chí Minh' : 'Hải Phòng'}
                           </span>
                           <span className="flex items-center">
                             <Clock size={14} className="mr-1 text-primary" /> 
                             {job.type}
                           </span>
                           <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg">
                             {job.salary}
                           </span>
                        </div>
                     </div>

                     <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        {/* Admin Controls */}
                        {isAdmin ? (
                          editingJobId === job.id ? (
                            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-lg absolute right-0 top-0 sm:relative z-10 border border-gray-200 animate-in fade-in zoom-in">
                               <select 
                                  className="border rounded-lg px-2 py-1 text-xs outline-none"
                                  value={editData.branch}
                                  onChange={e => setEditData({...editData, branch: e.target.value as 'HCM' | 'HPH'})}
                               >
                                 <option value="HCM">HCM</option>
                                 <option value="HPH">HPH</option>
                               </select>
                               <input 
                                  type="number" 
                                  className="w-16 border rounded-lg px-2 py-1 text-xs outline-none"
                                  value={editData.quantity}
                                  onChange={e => setEditData({...editData, quantity: Number(e.target.value)})}
                                  min={0}
                               />
                               <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg" title="Lưu">
                                 <Save size={16}/>
                               </button>
                               <button onClick={cancelEdit} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Hủy">
                                 <X size={16}/>
                               </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startEdit(job)} 
                              className="p-2.5 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition"
                              title="Chỉnh sửa vị trí"
                            >
                              <Edit size={16} />
                            </button>
                          )
                        ) : (
                          /* Direct Apply Link -> Opens Outlook / Gmail immediately */
                          job.quantity > 0 ? (
                            <a 
                              href={mailtoHref}
                              className="bg-primary hover:bg-primaryDark text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 transition transform active:scale-95 flex items-center space-x-1.5 group-hover:shadow-primary/30"
                              title={`Mở Outlook/Gmail ứng tuyển vị trí ${job.title}`}
                            >
                              <span>Ứng tuyển</span>
                              <Send size={14} />
                            </a>
                          ) : (
                            <button disabled className="bg-gray-200 text-gray-400 px-6 py-2.5 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                              Hết hạn
                            </button>
                          )
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </section>
  );
};

export default Jobs;

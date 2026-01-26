
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, UserCheck, MapPin, AlertCircle, History, ChevronLeft, ChevronRight, FileText, Upload, X, PenTool, Printer } from 'lucide-react';
import { UserAccount, AttendanceRecord, LeaveFormDetails } from '../../App';
import { API_BASE_URL } from '../../constants';

interface TimekeepingProps {
  currentUser: UserAccount | null;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

const Timekeeping: React.FC<TimekeepingProps> = ({ currentUser, attendanceRecords, onUpdateAttendance }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateForLeave, setSelectedDateForLeave] = useState<string | null>(null);
  
  // Leave Form State
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveDuration, setLeaveDuration] = useState<number>(1);
  const [leavePeriod, setLeavePeriod] = useState<'All Day' | 'Morning' | 'Afternoon'>('All Day');
  const [leaveType, setLeaveType] = useState<'Paid' | 'Unpaid'>('Paid');
  
  // Multi-day Leave State
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [leaveEndDate, setLeaveEndDate] = useState<string>('');

  // Uploading State (auto-generation)
  const [isUploading, setIsUploading] = useState(false);

  // Detailed Leave Application Form Data
  const [leaveFormData, setLeaveFormData] = useState<LeaveFormDetails>({
      reason: '',
      handoverWork: '',
      handoverTo: '',
      department: '',
      phone: currentUser?.department === 'Sales' ? '090xxxxxxx' : '',
      address: 'Tp. Hồ Chí Minh'
  });

  const TOTAL_LEAVE_DAYS = 12;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(
    r => r.userId === currentUser?.id && r.date === todayStr
  );

  // --- LEAVE BALANCE CALCULATION ---
  const remainingLeaveDays = useMemo(() => {
      if (!currentUser) return 0;
      const currentYear = new Date().getFullYear();
      
      const usedDays = attendanceRecords
          .filter(r => 
              r.userId === currentUser.id && 
              r.status === 'On Leave' && 
              r.leaveType === 'Paid' &&
              new Date(r.date).getFullYear() === currentYear
          )
          .reduce((sum, r) => sum + (r.leaveDuration || 1), 0);
          
      return Math.max(0, TOTAL_LEAVE_DAYS - usedDays);
  }, [attendanceRecords, currentUser]);

  // --- ATTENDANCE ACTIONS (Removed CheckIn/CheckOut buttons as requested) ---
  // const handleCheckIn = () => { ... };
  // const handleCheckOut = () => { ... };

  // --- LEAVE ACTIONS ---
  const handleOpenLeaveModal = (dateStr: string) => {
      setSelectedDateForLeave(dateStr);
      setLeaveEndDate(dateStr); // Default end date is start date
      setLeaveModalOpen(true);
      
      // Reset form defaults
      setLeaveDuration(1);
      setLeavePeriod('All Day');
      setLeaveType('Paid');
      setIsMultiDay(false);
      setLeaveFormData({
          reason: '',
          handoverWork: '',
          handoverTo: '',
          department: '',
          phone: '',
          address: 'Tp. Hồ Chí Minh'
      });
  };

  // Calculate days difference
  const calculateTotalDays = () => {
      if (!isMultiDay || !selectedDateForLeave || !leaveEndDate) return leaveDuration;
      const start = new Date(selectedDateForLeave);
      const end = new Date(leaveEndDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
      return diffDays > 0 ? diffDays : 1;
  };

  const generateHTMLFile = (totalDays: number) => {
      if (!selectedDateForLeave) return null;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 40px; max-width: 800px; margin: 0 auto; }
                .text-center { text-align: center; }
                .uppercase { text-transform: uppercase; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
                .underline { text-decoration: underline; }
                .mt-4 { margin-top: 16px; }
                .mb-4 { margin-bottom: 16px; }
                .flex-between { display: flex; justify-content: space-between; }
                .signature-box { margin-top: 50px; }
            </style>
        </head>
        <body>
            <div class="text-center mb-4">
                <h3 class="bold uppercase" style="font-size: 13px; margin: 0;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p class="underline bold" style="font-size: 12px; margin: 5px 0;">Độc lập – Tự do – Hạnh phúc</p>
                <hr style="width: 60px; border-top: 1px solid black;" />
            </div>
            
            <h2 class="text-center bold uppercase mt-4" style="font-size: 20px;">ĐƠN XIN NGHỈ PHÉP</h2>
            
            <div style="font-size: 14px; line-height: 1.6;">
                <p><strong>Kính gửi:</strong> Ban Giám Đốc Công Ty<br/>
                <span style="padding-left: 70px;">Phòng Hành chính – Nhân sự</span></p>
                
                <p>Tôi tên là: <strong>${currentUser?.name}</strong><br/>
                Chức vụ: ${currentUser?.position || 'Nhân viên'}<br/>
                Bộ phận: ${currentUser?.department}<br/>
                Địa chỉ: ${leaveFormData.address}<br/>
                Điện thoại: ${leaveFormData.phone}</p>

                <p class="mt-4" style="text-align: justify;">
                    Nay tôi trình đơn này kính xin Ban Giám Đốc chấp thuận cho tôi được nghỉ phép trong thời gian 
                    <strong>${totalDays}</strong> ngày.
                </p>
                <p style="text-align: justify;">
                    (Từ ngày <strong>${new Date(selectedDateForLeave).toLocaleDateString('vi-VN')}</strong>
                    đến hết ngày <strong>${new Date(leaveEndDate || selectedDateForLeave).toLocaleDateString('vi-VN')}</strong>
                    ${!isMultiDay && leaveDuration === 0.5 ? `- Buổi ${leavePeriod === 'Morning' ? 'Sáng' : 'Chiều'}` : ''})
                </p>

                <p>Lý do xin nghỉ phép:</p>
                <p class="italic" style="border-bottom: 1px dotted #ccc;">${leaveFormData.reason}</p>

                <p class="mt-4">Tôi đã bàn giao công việc cho: <strong>${leaveFormData.handoverTo}</strong> - Bộ phận: ${leaveFormData.department}</p>
                
                <p>Các công việc được bàn giao:</p>
                <p class="italic" style="border-bottom: 1px dotted #ccc;">${leaveFormData.handoverWork}</p>

                <p class="mt-4">Tôi xin hứa sẽ cập nhật đầy đủ nội dung công tác trong thời gian vắng.</p>
                <p>Kính mong Ban Giám Đốc xem xét và chấp thuận.</p>
            </div>

            <div class="flex-between signature-box" style="font-size: 14px;">
                <div class="text-center">
                    <p class="bold">Trưởng Bộ phận</p>
                    <p class="italic" style="font-size: 11px;">(Ký, ghi rõ họ tên)</p>
                </div>
                <div class="text-center">
                    <p class="italic">Tp.HCM, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</p>
                    <p class="bold">Người làm đơn</p>
                    <p class="italic" style="font-size: 11px;">(Ký, ghi rõ họ tên)</p>
                    <p style="margin-top: 50px;" class="bold">${currentUser?.name}</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileName = `Don_Xin_Nghi_${currentUser?.name.replace(/\s+/g, '_')}_${selectedDateForLeave}.html`;
      return new File([blob], fileName, { type: 'text/html' });
  };

  const handleSubmitLeave = async () => {
      if (!currentUser || !selectedDateForLeave) return;
      
      const totalDaysToBook = calculateTotalDays();

      if (leaveType === 'Paid') {
          if (!leaveFormData.reason) return alert('Vui lòng nhập lý do nghỉ phép.');
          if (remainingLeaveDays < totalDaysToBook) return alert(`Số ngày phép còn lại không đủ! Bạn cần ${totalDaysToBook} ngày nhưng chỉ còn ${remainingLeaveDays} ngày.`);
      }

      if (isMultiDay && leaveEndDate < selectedDateForLeave) {
          return alert('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      }

      // Generate array of dates to book
      const datesToBook: string[] = [];
      if (isMultiDay) {
          let current = new Date(selectedDateForLeave);
          const end = new Date(leaveEndDate);
          while (current <= end) {
              datesToBook.push(new Date(current).toISOString().split('T')[0]);
              current.setDate(current.getDate() + 1);
          }
      } else {
          datesToBook.push(selectedDateForLeave);
      }

      // Check for conflicts
      const conflicts = datesToBook.filter(date => 
          attendanceRecords.some(r => r.userId === currentUser.id && r.date === date)
      );

      if (conflicts.length > 0) {
          const conflictDates = conflicts.map(d => new Date(d).toLocaleDateString('vi-VN')).join(', ');
          alert(`Không thể đăng ký: Ngày ${conflictDates} đã có dữ liệu chấm công hoặc nghỉ phép. Vui lòng liên hệ Account.`);
          return;
      }

      // Auto-generate and Upload File
      setIsUploading(true);
      let uploadedFileName = undefined;

      try {
          const file = generateHTMLFile(totalDaysToBook);
          if (file) {
              const formData = new FormData();
              formData.append('file', file);
              
              const res = await fetch(`${API_BASE_URL}/api/upload?category=LEAVE`, {
                  method: 'POST',
                  body: formData
              });

              if (res.ok) {
                  const data = await res.json();
                  uploadedFileName = data.record.fileName;
              } else {
                  console.error('Failed to auto-upload generated leave form');
              }
          }
      } catch (e) {
          console.error('Error auto-generating file', e);
      }

      // Process records
      let currentRecords = [...attendanceRecords];

      datesToBook.forEach(targetDate => {
          const newRecord: AttendanceRecord = {
              id: Date.now() + Math.random(), // Ensure unique ID
              userId: currentUser.id,
              userName: currentUser.name,
              date: targetDate,
              checkIn: null,
              checkOut: null,
              status: leaveType === 'Paid' ? 'On Leave' : 'Unpaid Leave',
              leaveType: leaveType,
              leaveDuration: isMultiDay ? 1 : leaveDuration, // If multiday, each day counts as 1
              leavePeriod: isMultiDay ? 'All Day' : leavePeriod,
              leaveForm: leaveType === 'Paid' ? leaveFormData : undefined,
              leaveFile: uploadedFileName, // Save the generated HTML filename here
              leaveReason: leaveType === 'Paid' ? leaveFormData.reason : 'Nghỉ không lương',
              note: leaveType === 'Paid' 
                  ? `Nghỉ phép ${isMultiDay ? `(Chuỗi ${totalDaysToBook} ngày)` : `(${leavePeriod === 'All Day' ? '1 ngày' : leavePeriod})`}` 
                  : 'Nghỉ không lương'
          };
          
          currentRecords.push(newRecord);
      });

      onUpdateAttendance(currentRecords);
      setIsUploading(false);

      // Reset & Close
      setLeaveModalOpen(false);
      setSelectedDateForLeave(null);
      alert(`Đã gửi yêu cầu nghỉ ${totalDaysToBook} ngày thành công!`);
  };

  // --- CALENDAR GENERATION ---
  const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
      
      const days = [];
      
      // Padding for empty days before the 1st
      for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
          days.push(null);
      }

      // Actual days
      for (let i = 1; i <= daysInMonth; i++) {
          days.push(new Date(year, month, i));
      }

      return days;
  };

  const calendarDays = generateCalendarDays();

  // Helper to get status color
  const getStatusColor = (status: string | undefined, leaveType?: string) => {
      if (status === 'On Leave') return 'bg-blue-100 text-blue-700 border-blue-200';
      if (status === 'Unpaid Leave') return 'bg-orange-100 text-orange-700 border-orange-200';
      
      switch (status) {
          case 'Present': return 'bg-green-100 text-green-700 border-green-200';
          case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
          case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100';
      }
  };

  const changeMonth = (delta: number) => {
      const newDate = new Date(currentMonth);
      newDate.setMonth(newDate.getMonth() + delta);
      setCurrentMonth(newDate);
  };

  if (!currentUser) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <AlertCircle size={48} className="mb-4" />
              <p>Vui lòng đăng nhập để thực hiện chấm công.</p>
          </div>
      );
  }

  // Calculate Stats for Current Month
  const currentMonthRecords = attendanceRecords.filter(r => 
      r.userId === currentUser.id && 
      new Date(r.date).getMonth() === currentMonth.getMonth() &&
      new Date(r.date).getFullYear() === currentMonth.getFullYear()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Clock & Info Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-[#1e2a3b] to-[#111827] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center">
                <h2 className="text-xl font-bold mb-1">Xin chào, {currentUser.name.split(' ').pop()}!</h2>
                <div className="mt-6 mb-8">
                    <p className="text-5xl font-black tracking-tighter">
                        {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-primary font-medium mt-2">
                        {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Display time only if data exists */}
                    {todayRecord ? (
                        <>
                            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <p className="text-xs text-gray-400 uppercase">Giờ vào</p>
                                <p className="text-2xl font-bold text-green-400">{todayRecord.checkIn || '--:--'}</p>
                            </div>
                            
                            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                <p className="text-xs text-gray-400 uppercase">Giờ ra</p>
                                <p className="text-2xl font-bold text-orange-400">{todayRecord.checkOut || '--:--'}</p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center text-gray-400 italic text-sm">
                            Chưa có dữ liệu chấm công hôm nay.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Stats Mini */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center"><History size={16} className="mr-2" /> Thống kê tháng {currentMonth.getMonth() + 1}</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                    {/* Count Present + Late as 'Worked' aka KPI */}
                    <p className="text-xl font-bold text-green-600">{currentMonthRecords.filter(r => r.status === 'Present' || r.status === 'Late').length}</p>
                    <p className="text-[10px] text-gray-500 uppercase">KPI (Công)</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                    <p className="text-xl font-bold text-yellow-600">{currentMonthRecords.filter(r => r.status === 'Late').length}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Đi muộn</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-bl">Quota: {remainingLeaveDays}</div>
                    <p className="text-xl font-bold text-blue-600">{currentMonthRecords.filter(r => r.status === 'On Leave').reduce((s, r) => s + (r.leaveDuration || 1), 0)}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Nghỉ phép</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                    <p className="text-xl font-bold text-red-600">{currentMonthRecords.filter(r => r.status === 'Absent').length}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Vắng</p>
                </div>
            </div>
        </div>
      </div>

      {/* RIGHT: Calendar Grid */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 text-lg flex items-center">
                <Calendar size={20} className="mr-2 text-primary" /> Bảng Công Tháng {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
            </h3>
            <div className="flex space-x-2">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white rounded-full transition"><ChevronLeft size={20} /></button>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white rounded-full transition"><ChevronRight size={20} /></button>
            </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
            ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-gray-100 gap-[1px]">
            {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="bg-white min-h-[80px]"></div>;
                
                const dateStr = date.toISOString().split('T')[0];
                const record = currentMonthRecords.find(r => r.date === dateStr);
                const isToday = dateStr === todayStr;
                const isFuture = date > new Date();
                
                return (
                    <div 
                        key={dateStr} 
                        onClick={() => {
                            if (record) {
                                if (record.status === 'On Leave' || record.status === 'Unpaid Leave') {
                                    alert('Đơn nghỉ phép đã được lập. Bạn không thể tự chỉnh sửa. Vui lòng liên hệ bộ phận Account.');
                                }
                                // We block editing any existing record here
                                return;
                            }
                            if (isFuture || isToday) {
                                handleOpenLeaveModal(dateStr);
                            }
                        }}
                        className={`bg-white min-h-[100px] p-2 relative group transition-colors ${!record && (isFuture || isToday) ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                    >
                        <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-700'}`}>{date.getDate()}</span>
                        
                        {record ? (
                            <div className={`mt-2 p-1.5 rounded border text-xs ${getStatusColor(record.status, record.leaveType)}`}>
                                <p className="font-bold truncate">
                                    {record.status === 'On Leave' ? `Phép (${record.leaveDuration}d)` : 
                                     record.status === 'Unpaid Leave' ? 'Không lương' :
                                     record.status === 'Present' ? 'Đúng giờ' : 
                                     record.status === 'Late' ? 'Đi muộn' : 'Vắng'}
                                </p>
                                {record.status === 'On Leave' || record.status === 'Unpaid Leave' ? (
                                    <p className="truncate opacity-75 mt-1 text-[10px]">{record.leavePeriod !== 'All Day' ? record.leavePeriod : ''}</p>
                                ) : (
                                    <p className="font-mono mt-1">{record.checkIn} - {record.checkOut || '...'}</p>
                                )}
                            </div>
                        ) : (
                            (!isFuture && !isToday) ? (
                                <div className="mt-2 text-center text-xs text-gray-300 italic">--</div>
                            ) : (
                                <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-blue-50/90 backdrop-blur-sm">
                                    <span className="text-xs font-bold text-blue-600">+ Xin nghỉ</span>
                                </div>
                            )
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* LEAVE APPLICATION MODAL */}
      {leaveModalOpen && selectedDateForLeave && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLeaveModalOpen(false)}></div>
              <div className={`bg-white rounded-2xl w-full ${leaveType === 'Paid' ? 'max-w-5xl' : 'max-w-md'} relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]`}>
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary p-2 rounded-lg"><FileText size={20} /></div>
                          <div>
                              <h3 className="text-lg font-bold text-gray-800">Đăng ký nghỉ phép</h3>
                              <p className="text-xs text-gray-500">
                                  Bắt đầu: {new Date(selectedDateForLeave).toLocaleDateString('vi-VN')}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => !isUploading && setLeaveModalOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Loại hình nghỉ</label>
                              <select 
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary font-bold"
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value as any)}
                              >
                                  <option value="Paid">Nghỉ có phép (Trừ phép năm)</option>
                                  <option value="Unpaid">Nghỉ không lương</option>
                              </select>
                              {leaveType === 'Paid' && (
                                  <p className="text-[10px] text-green-600 mt-1 font-medium">Số phép còn lại: {remainingLeaveDays} ngày</p>
                              )}
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Thời gian nghỉ</label>
                              <select 
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                value={isMultiDay ? 'multi' : leaveDuration}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'multi') {
                                        setIsMultiDay(true);
                                        setLeaveDuration(1); // Placeholder
                                    } else {
                                        setIsMultiDay(false);
                                        const numVal = Number(val);
                                        setLeaveDuration(numVal);
                                        setLeaveEndDate(selectedDateForLeave); // Reset end date
                                        if (numVal === 1) setLeavePeriod('All Day');
                                        else if (leavePeriod === 'All Day') setLeavePeriod('Morning');
                                    }
                                }}
                              >
                                  <option value={1}>Cả ngày (1 ngày)</option>
                                  <option value={0.5}>Nửa ngày (0.5 ngày)</option>
                                  <option value="multi">Nhiều ngày (&gt; 1 ngày)</option>
                              </select>
                          </div>
                          
                          {/* Conditional Third Input */}
                          {!isMultiDay && leaveDuration === 0.5 && (
                              <div className="animate-in slide-in-from-left-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Buổi nghỉ</label>
                                  <select 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={leavePeriod}
                                    onChange={(e) => setLeavePeriod(e.target.value as any)}
                                  >
                                      <option value="Morning">Buổi sáng</option>
                                      <option value="Afternoon">Buổi chiều</option>
                                  </select>
                              </div>
                          )}

                          {isMultiDay && (
                              <div className="animate-in slide-in-from-left-2">
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Đến ngày (End Date)</label>
                                  <input 
                                    type="date"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={leaveEndDate}
                                    min={selectedDateForLeave}
                                    onChange={(e) => setLeaveEndDate(e.target.value)}
                                  />
                                  <p className="text-[10px] text-gray-400 mt-1">Tổng: {calculateTotalDays()} ngày</p>
                              </div>
                          )}
                      </div>

                      {/* Content Body */}
                      {leaveType === 'Paid' ? (
                          <div className="flex flex-col lg:flex-row gap-8 border-t border-gray-100 pt-6">
                              {/* LEFT: Live Preview Form */}
                              <div className="flex-1 bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner flex justify-center">
                                  <div 
                                    className="bg-white w-full max-w-[210mm] shadow-lg p-8 text-black"
                                    style={{ fontFamily: '"Times New Roman", Times, serif', minHeight: '600px' }}
                                  >
                                      <div className="text-center mb-6">
                                          <h3 className="font-bold text-[13px] uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                                          <p className="text-[12px] underline underline-offset-2 font-bold">Độc lập – Tự do – Hạnh phúc</p>
                                          <div className="w-16 h-[1px] bg-black mx-auto mt-2"></div>
                                      </div>
                                      
                                      <h2 className="text-center text-[20px] font-bold uppercase mb-8 mt-4">ĐƠN XIN NGHỈ PHÉP</h2>
                                      
                                      <div className="text-[14px] leading-relaxed space-y-3">
                                          <p className="font-bold">Kính gửi: <span className="font-normal pl-2">Ban Giám Đốc Công Ty</span></p>
                                          <p className="font-bold pl-[70px]"><span className="font-normal pl-2">Phòng Hành chính – Nhân sự</span></p>
                                          
                                          <div className="grid grid-cols-1 gap-2 mt-4">
                                              <p>Tôi tên là: <span className="font-bold pl-2">{currentUser?.name}</span></p>
                                              <p>Chức vụ: <span className="pl-2">{currentUser?.position || 'Nhân viên'}</span></p>
                                              <p>Bộ phận: <span className="pl-2">{currentUser?.department}</span></p>
                                              <p>Địa chỉ: <span className="pl-2">{leaveFormData.address}</span></p>
                                              <p>Điện thoại: <span className="pl-2">{leaveFormData.phone}</span></p>
                                          </div>

                                          <p className="mt-4 text-justify">
                                              Nay tôi trình đơn này kính xin Ban Giám Đốc chấp thuận cho tôi được nghỉ phép trong thời gian 
                                              <span className="font-bold px-1">{calculateTotalDays()}</span> ngày.
                                          </p>
                                          <p className="text-justify">
                                              (Từ ngày <span className="font-bold px-1">{new Date(selectedDateForLeave).toLocaleDateString('vi-VN')}</span>
                                              đến hết ngày <span className="font-bold px-1">{new Date(leaveEndDate || selectedDateForLeave).toLocaleDateString('vi-VN')}</span>
                                              {!isMultiDay && leaveDuration === 0.5 && <span> - Buổi {leavePeriod === 'Morning' ? 'Sáng' : 'Chiều'}</span>})
                                          </p>

                                          <p>Lý do xin nghỉ phép:</p>
                                          <p className="border-b border-dotted border-gray-400 italic min-h-[20px]">{leaveFormData.reason}</p>

                                          <p className="mt-2">Tôi đã bàn giao công việc cho: <span className="font-bold pl-1">{leaveFormData.handoverTo}</span> - Bộ phận: <span className="pl-1">{leaveFormData.department}</span></p>
                                          
                                          <p>Các công việc được bàn giao:</p>
                                          <p className="border-b border-dotted border-gray-400 italic min-h-[20px]">{leaveFormData.handoverWork}</p>

                                          <p className="mt-4">Tôi xin hứa sẽ cập nhật đầy đủ nội dung công tác trong thời gian vắng.</p>
                                          <p>Kính mong Ban Giám Đốc xem xét và chấp thuận.</p>
                                      </div>

                                      <div className="flex justify-between mt-12 text-[14px] px-4">
                                          <div className="text-center">
                                              <p className="font-bold">Trưởng Bộ phận</p>
                                              <p className="italic text-[11px]">(Ký, ghi rõ họ tên)</p>
                                          </div>
                                          <div className="text-center">
                                              <p className="italic">........., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                                              <p className="font-bold mt-1">Người làm đơn</p>
                                              <p className="italic text-[11px]">(Ký, ghi rõ họ tên)</p>
                                              <p className="mt-12 font-bold">{currentUser?.name}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* RIGHT: Input Form */}
                              <div className="w-full lg:w-[350px] space-y-4">
                                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                      <h4 className="font-bold text-blue-700 text-sm mb-2 flex items-center"><PenTool size={14} className="mr-2"/> Nhập thông tin đơn</h4>
                                      <div className="space-y-3">
                                          <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Lý do nghỉ (*)</label>
                                              <textarea 
                                                  className="w-full border border-blue-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  placeholder="VD: Việc gia đình..."
                                                  value={leaveFormData.reason}
                                                  onChange={(e) => setLeaveFormData({...leaveFormData, reason: e.target.value})}
                                              ></textarea>
                                          </div>
                                          <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Người nhận bàn giao</label>
                                              <input 
                                                  type="text" 
                                                  className="w-full border border-blue-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  value={leaveFormData.handoverTo}
                                                  onChange={(e) => setLeaveFormData({...leaveFormData, handoverTo: e.target.value})}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Bộ phận (Người nhận)</label>
                                              <input 
                                                  type="text" 
                                                  className="w-full border border-blue-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  value={leaveFormData.department}
                                                  onChange={(e) => setLeaveFormData({...leaveFormData, department: e.target.value})}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Công việc bàn giao</label>
                                              <textarea 
                                                  className="w-full border border-blue-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  placeholder="VD: Theo dõi lô hàng ABC..."
                                                  value={leaveFormData.handoverWork}
                                                  onChange={(e) => setLeaveFormData({...leaveFormData, handoverWork: e.target.value})}
                                              ></textarea>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">SĐT Liên hệ</label>
                                                  <input type="text" className="w-full border border-blue-200 rounded p-2 text-sm outline-none" value={leaveFormData.phone} onChange={(e) => setLeaveFormData({...leaveFormData, phone: e.target.value})} />
                                              </div>
                                              <div>
                                                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nơi ở hiện tại</label>
                                                  <input type="text" className="w-full border border-blue-200 rounded p-2 text-sm outline-none" value={leaveFormData.address} onChange={(e) => setLeaveFormData({...leaveFormData, address: e.target.value})} />
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
                              <AlertCircle size={48} className="mx-auto text-orange-400 mb-4" />
                              <h3 className="text-lg font-bold text-gray-700">Nghỉ không lương</h3>
                              <p className="text-gray-500 mt-2 max-w-md mx-auto">Bạn đã chọn hình thức nghỉ không lương. Vui lòng xác nhận để gửi yêu cầu đến bộ phận nhân sự và kế toán.</p>
                          </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button 
                        onClick={() => !isUploading && setLeaveModalOpen(false)}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                        disabled={isUploading}
                      >
                          Hủy bỏ
                      </button>
                      <button 
                        onClick={handleSubmitLeave}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition flex items-center ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primaryDark text-white'}`}
                        disabled={isUploading}
                      >
                          <Upload size={16} className="mr-2" /> {isUploading ? 'Đang gửi...' : 'Gửi đơn xin nghỉ'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Timekeeping;

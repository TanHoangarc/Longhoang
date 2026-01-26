import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, X, User, Save, FileText, Settings, Briefcase, Calendar, Paperclip, Eye, Upload, FileSpreadsheet, Clock, CheckCircle, Shield, ChevronDown } from 'lucide-react';
import { AttendanceRecord, UserAccount, LeaveFormDetails, SystemNotification, AttendanceConfig } from '../../App';
import { API_BASE_URL } from '../../constants';
import * as XLSX from 'xlsx';

interface AccountAttendanceProps {
  attendanceRecords: AttendanceRecord[];
  users: UserAccount[];
  onUpdate: (records: AttendanceRecord[]) => void;
  onUpdateUser: (user: UserAccount) => void;
  notifications: SystemNotification[];
  config: AttendanceConfig;
  onSaveConfig: (config: AttendanceConfig) => void;
}

type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Unpaid Leave';

const AccountAttendance: React.FC<AccountAttendanceProps> = ({ attendanceRecords, users, onUpdate, onUpdateUser, notifications, config, onSaveConfig }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected cell for attendance details
  const [selectedCell, setSelectedCell] = useState<{
      user: UserAccount;
      date: string;
      record?: AttendanceRecord;
  } | null>(null);

  // User Settings Modal State
  const [settingsUser, setSettingsUser] = useState<UserAccount | null>(null);
  
  // Form State for User Settings
  const [employmentType, setEmploymentType] = useState<'Normal' | 'Maternity' | 'Resignation'>('Normal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Attendance Detail Modal State
  const [editStatus, setEditStatus] = useState<AttendanceStatus | ''>('');
  const [editReason, setEditReason] = useState('');
  const [editFile, setEditFile] = useState('');
  // New fields for manual time editing
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  // File Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Loading state for Excel import
  const [isImporting, setIsImporting] = useState(false);

  // --- CONFIGURATION STATE ---
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [localConfig, setLocalConfig] = useState<AttendanceConfig>(config);
  const [configSearchTerm, setConfigSearchTerm] = useState('');

  // Sync prop config to local state
  useEffect(() => {
      setLocalConfig(config);
  }, [config]);

  // Dynamic Year Options from Current Year onwards
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    // Generate current year + next 4 years
    return Array.from({ length: 5 }, (_, i) => current + i);
  }, []);

  // Initialize Settings Modal when a user is selected
  useEffect(() => {
      if (settingsUser) {
          setEmploymentType(settingsUser.employmentStatus?.type || 'Normal');
          setStartDate(settingsUser.employmentStatus?.startDate || '');
          setEndDate(settingsUser.employmentStatus?.endDate || '');
      }
  }, [settingsUser]);

  // Update local edit state when cell is selected
  useEffect(() => {
      if (selectedCell) {
          setEditStatus(selectedCell.record?.status || '');
          setEditReason(selectedCell.record?.leaveReason || '');
          setEditFile(selectedCell.record?.leaveFile || '');
          setEditCheckIn(selectedCell.record?.checkIn || '');
          setEditCheckOut(selectedCell.record?.checkOut || '');
      }
  }, [selectedCell]);

  // Generate days array for the selected month
  const daysInMonth = useMemo(() => {
      const days = new Date(selectedYear, selectedMonth, 0).getDate();
      return Array.from({ length: days }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  // Filter users based on search
  const filteredUsers = users.filter(u => 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecord = (userId: number, day: number) => {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return attendanceRecords.find(r => r.userId === userId && r.date === dateStr);
  };

  const getCellContent = (day: number, record?: AttendanceRecord, user?: UserAccount) => {
      // Check if user is exempt
      if (user && config.exemptUserIds.includes(user.id)) {
          // Nếu không có dữ liệu record (chưa chấm công hoặc không xin nghỉ)
          if (!record) {
              const date = new Date(selectedYear, selectedMonth - 1, day);
              const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
              
              // Thứ 7 (6) và Chủ Nhật (0) -> Để trống
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                  return { symbol: '', color: '' };
              } 
              // Ngày thường -> Mặc định là có mặt (+)
              else {
                  return { symbol: '+', color: 'text-green-600 font-bold bg-green-50', title: 'Miễn chấm công' };
              }
          }
      }

      if (!record) return { symbol: '', color: '' };
      
      // Handle Partial Leave Display
      if ((record.status === 'On Leave' || record.status === 'Unpaid Leave') && record.leaveDuration === 0.5) {
          const label = record.leavePeriod === 'Morning' ? 'S' : 'C'; // S: Sáng, C: Chiều
          const baseColor = record.status === 'On Leave' ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
          return { symbol: `${record.status === 'On Leave' ? 'P' : 'KP'}(${label})`, color: `${baseColor} text-[10px] font-bold` };
      }

      // --- DYNAMIC TIME CHECK LOGIC ---
      // Nếu có giờ check-in, tính toán lại trạng thái dựa trên config hiện tại
      if (record.checkIn && user && record.status !== 'On Leave' && record.status !== 'Unpaid Leave') {
          const roleKey = user.role === 'Accounting' ? 'Accounting' : user.role;
          const startTime = config.startTimes[roleKey] || '08:00';
          
          const [checkH, checkM] = record.checkIn.split(':').map(Number);
          const [startH, startM] = startTime.split(':').map(Number);

          // Grace period 15 minutes
          const lateThresholdM = startM + 15;
          const graceH = startH + Math.floor(lateThresholdM / 60);
          const graceM = lateThresholdM % 60;

          // Compare: If CheckIn > GraceTime => Late, Else => Present
          const isLate = (checkH > graceH) || (checkH === graceH && checkM > graceM);

          if (isLate) {
              return { symbol: 'M', color: 'text-orange-500 font-bold bg-orange-50', title: `Đi muộn (Vào: ${record.checkIn})` };
          } else {
              return { symbol: '+', color: 'text-green-600 font-bold bg-green-50', title: `Đúng giờ (Vào: ${record.checkIn})` };
          }
      }

      // Fallback to stored status
      switch (record.status) {
          case 'Present': 
            return { symbol: '+', color: 'text-green-600 font-bold bg-green-50' };
          case 'Late': return { symbol: 'M', color: 'text-orange-500 font-bold bg-orange-50' };
          case 'On Leave': return { symbol: 'P', color: 'text-blue-600 font-bold bg-blue-50' };
          case 'Unpaid Leave': return { symbol: 'KP', color: 'text-red-500 font-bold bg-red-50' };
          case 'Absent': return { symbol: 'V', color: 'text-red-600 font-bold bg-red-100' };
          default: return { symbol: '-', color: 'text-gray-300' };
      }
  };

  const handleCellClick = (user: UserAccount, day: number) => {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = getRecord(user.id, day);
      setSelectedCell({ user, date: dateStr, record });
  };

  const handleSaveAttendance = () => {
      if (!selectedCell || !editStatus) return;

      const newRecord: AttendanceRecord = {
          id: selectedCell.record?.id || Date.now(),
          userId: selectedCell.user.id,
          userName: selectedCell.user.name,
          date: selectedCell.date,
          checkIn: editCheckIn || null,   // Save edited time
          checkOut: editCheckOut || null, // Save edited time
          status: editStatus as AttendanceStatus,
          leaveReason: editStatus === 'On Leave' ? editReason : undefined,
          leaveFile: editStatus === 'On Leave' ? editFile : undefined,
          note: selectedCell.record?.note,
          leaveType: editStatus === 'On Leave' ? 'Paid' : editStatus === 'Unpaid Leave' ? 'Unpaid' : undefined,
          leaveDuration: 1 // Default to 1 day if edited manually from Account
      };

      // Filter out old record for this user/date if exists, then add new one
      const otherRecords = attendanceRecords.filter(r => !(r.userId === selectedCell.user.id && r.date === selectedCell.date));
      onUpdate([...otherRecords, newRecord]);
      
      setSelectedCell(null); // Close modal
  };

  const handleSaveUserSettings = () => {
      if (!settingsUser) return;

      let note = '';
      if (employmentType === 'Maternity') {
          note = 'Nghỉ thai sản';
      } else if (employmentType === 'Resignation' && startDate) {
          const dateObj = new Date(startDate);
          const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
          note = `Nghỉ việc từ ngày ${dateStr}`;
      }

      const updatedUser: UserAccount = {
          ...settingsUser,
          employmentStatus: {
              type: employmentType,
              startDate,
              endDate: employmentType === 'Maternity' ? endDate : undefined,
              note
          }
      };

      onUpdateUser(updatedUser);
      setSettingsUser(null);
  };

  const handlePreview = (fileName: string) => {
      setPreviewUrl(`${API_BASE_URL}/files/LEAVE/${fileName}`);
  };

  const handleSaveConfig = () => {
      onSaveConfig(localConfig);
      alert('Đã lưu thiết lập chấm công thành công!');
      setShowConfigModal(false);
  };

  const toggleExemptUser = (userId: number) => {
      setLocalConfig(prev => {
          const exists = prev.exemptUserIds.includes(userId);
          return {
              ...prev,
              exemptUserIds: exists 
                  ? prev.exemptUserIds.filter(id => id !== userId)
                  : [...prev.exemptUserIds, userId]
          };
      });
  };

  // --- EXCEL IMPORT LOGIC ---
  const normalizeName = (name: string) => {
      return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, ' ').trim();
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      const reader = new FileReader();
      
      reader.onload = (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsName = wb.SheetNames[0];
              const ws = wb.Sheets[wsName];
              
              // Get data with raw: false to ensure dates/times are strings
              const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false }) as any[][];
              
              if (data.length < 15) {
                  alert('File Excel không đúng định dạng hoặc quá ít dữ liệu.');
                  setIsImporting(false);
                  return;
              }

              // --- CONFIGURATION ---
              const HEADER_ROW_INDEX = 9; // Row 10 (index 9) contains days: 1, 2, 3...
              const NAME_COL_INDEX = 3;   // Column D (index 3) contains employee names
              // ---------------------

              // 1. Map Days to Column Indices (Scan Row 10)
              const dateRow = data[HEADER_ROW_INDEX];
              const dayColMap: Record<number, number> = {}; // Day Number -> Column Index (In)

              if (!dateRow) {
                  alert('Không tìm thấy dòng ngày (Hàng 10). Vui lòng kiểm tra lại file.');
                  setIsImporting(false);
                  return;
              }

              dateRow.forEach((cell, idx) => {
                  // Handle cases like "1" or "1 | T5" - extract the leading number
                  const cellStr = String(cell).trim();
                  const match = cellStr.match(/^(\d+)/);
                  if (match) {
                      const dayNum = parseInt(match[1]);
                      if (dayNum >= 1 && dayNum <= 31) {
                          // The date column is usually the 'In' column, 'Out' is next to it
                          dayColMap[dayNum] = idx;
                      }
                  }
              });

              if (Object.keys(dayColMap).length === 0) {
                  alert('Không xác định được các cột ngày trong Hàng 10. Vui lòng kiểm tra lại file.');
                  setIsImporting(false);
                  return;
              }

              const newRecords: AttendanceRecord[] = [];
              
              // 2. Group Rows by Employee Name (Column D)
              // We start scanning from a few rows after the header to find people
              const START_DATA_ROW = HEADER_ROW_INDEX + 2; // e.g. Row 12/13
              const employeeRows: Record<string, any[]> = {};

              for (let i = START_DATA_ROW; i < data.length; i++) {
                  const row = data[i];
                  // Safe check if row is empty
                  if (!row) continue;

                  const rawName = String(row[NAME_COL_INDEX] || '').trim();
                  
                  // Skip empty names or header-like rows repeated
                  if (!rawName || rawName.includes('Tên nhân viên')) continue;

                  if (!employeeRows[rawName]) {
                      employeeRows[rawName] = [];
                  }
                  employeeRows[rawName].push(row);
              }

              // 3. Process Each Employee
              Object.keys(employeeRows).forEach(rawName => {
                  // Find matching user in system
                  const matchedUser = users.find(u => 
                      normalizeName(u.name) === normalizeName(rawName) || 
                      normalizeName(u.englishName || '') === normalizeName(rawName)
                  );

                  if (!matchedUser) return; // Skip if user not found in system

                  // Get role-based start time
                  const roleKey = matchedUser.role === 'Accounting' ? 'Accounting' : matchedUser.role;
                  const startTime = config.startTimes[roleKey] || '08:00';
                  const [startH, startM] = startTime.split(':').map(Number);

                  const userRows = employeeRows[rawName];

                  // Iterate through days 1 to 31
                  for (let d = 1; d <= 31; d++) {
                      const colIn = dayColMap[d];
                      if (colIn === undefined) continue;
                      
                      const colOut = colIn + 1; // Assumption: Out is always next to In

                      // Find best time pair from the multiple rows for this user
                      let bestIn = '';
                      let bestOut = '';

                      // Heuristic: Look for time format HH:mm in the rows
                      // Priority: Find a row that has a valid time string
                      for (const row of userRows) {
                          const valIn = String(row[colIn] || '').trim();
                          const valOut = String(row[colOut] || '').trim();

                          // Time Regex (simple HH:mm or H:mm)
                          const isTime = (str: string) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(str);

                          if (isTime(valIn) && !bestIn) bestIn = valIn;
                          if (isTime(valOut) && !bestOut) bestOut = valOut;
                      }

                      // If we found at least one time, create a record
                      if (bestIn || bestOut) {
                          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          
                          let status: AttendanceStatus = 'Present';
                          
                          // Check exemptions
                          if (config.exemptUserIds.includes(matchedUser.id)) {
                              status = 'Present'; // Exempt users always present if data exists
                          } else if (bestIn) {
                              // Standard Late Logic based on Config
                              const [h, m] = bestIn.split(':').map(Number);
                              
                              // Check if late (Start Time + 15 mins grace period)
                              const lateThresholdM = startM + 15;
                              const graceH = startH + Math.floor(lateThresholdM / 60);
                              const graceM = lateThresholdM % 60;

                              if (h > graceH || (h === graceH && m > graceM)) {
                                  status = 'Late';
                              }
                          }

                          newRecords.push({
                              id: Date.now() + Math.random(),
                              userId: matchedUser.id,
                              userName: matchedUser.name,
                              date: dateStr,
                              checkIn: bestIn || null,
                              checkOut: bestOut || null,
                              status: status
                          });
                      }
                  }
              });

              if (newRecords.length > 0) {
                  // CLEAR DATA LOGIC: Remove all records for the selected Month/Year before adding new ones
                  const keptRecords = attendanceRecords.filter(r => {
                      const [y, m] = r.date.split('-').map(Number);
                      // Keep record if it belongs to a different Year OR different Month
                      return y !== selectedYear || m !== selectedMonth;
                  });
                  
                  onUpdate([...keptRecords, ...newRecords]);
                  alert(`Đã xóa dữ liệu cũ và import thành công ${newRecords.length} dòng chấm công cho tháng ${selectedMonth}/${selectedYear}.`);
              } else {
                  alert('Không tìm thấy dữ liệu thời gian (HH:mm) hợp lệ cho nhân viên nào.');
              }

          } catch (error) {
              console.error(error);
              alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.');
          } finally {
              setIsImporting(false);
              e.target.value = '';
          }
      };
      
      reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-800 uppercase">BẢNG CHẤM CÔNG</h3>
          <p className="text-sm text-gray-500">Tháng {selectedMonth}/{selectedYear}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            {/* Excel Upload Button */}
            <div className="relative group">
                <input 
                    type="file" 
                    id="excel-upload" 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleExcelUpload}
                    disabled={isImporting}
                />
                <label 
                    htmlFor="excel-upload" 
                    className={`bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 transition shadow-md cursor-pointer ${isImporting ? 'opacity-70 cursor-wait' : ''}`}
                >
                    <FileSpreadsheet size={16} className="mr-2" /> 
                    {isImporting ? 'Đang xử lý...' : 'Load Excel'}
                </label>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm nhân viên..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <select 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-green-500 shadow-sm bg-white"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            
            <select 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-green-500 shadow-sm bg-white"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
            </select>

            <div className="flex gap-2">
                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-900 transition shadow-md">
                    <Download size={16} className="mr-2" /> Xuất Báo Cáo
                </button>
                <button 
                    onClick={() => setShowConfigModal(true)}
                    className="bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
                    title="Thiết lập thời gian & miễn chấm công"
                >
                    <Settings size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* VIEW: ATTENDANCE GRID */}
      <div className="bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden w-full animate-in fade-in">
        <table className="w-full border-collapse table-fixed">
            <thead>
                <tr className="bg-[#8cc63f] text-white text-xs font-bold uppercase tracking-wider text-center h-12">
                    <th className="border border-gray-400 w-[3%] bg-[#8cc63f]">STT</th>
                    <th className="border border-gray-400 w-[12%] text-left px-3 bg-[#8cc63f]">Họ tên</th>
                    <th className="border border-gray-400 w-[6%] bg-[#8cc63f]">Chức vụ</th>
                    
                    {/* Days Header - Auto width */}
                    {daysInMonth.map(day => (
                        <th key={day} className="border border-gray-400">{day}</th>
                    ))}
                    
                    <th className="border border-gray-400 w-[3%] bg-yellow-400 text-black font-black">TC</th>
                    <th className="border border-gray-400 w-[3%] bg-yellow-400 text-black font-black">P</th>
                    <th className="border border-gray-400 w-[3%] bg-yellow-400 text-black font-black">KP</th>
                    <th className="border border-gray-400 w-[10%] bg-[#8cc63f]">Ghi chú</th>
                    <th className="border border-gray-400 w-[4%] bg-[#8cc63f]">Cài đặt</th>
                </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user, index) => {
                    let totalPresent = 0;
                    let totalLeave = 0;
                    let totalUnpaid = 0;

                    return (
                        <tr key={user.id} className="text-xs h-12 hover:bg-gray-50 transition">
                            <td className="border border-gray-300 text-center font-bold bg-gray-50/50">{index + 1}</td>
                            <td className="border border-gray-300 font-bold text-gray-800 px-3 truncate">{user.name}</td>
                            <td className="border border-gray-300 text-center text-gray-500 uppercase text-[10px] truncate px-1">{user.role}</td>
                            
                            {/* Days Cells */}
                            {daysInMonth.map(day => {
                                // Construct date string for the cell
                                const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                
                                // --- CHECK FOR PUBLIC HOLIDAYS (GLOBAL) ---
                                const isGlobalHoliday = notifications.some(notif => {
                                    const isHolidayTopic = /nghỉ lễ|tết|holiday|giỗ|quốc khánh|thống nhất|hùng vương/i.test(notif.title);
                                    if (isHolidayTopic && notif.startDate && notif.expiryDate) {
                                        return dateStr >= notif.startDate && dateStr <= notif.expiryDate;
                                    }
                                    return false;
                                });

                                // --- LOCK LOGIC (INDIVIDUAL) ---
                                let isLocked = false;
                                let lockTitle = '';

                                if (user.employmentStatus?.type && user.employmentStatus.startDate) {
                                    const { type, startDate, endDate } = user.employmentStatus;
                                    if (type === 'Resignation' && dateStr >= startDate) {
                                        isLocked = true;
                                        lockTitle = 'Đã nghỉ việc';
                                    } else if (type === 'Maternity' && dateStr >= startDate && (!endDate || dateStr <= endDate)) {
                                        isLocked = true;
                                        lockTitle = 'Nghỉ thai sản';
                                    }
                                }

                                if (isLocked) {
                                    return <td key={day} className="border border-gray-300 bg-gray-100 cursor-not-allowed" title={lockTitle}></td>;
                                }

                                const record = getRecord(user.id, day);
                                const { symbol, color, title } = getCellContent(day, record, user);
                                
                                // Calculating totals (Approximate)
                                if (record?.status === 'Present' || symbol === '+') totalPresent += 1;
                                if (record?.status === 'Late') totalPresent += 1; 
                                
                                // Count Leave (Partial)
                                if (record?.status === 'On Leave') totalLeave += (record.leaveDuration || 1);
                                if (record?.status === 'Unpaid Leave' || record?.status === 'Absent') totalUnpaid += (record.leaveDuration || 1);

                                // Check Global Holiday if no record
                                if (isGlobalHoliday && !record) {
                                    return <td key={day} className="border border-gray-300 bg-red-500 text-white font-bold text-center cursor-default" title="Nghỉ Lễ">Lễ</td>;
                                }

                                return (
                                    <td 
                                        key={day} 
                                        className={`border border-gray-300 text-center cursor-pointer hover:brightness-95 transition-all ${color}`}
                                        onClick={() => handleCellClick(user, day)}
                                        title={title || (record ? `${record.note || ''}\n${record.checkIn ? `Vào: ${record.checkIn}` : ''}\n${record.checkOut ? `Ra: ${record.checkOut}` : ''}` : '')}
                                    >
                                        {symbol}
                                    </td>
                                );
                            })}
                            
                            {/* Summary Columns */}
                            <td className="border border-gray-300 text-center font-bold bg-yellow-50">{totalPresent}</td>
                            <td className="border border-gray-300 text-center font-bold text-blue-600 bg-yellow-50">{totalLeave}</td>
                            <td className="border border-gray-300 text-center font-bold text-red-600 bg-yellow-50">{totalUnpaid}</td>
                            
                            {/* Note Column */}
                            <td className="border border-gray-300 px-2 text-center text-red-600 font-bold uppercase truncate text-[10px]">
                                {user.employmentStatus?.note || ''}
                            </td>

                            {/* Settings Column */}
                            <td className="border border-gray-300 text-center">
                                <button 
                                    onClick={() => setSettingsUser(user)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition"
                                    title="Cài đặt nghỉ phép/thôi việc"
                                >
                                    <Settings size={16} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="font-bold uppercase text-gray-400 mr-2">GHI CHÚ:</div>
          <div className="flex items-center"><span className="font-bold text-green-600 bg-green-50 px-2 rounded mr-1">+</span> Có mặt</div>
          <div className="flex items-center"><span className="font-bold text-orange-500 bg-orange-50 px-2 rounded mr-1">M</span> Đi muộn</div>
          <div className="flex items-center"><span className="font-bold text-blue-600 bg-blue-50 px-2 rounded mr-1">P</span> Nghỉ phép</div>
          <div className="flex items-center"><span className="font-bold text-red-600 bg-red-50 px-2 rounded mr-1">KP</span> Nghỉ không lương</div>
          <div className="flex items-center"><span className="font-bold text-red-600 bg-red-100 px-2 rounded mr-1">V</span> Vắng mặt</div>
      </div>

      {/* MODALS */}
      {/* 1. Attendance Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white relative">
                    <button 
                        onClick={() => setSelectedCell(null)} 
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white text-green-600 rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                            {selectedCell.user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{selectedCell.user.name}</h3>
                            <div className="flex items-center gap-2 text-green-100 text-sm mt-1 font-medium">
                                <Calendar size={14} />
                                {new Date(selectedCell.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            <p className="text-xs text-green-100/80 mt-0.5 uppercase tracking-wide">{selectedCell.user.role}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Time Inputs */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-wider">Thời gian làm việc</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition group">
                                <div className="flex items-center gap-2 mb-1 text-green-600">
                                    <div className="p-1.5 bg-green-100 rounded-lg"><Clock size={16} /></div>
                                    <span className="text-xs font-bold">Giờ vào</span>
                                </div>
                                <input 
                                    type="time" 
                                    className="w-full bg-transparent text-2xl font-black text-gray-800 outline-none p-0"
                                    value={editCheckIn} 
                                    onChange={e => setEditCheckIn(e.target.value)} 
                                />
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition group">
                                <div className="flex items-center gap-2 mb-1 text-orange-500">
                                    <div className="p-1.5 bg-orange-100 rounded-lg"><Clock size={16} /></div>
                                    <span className="text-xs font-bold">Giờ ra</span>
                                </div>
                                <input 
                                    type="time" 
                                    className="w-full bg-transparent text-2xl font-black text-gray-800 outline-none p-0"
                                    value={editCheckOut} 
                                    onChange={e => setEditCheckOut(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Select */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">Trạng thái chấm công</label>
                        <div className="relative">
                            <select 
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl outline-none focus:border-green-500 focus:bg-white transition"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                            >
                                <option value="Present">✅ Có mặt (Present)</option>
                                <option value="Late">⚠️ Đi muộn (Late)</option>
                                <option value="On Leave">🏖️ Nghỉ phép (On Leave)</option>
                                <option value="Unpaid Leave">💸 Nghỉ không lương (Unpaid)</option>
                                <option value="Absent">❌ Vắng mặt (Absent)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Conditional Reason & File Link */}
                    {(editStatus === 'On Leave' || editStatus === 'Unpaid Leave') && (
                        <div className="animate-in slide-in-from-top-2 pt-2 border-t border-dashed border-gray-200">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Lý do nghỉ / Ghi chú</label>
                            <textarea 
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition resize-none bg-gray-50 focus:bg-white mb-3" 
                                placeholder="Nhập lý do..."
                                rows={3}
                                value={editReason}
                                onChange={(e) => setEditReason(e.target.value)}
                            ></textarea>
                            
                            {editFile && (
                                <div 
                                    onClick={() => handlePreview(editFile)}
                                    className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center z-10">
                                        <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm mr-3">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Đơn xin nghỉ phép</p>
                                            <p className="text-[10px] text-blue-600 truncate max-w-[180px]">{editFile}</p>
                                        </div>
                                    </div>
                                    <div className="z-10 bg-white/50 p-1.5 rounded-full text-blue-500 group-hover:bg-white group-hover:text-blue-700 transition">
                                        <Eye size={16} />
                                    </div>
                                    {/* Hover effect background */}
                                    <div className="absolute inset-0 bg-blue-100/0 group-hover:bg-blue-100/30 transition-colors duration-300"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2">
                        <button 
                            onClick={handleSaveAttendance} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-200 transition transform active:scale-95 flex items-center justify-center"
                        >
                            <Save size={18} className="mr-2" /> Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 2. User Settings Modal */}
      {settingsUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800">Cài đặt nhân sự</h3>
                      <button onClick={() => setSettingsUser(null)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                          Cấu hình trạng thái làm việc cho: <span className="font-bold text-green-600">{settingsUser.name}</span>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
                          <select className="w-full border rounded p-2 text-sm" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as any)}>
                              <option value="Normal">Đang làm việc (Bình thường)</option>
                              <option value="Maternity">Nghỉ thai sản</option>
                              <option value="Resignation">Đã nghỉ việc</option>
                          </select>
                      </div>
                      
                      {employmentType !== 'Normal' && (
                          <div className="space-y-3 animate-in slide-in-from-top-2">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày bắt đầu</label>
                                  <input type="date" className="w-full border rounded p-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                              </div>
                              {employmentType === 'Maternity' && (
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày kết thúc (Dự kiến)</label>
                                      <input type="date" className="w-full border rounded p-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                  </div>
                              )}
                          </div>
                      )}

                      <button onClick={handleSaveUserSettings} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm shadow hover:bg-blue-700 transition">
                          Lưu cài đặt
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Config Modal */}
      {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                      <h3 className="font-bold text-lg text-gray-800 flex items-center"><Settings className="mr-2 text-gray-500" size={20}/> Cấu hình Chấm công</h3>
                      <button onClick={() => setShowConfigModal(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      
                      {/* Work Hours Config */}
                      <div>
                          <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center"><Clock size={16} className="mr-2 text-blue-500"/> Giờ làm việc theo bộ phận</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {Object.keys(localConfig.startTimes).map(role => (
                                  <div key={role}>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{role}</label>
                                      <input 
                                          type="time" 
                                          className="w-full border border-gray-200 rounded p-2 text-sm font-mono focus:border-green-500 outline-none"
                                          value={localConfig.startTimes[role]}
                                          onChange={(e) => setLocalConfig({...localConfig, startTimes: {...localConfig.startTimes, [role]: e.target.value}})}
                                      />
                                  </div>
                              ))}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 italic">* Đi muộn được tính sau 15 phút so với giờ quy định.</p>
                      </div>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Exempt Users Config */}
                      <div>
                          <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center"><Shield size={16} className="mr-2 text-green-500"/> Miễn chấm công (Auto Check-in)</h4>
                          <div className="relative mb-3">
                              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                              <input 
                                  type="text" 
                                  placeholder="Tìm nhân viên..." 
                                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-green-500 outline-none"
                                  value={configSearchTerm}
                                  onChange={(e) => setConfigSearchTerm(e.target.value)}
                              />
                          </div>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 custom-scrollbar">
                              {users.filter(u => u.name.toLowerCase().includes(configSearchTerm.toLowerCase())).map(u => (
                                  <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
                                      <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">{u.name.charAt(0)}</div>
                                          <span className="text-sm text-gray-700">{u.name}</span>
                                      </div>
                                      <button 
                                          onClick={() => toggleExemptUser(u.id)}
                                          className={`text-xs font-bold px-2 py-1 rounded transition ${localConfig.exemptUserIds.includes(u.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                      >
                                          {localConfig.exemptUserIds.includes(u.id) ? 'Đang miễn' : 'Chọn'}
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>

                  </div>
                  <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                      <button onClick={handleSaveConfig} className="bg-[#8cc63f] hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition">
                          Lưu cấu hình
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* File Preview Overlay */}
      {previewUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b flex justify-between items-center bg-gray-100">
                      <h3 className="font-bold text-gray-700 flex items-center"><FileText size={18} className="mr-2"/> Xem tài liệu</h3>
                      <button onClick={() => setPreviewUrl(null)}><X size={24} className="text-gray-500 hover:text-red-500" /></button>
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 overflow-auto flex justify-center items-center">
                      <iframe src={previewUrl} className="w-full h-full border bg-white shadow-sm" title="Preview"></iframe>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AccountAttendance;
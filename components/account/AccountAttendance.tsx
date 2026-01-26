
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, X, User, Save, FileText, Settings, Briefcase, Calendar, Paperclip, Eye, Upload, FileSpreadsheet, Clock } from 'lucide-react';
import { AttendanceRecord, UserAccount, LeaveFormDetails, SystemNotification } from '../../App';
import { API_BASE_URL } from '../../constants';
import * as XLSX from 'xlsx';

interface AccountAttendanceProps {
  attendanceRecords: AttendanceRecord[];
  users: UserAccount[];
  onUpdate: (records: AttendanceRecord[]) => void;
  onUpdateUser: (user: UserAccount) => void;
  notifications: SystemNotification[];
}

type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Unpaid Leave';

const AccountAttendance: React.FC<AccountAttendanceProps> = ({ attendanceRecords, users, onUpdate, onUpdateUser, notifications }) => {
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

  const getCellContent = (record?: AttendanceRecord) => {
      if (!record) return { symbol: '', color: '' };
      
      // Handle Partial Leave Display
      if ((record.status === 'On Leave' || record.status === 'Unpaid Leave') && record.leaveDuration === 0.5) {
          const label = record.leavePeriod === 'Morning' ? 'S' : 'C'; // S: Sáng, C: Chiều
          const baseColor = record.status === 'On Leave' ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
          return { symbol: `${record.status === 'On Leave' ? 'P' : 'KP'}(${label})`, color: `${baseColor} text-[10px] font-bold` };
      }

      switch (record.status) {
          case 'Present': 
            // If we have check-in/out times, maybe show a small dot or different shade?
            // For now keeping it simple as requested '+'
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
                          
                          // Simple Late Logic
                          if (bestIn) {
                              const [h, m] = bestIn.split(':').map(Number);
                              if (h > 8 || (h === 8 && m > 20)) status = 'Late';
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

            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-900 transition shadow-md">
                <Download size={16} className="mr-2" /> Xuất Báo Cáo
            </button>
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
                                const { symbol, color } = getCellContent(record);
                                
                                // Calculating totals (Approximate)
                                if (record?.status === 'Present') totalPresent += 1;
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
                                        title={record ? `${record.note || ''}\n${record.checkIn ? `Vào: ${record.checkIn}` : ''}\n${record.checkOut ? `Ra: ${record.checkOut}` : ''}` : ''}
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
          <div className="font-bold uppercase text-gray-400 mr-2">Ghi chú:</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-green-600 bg-green-50 rounded mr-2 border border-green-100">+</span> Có mặt</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-blue-600 bg-blue-50 rounded mr-2 border border-blue-100">P</span> Phép năm</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-red-500 bg-red-50 rounded mr-2 border border-red-100">KP</span> Không lương</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-orange-500 bg-orange-50 rounded mr-2 border border-orange-100">M</span> Đi muộn</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-red-600 bg-red-100 rounded mr-2 border border-red-200">V</span> Vắng mặt</div>
          <div className="flex items-center"><span className="w-6 h-6 flex items-center justify-center font-bold text-white bg-red-500 rounded mr-2 border border-red-600">Lễ</span> Nghỉ Lễ</div>
      </div>

      {/* USER SETTINGS MODAL */}
      {settingsUser && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsUser(null)}></div>
              <div className="bg-white rounded-xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div className="flex items-center space-x-3">
                          <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm border border-gray-100"><Briefcase size={20} /></div>
                          <div>
                              <h3 className="font-bold text-gray-800">Cài đặt trạng thái nhân viên</h3>
                              <p className="text-xs text-gray-500">{settingsUser.name}</p>
                          </div>
                      </div>
                      <button onClick={() => setSettingsUser(null)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      {/* Employment Type Selector */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Hình thức nghỉ</label>
                          <div className="grid grid-cols-3 gap-3">
                              <button
                                onClick={() => setEmploymentType('Normal')}
                                className={`py-2 rounded-lg text-sm font-bold border transition ${employmentType === 'Normal' ? 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                              >
                                  Bình thường
                              </button>
                              <button
                                onClick={() => setEmploymentType('Maternity')}
                                className={`py-2 rounded-lg text-sm font-bold border transition ${employmentType === 'Maternity' ? 'bg-pink-50 text-pink-700 border-pink-200 ring-1 ring-pink-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                              >
                                  Nghỉ thai sản
                              </button>
                              <button
                                onClick={() => setEmploymentType('Resignation')}
                                className={`py-2 rounded-lg text-sm font-bold border transition ${employmentType === 'Resignation' ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                              >
                                  Nghỉ việc
                              </button>
                          </div>
                      </div>

                      {/* Maternity Inputs */}
                      {employmentType === 'Maternity' && (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                              <div className="bg-pink-50 p-3 rounded-lg border border-pink-100 text-xs text-pink-700 font-medium mb-2">
                                  Hệ thống sẽ ghi chú "Nghỉ thai sản" vào bảng chấm công và khóa các ô ngày trong khoảng thời gian này.
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Ngày bắt đầu nghỉ</label>
                                      <input 
                                        type="date" 
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                      />
                                  </div>
                                  <div>
                                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Thời gian làm lại</label>
                                      <input 
                                        type="date" 
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                      />
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Resignation Inputs */}
                      {employmentType === 'Resignation' && (
                          <div className="space-y-4 animate-in slide-in-from-top-2">
                              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-700 font-medium mb-2">
                                  Hệ thống sẽ ghi chú "Nghỉ việc từ ngày..." vào bảng chấm công và khóa các ô ngày từ ngày nghỉ việc trở đi.
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Ngày chính thức nghỉ</label>
                                  <input 
                                    type="date" 
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                  />
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                      <button 
                        onClick={() => setSettingsUser(null)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                      >
                          Hủy
                      </button>
                      <button 
                        onClick={handleSaveUserSettings}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center shadow-lg transition"
                      >
                          <Save size={16} className="mr-2" /> Lưu cài đặt
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* ATTENDANCE DETAIL MODAL */}
      {selectedCell && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCell(null)}></div>
              <div className="bg-white rounded-xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div className="flex items-center space-x-3">
                          <div className="bg-white p-2 rounded-full text-green-600 shadow-sm border border-gray-100"><User size={20} /></div>
                          <div>
                              <h3 className="font-bold text-gray-800 text-sm">{selectedCell.user.name}</h3>
                              <p className="text-xs text-gray-500 font-medium">{new Date(selectedCell.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-red-500 transition"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      {/* Time Check-In/Out Inputs */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase flex items-center"><Clock size={12} className="mr-1"/> Giờ chấm công</h4>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Giờ Vào (In)</label>
                                  <input 
                                    type="time" 
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-center"
                                    value={editCheckIn}
                                    onChange={(e) => setEditCheckIn(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Giờ Ra (Out)</label>
                                  <input 
                                    type="time" 
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm font-mono font-bold text-center"
                                    value={editCheckOut}
                                    onChange={(e) => setEditCheckOut(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Status Selector */}
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Chọn trạng thái</label>
                          <div className="grid grid-cols-5 gap-2">
                              {[
                                { val: 'Present', label: '+', title: 'Có mặt', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
                                { val: 'On Leave', label: 'P', title: 'Nghỉ phép', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                                { val: 'Unpaid Leave', label: 'KP', title: 'Không lương', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
                                { val: 'Late', label: 'M', title: 'Đi muộn', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                                { val: 'Absent', label: 'V', title: 'Vắng mặt', color: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200' },
                              ].map((opt) => (
                                  <button
                                    key={opt.val}
                                    onClick={() => setEditStatus(opt.val as AttendanceStatus)}
                                    className={`h-12 rounded-lg border flex items-center justify-center font-bold text-lg transition-all shadow-sm ${opt.color} ${editStatus === opt.val ? 'ring-2 ring-offset-2 ring-gray-400 scale-105' : ''}`}
                                    title={opt.title}
                                  >
                                      {opt.label}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Display Current Leave Details (Read-only view) */}
                      {selectedCell.record?.leaveForm && (
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
                              <p className="font-bold text-gray-700">Chi tiết đơn nghỉ:</p>
                              <p>Lý do: {selectedCell.record.leaveForm.reason}</p>
                              <p>Bàn giao: {selectedCell.record.leaveForm.handoverWork}</p>
                              {selectedCell.record.leaveFile && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                      <button 
                                          onClick={() => handlePreview(selectedCell.record!.leaveFile!)}
                                          className="text-blue-600 hover:underline text-xs font-bold flex items-center bg-transparent border-none p-0 cursor-pointer"
                                      >
                                          <Paperclip size={12} className="mr-1"/> Xem đơn đính kèm
                                      </button>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Conditional Inputs for Leave */}
                      {editStatus === 'On Leave' && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4 animate-in slide-in-from-top-2">
                              <div>
                                  <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Lý do nghỉ</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                                    placeholder="VD: Nghỉ phép năm..."
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Tệp đính kèm (Đơn xin nghỉ)</label>
                                  
                                  {editFile ? (
                                      <div className="flex items-center gap-2">
                                          <button 
                                              onClick={() => handlePreview(editFile)}
                                              className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition shadow-sm"
                                          >
                                              <Eye size={16} className="mr-2" /> Xem đơn đính kèm
                                          </button>
                                          <label className="p-2 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 text-blue-400 transition shadow-sm" title="Tải file khác">
                                              <Upload size={16} />
                                              <input type="file" className="hidden" onChange={(e) => setEditFile(e.target.files?.[0]?.name || '')} />
                                          </label>
                                      </div>
                                  ) : (
                                      <div className="flex items-center space-x-2">
                                          <div className="flex-1 border border-blue-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-400 italic">
                                              Chưa có tệp
                                          </div>
                                          <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition shadow-md flex items-center">
                                              <Upload size={14} className="mr-1" /> Upload
                                              <input type="file" className="hidden" onChange={(e) => setEditFile(e.target.files?.[0]?.name || '')} />
                                          </label>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                      <button 
                        onClick={() => setSelectedCell(null)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
                      >
                          Hủy
                      </button>
                      <button 
                        onClick={handleSaveAttendance}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center shadow-lg transition transform active:scale-95"
                      >
                          <Save size={16} className="mr-2" /> Lưu cập nhật
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewUrl && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
              <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center">
                          <FileText className="mr-2 text-primary" /> Chi tiết đơn đính kèm
                      </h3>
                      <div className="flex items-center gap-2">
                          <a href={previewUrl} target="_blank" rel="noreferrer" download className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition" title="Tải xuống / Mở tab mới">
                              <Download size={20} />
                          </a>
                          <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition">
                              <X size={20} />
                          </button>
                      </div>
                  </div>
                  <div className="flex-1 bg-gray-50 p-0 overflow-hidden relative">
                       <iframe src={previewUrl} className="w-full h-full border-none bg-white" title="Document Preview"></iframe>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AccountAttendance;

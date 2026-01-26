
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Save, Download, Settings, X, CheckSquare, Square, ArrowUpDown, Filter, DollarSign, Plus, Trash2, User, ShieldCheck, Briefcase, Calendar, CreditCard } from 'lucide-react';
import { UserAccount, AttendanceRecord, AttendanceConfig } from '../../App';

interface AccountSalaryProps {
  users: UserAccount[];
  attendanceRecords: AttendanceRecord[];
  attendanceConfig: AttendanceConfig;
}

// Granular column keys
type ColumnKey = 
  | 'position' | 'basic_salary'
  | 'work_days' | 'salary_time'
  | 'kpi_current' | 'kpi_hold' | 'kpi_return'
  | 'bonus' | 'salary_13' | 'parking'
  | 'total_income' | 'advance'
  | 'insurance_base'
  | 'deduct_bhxh' | 'deduct_bhyt' | 'deduct_bhtn' | 'deduct_fund' | 'deduct_pit' | 'deduct_total'
  | 'tax_family' | 'tax_income_total' | 'tax_assessable'
  | 'net_salary'
  | 'comp_bhxh' | 'comp_bhyt' | 'comp_bhtn' | 'comp_union'
  | 'holiday_bonus' | 'note';

// Money Config Type
type MoneyConfigType = 'parking' | 'bonus' | 'salary13' | 'holidayBonus';

interface MoneyConfig {
    id: number;
    type: MoneyConfigType;
    amount: number;
    month: number;
    year: number;
    name: string; // Display name
}

const AccountSalary: React.FC<AccountSalaryProps> = ({ users, attendanceRecords, attendanceConfig }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Sorting & Filtering State
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('All');

  // Visibility State - Granular
  const [showSettings, setShowSettings] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
      position: true, basic_salary: true,
      work_days: true, salary_time: true,
      kpi_current: true, kpi_hold: true, kpi_return: true,
      bonus: true, salary_13: true, parking: true,
      total_income: true, advance: true,
      insurance_base: true,
      deduct_bhxh: true, deduct_bhyt: true, deduct_bhtn: true, deduct_fund: true, deduct_pit: true, deduct_total: true,
      tax_family: true, tax_income_total: true, tax_assessable: true,
      net_salary: true,
      comp_bhxh: true, comp_bhyt: true, comp_bhtn: true, comp_union: true,
      holiday_bonus: true, note: true
  });

  // Edit Modal State
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Money Config State
  const [showMoneyModal, setShowMoneyModal] = useState(false);
  const [moneyConfigs, setMoneyConfigs] = useState<MoneyConfig[]>([
      { id: 1, type: 'parking', amount: 150000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), name: 'Phụ cấp gửi xe' },
      { id: 2, type: 'bonus', amount: 500000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), name: 'Thưởng KPI chuẩn' }
  ]);
  const [newMoneyConfig, setNewMoneyConfig] = useState<{type: MoneyConfigType, amount: number, name: string}>({
      type: 'parking', amount: 0, name: 'Phụ cấp gửi xe'
  });

  // Payroll Data State
  const [payrollData, setPayrollData] = useState<Record<number, {
      basic: number; // Lương
      kpiCurrent: number; // Tháng này
      kpiHold: number; // Tạm giữ tháng này
      kpiReturn: number; // Trả lại tháng trước
      bonus: number; // Thưởng
      salary13: number; // Lương tháng 13
      parking: number; // Gửi xe
      advance: number; // Tạm ứng/Trừ lương
      insuranceBase: number; // Lương đóng BH
      companyFund: number; // Trích quỹ cty
      familyDeduction: number; // Giảm trừ gia cảnh
      holidayBonus: number; // Thưởng lễ
      unionFee: number; // KPCĐ
      note: string;
      isContractSigned: boolean; // Hợp đồng lao động
  }>>({});

  // Initialize data
  useEffect(() => {
      const initData: any = { ...payrollData };
      let hasChange = false;
      users.forEach(u => {
          if (!initData[u.id]) {
              initData[u.id] = {
                  basic: 5000000,
                  kpiCurrent: 0,
                  kpiHold: 0,
                  kpiReturn: 0,
                  bonus: 0,
                  salary13: 0,
                  parking: 150000,
                  advance: 0,
                  insuranceBase: 5000000,
                  companyFund: 50000,
                  familyDeduction: 11000000,
                  holidayBonus: 0,
                  unionFee: 0,
                  note: '',
                  isContractSigned: true
              };
              hasChange = true;
          }
      });
      if (hasChange) setPayrollData(initData);
  }, [users]);

  // Extract unique roles for filter
  const uniqueRoles = useMemo(() => {
      const roles = new Set(users.map(u => u.role));
      return ['All', ...Array.from(roles)];
  }, [users]);

  // Filter and Sort Users
  const filteredUsers = useMemo(() => {
      let result = users.filter(u => 
          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) && u.role !== 'Customer'
      );

      if (roleFilter !== 'All') {
          result = result.filter(u => u.role === roleFilter);
      }

      if (sortDirection) {
          result.sort((a, b) => {
              const nameA = a.name.toLowerCase();
              const nameB = b.name.toLowerCase();
              if (sortDirection === 'asc') return nameA.localeCompare(nameB, 'vi');
              return nameB.localeCompare(nameA, 'vi');
          });
      }

      return result;
  }, [users, searchTerm, roleFilter, sortDirection]);

  // --- HELPER TO CALCULATE WORK DAYS (TC) ---
  const calculateWorkDays = (userId: number) => {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      let count = 0;

      for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const record = attendanceRecords.find(r => r.userId === userId && r.date === dateStr);
          
          let isPresent = false;

          // Check if user is exempt
          const isExempt = attendanceConfig.exemptUserIds.includes(userId);

          if (isExempt) {
              if (!record) {
                  // If exempt and no record, assume present on weekdays
                  const dateObj = new Date(selectedYear, selectedMonth - 1, d);
                  const dayOfWeek = dateObj.getDay();
                  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                      isPresent = true;
                  }
              } else {
                  // If record exists, respect the status
                  if (record.status === 'Present' || record.status === 'Late') {
                      isPresent = true;
                  }
              }
          } else {
              // Not exempt: Must have explicit Present/Late record
              if (record && (record.status === 'Present' || record.status === 'Late')) {
                  isPresent = true;
              }
          }

          if (isPresent) count++;
      }
      return count;
  };

  const handleSortToggle = () => {
      setSortDirection(prev => {
          if (prev === null) return 'asc';
          if (prev === 'asc') return 'desc';
          return null;
      });
  };

  const handleOpenEdit = (userId: number) => {
      setEditingMember(userId);
      setEditFormData({ ...payrollData[userId] });
  };

  const handleSaveEdit = () => {
      if (editingMember !== null && editFormData) {
          setPayrollData(prev => ({
              ...prev,
              [editingMember]: editFormData
          }));
          setEditingMember(null);
          setEditFormData(null);
      }
  };

  const toggleColumn = (key: ColumnKey) => {
      setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatMoney = (num: number) => Math.round(num).toLocaleString('en-US');

  const currentYearBase = new Date().getFullYear();
  const yearOptions = [currentYearBase - 1, currentYearBase, currentYearBase + 1];

  const handleEditFormChange = (field: string, val: string | boolean) => {
      if (field === 'note' || field === 'isContractSigned') {
          setEditFormData({ ...editFormData, [field]: val });
      } else {
          const num = parseInt(String(val).replace(/[^0-9-]/g, '')) || 0;
          setEditFormData({ ...editFormData, [field]: num });
      }
  };

  const handleAddMoneyConfig = () => {
      if(newMoneyConfig.amount <= 0) return alert('Số tiền phải lớn hơn 0');
      setMoneyConfigs([...moneyConfigs, {
          id: Date.now(),
          type: newMoneyConfig.type,
          amount: newMoneyConfig.amount,
          month: selectedMonth,
          year: selectedYear,
          name: newMoneyConfig.name
      }]);
      setNewMoneyConfig({ ...newMoneyConfig, amount: 0 });
  };

  const handleDeleteMoneyConfig = (id: number) => {
      setMoneyConfigs(moneyConfigs.filter(c => c.id !== id));
  };

  const applyPresetValue = (field: string, type: MoneyConfigType) => {
      const config = moneyConfigs.find(c => c.type === type && c.month === selectedMonth && c.year === selectedYear);
      if (config) {
          setEditFormData({ ...editFormData, [field]: config.amount });
      } else {
          alert(`Chưa có cấu hình khoản tiền "${newMoneyConfig.name}" cho Tháng ${selectedMonth}/${selectedYear}.`);
      }
  };

  const getColSpan = (keys: ColumnKey[]) => keys.filter(k => visibleColumns[k]).length;

  const columnConfig: { group: string, items: { key: ColumnKey, label: string }[] }[] = [
      { group: 'Thông tin cơ bản', items: [{ key: 'position', label: 'Chức vụ' }, { key: 'basic_salary', label: 'Lương Cơ Bản' }] },
      { group: 'Lương thời gian', items: [{ key: 'work_days', label: 'Ngày công' }, { key: 'salary_time', label: 'Số tiền' }] },
      { group: 'Lương khoán', items: [{ key: 'kpi_current', label: 'Tháng này' }, { key: 'kpi_hold', label: 'Tạm giữ' }, { key: 'kpi_return', label: 'Trả lại' }] },
      { group: 'Phụ cấp & Thưởng', items: [{ key: 'bonus', label: 'Thưởng' }, { key: 'salary_13', label: 'Lương T13' }, { key: 'parking', label: 'Gửi xe' }, { key: 'holiday_bonus', label: 'Thưởng lễ' }] },
      { group: 'Tổng & Tạm ứng', items: [{ key: 'total_income', label: 'Tổng số' }, { key: 'advance', label: 'Tạm ứng' }] },
      { group: 'Khấu trừ & Thuế', items: [{ key: 'insurance_base', label: 'Lương BH' }, { key: 'deduct_bhxh', label: 'BHXH (NV)' }, { key: 'deduct_bhyt', label: 'BHYT (NV)' }, { key: 'deduct_bhtn', label: 'BHTN (NV)' }, { key: 'deduct_fund', label: 'Quỹ Cty' }, { key: 'deduct_pit', label: 'Thuế TNCN' }, { key: 'deduct_total', label: 'Cộng Khấu Trừ' }] },
      { group: 'Tính Thuế', items: [{ key: 'tax_family', label: 'Giảm trừ GC' }, { key: 'tax_income_total', label: 'TN Chịu Thuế' }, { key: 'tax_assessable', label: 'TN Tính Thuế' }] },
      { group: 'Thực lĩnh', items: [{ key: 'net_salary', label: 'Thực lĩnh' }] },
      { group: 'Chi phí Công ty', items: [{ key: 'comp_bhxh', label: 'BHXH (Cty)' }, { key: 'comp_bhyt', label: 'BHYT (Cty)' }, { key: 'comp_bhtn', label: 'BHTN (Cty)' }, { key: 'comp_union', label: 'KPCĐ' }] },
      { group: 'Khác', items: [{ key: 'note', label: 'Ghi chú' }] },
  ];

  const getBankStyle = (bankName: string = '') => {
    const name = bankName.toLowerCase();
    if (name.includes('techcom')) return 'bg-gradient-to-br from-red-600 to-red-800';
    if (name.includes('vietcom')) return 'bg-gradient-to-br from-green-600 to-green-800';
    if (name.includes('mb') || name.includes('military')) return 'bg-gradient-to-br from-blue-700 to-blue-900';
    if (name.includes('acb')) return 'bg-gradient-to-br from-blue-500 to-blue-700';
    return 'bg-gradient-to-br from-gray-700 to-gray-900';
  };

  const editingUserObj = users.find(u => u.id === editingMember);

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in duration-300 w-full max-w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
            <div>
                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Quản lý Lương</h3>
                <div className="flex items-center gap-2 mt-1">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:border-green-500"
                    >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:border-green-500"
                    >
                        {yearOptions.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div className="relative flex-grow lg:flex-grow-0">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Tìm nhân viên..." 
                        className="w-full lg:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={() => setShowMoneyModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center transition"
                >
                    <DollarSign size={16} className="mr-2" /> Cấu hình Thu nhập
                </button>

                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center hover:bg-green-700 transition">
                    <Download size={16} className="mr-2" /> Xuất Excel
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`px-4 py-2 rounded-lg border transition flex items-center font-bold text-sm ${showSettings ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Settings size={16} className="mr-2" /> Thiết lập
                    </button>
                    
                    {showSettings && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-3 animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Hiển thị cột</div>
                            <div className="space-y-3">
                                {columnConfig.map((group, gIdx) => (
                                    <div key={gIdx}>
                                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">{group.group}</div>
                                        <div className="space-y-1 pl-1">
                                            {group.items.map((col) => (
                                                <div 
                                                    key={col.key} 
                                                    onClick={() => toggleColumn(col.key)}
                                                    className="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                                                >
                                                    {visibleColumns[col.key] ? <CheckSquare size={16} className="text-green-500 mr-2" /> : <Square size={16} className="text-gray-300 mr-2" />}
                                                    {col.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-white border border-gray-300 shadow-md rounded-lg overflow-x-auto flex-1 w-full relative">
            <table className="w-full border-collapse text-xs min-w-full">
                <thead className="sticky top-0 z-40 shadow-sm">
                    <tr className="bg-[#FFFBF0] text-slate-800 font-bold uppercase tracking-wider text-center h-10 border-b border-orange-200">
                        <th className="border border-orange-200 w-[40px] bg-[#FFFBF0]" rowSpan={2}>STT</th>
                        <th className="border border-orange-200 min-w-[180px] sticky left-0 z-50 bg-[#FFFBF0]" rowSpan={2}>
                            <div className="flex items-center justify-between px-2">
                                <span>Tên Nhân viên</span>
                                <button onClick={handleSortToggle} className="p-1 hover:bg-orange-100 rounded transition">
                                    <ArrowUpDown size={14} className={sortDirection ? 'text-primary' : 'text-slate-400'} />
                                </button>
                            </div>
                        </th>
                        
                        {visibleColumns.position && (
                            <th className="border border-orange-200 w-[120px] bg-[#FFFBF0]" rowSpan={2}>
                                <div className="flex items-center justify-center space-x-1">
                                    <span>Chức vụ</span>
                                    <div className="relative group">
                                        <Filter size={12} className={`cursor-pointer ${roleFilter !== 'All' ? 'text-primary' : 'text-slate-400'}`} />
                                        <select 
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                        >
                                            {uniqueRoles.map(r => <option key={r} value={r}>{r === 'All' ? 'Tất cả' : r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </th>
                        )}
                        {visibleColumns.basic_salary && <th className="border border-orange-200 w-[100px] bg-[#FFFBF0]" rowSpan={2}>Lương CB</th>}
                        
                        {getColSpan(['work_days', 'salary_time']) > 0 && (
                            <th className="border border-orange-200 bg-[#fff7ed]" colSpan={getColSpan(['work_days', 'salary_time'])}>Lương thời gian</th>
                        )}
                        
                        {getColSpan(['kpi_current', 'kpi_hold', 'kpi_return']) > 0 && (
                            <th className="border border-orange-200 bg-[#fefce8]" colSpan={getColSpan(['kpi_current', 'kpi_hold', 'kpi_return'])}>Lương khoán</th>
                        )}
                        
                        {visibleColumns.bonus && <th className="border border-orange-200 w-[90px] bg-[#FFFBF0]" rowSpan={2}>Thưởng</th>}
                        {visibleColumns.salary_13 && <th className="border border-orange-200 w-[90px] bg-[#FFFBF0]" rowSpan={2}>Lương T13</th>}
                        {visibleColumns.parking && <th className="border border-orange-200 w-[90px] bg-[#FFFBF0]" rowSpan={2}>Gửi xe</th>}
                        {visibleColumns.total_income && <th className="border border-orange-200 w-[110px] bg-green-50 text-green-800" rowSpan={2}>Tổng số</th>}
                        {visibleColumns.advance && <th className="border border-orange-200 w-[100px] bg-red-50 text-red-800" rowSpan={2}>Tạm ứng / Trừ</th>}
                        {visibleColumns.insurance_base && <th className="border border-orange-200 w-[100px] bg-[#FFFBF0]" rowSpan={2}>Lương BH</th>}
                        {getColSpan(['deduct_bhxh', 'deduct_bhyt', 'deduct_bhtn', 'deduct_fund', 'deduct_pit', 'deduct_total']) > 0 && (
                            <th className="border border-orange-200 bg-[#fff1f2]" colSpan={getColSpan(['deduct_bhxh', 'deduct_bhyt', 'deduct_bhtn', 'deduct_fund', 'deduct_pit', 'deduct_total'])}>Các khoản khấu trừ</th>
                        )}
                        {visibleColumns.tax_family && <th className="border border-orange-200 w-[100px] bg-[#FFFBF0]" rowSpan={2}>Giảm trừ GC</th>}
                        {visibleColumns.tax_income_total && <th className="border border-orange-200 w-[100px] bg-[#FFFBF0]" rowSpan={2}>TN chịu thuế</th>}
                        {visibleColumns.tax_assessable && <th className="border border-orange-200 w-[100px] bg-[#FFFBF0]" rowSpan={2}>TN Tính thuế</th>}
                        {visibleColumns.net_salary && <th className="border border-orange-200 w-[120px] bg-green-100 text-green-900" rowSpan={2}>Thực lĩnh</th>}
                        {getColSpan(['comp_bhxh', 'comp_bhyt', 'comp_bhtn', 'comp_union']) > 0 && (
                            <th className="border border-orange-200 bg-[#f3f4f6]" colSpan={getColSpan(['comp_bhxh', 'comp_bhyt', 'comp_bhtn', 'comp_union'])}>Cty đóng</th>
                        )}
                        {visibleColumns.holiday_bonus && <th className="border border-orange-200 w-[90px] bg-[#FFFBF0]" rowSpan={2}>Thưởng lễ</th>}
                        {visibleColumns.note && <th className="border border-orange-200 min-w-[100px] bg-[#FFFBF0]" rowSpan={2}>Ghi chú</th>}
                    </tr>
                    <tr className="bg-[#FFFBF0] text-slate-700 font-bold uppercase text-[10px] text-center h-10 border-b border-orange-200">
                        {visibleColumns.work_days && <th className="border border-orange-200 w-[50px] bg-[#fff7ed]">Ngày công</th>}
                        {visibleColumns.salary_time && <th className="border border-orange-200 w-[100px] bg-[#fff7ed]">Số tiền</th>}
                        {visibleColumns.kpi_current && <th className="border border-orange-200 w-[100px] bg-[#fefce8]">Tháng này</th>}
                        {visibleColumns.kpi_hold && <th className="border border-orange-200 w-[100px] bg-[#fefce8]">Giữ T.Này</th>}
                        {visibleColumns.kpi_return && <th className="border border-orange-200 w-[100px] bg-[#fefce8]">Trả T.Trước</th>}
                        {visibleColumns.deduct_bhxh && <th className="border border-orange-200 w-[80px] bg-[#fff1f2]">BHXH</th>}
                        {visibleColumns.deduct_bhyt && <th className="border border-orange-200 w-[80px] bg-[#fff1f2]">BHYT</th>}
                        {visibleColumns.deduct_bhtn && <th className="border border-orange-200 w-[80px] bg-[#fff1f2]">BHTN</th>}
                        {visibleColumns.deduct_fund && <th className="border border-orange-200 w-[80px] bg-[#fff1f2]">Quỹ Cty</th>}
                        {visibleColumns.deduct_pit && <th className="border border-orange-200 w-[80px] bg-[#fff1f2]">Thuế TNCN</th>}
                        {visibleColumns.deduct_total && <th className="border border-orange-200 w-[90px] bg-[#ffe4e6] text-red-700">Cộng</th>}
                        {visibleColumns.comp_bhxh && <th className="border border-orange-200 w-[80px] bg-[#f3f4f6]">BHXH</th>}
                        {visibleColumns.comp_bhyt && <th className="border border-orange-200 w-[80px] bg-[#f3f4f6]">BHYT</th>}
                        {visibleColumns.comp_bhtn && <th className="border border-orange-200 w-[80px] bg-[#f3f4f6]">BHTN</th>}
                        {visibleColumns.comp_union && <th className="border border-orange-200 w-[80px] bg-[#f3f4f6]">KPCĐ</th>}
                    </tr>
                </thead>
                <tbody className="text-sm font-medium text-gray-700">
                    {filteredUsers.map((u, idx) => {
                        const d = payrollData[u.id] || { 
                            basic: 0, 
                            kpiCurrent: 0, 
                            kpiHold: 0, 
                            kpiReturn: 0, 
                            bonus: 0, 
                            salary13: 0, 
                            parking: 0, 
                            advance: 0, 
                            insuranceBase: 0, 
                            companyFund: 0, 
                            familyDeduction: 11000000, 
                            holidayBonus: 0, 
                            unionFee: 0, 
                            note: '', 
                            isContractSigned: true 
                        };
                        
                        // USE HELPER FOR TC
                        const workDays = calculateWorkDays(u.id);
                        
                        const salaryTime = (d.basic / 26) * workDays;
                        const totalIncome = salaryTime + (d.kpiCurrent || 0) + (d.kpiReturn || 0) + (d.bonus || 0) + (d.parking || 0);
                        const netSalary = totalIncome - (d.advance || 0);

                        return (
                            <tr key={u.id} className="hover:bg-yellow-50 transition border-b border-gray-200 group">
                                <td className="border border-gray-300 text-center py-2 bg-gray-50">{idx + 1}</td>
                                <td className="border border-gray-300 px-3 font-bold sticky left-0 bg-white z-20 shadow-sm text-blue-900 cursor-pointer hover:underline" onClick={() => handleOpenEdit(u.id)}>{u.name}</td>
                                {visibleColumns.position && <td className="border border-gray-300 text-center text-xs">{u.role}</td>}
                                {visibleColumns.basic_salary && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.basic)}</td>}
                                {visibleColumns.work_days && <td className="border border-gray-300 text-center font-bold">{workDays}</td>}
                                {visibleColumns.salary_time && <td className="border border-gray-300 text-right px-2 font-bold text-blue-700 bg-blue-50">{formatMoney(salaryTime)}</td>}
                                {visibleColumns.kpi_current && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.kpiCurrent || 0)}</td>}
                                {visibleColumns.kpi_hold && <td className="border border-gray-300 px-2 text-right text-red-500">{formatMoney(d.kpiHold || 0)}</td>}
                                {visibleColumns.kpi_return && <td className="border border-gray-300 px-2 text-right text-green-600">{formatMoney(d.kpiReturn || 0)}</td>}
                                {visibleColumns.bonus && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.bonus || 0)}</td>}
                                {visibleColumns.salary_13 && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.salary13 || 0)}</td>}
                                {visibleColumns.parking && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.parking || 0)}</td>}
                                {visibleColumns.total_income && <td className="border border-gray-300 text-right px-2 font-black text-green-800 bg-green-100">{formatMoney(totalIncome)}</td>}
                                {visibleColumns.advance && <td className="border border-gray-300 px-2 text-right text-red-600 font-bold">{formatMoney(d.advance)}</td>}
                                {visibleColumns.insurance_base && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.insuranceBase || 0)}</td>}
                                {visibleColumns.deduct_bhxh && <td className="border border-gray-300 text-right px-2 text-xs">{(d.insuranceBase || 0) * 0.08}</td>}
                                {visibleColumns.deduct_bhyt && <td className="border border-gray-300 text-right px-2 text-xs">{(d.insuranceBase || 0) * 0.015}</td>}
                                {visibleColumns.deduct_bhtn && <td className="border border-gray-300 text-right px-2 text-xs">{(d.insuranceBase || 0) * 0.01}</td>}
                                {visibleColumns.deduct_fund && <td className="border border-gray-300 px-2 text-right text-xs">{formatMoney(d.companyFund || 0)}</td>}
                                {visibleColumns.deduct_pit && <td className="border border-gray-300 text-right px-2 font-bold text-orange-600">0</td>}
                                {visibleColumns.deduct_total && <td className="border border-gray-300 text-right px-2 font-black text-red-700 bg-red-50">0</td>}
                                {visibleColumns.tax_family && <td className="border border-gray-300 px-2 text-right text-xs">{formatMoney(d.familyDeduction || 11000000)}</td>}
                                {visibleColumns.tax_income_total && <td className="border border-gray-300 text-right px-2 bg-gray-50">{formatMoney(totalIncome)}</td>}
                                {visibleColumns.tax_assessable && <td className="border border-gray-300 text-right px-2 bg-gray-50 font-bold">0</td>}
                                {visibleColumns.net_salary && <td className="border border-gray-300 text-right px-2 font-black text-white bg-green-600 text-base">{formatMoney(netSalary)}</td>}
                                {visibleColumns.comp_bhxh && <td className="border border-gray-300 text-right px-2 text-xs text-gray-500">{(d.insuranceBase || 0) * 0.175}</td>}
                                {visibleColumns.comp_bhyt && <td className="border border-gray-300 text-right px-2 text-xs text-gray-500">{(d.insuranceBase || 0) * 0.03}</td>}
                                {visibleColumns.comp_bhtn && <td className="border border-gray-300 text-right px-2 text-xs text-gray-500">{(d.insuranceBase || 0) * 0.01}</td>}
                                {visibleColumns.comp_union && <td className="border border-gray-300 px-2 text-right text-xs">0</td>}
                                {visibleColumns.holiday_bonus && <td className="border border-gray-300 px-2 text-right">{formatMoney(d.holidayBonus || 0)}</td>}
                                {visibleColumns.note && <td className="border border-gray-300 px-2 text-left text-xs truncate max-w-[150px]">{d.note}</td>}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {showMoneyModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMoneyModal(false)}></div>
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center"><DollarSign className="mr-2 text-indigo-600" /> Cấu hình Thu nhập</h3>
                        <button onClick={() => setShowMoneyModal(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Loại tiền</label>
                                <select className="w-full border rounded-lg p-2 text-sm outline-none" value={newMoneyConfig.type} onChange={(e) => setNewMoneyConfig({ ...newMoneyConfig, type: e.target.value as MoneyConfigType })}>
                                    <option value="parking">Phụ cấp Gửi xe</option>
                                    <option value="bonus">Thưởng (Bonus)</option>
                                    <option value="salary13">Lương Tháng 13</option>
                                    <option value="holidayBonus">Thưởng Lễ</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Tên hiển thị</label>
                                <input type="text" className="w-full border rounded-lg p-2 text-sm" value={newMoneyConfig.name} onChange={(e) => setNewMoneyConfig({...newMoneyConfig, name: e.target.value})} />
                            </div>
                        </div>
                        <input type="number" className="w-full border rounded-lg p-2 text-lg font-bold" value={newMoneyConfig.amount} onChange={(e) => setNewMoneyConfig({...newMoneyConfig, amount: Number(e.target.value)})} />
                        
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center text-xs text-blue-700 font-bold">
                            <span>Áp dụng cho: Tháng {selectedMonth}/{selectedYear}</span>
                            <button 
                                onClick={handleAddMoneyConfig}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex items-center"
                            >
                                <Plus size={14} className="mr-1" /> Thêm mới
                            </button>
                        </div>

                        {/* List */}
                        <div className="mt-4 max-h-60 overflow-y-auto">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Danh sách đã cấu hình (Tháng {selectedMonth}/{selectedYear})</label>
                            <div className="space-y-2">
                                {moneyConfigs.filter(c => c.month === selectedMonth && c.year === selectedYear).map(config => (
                                    <div key={config.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 hover:bg-white transition">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{config.name}</p>
                                            <p className="text-xs text-gray-500 uppercase">{config.type}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-indigo-600">{formatMoney(config.amount)}</span>
                                            <button onClick={() => handleDeleteMoneyConfig(config.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {moneyConfigs.filter(c => c.month === selectedMonth && c.year === selectedYear).length === 0 && (
                                    <p className="text-center text-gray-400 italic text-sm py-4">Chưa có cấu hình nào.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {editingMember !== null && editFormData && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditingMember(null)}>
                <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200 border border-gray-100" onClick={e => e.stopPropagation()}>
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center sticky top-0 z-10 shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"><User size={24} /></div>
                            <div>
                                <h3 className="text-xl font-bold">{editingUserObj?.name}</h3>
                                <div className="flex items-center gap-3 text-xs font-medium text-blue-100 mt-1">
                                    <span className="bg-white/20 px-2 py-0.5 rounded flex items-center"><Briefcase size={12} className="mr-1" /> {editingUserObj?.role}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded flex items-center"><Calendar size={12} className="mr-1" /> Tháng {selectedMonth}/{selectedYear}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Contract Toggle */}
                            <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20">
                                <button 
                                    onClick={() => handleEditFormChange('isContractSigned', false)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${!editFormData.isContractSigned ? 'bg-white text-blue-600 shadow' : 'text-blue-100 hover:text-white'}`}
                                >
                                    Thử việc / CTV
                                </button>
                                <button 
                                    onClick={() => handleEditFormChange('isContractSigned', true)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center ${editFormData.isContractSigned ? 'bg-green-500 text-white shadow' : 'text-blue-100 hover:text-white'}`}
                                >
                                    <ShieldCheck size={12} className="mr-1" /> Đã ký HĐLĐ
                                </button>
                            </div>
                            <button onClick={() => setEditingMember(null)} className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
                        </div>
                    </div>
                    
                    <div className="p-5 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
                            
                            {/* COL 1: INCOME CORE */}
                            <div className="flex flex-col h-full">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 h-full">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center">
                                        <div className="w-6 h-1 bg-green-500 mr-2 rounded-full"></div> Nguồn thu nhập chính
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Lương Cơ Bản</label>
                                            <input type="text" className="w-full border border-gray-200 rounded-xl p-2.5 text-lg font-bold text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition" value={formatMoney(editFormData.basic)} onChange={e => handleEditFormChange('basic', e.target.value)} />
                                        </div>
                                        
                                        {/* KPI Section */}
                                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-2">
                                            <label className="text-[10px] font-bold text-orange-700 uppercase block mb-2">Lương Khoán (KPI)</label>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500">Tháng này</label>
                                                        <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-blue-600 bg-white" value={formatMoney(editFormData.kpiCurrent)} onChange={e => handleEditFormChange('kpiCurrent', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500">Tạm giữ</label>
                                                        <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-red-500 bg-white" value={formatMoney(editFormData.kpiHold)} onChange={e => handleEditFormChange('kpiHold', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500">Trả lại (Tháng trước)</label>
                                                    <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-green-600 bg-white" value={formatMoney(editFormData.kpiReturn)} onChange={e => handleEditFormChange('kpiReturn', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COL 2: BENEFITS & BONUSES */}
                            <div className="flex flex-col h-full">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 h-full">
                                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center">
                                        <div className="w-6 h-1 bg-blue-500 mr-2 rounded-full"></div> Phụ cấp & Chế độ
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-500">Phụ cấp Gửi xe</label><button onClick={() => applyPresetValue('parking', 'parking')} className="text-[10px] text-blue-500 font-bold hover:underline">Áp dụng</button></div>
                                                <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold" value={formatMoney(editFormData.parking)} onChange={e => handleEditFormChange('parking', e.target.value)} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-gray-500">Thưởng (Bonus)</label><button onClick={() => applyPresetValue('bonus', 'bonus')} className="text-[10px] text-blue-500 font-bold hover:underline">Áp dụng</button></div>
                                                <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold" value={formatMoney(editFormData.bonus)} onChange={e => handleEditFormChange('bonus', e.target.value)} />
                                            </div>
                                        </div>

                                        {editFormData.isContractSigned ? (
                                            <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <div>
                                                    <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-blue-700">Lương T13</label><button onClick={() => applyPresetValue('salary13', 'salary13')} className="text-[10px] text-blue-500 font-bold hover:underline">Áp dụng</button></div>
                                                    <input type="text" className="w-full border border-blue-200 rounded-lg p-2 text-sm font-bold text-blue-600 bg-white" value={formatMoney(editFormData.salary13)} onChange={e => handleEditFormChange('salary13', e.target.value)} />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-1"><label className="text-[10px] font-bold text-blue-700">Thưởng Lễ</label><button onClick={() => applyPresetValue('holidayBonus', 'holidayBonus')} className="text-[10px] text-blue-500 font-bold hover:underline">Áp dụng</button></div>
                                                    <input type="text" className="w-full border border-blue-200 rounded-lg p-2 text-sm font-bold text-blue-600 bg-white" value={formatMoney(editFormData.holidayBonus)} onChange={e => handleEditFormChange('holidayBonus', e.target.value)} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-400 italic">
                                                Chế độ Lương T13 & Thưởng Lễ chỉ áp dụng khi ký HĐLĐ.
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[10px] font-bold text-red-500 block mb-1">Tạm ứng / Trừ lương khác</label>
                                            <input type="text" className="w-full bg-red-50 border border-red-200 rounded-lg p-2 text-sm font-bold text-red-600" value={formatMoney(editFormData.advance)} onChange={e => handleEditFormChange('advance', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COL 3: DEDUCTIONS & INFO */}
                            <div className="flex flex-col h-full space-y-5">
                                {/* Bank Info Card - Condensed & Dynamic Color */}
                                <div className={`${getBankStyle(editingUserObj?.bankName)} p-4 rounded-2xl text-white shadow-lg relative overflow-hidden transition-colors`}>
                                    <div className="absolute right-0 top-0 p-3 opacity-10"><CreditCard size={64} /></div>
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><CreditCard size={20} /></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/70 uppercase">Tài khoản nhận lương</p>
                                            {editingUserObj?.bankAccount ? (
                                                <>
                                                    <p className="font-mono font-bold text-lg tracking-wider text-white">{editingUserObj.bankAccount}</p>
                                                    <p className="text-[10px] text-white/90 font-bold uppercase">{editingUserObj.bankName}</p>
                                                </>
                                            ) : (
                                                <p className="text-xs italic text-white/50">Chưa cập nhật</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 ${!editFormData.isContractSigned ? 'opacity-70 grayscale' : ''}`}>
                                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-3 flex items-center justify-between">
                                        <div className="flex items-center"><div className="w-6 h-1 bg-red-500 mr-2 rounded-full"></div> Nghĩa vụ & Khấu trừ</div>
                                        {!editFormData.isContractSigned && <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">N/A</span>}
                                    </h4>
                                    
                                    <div className={`space-y-3 ${!editFormData.isContractSigned ? 'pointer-events-none' : ''}`}>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Lương đóng BHXH</label>
                                            <input type="text" className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold" value={formatMoney(editFormData.insuranceBase)} onChange={e => handleEditFormChange('insuranceBase', e.target.value)} />
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block">Quỹ Cty</label>
                                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold" value={formatMoney(editFormData.companyFund)} onChange={e => handleEditFormChange('companyFund', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block">KPCĐ</label>
                                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold" value={formatMoney(editFormData.unionFee)} onChange={e => handleEditFormChange('unionFee', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block">GT Gia cảnh</label>
                                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-1.5 text-xs font-bold" value={formatMoney(editFormData.familyDeduction)} onChange={e => handleEditFormChange('familyDeduction', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Ghi chú</label>
                                    <textarea className="w-full border border-gray-200 rounded-lg p-2 text-sm h-16 resize-none focus:border-blue-500 outline-none transition" value={editFormData.note} onChange={e => handleEditFormChange('note', e.target.value)}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button onClick={() => setEditingMember(null)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition text-sm">Hủy bỏ</button>
                        <button onClick={handleSaveEdit} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center transform active:scale-95 text-sm">
                            <Save size={16} className="mr-2" /> Lưu cập nhật
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AccountSalary;


import React, { useState, useMemo } from 'react';
// Added X to the lucide-react imports
import { Plus, ArrowUpRight, ArrowDownLeft, DollarSign, Trash2, Search, Wallet, Filter, Download, Calendar, X } from 'lucide-react';

interface WCATransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  pic: string;
}

const AccountWCA: React.FC = () => {
  const [transactions, setTransactions] = useState<WCATransaction[]>([
    { id: 1, date: '2026-05-01', description: 'Nạp quỹ đầu tháng', amount: 50000000, type: 'in', pic: 'Admin' },
    { id: 2, date: '2026-05-05', description: 'Thanh toán phí cảng Cát Lái (Job 102)', amount: 2500000, type: 'out', pic: 'Ops Team' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterMonth, setFilterMonth] = useState<number | 'All'>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(2026); // Default to 2026

  const [newTrans, setNewTrans] = useState<Omit<WCATransaction, 'id'>>({
      date: new Date().toISOString().split('T')[0], description: '', amount: 0, type: 'out', pic: ''
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (t.pic || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const dateObj = new Date(t.date);
        const m = dateObj.getMonth() + 1;
        const y = dateObj.getFullYear();

        const matchesMonth = filterMonth === 'All' || m === filterMonth;
        const matchesYear = y === filterYear;

        return matchesSearch && matchesMonth && matchesYear;
    });
  }, [transactions, searchTerm, filterMonth, filterYear]);

  const balance = transactions.reduce((acc, curr) => curr.type === 'in' ? acc + curr.amount : acc - curr.amount, 0);

  const handleSave = () => {
      if (!newTrans.description || newTrans.amount <= 0) return alert('Vui lòng nhập thông tin hợp lệ');
      setTransactions([{ ...newTrans, id: Date.now() }, ...transactions]);
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 uppercase">QUẢN LÝ DÒNG TIỀN WCA</h3>
          <p className="text-sm text-gray-500">Số dư hiện tại: <span className="font-bold text-blue-600">{balance.toLocaleString()} VND</span></p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            {/* Filter Group */}
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 space-x-1">
                <div className="relative">
                    <Calendar className="absolute left-2 top-2 text-gray-400" size={14} />
                    <select 
                        className="pl-7 pr-2 py-1 bg-transparent text-xs font-bold outline-none border-none"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                    >
                        <option value="All">Tất cả tháng</option>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                </div>
                <div className="w-px bg-gray-200 my-1"></div>
                <select 
                    className="px-2 py-1 bg-transparent text-xs font-bold outline-none border-none"
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                >
                    {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm giao dịch..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition"
            >
                <Plus size={16} className="mr-2" /> Tạo mới
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 transition shadow-md">
                <Download size={16} className="mr-2" /> Excel
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden h-fit">
            <div className="relative z-10">
                <p className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-1">Ví điện tử WCA</p>
                <h2 className="text-3xl font-black">{balance.toLocaleString()}</h2>
                <div className="mt-6 space-y-2 text-xs font-medium opacity-90">
                    <div className="flex justify-between items-center bg-white/10 p-2 rounded-lg border border-white/10">
                        <span className="flex items-center"><ArrowUpRight size={14} className="mr-1 text-green-400"/> Nạp:</span>
                        <span>{transactions.filter(t=>t.type==='in').reduce((s,t)=>s+t.amount,0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 p-2 rounded-lg border border-white/10">
                        <span className="flex items-center"><ArrowDownLeft size={14} className="mr-1 text-red-400"/> Chi:</span>
                        <span>{transactions.filter(t=>t.type==='out').reduce((s,t)=>s+t.amount,0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <Wallet size={100} className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12" />
        </div>

        <div className="lg:col-span-3 bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <table className="w-full text-left">
                <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Ngày</th>
                        <th className="px-6 py-4">Nội dung</th>
                        <th className="px-6 py-4">Người chi</th>
                        <th className="px-6 py-4 text-center">Loại</th>
                        <th className="px-6 py-4 text-right">Số tiền</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 transition h-14">
                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{t.date}</td>
                            <td className="px-6 py-4 font-bold text-gray-800">{t.description}</td>
                            <td className="px-6 py-4 text-gray-600 font-medium">{t.pic}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.type === 'in' ? 'Nạp' : 'Chi'}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-black ${t.type === 'in' ? 'text-green-600' : 'text-slate-800'}`}>
                                {t.type === 'in' ? '+' : '-'}{t.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Không tìm thấy giao dịch nào trong khoảng thời gian này.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-200">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">Thêm giao dịch mới</h3>
                    {/* Fixed missing X icon by adding it to imports */}
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Loại</label>
                            <select className="w-full border rounded-lg p-2 text-sm outline-none" value={newTrans.type} onChange={(e) => setNewTrans({ ...newTrans, type: e.target.value as any })}>
                                <option value="in">Nạp quỹ (In)</option>
                                <option value="out">Chi phí (Out)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ngày</label>
                            <input type="date" className="w-full border rounded-lg p-2 text-sm" value={newTrans.date} onChange={(e) => setNewTrans({...newTrans, date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nội dung</label>
                        <input type="text" className="w-full border rounded-lg p-2 text-sm" value={newTrans.description} onChange={(e) => setNewTrans({...newTrans, description: e.target.value})} placeholder="VD: Chi tiền lệnh..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Số tiền (VND)</label>
                        <input type="number" className="w-full border rounded-lg p-2 text-sm font-bold" value={newTrans.amount} onChange={(e) => setNewTrans({...newTrans, amount: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Người thực hiện (PIC)</label>
                        <input type="text" className="w-full border rounded-lg p-2 text-sm" value={newTrans.pic} onChange={(e) => setNewTrans({...newTrans, pic: e.target.value})} placeholder="Tên nhân viên..." />
                    </div>
                    <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg">Lưu giao dịch</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountWCA;

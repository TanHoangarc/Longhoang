
import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, DollarSign, Trash2, Search, Wallet } from 'lucide-react';

interface WCATransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'in' | 'out'; // Deposit or Payment
  pic: string; // Person in charge
}

const AccountWCA: React.FC = () => {
  // Mock Data
  const [transactions, setTransactions] = useState<WCATransaction[]>([
    { id: 1, date: '2024-05-01', description: 'Nạp quỹ đầu tháng', amount: 50000000, type: 'in', pic: 'Admin' },
    { id: 2, date: '2024-05-05', description: 'Thanh toán phí cảng Cát Lái (Job 102)', amount: 2500000, type: 'out', pic: 'Ops Team' },
    { id: 3, date: '2024-05-10', description: 'Chi phí tiếp khách', amount: 1500000, type: 'out', pic: 'Sales A' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrans, setNewTrans] = useState<Omit<WCATransaction, 'id'>>({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'out',
      pic: ''
  });

  const balance = transactions.reduce((acc, curr) => {
      return curr.type === 'in' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);

  const handleSave = () => {
      if (!newTrans.description || newTrans.amount <= 0) return alert('Vui lòng nhập thông tin hợp lệ');
      setTransactions([{ ...newTrans, id: Date.now() }, ...transactions]);
      setIsModalOpen(false);
      setNewTrans({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, type: 'out', pic: '' });
  };

  const handleDelete = (id: number) => {
      if (confirm('Xóa giao dịch này?')) {
          setTransactions(transactions.filter(t => t.id !== id));
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet size={100} />
                </div>
                <div className="relative z-10">
                    <p className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-1">Số dư WCA hiện tại</p>
                    <h2 className="text-4xl font-black">{balance.toLocaleString()} <span className="text-lg font-medium">VND</span></h2>
                    <div className="mt-6 flex gap-4 text-xs font-medium opacity-90">
                        <div className="flex items-center"><ArrowUpRight size={14} className="mr-1"/> Tổng nạp: {totalIn.toLocaleString()}</div>
                        <div className="flex items-center"><ArrowDownLeft size={14} className="mr-1"/> Tổng chi: {totalOut.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Quản lý dòng tiền WCA</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg transition"
                    >
                        <Plus size={16} className="mr-2" /> Tạo giao dịch mới
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Theo dõi các khoản tạm ứng (Advance) và hoàn ứng, chi phí phát sinh tại cảng và các khoản thanh toán nhanh.
                </div>
            </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h4 className="font-bold text-gray-700 text-sm uppercase">Lịch sử giao dịch</h4>
                <div className="relative">
                    <Search className="absolute left-2 top-2 text-gray-400" size={14} />
                    <input type="text" placeholder="Tìm kiếm..." className="pl-8 pr-3 py-1.5 text-xs border rounded-lg outline-none focus:border-indigo-500" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Ngày</th>
                            <th className="px-6 py-4">Nội dung</th>
                            <th className="px-6 py-4">Người thực hiện</th>
                            <th className="px-6 py-4 text-center">Loại</th>
                            <th className="px-6 py-4 text-right">Số tiền</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {transactions.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition">
                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{t.date}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">{t.description}</td>
                                <td className="px-6 py-4 text-gray-600">{t.pic}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {t.type === 'in' ? 'Nạp tiền' : 'Thanh toán'}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${t.type === 'in' ? 'text-green-600' : 'text-slate-800'}`}>
                                    {t.type === 'in' ? '+' : '-'}{t.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Thêm giao dịch WCA</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setNewTrans({...newTrans, type: 'out'})}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition ${newTrans.type === 'out' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Chi tiền (Payment)
                            </button>
                            <button 
                                onClick={() => setNewTrans({...newTrans, type: 'in'})}
                                className={`flex-1 py-2 rounded-md text-sm font-bold transition ${newTrans.type === 'in' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
                            >
                                Nạp tiền (Deposit)
                            </button>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Số tiền</label>
                            <input 
                                type="number" className="w-full border rounded-lg p-2 font-bold text-lg outline-none focus:border-indigo-500"
                                value={newTrans.amount} onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nội dung</label>
                            <input 
                                type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                                placeholder="VD: Chi phí job..."
                                value={newTrans.description} onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Ngày</label>
                                <input 
                                    type="date" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                                    value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Người thực hiện</label>
                                <input 
                                    type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-indigo-500"
                                    value={newTrans.pic} onChange={e => setNewTrans({...newTrans, pic: e.target.value})}
                                />
                            </div>
                        </div>
                        <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 shadow-lg transition">
                            Lưu giao dịch
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AccountWCA;

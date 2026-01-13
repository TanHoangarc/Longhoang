
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, CreditCard, MapPin } from 'lucide-react';

export interface Carrier {
  id: number;
  name: string;
  address: string;
  accountHolder: string;
  accountNumber: string;
  bank: string;
}

interface AccountDataProps {
  carriers: Carrier[];
  onUpdate: (carriers: Carrier[]) => void;
}

const AccountData: React.FC<AccountDataProps> = ({ carriers, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Carrier>({
    id: 0,
    name: '',
    address: '',
    accountHolder: '',
    accountNumber: '',
    bank: ''
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ id: 0, name: '', address: '', accountHolder: '', accountNumber: '', bank: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingId(carrier.id);
    setFormData({ ...carrier });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhà xe này?')) {
      onUpdate(carriers.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('Vui lòng nhập tên công ty');

    if (editingId) {
      onUpdate(carriers.map(c => c.id === editingId ? formData : c));
    } else {
      onUpdate([...carriers, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Dữ liệu Nhà xe</h3>
          <p className="text-sm text-gray-500">Quản lý thông tin các đơn vị vận tải (Sender)</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg transition"
        >
          <Plus size={16} className="mr-2" /> Thêm nhà xe mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carriers.map((carrier) => (
          <div key={carrier.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 text-primary rounded-lg">
                <Building2 size={24} />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(carrier)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded"><Edit size={16} /></button>
                <button onClick={() => handleDelete(carrier.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h4 className="font-bold text-gray-800 mb-2 min-h-[48px] line-clamp-2">{carrier.name}</h4>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <MapPin size={14} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="line-clamp-2">{carrier.address}</span>
              </div>
              <div className="flex items-start">
                <CreditCard size={14} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-mono font-bold text-gray-800">{carrier.accountNumber}</p>
                  <p className="text-xs">{carrier.bank}</p>
                  {carrier.accountHolder && <p className="text-xs italic mt-0.5">CTK: {carrier.accountHolder}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? 'Chỉnh sửa thông tin' : 'Thêm nhà xe mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tên đơn vị (Sender) <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:border-primary outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="CÔNG TY TNHH..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="Số nhà, đường, phường, quận..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Số tài khoản</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:border-primary outline-none"
                    value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Ngân hàng</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                    value={formData.bank}
                    onChange={e => setFormData({...formData, bank: e.target.value})}
                    placeholder="Vietcombank..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Chủ tài khoản (Nếu có)</label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                  value={formData.accountHolder}
                  onChange={e => setFormData({...formData, accountHolder: e.target.value})}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primaryDark rounded-lg shadow-md flex items-center">
                  <Save size={16} className="mr-2" /> Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountData;


import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, CreditCard, MapPin, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Carrier>({
    id: 0, name: '', address: '', accountHolder: '', accountNumber: '', bank: ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(carriers.map(c => c.id === editingId ? formData : c));
    } else {
      onUpdate([...carriers, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 uppercase">DỮ LIỆU NHÀ XE</h3>
          <p className="text-sm text-gray-500">Thông tin đơn vị vận tải (Sender)</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Tìm tên nhà xe..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAddNew}
                className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-md transition"
            >
                <Plus size={16} className="mr-2" /> Thêm nhà xe
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carriers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((carrier) => (
          <div key={carrier.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                <Building2 size={24} />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(carrier)} className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg"><Edit size={16} /></button>
                <button onClick={() => onUpdate(carriers.filter(c=>c.id!==carrier.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h4 className="font-bold text-gray-800 mb-4 min-h-[48px] line-clamp-2 text-lg uppercase leading-tight">{carrier.name}</h4>
            
            <div className="space-y-3 text-sm text-gray-600 border-t border-gray-50 pt-4">
              <div className="flex items-start">
                <MapPin size={14} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <span className="text-xs line-clamp-2">{carrier.address}</span>
              </div>
              <div className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                <CreditCard size={14} className="mt-1 mr-2 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-mono font-bold text-slate-800 tracking-wider">{carrier.accountNumber}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">{carrier.bank}</p>
                  {carrier.accountHolder && <p className="text-[10px] italic mt-1 text-gray-500">CTK: {carrier.accountHolder}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountData;

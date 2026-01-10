import React, { useState, useEffect } from 'react';
import { 
  X, Bell, FileSpreadsheet, BarChart3, Library, Clock, Plus, Trash2, 
  Upload, FileText, ChevronRight, Download, ArrowLeft, Package, 
  Ship, Truck, LayoutDashboard, FolderPlus, Folder, File, MoreVertical, 
  ShieldAlert, TrendingUp, UserPlus, UserMinus, MessageSquare, 
  AlertTriangle, HelpCircle, Save, Edit
} from 'lucide-react';

interface CompanyPageProps {
  onClose: () => void;
}

type ViewType = 'dashboard' | 'notifications' | 'quotation' | 'tracking' | 'reports' | 'library';

interface Customer {
  id: number;
  companyName: string;
  shipmentInfo: string;
  contact: string;
  status: string;
  classification: 'Check giá' | 'Tiềm năng';
}

interface QuoteRow {
  id: number;
  cost: string;
  unit: string;
  qty: number;
  price: number;
  vat: number;
  currency: string;
}

const CompanyPage: React.FC<CompanyPageProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [quoteType, setQuoteType] = useState<'import' | 'export'>('import');

  // --- SUB-COMPONENTS FOR DIFFERENT VIEWS ---

  const NotificationView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Thông báo hệ thống</h3>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
          <Plus size={16} className="mr-2" /> Tạo thông báo mới
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Ngày tháng</th>
              <th className="px-6 py-4 text-left">Nội dung thông báo</th>
              <th className="px-6 py-4 text-left">Đính kèm</th>
              <th className="px-6 py-4 text-left">Hiệu lực đến</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {[1, 2, 3].map(i => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-500">20/05/2024</td>
                <td className="px-6 py-4 font-medium text-gray-800">Cập nhật chính sách phụ phí nhiên liệu tháng 06/2024</td>
                <td className="px-6 py-4 text-primary flex items-center cursor-pointer hover:underline">
                  <FileText size={14} className="mr-1" /> policy_update.pdf
                </td>
                <td className="px-6 py-4 text-red-500 font-bold">30/06/2024</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const QuotationView = () => {
    const [rows, setRows] = useState<QuoteRow[]>([{ id: 1, cost: '', unit: 'Lô', qty: 1, price: 0, vat: 10, currency: 'USD' }]);
    const [units, setUnits] = useState(['Lô', 'Bill', 'Bộ', 'Cont', 'CBM', 'Kgs', 'Chuyến']);
    const [currencies, setCurrencies] = useState(['USD', 'VND', 'EUR']);
    const vats = [0, 5, 8, 10];
    
    const addRow = () => setRows([...rows, { id: Date.now(), cost: '', unit: units[0], qty: 1, price: 0, vat: 10, currency: currencies[0] }]);
    const removeRow = (id: number) => setRows(rows.filter(r => r.id !== id));
    
    const updateRow = (id: number, field: keyof QuoteRow, value: any) => {
      setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleAddUnit = () => {
      const newUnit = prompt('Nhập đơn vị mới:');
      if (newUnit && !units.includes(newUnit)) {
        setUnits([...units, newUnit]);
      }
    };

    const handleAddCurrency = () => {
      const newCurrency = prompt('Nhập loại tiền tệ mới:');
      if (newCurrency && !currencies.includes(newCurrency)) {
        setCurrencies([...currencies, newCurrency.toUpperCase()]);
      }
    };

    const calculateRowTotal = (row: QuoteRow) => {
      const amount = row.qty * row.price;
      const vatAmount = amount * (row.vat / 100);
      return (amount + vatAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setQuoteType('import')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'import' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Nhập
            </button>
            <button 
              onClick={() => setQuoteType('export')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'export' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Hàng Xuất
            </button>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 transition">
            <Download size={16} className="mr-2" /> Xuất File PDF
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Pickup</label>
              <input type="text" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="Địa điểm đóng hàng" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">AOD (Cảng đích)</label>
              <input type="text" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="Airport of Destination" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Term</label>
              <select className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition">
                <option>EXW</option><option>FOB</option><option>CIF</option><option>DDU</option><option>DDP</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Gross Weight (KGS)</label>
              <input type="number" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Volume</label>
              <input type="number" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Đơn vị</label>
              <div className="flex items-center">
                <select className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition">
                  <option>CBM</option>
                  <option>KGS</option>
                  <option>Cont 20GP</option>
                  <option>Cont 40GP</option>
                  <option>Cont 40HQ</option>
                  <option>Cont 45DC</option>
                  <option>Pallet</option>
                  <option>Carton</option>
                  <option>Package</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Commodity</label>
              <input type="text" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="Tên hàng hóa" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Saler</label>
              <input type="text" className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition" placeholder="Nhân viên phụ trách" />
            </div>
          </div>

          <div className="pt-8">
            <h4 className="font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">Bảng báo giá chi tiết</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500">
                  <tr>
                    <th className="p-3 border text-center w-12">STT</th>
                    <th className="p-3 border text-left">Các loại chi phí</th>
                    <th className="p-3 border text-left w-32">ĐVT</th>
                    <th className="p-3 border text-center w-20">Số lượng</th>
                    <th className="p-3 border text-right w-32">Đơn giá</th>
                    <th className="p-3 border text-center w-24">VAT (%)</th>
                    <th className="p-3 border text-center w-32">Tiền tệ</th>
                    <th className="p-3 border text-right w-32">Thành tiền</th>
                    <th className="p-3 border text-center w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="p-2 border text-center text-gray-400">{idx + 1}</td>
                      <td className="p-1 border">
                        <input 
                          type="text" 
                          className="w-full p-1 outline-none" 
                          placeholder="Local charge, Freight..." 
                          value={row.cost}
                          onChange={(e) => updateRow(row.id, 'cost', e.target.value)}
                        />
                      </td>
                      <td className="p-1 border">
                        <div className="flex items-center space-x-1">
                          <select 
                            className="w-full p-1 outline-none bg-transparent"
                            value={row.unit}
                            onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                          >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <button onClick={handleAddUnit} className="text-primary hover:bg-orange-50 p-1 rounded transition">
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-1 border">
                        <input 
                          type="number" 
                          className="w-full p-1 outline-none text-center" 
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border">
                        <input 
                          type="number" 
                          className="w-full p-1 outline-none text-right" 
                          placeholder="0"
                          value={row.price}
                          onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 border">
                        <div className="flex flex-col">
                          <select 
                            className="w-full p-1 text-xs outline-none bg-transparent"
                            value={vats.includes(row.vat) ? row.vat : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val !== 'custom') updateRow(row.id, 'vat', parseInt(val));
                            }}
                          >
                            {vats.map(v => <option key={v} value={v}>{v}%</option>)}
                            <option value="custom">Khác...</option>
                          </select>
                          {(!vats.includes(row.vat) || row.vat === undefined) && (
                            <input 
                              type="number" 
                              className="w-full p-1 text-xs outline-none border-t border-gray-100" 
                              placeholder="%"
                              value={row.vat}
                              onChange={(e) => updateRow(row.id, 'vat', parseFloat(e.target.value) || 0)}
                            />
                          )}
                        </div>
                      </td>
                      <td className="p-1 border">
                        <div className="flex items-center space-x-1">
                          <select 
                            className="w-full p-1 outline-none bg-transparent"
                            value={row.currency}
                            onChange={(e) => updateRow(row.id, 'currency', e.target.value)}
                          >
                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <button onClick={handleAddCurrency} className="text-primary hover:bg-orange-50 p-1 rounded transition">
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2 border text-right font-bold text-gray-700">
                        {calculateRowTotal(row)}
                      </td>
                      <td className="p-2 border text-center">
                        <button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addRow} className="mt-4 text-primary text-sm font-bold flex items-center hover:underline">
                <Plus size={16} className="mr-1" /> Thêm dòng chi phí
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Note (Ghi chú)</label>
                <textarea className="w-full border border-gray-200 rounded p-3 text-sm focus:border-primary outline-none h-24" placeholder="Điều kiện báo giá, thời gian hiệu lực..."></textarea>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h5 className="font-bold text-sm text-gray-600 uppercase mb-2">Thông tin liên hệ Sale</h5>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" placeholder="Tên Saler" />
                <input type="text" className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" placeholder="Số điện thoại" />
                <input type="email" className="bg-white border border-gray-200 rounded p-2 text-sm outline-none col-span-2" placeholder="Email liên hệ" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TrackingView = () => (
    <div className="space-y-8">
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setQuoteType('import')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'import' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
        >
          Hàng Nhập
        </button>
        <button 
          onClick={() => setQuoteType('export')}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${quoteType === 'export' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
        >
          Hàng Xuất
        </button>
      </div>

      <div className="space-y-6">
        {[1, 2].map(shipment => (
          <div key={shipment} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase mr-3">Mã lô hàng:</span>
                <span className="font-bold text-gray-800">LH-SHPT-202400{shipment}</span>
              </div>
              <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                <span className="flex items-center"><Ship size={14} className="mr-1" /> ONE FREEDOM / V.2405</span>
                <span className="flex items-center"><Truck size={14} className="mr-1" /> HCM - Hải Phòng</span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div className={`absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ${shipment === 1 ? 'w-3/4' : 'w-1/4'}`}></div>

                <div className="flex justify-between relative z-10">
                  {[
                    { label: 'Lấy hàng', icon: Package, date: '15/05' },
                    { label: 'Hải quan cảng', icon: ShieldAlert, date: '17/05' },
                    { label: 'Load tàu', icon: Ship, date: '19/05' },
                    { label: 'Về kho', icon: Truck, date: 'Dự kiến 25/05' }
                  ].map((step, idx) => {
                    const isActive = (shipment === 1 && idx <= 2) || (shipment === 2 && idx === 0);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-primary border-orange-200 text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                          <step.icon size={20} />
                        </div>
                        <div className="mt-4 text-center">
                          <p className={`text-xs font-bold uppercase ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step.label}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{step.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReportsView = () => {
    const [customers, setCustomers] = useState<Customer[]>([
      { id: 1, companyName: 'Công ty ABC Việt Nam', shipmentInfo: '3x20GP HCM-BKK', contact: 'Mr. Long - 090xxx', status: 'Đang báo giá', classification: 'Check giá' },
      { id: 2, companyName: 'Logistics Global Ltd', shipmentInfo: '1.2 tons AIR SGN-FRA', contact: 'Ms. Hoa - hoa@global.com', status: 'Đã chốt', classification: 'Tiềm năng' },
    ]);
    
    const [editingId, setEditingId] = useState<number | null>(null);

    const addCustomer = () => {
      const newCust: Customer = {
        id: Date.now(),
        companyName: '',
        shipmentInfo: '',
        contact: '',
        status: 'Mới',
        classification: 'Check giá'
      };
      setCustomers([...customers, newCust]);
      setEditingId(newCust.id);
    };

    const updateCustomer = (id: number, field: keyof Customer, value: any) => {
      setCustomers(customers.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const deleteCustomer = (id: number) => {
      setCustomers(customers.filter(c => c.id !== id));
    };

    return (
      <div className="space-y-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Booking trong tuần', value: '18', color: 'text-primary', icon: Package, trend: '+4 so với tuần trước' },
            { label: 'Profit trong tuần', value: '$8,450', color: 'text-green-600', icon: TrendingUp, trend: '+12.5%' },
            { label: 'Lô hàng đang chạy', value: '34', color: 'text-blue-600', icon: Ship, trend: '8 lô hàng sắp về' },
            { label: 'Doanh thu tháng', value: '$92,000', color: 'text-indigo-600', icon: BarChart3, trend: 'Đạt 85% kế hoạch' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}><stat.icon size={20} /></div>
              </div>
              <h4 className="text-gray-400 text-xs font-bold uppercase mb-1 tracking-wider">{stat.label}</h4>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">{stat.trend}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-primary/10 text-primary rounded-lg"><UserPlus size={20} /></div>
               <h3 className="font-bold text-gray-800 text-lg">Khách hàng mới phát triển</h3>
            </div>
            <button 
              onClick={addCustomer}
              className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center shadow-lg shadow-orange-100"
            >
              <Plus size={14} className="mr-1" /> Thêm khách hàng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Tên công ty</th>
                  <th className="px-6 py-4">Thông tin lô hàng</th>
                  <th className="px-6 py-4">Thông tin liên lạc</th>
                  <th className="px-6 py-4">Tình trạng</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4">
                      {editingId === cust.id ? (
                        <input className="w-full text-sm border-b border-primary/30 p-1 outline-none" value={cust.companyName} onChange={(e) => updateCustomer(cust.id, 'companyName', e.target.value)} placeholder="Nhập tên..." />
                      ) : (
                        <div className="text-sm font-bold text-gray-800">{cust.companyName || '—'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cust.id ? (
                        <input className="w-full text-sm border-b border-primary/30 p-1 outline-none" value={cust.shipmentInfo} onChange={(e) => updateCustomer(cust.id, 'shipmentInfo', e.target.value)} placeholder="Nhập lô hàng..." />
                      ) : (
                        <div className="text-xs text-gray-500">{cust.shipmentInfo || '—'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === cust.id ? (
                        <input className="w-full text-sm border-b border-primary/30 p-1 outline-none" value={cust.contact} onChange={(e) => updateCustomer(cust.id, 'contact', e.target.value)} placeholder="Số ĐT/Email..." />
                      ) : (
                        <div className="text-xs text-gray-500">{cust.contact || '—'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-xs font-medium text-gray-600">{cust.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition ${cust.classification === 'Tiềm năng' ? 'bg-orange-50 text-primary' : 'bg-gray-100 text-gray-500'}`}
                        value={cust.classification}
                        onChange={(e) => updateCustomer(cust.id, 'classification', e.target.value as any)}
                      >
                        <option value="Check giá">Check giá</option>
                        <option value="Tiềm năng">Tiềm năng</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId === cust.id ? (
                          <button onClick={() => setEditingId(null)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={16} /></button>
                        ) : (
                          <button onClick={() => setEditingId(cust.id)} className="p-2 text-gray-400 hover:text-primary rounded-lg"><Edit size={16} /></button>
                        )}
                        <button onClick={() => deleteCustomer(cust.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><AlertTriangle size={20} /></div>
                <h4 className="font-bold text-gray-800">Khó khăn & Các bộ phận liên quan</h4>
             </div>
             <textarea className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-100 transition" placeholder="Mô tả khó khăn..."></textarea>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gray-100 text-gray-500 rounded-lg"><UserMinus size={20} /></div>
                <h4 className="font-bold text-gray-800">Khách hàng bị mất (nếu có)</h4>
             </div>
             <textarea className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-200 transition" placeholder="Lý do..."></textarea>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><MessageSquare size={20} /></div>
                <h4 className="font-bold text-gray-800">Phản ánh nội bộ / Khách hàng</h4>
             </div>
             <textarea className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="Phản ánh..."></textarea>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-50 text-green-500 rounded-lg"><HelpCircle size={20} /></div>
                <h4 className="font-bold text-gray-800">Yêu cầu & Đề xuất</h4>
             </div>
             <textarea className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-100 transition" placeholder="Đề xuất..."></textarea>
          </div>
        </div>

        <div className="flex justify-center pt-8">
            <button className="bg-[#1e2a3b] text-white px-12 py-4 rounded-xl font-bold shadow-2xl hover:bg-black transition transform active:scale-95">
                GỬI BÁO CÁO TUẦN
            </button>
        </div>
      </div>
    );
  };

  const LibraryView = () => {
    const [folders] = useState([
      { name: 'Hàng Nhập', files: ['Import_Checklist.pdf', 'Manifest_Template.xlsx'] },
      { name: 'Hàng Xuất', files: ['Export_Process.doc', 'SI_Template.pdf'] },
      { name: 'Hợp đồng & Biểu mẫu', files: ['Contract_2024.docx', 'Power_of_Attorney.pdf'] }
    ]);

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Thư viện mẫu chuẩn</h3>
          <div className="flex space-x-3">
             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition">
              <FolderPlus size={16} className="mr-2" /> Thêm thư mục
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-primaryDark transition">
              <Upload size={16} className="mr-2" /> Tải lên tài liệu
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Folder className="text-primary fill-primary/10" size={24} />
                  <span className="font-bold text-gray-800">{folder.name}</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {folder.files.map((file, fidx) => (
                  <div key={fidx} className="flex items-center justify-between p-2 hover:bg-orange-50 rounded group/file cursor-pointer transition">
                    <div className="flex items-center space-x-3">
                      <File className="text-gray-400 group-hover/file:text-primary transition-colors" size={16} />
                      <span className="text-sm text-gray-600 font-medium">{file}</span>
                    </div>
                    <Download size={14} className="text-gray-300 group-hover/file:text-primary opacity-0 group-hover/file:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'notifications': return <NotificationView />;
      case 'quotation': return <QuotationView />;
      case 'tracking': return <TrackingView />;
      case 'reports': return <ReportsView />;
      case 'library': return <LibraryView />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'notifications', title: 'Thông báo', icon: Bell, color: 'bg-blue-500', desc: 'Thông tin nội bộ và tin tức chung' },
            { id: 'quotation', title: 'Lập báo giá', icon: FileSpreadsheet, color: 'bg-green-500', desc: 'Báo giá hàng nhập/xuất chuyên nghiệp' },
            { id: 'tracking', title: 'Tiến độ', icon: Clock, color: 'bg-orange-500', desc: 'Theo dõi hành trình lô hàng thời gian thực' },
            { id: 'reports', title: 'Báo cáo', icon: BarChart3, color: 'bg-purple-500', desc: 'Thống kê sản lượng và doanh thu cá nhân' },
            { id: 'library', title: 'Thư viện mẫu', icon: Library, color: 'bg-gray-800', desc: 'Kho biểu mẫu và tài liệu chuẩn hóa' }
          ].map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveView(item.id as ViewType)}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              <div className="mt-6 flex items-center text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Truy cập <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#1e2a3b] text-white py-4 px-8 sticky top-0 z-40 shadow-lg border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white text-xs">LH</div>
              <span className="font-bold uppercase tracking-tighter text-sm">Long Hoang <span className="text-primary">Staff</span></span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 border-l border-white/10 pl-6 ml-6">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Bàn làm việc' },
                { id: 'quotation', icon: FileSpreadsheet, label: 'Báo giá' },
                { id: 'tracking', icon: Clock, label: 'Tiến độ' },
                { id: 'reports', icon: BarChart3, label: 'Báo cáo' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as ViewType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === item.id ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        {activeView !== 'dashboard' && (
          <button 
            onClick={() => setActiveView('dashboard')}
            className="mb-8 flex items-center text-gray-400 hover:text-primary transition font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Quay lại Bàn làm việc
          </button>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
      <div className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium">
        Hệ thống Quản lý Nội bộ Long Hoang Logistics v3.2.0 • 2024
      </div>
    </div>
  );
};

export default CompanyPage;
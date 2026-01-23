
import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Printer, Save, Trash2, Check, AlertCircle, Calendar } from 'lucide-react';
import { DebitNoteRecord, DebitNoteItem, CustomerDef, FeeDef } from '../../App';

interface AccountDebitNoteProps {
  initialData?: DebitNoteRecord;
  onSave: (note: DebitNoteRecord) => void;
  onBack: () => void;
  // New props
  customerDefs?: CustomerDef[];
  onAddCustomer?: (c: CustomerDef) => void;
  feeDefs?: FeeDef[];
  onAddFee?: (f: FeeDef) => void;
}

const AccountDebitNote: React.FC<AccountDebitNoteProps> = ({ 
    initialData, onSave, onBack, 
    customerDefs = [], onAddCustomer,
    feeDefs = [], onAddFee
}) => {
  const [formData, setFormData] = useState<DebitNoteRecord>(initialData || {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    jobNo: '',
    customerName: '',
    customerTaxId: '',
    customerAddress: '',
    carrier: '',
    etd: '',
    hbl: '',
    pol: '',
    pod: '',
    volume: '',
    roe: 23100,
    roeCurrency: 'USD', // Default currency
    note: '',
    items: [
        { id: 1, description: 'OF', qty: 1, unit: 'Lô', price: 0, vat: 0, currency: 'USD', type: 'SERVICE' },
        { id: 2, description: 'THC', qty: 1, unit: 'Lô', price: 0, vat: 8, currency: 'USD', type: 'SERVICE' },
        { id: 3, description: 'DO', qty: 1, unit: 'Lô', price: 0, vat: 8, currency: 'USD', type: 'SERVICE' }
    ]
  });

  const handleChange = (field: keyof DebitNoteRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to format YYYY-MM-DD to dd/mm/yyyy for display
  const formatDateVN = (dateStr: string) => {
      if (!dateStr) return '';
      // If already matches YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, d] = dateStr.split('-');
          return `${d}/${m}/${y}`;
      }
      return dateStr;
  };

  // Helper to convert dd/mm/yyyy (or other) back to YYYY-MM-DD for the date input value
  const getISODate = (dateStr: string) => {
      if (!dateStr) return '';
      // If already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // If dd/mm/yyyy
      const parts = dateStr.split('/');
      if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return '';
  };

  // --- CUSTOMER SELECTION LOGIC ---
  const handleCustomerSelect = (name: string) => {
      // 1. Update text immediately
      handleChange('customerName', name);

      // 2. Lookup in defs
      const match = customerDefs.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (match) {
          handleChange('customerTaxId', match.taxId);
          handleChange('customerAddress', match.address);
      }
  };

  const handleAddNewCustomer = () => {
      if (!formData.customerName) return;
      if (onAddCustomer) {
          onAddCustomer({
              id: Date.now(),
              name: formData.customerName.toUpperCase(),
              taxId: formData.customerTaxId,
              address: formData.customerAddress
          });
          alert(`Đã thêm khách hàng "${formData.customerName}" vào danh sách!`);
      }
  };

  // --- FEE SELECTION LOGIC ---
  const handleItemChange = (id: number, field: keyof DebitNoteItem, value: any) => {
    setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // If description changed, check fee defs
                if (field === 'description') {
                    const match = feeDefs.find(f => f.name.toLowerCase() === (value as string).toLowerCase());
                    if (match) {
                        updated.vat = match.vat;
                    }
                }
                return updated;
            }
            return item;
        })
    }));
  };

  const handleAddNewFee = (feeName: string, currentVat: number, type: 'SERVICE' | 'ON_BEHALF') => {
      if (!feeName || !onAddFee) return;
      onAddFee({
          id: Date.now(),
          name: feeName.toUpperCase(),
          vat: currentVat,
          type: type
      });
      alert(`Đã thêm phí "${feeName}" vào danh sách!`);
  };

  const addItem = (type: 'SERVICE' | 'ON_BEHALF') => {
      const newItem: DebitNoteItem = {
          id: Date.now(),
          description: '',
          qty: 1,
          unit: 'Lô',
          price: 0,
          vat: 0,
          currency: formData.roeCurrency as any || 'USD', // Default to current ROE currency
          type: type
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const deleteItem = (id: number) => {
      setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const handleSave = () => {
      if (!formData.customerName) return alert('Vui lòng nhập tên khách hàng');
      onSave(formData);
  };

  // Calculations
  const calculateRowTotal = (item: DebitNoteItem) => {
      const amount = item.price * item.qty;
      const vatAmount = amount * (item.vat / 100);
      return amount + vatAmount;
  };

  const calculateRowTotalVND = (item: DebitNoteItem) => {
      const totalForeign = calculateRowTotal(item);
      // Dynamic conversion based on selected ROE currency
      const activeCurrency = formData.roeCurrency || 'USD';
      if (item.currency === activeCurrency) return totalForeign * formData.roe;
      return totalForeign;
  };

  const calculateTotalForeign = (items: DebitNoteItem[]) => {
      const activeCurrency = formData.roeCurrency || 'USD';
      return items.filter(i => i.currency === activeCurrency).reduce((sum, item) => sum + calculateRowTotal(item), 0);
  };

  const calculateTotalVND = (items: DebitNoteItem[]) => {
      return items.reduce((sum, item) => sum + calculateRowTotalVND(item), 0);
  };

  const serviceItems = formData.items.filter(i => i.type === 'SERVICE');
  const behalfItems = formData.items.filter(i => i.type === 'ON_BEHALF');

  const totalForeign = calculateTotalForeign(formData.items);
  const totalVND = calculateTotalVND(formData.items);

  const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });

  // Determine available currencies for the list
  const availableCurrencies = [formData.roeCurrency || 'USD', 'VND'];

  // Separate Fee Definitions
  const serviceFees = feeDefs.filter(f => f.type === 'SERVICE' || !f.type); // Fallback for old data
  const behalfFees = feeDefs.filter(f => f.type === 'ON_BEHALF');

  // Helper to detect if a fee is "new" (not in list) to show the + button
  const isNewFee = (description: string) => {
      return description && !feeDefs.some(f => f.name.toLowerCase() === description.toLowerCase());
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
        {/* Toolbar */}
        <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center print:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold flex items-center">
                    <ArrowLeft size={20} className="mr-2" /> Quay lại
                </button>
                <h2 className="text-xl font-bold text-gray-800">Soạn thảo Debit Note</h2>
            </div>
            <div className="flex gap-2">
                <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-blue-700">
                    <Save size={16} className="mr-2" /> Lưu
                </button>
                <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-gray-900">
                    <Printer size={16} className="mr-2" /> In
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8">
            {/* PAPER */}
            <div 
                className="bg-white w-full max-w-[210mm] mx-auto shadow-2xl p-10 print:shadow-none print:w-full print:max-w-none print:p-0"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
                
                {/* Header - Image Banner */}
                <div className="mb-6 w-full">
                    <img 
                      src="https://i.ibb.co/Kx32Z01D/LH-VIETNAMESE.jpg" 
                      alt="Long Hoang Logistics Header" 
                      className="w-full h-auto block"
                    />
                </div>

                <h2 className="text-center text-3xl font-black uppercase mb-8 tracking-wider text-gray-900">DEBIT NOTE</h2>

                {/* Customer Info - No Frame */}
                <div className="mb-8 text-sm space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-[80px] font-bold uppercase text-gray-600">TO:</div>
                        <div className="flex-1 relative group">
                            <input 
                                type="text" 
                                list="customer-list"
                                className="w-full font-bold uppercase outline-none border-b border-dotted border-gray-400 py-1 focus:border-primary transition bg-transparent" 
                                placeholder="TÊN KHÁCH HÀNG (Chọn hoặc nhập mới)..." 
                                value={formData.customerName}
                                onChange={(e) => handleCustomerSelect(e.target.value)}
                            />
                            <datalist id="customer-list">
                                {customerDefs.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                            {/* Quick Add Button if name not empty and not in list */}
                            {formData.customerName && !customerDefs.some(c => c.name.toLowerCase() === formData.customerName.toLowerCase()) && (
                                <button 
                                    onClick={handleAddNewCustomer}
                                    className="absolute right-0 top-0 text-blue-500 hover:text-blue-700 text-xs font-bold p-1 print:hidden opacity-50 group-hover:opacity-100 transition"
                                    title="Lưu khách hàng mới vào Cấu hình"
                                >
                                    <Plus size={14} className="inline mr-1"/> Lưu mới
                                </button>
                            )}
                        </div>
                        <div className="w-[40px] font-bold uppercase text-gray-600 text-right">Job:</div>
                        <div className="w-[150px]">
                            <input 
                                type="text" 
                                className="w-full outline-none border-b border-dotted border-gray-400 py-1 text-left font-bold bg-transparent" 
                                placeholder="JOB NO..." 
                                value={formData.jobNo}
                                onChange={(e) => handleChange('jobNo', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-[80px] font-bold uppercase text-gray-600">MST:</div>
                        <div className="flex-1">
                            <input 
                                type="text" 
                                className="w-full font-bold outline-none border-b border-dotted border-gray-400 py-1 focus:border-primary transition bg-transparent" 
                                placeholder="MÃ SỐ THUẾ..." 
                                value={formData.customerTaxId}
                                onChange={(e) => handleChange('customerTaxId', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-[80px] font-bold uppercase text-gray-600 pt-1">Địa chỉ:</div>
                        <div className="flex-1">
                            <textarea 
                                className="w-full outline-none resize-none border-b border-dotted border-gray-400 py-1 focus:border-primary transition bg-transparent overflow-hidden" 
                                rows={2} 
                                placeholder="Địa chỉ..."
                                value={formData.customerAddress}
                                onChange={(e) => handleChange('customerAddress', e.target.value)}
                                style={{ minHeight: '48px' }}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Shipment Info Grid - No Frame */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-2 mb-8 text-sm">
                    {/* Left Column */}
                    <div className="space-y-2">
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">Carrier/Agent:</div>
                            <input 
                                className="flex-1 outline-none text-right font-medium uppercase bg-transparent" 
                                value={formData.carrier} 
                                onChange={e => handleChange('carrier', e.target.value)} 
                                placeholder="..."
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">HBL/MLB:</div>
                            <input 
                                className="flex-1 outline-none text-right font-medium uppercase bg-transparent" 
                                value={formData.hbl} 
                                onChange={e => handleChange('hbl', e.target.value)} 
                                placeholder="..."
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">P.O.L:</div>
                            <input 
                                className="flex-1 outline-none text-right font-medium uppercase bg-transparent" 
                                value={formData.pol} 
                                onChange={e => handleChange('pol', e.target.value)} 
                                placeholder="..."
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">P.O.D:</div>
                            <input 
                                className="flex-1 outline-none text-right font-medium uppercase bg-transparent" 
                                value={formData.pod} 
                                onChange={e => handleChange('pod', e.target.value)} 
                                placeholder="..."
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">Volume:</div>
                            <input 
                                className="flex-1 outline-none text-right font-medium uppercase bg-transparent" 
                                value={formData.volume} 
                                onChange={e => handleChange('volume', e.target.value)} 
                                placeholder="..."
                            />
                        </div>
                        <div className="flex items-center border-b border-gray-100 pb-1">
                            <div className="w-[100px] font-bold text-gray-600">R.O.E:</div>
                            <input 
                                type="number" 
                                className="flex-1 outline-none text-right font-medium bg-transparent" 
                                value={formData.roe} 
                                onChange={e => handleChange('roe', Number(e.target.value))} 
                            />
                            <select
                                className="ml-1 text-xs font-bold text-gray-500 bg-transparent outline-none"
                                value={formData.roeCurrency || 'USD'}
                                onChange={(e) => handleChange('roeCurrency', e.target.value)}
                            >
                                <option value="USD">VND/USD</option>
                                <option value="EUR">VND/EUR</option>
                                <option value="JPY">VND/JPY</option>
                                <option value="CNY">VND/CNY</option>
                                <option value="GBP">VND/GBP</option>
                            </select>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col h-full">
                        <div className="flex items-center border-b border-gray-100 pb-1 mb-2">
                            <div className="w-[80px] font-bold text-gray-600">ETD/ETA:</div>
                            <div className="flex-1 relative flex items-center group">
                                <input 
                                    type="text"
                                    className="flex-1 outline-none text-left font-medium bg-transparent" 
                                    value={formatDateVN(formData.etd)} 
                                    onChange={e => handleChange('etd', e.target.value)} 
                                    placeholder="dd/mm/yyyy"
                                />
                                {/* Calendar Icon with Overlay Date Input */}
                                <div className="relative ml-1 w-6 h-6 flex items-center justify-center cursor-pointer print:hidden">
                                    <Calendar size={16} className="text-gray-400 group-hover:text-blue-600 transition" />
                                    <input 
                                        type="date"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        value={getISODate(formData.etd)}
                                        onChange={e => handleChange('etd', e.target.value)}
                                        title="Chọn ngày từ lịch"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1">
                            <div className="font-bold text-gray-600 mb-1">Note:</div>
                            <textarea 
                                className="flex-1 w-full outline-none p-2 border border-gray-200 rounded-lg resize-none bg-gray-50/50 text-xs" 
                                value={formData.note} 
                                onChange={e => handleChange('note', e.target.value)}
                                placeholder="Ghi chú..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Datalists for Fees (Split by Type) */}
                <datalist id="fee-list-service">
                    {serviceFees.map(f => <option key={f.id} value={f.name} />)}
                </datalist>
                <datalist id="fee-list-behalf">
                    {behalfFees.map(f => <option key={f.id} value={f.name} />)}
                </datalist>

                {/* Items Table */}
                <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
                    <thead>
                        <tr className="bg-[#e6b8af]">
                            <th className="border border-gray-300 p-2 w-[40%]">DESCRIPTION</th>
                            <th className="border border-gray-300 p-2 w-[8%]">Q'ty (Unit)</th>
                            <th className="border border-gray-300 p-2 w-[10%]">PRICE</th>
                            <th className="border border-gray-300 p-2 w-[5%]">VAT %</th>
                            <th className="border border-gray-300 p-2 w-[7%]">CURR</th>
                            <th className="border border-gray-300 p-2 w-[15%]">Amount (Incl VAT)</th>
                            <th className="border border-gray-300 p-2 w-[15%]">AMOUNT VND</th>
                            <th className="border border-gray-300 p-1 w-[20px] print:hidden"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Service Charges */}
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={8} className="border border-gray-300 p-1 pl-2">LOGISTICS CHARGE ( PHÍ DỊCH VỤ )</td>
                        </tr>
                        {serviceItems.map(item => {
                            const isNew = isNewFee(item.description);
                            return (
                                <tr key={item.id} className="group">
                                    <td className="border border-gray-300 p-1 relative">
                                        <input 
                                            type="text"
                                            list="fee-list-service"
                                            className={`w-full outline-none uppercase bg-transparent ${isNew ? '[&::-webkit-calendar-picker-indicator]:!hidden' : ''}`}
                                            value={item.description} 
                                            onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                                        />
                                        {/* Quick Add Fee */}
                                        {isNew && (
                                            <button 
                                                onClick={() => handleAddNewFee(item.description, item.vat, 'SERVICE')}
                                                className="absolute right-1 top-1 text-green-500 hover:text-green-700 opacity-0 group-hover:opacity-100 transition print:hidden"
                                                title="Lưu phí mới (Service)"
                                            >
                                                <Plus size={14}/>
                                            </button>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-center"><input className="w-full outline-none text-center bg-transparent" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))} /></td>
                                    <td className="border border-gray-300 p-1 text-right"><input className="w-full outline-none text-right bg-transparent" value={item.price} onChange={e => handleItemChange(item.id, 'price', Number(e.target.value))} /></td>
                                    <td className="border border-gray-300 p-1 text-center"><input className="w-full outline-none text-center bg-transparent" value={item.vat} onChange={e => handleItemChange(item.id, 'vat', Number(e.target.value))} /></td>
                                    <td className="border border-gray-300 p-1 text-center">
                                        <select 
                                            className="w-full outline-none bg-transparent text-center appearance-none" 
                                            value={item.currency} 
                                            onChange={e => handleItemChange(item.id, 'currency', e.target.value)}
                                        >
                                            {availableCurrencies.map(curr => (
                                                <option key={curr} value={curr}>{curr}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(calculateRowTotal(item))}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(calculateRowTotalVND(item))}</td>
                                    <td className="border border-gray-300 p-1 text-center print:hidden"><button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={12}/></button></td>
                                </tr>
                            );
                        })}
                        <tr className="print:hidden">
                            <td colSpan={8} className="p-1"><button onClick={() => addItem('SERVICE')} className="text-xs text-blue-600 hover:underline flex items-center"><Plus size={12} className="mr-1"/> Thêm dòng dịch vụ</button></td>
                        </tr>

                        {/* Pay On Behalf */}
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={8} className="border border-gray-300 p-1 pl-2">PAY ON BEHALF ( CHI HỘ )</td>
                        </tr>
                        {behalfItems.map(item => {
                            const isNew = isNewFee(item.description);
                            return (
                                <tr key={item.id} className="group">
                                    <td className="border border-gray-300 p-1 relative">
                                        <input 
                                            type="text"
                                            list="fee-list-behalf"
                                            className={`w-full outline-none uppercase bg-transparent ${isNew ? '[&::-webkit-calendar-picker-indicator]:!hidden' : ''}`} 
                                            value={item.description} 
                                            onChange={e => handleItemChange(item.id, 'description', e.target.value)} 
                                        />
                                        {isNew && (
                                            <button 
                                                onClick={() => handleAddNewFee(item.description, item.vat, 'ON_BEHALF')}
                                                className="absolute right-1 top-1 text-green-500 hover:text-green-700 opacity-0 group-hover:opacity-100 transition print:hidden"
                                                title="Lưu phí mới (Chi hộ)"
                                            >
                                                <Plus size={14}/>
                                            </button>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-center"><input className="w-full outline-none text-center bg-transparent" value={item.qty} onChange={e => handleItemChange(item.id, 'qty', Number(e.target.value))} /></td>
                                    <td className="border border-gray-300 p-1 text-right"><input className="w-full outline-none text-right bg-transparent" value={item.price} onChange={e => handleItemChange(item.id, 'price', Number(e.target.value))} /></td>
                                    <td className="border border-gray-300 p-1 text-center text-gray-300">-</td>
                                    <td className="border border-gray-300 p-1 text-center">
                                        <select 
                                            className="w-full outline-none bg-transparent text-center appearance-none" 
                                            value={item.currency} 
                                            onChange={e => handleItemChange(item.id, 'currency', e.target.value)}
                                        >
                                            {availableCurrencies.map(curr => (
                                                <option key={curr} value={curr}>{curr}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(calculateRowTotal(item))}</td>
                                    <td className="border border-gray-300 p-1 text-right font-bold">{formatNumber(calculateRowTotalVND(item))}</td>
                                    <td className="border border-gray-300 p-1 text-center print:hidden"><button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={12}/></button></td>
                                </tr>
                            );
                        })}
                        <tr className="print:hidden">
                            <td colSpan={8} className="p-1"><button onClick={() => addItem('ON_BEHALF')} className="text-xs text-orange-600 hover:underline flex items-center"><Plus size={12} className="mr-1"/> Thêm dòng chi hộ</button></td>
                        </tr>

                        {/* TOTAL */}
                        <tr className="bg-[#e6b8af] font-bold">
                            <td colSpan={5} className="border border-gray-300 p-2 text-center text-lg">TOTAL</td>
                            <td className="border border-gray-300 p-2 text-right">{formData.roeCurrency || 'USD'} {formatNumber(totalForeign)}</td>
                            <td className="border border-gray-300 p-2 text-right text-lg">(VND) {formatNumber(totalVND)}</td>
                            <td className="border border-gray-300 p-1 print:hidden"></td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Bank Info (Static for now based on image context) */}
                <div className="mt-8 text-sm">
                    <p className="font-bold underline mb-1">BANK DETAILS:</p>
                    <p>Beneficiary Name: <span className="font-bold uppercase">CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span></p>
                    <p>Account No (VND): <span className="font-bold">19135447033015</span></p>
                    <p>Account No (USD): <span className="font-bold">19135447033023</span></p>
                    <p>Bank Name: <span className="font-bold">TECHCOMBANK - GIA DINH BRANCH</span></p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AccountDebitNote;

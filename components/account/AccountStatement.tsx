
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, FileSpreadsheet, Calendar, ArrowLeft, Share2, Lock, CheckCircle, Unlock, RotateCcw, Pencil } from 'lucide-react';
import { Carrier } from './AccountData';
import { StatementData } from '../../App';

interface StatementRow {
  id: number;
  date: string;
  plateNumber: string;
  from: string;
  to: string;
  price: number;
  note: string;
  jobNo: string;
}

interface AccountStatementProps {
  carriers: Carrier[];
  initialData?: StatementData;
  onSave: (data: StatementData) => void;
  onBack: () => void;
}

const AccountStatement: React.FC<AccountStatementProps> = ({ carriers, initialData, onSave, onBack }) => {
  // Initialize Header Info
  const [headerInfo, setHeaderInfo] = useState(initialData?.headerInfo || {
    sender: 'CÔNG TY TNHH DV VT THANH XUÂN ĐÀO',
    address: '41/15d/5/10 Đường Gò Cát, Phường Phú Hữu, Tp Thủ Đức, Tp Hồ Chí Minh',
    accountHolder: '',
    accountNumber: '1044115528',
    bank: 'Vietcombank',
    receiver: 'CÔNG TY TNHH LONG HOÀNG',
    invoiceDate: new Date().toISOString().split('T')[0]
  });

  // Manifest Title State
  const [manifestName, setManifestName] = useState(
      initialData?.title || (initialData ? `Bảng kê #${initialData.id.toString().slice(-4)}` : 'Bảng kê mới')
  );

  // Initialize Rows
  const [rows, setRows] = useState<StatementRow[]>(initialData?.rows || [
    { id: 1, date: new Date().toISOString().split('T')[0], plateNumber: '', from: '', to: '', price: 0, note: '', jobNo: '' },
  ]);

  const [status, setStatus] = useState<'Draft' | 'Shared' | 'Locked'>(initialData?.status || 'Draft');

  const [newRow, setNewRow] = useState<StatementRow>({
    id: 0, date: '', plateNumber: '', from: '', to: '', price: 0, note: '', jobNo: ''
  });

  // Effect to auto-populate carrier info if creating new and user selects one
  const handleCarrierSelect = (carrierId: string) => {
    const selected = carriers.find(c => c.id.toString() === carrierId);
    if (selected) {
      setHeaderInfo(prev => ({
        ...prev,
        sender: selected.name,
        address: selected.address,
        accountNumber: selected.accountNumber,
        bank: selected.bank,
        accountHolder: selected.accountHolder
      }));
    }
  };

  const handleAddRow = () => {
    if (!newRow.date || !newRow.plateNumber) {
      alert('Vui lòng nhập ngày và biển số xe');
      return;
    }
    setRows([...rows, { ...newRow, id: Date.now() }]);
    setNewRow({ id: 0, date: '', plateNumber: '', from: '', to: '', price: 0, note: '', jobNo: '' });
  };

  const handleDeleteRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const calculateTotal = () => rows.reduce((sum, row) => sum + row.price, 0);
  
  const handleSave = (newStatus?: 'Draft' | 'Shared' | 'Locked') => {
      const finalStatus = newStatus || status;
      const totalAmount = calculateTotal();
      const invoiceDateObj = new Date(headerInfo.invoiceDate);
      const monthStr = `${invoiceDateObj.getFullYear()}-${String(invoiceDateObj.getMonth() + 1).padStart(2, '0')}`;

      const statementData: StatementData = {
          id: initialData?.id || Date.now(),
          title: manifestName, // Save the title
          month: monthStr,
          createdDate: headerInfo.invoiceDate,
          senderName: headerInfo.sender,
          receiverName: headerInfo.receiver,
          totalAmount: totalAmount,
          status: finalStatus,
          rows: rows,
          headerInfo: headerInfo
      };
      
      setStatus(finalStatus);
      onSave(statementData);
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}-Thg${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    return `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden on Print) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm print:hidden space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition">
                  <ArrowLeft size={24} />
              </button>
              
              {/* EDITABLE MANIFEST NAME */}
              <div className="flex items-center group">
                <FileSpreadsheet className="mr-2 text-green-600" /> 
                <div className="relative">
                    <input 
                        type="text" 
                        className="font-bold text-gray-800 text-lg border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none px-1 transition bg-transparent"
                        value={manifestName}
                        onChange={(e) => setManifestName(e.target.value)}
                        placeholder="Nhập tên bảng kê..."
                    />
                    <Pencil size={12} className="absolute -right-4 top-1.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
              
              {/* Status Badges - Removed Draft Badge */}
              {status === 'Shared' && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Share2 size={12} className="mr-1" /> Đang chia sẻ
                  </span>
              )}
              {status === 'Locked' && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <Lock size={12} className="mr-1" /> Đã Khóa (Hoàn thành)
                  </span>
              )}
          </div>
          
          <div className="flex space-x-2">
             <button 
                onClick={() => handleSave()}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50 transition"
              >
                <Save size={16} className="mr-2" /> Lưu lại
              </button>
              
              {/* STATUS ACTION BUTTONS */}
              {status === 'Draft' && (
                <button 
                    onClick={() => {
                        if (confirm('Chia sẻ bảng kê này để bộ phận Company nhập liệu?')) {
                            handleSave('Shared');
                        }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition"
                >
                    <Share2 size={16} className="mr-2" /> Chia sẻ
                </button>
              )}

              {status === 'Shared' && (
                <>
                    <button 
                        onClick={() => handleSave('Draft')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center transition"
                    >
                        <RotateCcw size={16} className="mr-2" /> Hủy chia sẻ
                    </button>
                    <button 
                        onClick={() => {
                            if (confirm('Khóa bảng kê? Sau khi khóa, không ai có thể chỉnh sửa được nữa.')) {
                                handleSave('Locked');
                            }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition"
                    >
                        <Lock size={16} className="mr-2" /> Khóa & Hoàn tất
                    </button>
                </>
              )}

              {status === 'Locked' && (
                <button 
                    onClick={() => {
                        if (confirm('Mở khóa bảng kê để tiếp tục chỉnh sửa? Trạng thái sẽ chuyển về "Đang chia sẻ".')) {
                            handleSave('Shared');
                        }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition"
                >
                    <Unlock size={16} className="mr-2" /> Mở khóa
                </button>
              )}

              <button 
                onClick={() => window.print()}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-black transition"
              >
                <Printer size={16} className="mr-2" /> In
              </button>
          </div>
        </div>

        {/* Header Config */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${status === 'Locked' ? 'opacity-60 pointer-events-none' : ''}`}>
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Đơn vị gửi (Sender)</label>
              
              {/* Carrier Selection */}
              <select 
                className="w-full border p-2 rounded text-sm mb-2 bg-gray-50 focus:bg-white transition outline-none focus:border-primary"
                onChange={(e) => handleCarrierSelect(e.target.value)}
                value={carriers.find(c => c.name === headerInfo.sender)?.id || ''}
              >
                <option value="">-- Chọn Nhà xe / Đơn vị gửi --</option>
                {carriers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input type="text" className="w-full border p-2 rounded text-sm font-bold" value={headerInfo.sender} onChange={e => setHeaderInfo({...headerInfo, sender: e.target.value})} placeholder="Tên công ty..." />
              <input type="text" className="w-full border p-2 rounded text-sm" value={headerInfo.address} onChange={e => setHeaderInfo({...headerInfo, address: e.target.value})} placeholder="Địa chỉ..." />
           </div>
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Đơn vị nhận (Receiver)</label>
              <input type="text" className="w-full border p-2 rounded text-sm font-bold" value={headerInfo.receiver} onChange={e => setHeaderInfo({...headerInfo, receiver: e.target.value})} />
              <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-500">Ngày HĐ:</span>
                 <input type="date" className="border p-2 rounded text-sm" value={headerInfo.invoiceDate} onChange={e => setHeaderInfo({...headerInfo, invoiceDate: e.target.value})} />
              </div>
           </div>
        </div>

        {/* Input Form */}
        {status !== 'Locked' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Thêm dòng mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                <div>
                    <label className="text-[10px] font-bold block mb-1">Ngày</label>
                    <input type="date" className="w-full p-2 border rounded text-sm" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Biển số xe</label>
                    <input type="text" className="w-full p-2 border rounded text-sm font-bold uppercase" placeholder="59C..." value={newRow.plateNumber} onChange={e => setNewRow({...newRow, plateNumber: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Điểm đi</label>
                    <input type="text" className="w-full p-2 border rounded text-sm" placeholder="Cát Lái..." value={newRow.from} onChange={e => setNewRow({...newRow, from: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Điểm đến</label>
                    <input type="text" className="w-full p-2 border rounded text-sm" placeholder="KCN..." value={newRow.to} onChange={e => setNewRow({...newRow, to: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Tiền VC</label>
                    <input type="number" className="w-full p-2 border rounded text-sm" placeholder="VNĐ" value={newRow.price || ''} onChange={e => setNewRow({...newRow, price: Number(e.target.value)})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Ghi chú</label>
                    <input type="text" className="w-full p-2 border rounded text-sm" placeholder="..." value={newRow.note} onChange={e => setNewRow({...newRow, note: e.target.value})} />
                </div>
                <div>
                    <label className="text-[10px] font-bold block mb-1">Số Job</label>
                    <input type="text" className="w-full p-2 border rounded text-sm uppercase" placeholder="JOB..." value={newRow.jobNo} onChange={e => setNewRow({...newRow, jobNo: e.target.value})} />
                </div>
            </div>
            <button onClick={handleAddRow} className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition flex justify-center items-center">
                <Plus size={16} className="mr-1" /> Thêm vào bảng kê
            </button>
            </div>
        )}
      </div>

      {/* PREVIEW & PRINT AREA - RESPONSIVE */}
      <div className="overflow-x-auto pb-10 w-full">
        <style>{`
          @media print {
            @page {
              size: landscape;
              margin: 5mm;
            }
            body {
              -webkit-print-color-adjust: exact;
            }
            .print-fit-width {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-hidden-col {
              display: none !important;
              width: 0 !important;
            }
          }
        `}</style>
        <div 
          className="bg-white p-6 shadow-lg print:shadow-none print:p-0 mx-auto text-black border border-gray-100 print-fit-width w-full"
          style={{ minHeight: '210mm' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-2/3">
              <h2 className="font-bold text-[14px] uppercase">{headerInfo.sender}</h2>
              <p className="text-[11px] mt-1">• Địa chỉ: {headerInfo.address}</p>
              <p className="text-[11px] mt-1">Thông tin chuyển khoản: {headerInfo.accountNumber}</p>
              {headerInfo.accountHolder && <p className="text-[11px]">Chủ tài khoản: {headerInfo.accountHolder}</p>}
              <p className="text-[11px]">Số tài khoản: {headerInfo.accountNumber}</p>
              <p className="text-[11px]">Ngân Hàng: {headerInfo.bank}</p>
            </div>
            <div className="w-1/3 text-right">
              <p className="text-[12px]">Kính Gửi: {headerInfo.receiver}</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-[20px] font-bold uppercase">BẢNG KÊ XE TẢI</h1>
            <p className="text-[12px] italic">HD: {formatDateHeader(headerInfo.invoiceDate)}</p>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-black text-[12px] table-fixed">
            <colgroup>
                <col className="w-[40px]" /> {/* STT */}
                <col className="w-[90px]" /> {/* Ngay */}
                <col className="w-[90px]" /> {/* Bien So */}
                <col /> {/* Diem Di (Auto) */}
                <col /> {/* Diem Den (Auto) */}
                <col className="w-[100px]" /> {/* Tien */}
                <col className="w-[70px]" /> {/* Ghi chu */}
                <col className="w-[120px]" /> {/* So Job */}
                <col className="w-[40px] print:hidden print-hidden-col" /> {/* Delete */}
            </colgroup>
            <thead>
              <tr>
                <th className="border border-black p-1 text-center">STT</th>
                <th className="border border-black p-1 text-center">NGÀY</th>
                <th className="border border-black p-1 text-center">BIỂN SỐ XE</th>
                <th className="border border-black p-1 text-center">Điểm Đi</th>
                <th className="border border-black p-1 text-center">Điểm Đến</th>
                <th className="border border-black p-1 text-right">Tiền vận chuyển</th>
                <th className="border border-black p-1 text-center">Ghi chú</th>
                <th className="border border-black p-1 text-center">Số Job</th>
                <th className="border border-black p-1 text-center print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 text-center">{formatDateForDisplay(row.date)}</td>
                  <td className="border border-black p-1 text-center">{row.plateNumber}</td>
                  <td className="border border-black p-1">{row.from}</td>
                  <td className="border border-black p-1">{row.to}</td>
                  <td className="border border-black p-1 text-right">{row.price.toLocaleString()}</td>
                  <td className="border border-black p-1 text-center">{row.note}</td>
                  <td className="border border-black p-1 text-center font-bold text-blue-600">{row.jobNo}</td>
                  <td className="border border-black p-1 text-center print:hidden">
                    {status !== 'Locked' && (
                        <button onClick={() => handleDeleteRow(row.id)} className="text-red-500 hover:text-red-700 flex justify-center w-full"><Trash2 size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-16 px-8">
            <div className="text-center">
                <p className="font-bold text-[12px] uppercase">CTY TNHH LONG HOANG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatement;

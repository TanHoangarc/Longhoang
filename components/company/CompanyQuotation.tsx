
import React, { useState, useMemo } from 'react';
import { Printer, X, Phone, Mail, Download, Plus, Trash2 } from 'lucide-react';

interface QuoteRow {
  id: number;
  cost: string;
  unit: string;
  qty: number;
  price: number;
  vat: number;
  currency: string;
}

interface QuotationData {
  region: 'Hồ Chí Minh' | 'Hải Phòng';
  pickup: string;
  placeOfReceipt?: string;
  aod: string;
  term: string;
  weight: string;
  volume: string;
  unit: string;
  commodity: string;
  note: string;
  salerName: string;
  salerPhone: string;
  salerEmail: string;
}

const PORTS_HCM = [
  'Cảng Cát Lái (HCM)',
  'Cảng Hiệp Phước (HCM)',
  'Cảng VICT (HCM)',
  'Tân Cảng Phú Hữu (HCM)',
  'ICD Phước Long (HCM)',
  'Sân bay Tân Sơn Nhất (SGN)'
];

const PORTS_HP = [
  'Cảng Tân Vũ (Hải Phòng)',
  'Cảng Chùa Vẽ (Hải Phòng)',
  'Cảng Đình Vũ (Hải Phòng)',
  'Cảng Nam Hải Đình Vũ (Hải Phòng)',
  'Cảng Lạch Huyện (TC-HICT)',
  'Sân bay Cát Bi (HPH)'
];

const FOREIGN_PORTS = [
  'Singapore (SGP)', 'Shanghai (CHN)', 'Shenzhen (CHN)', 'Ningbo (CHN)', 
  'Busan (KOR)', 'Hong Kong (HKG)', 'Rotterdam (NLD)', 'Antwerp (BEL)',
  'Los Angeles (USA)', 'Long Beach (USA)', 'New York (USA)', 'Hamburg (DEU)',
  'Tokyo (JPN)', 'Port Klang (MYS)', 'Dubai (ARE)', 'Bangkok (THA)', 'Laem Chabang (THA)'
];

const CompanyQuotation = () => {
  const [rows, setRows] = useState<QuoteRow[]>([{ id: 1, cost: '', unit: 'Lô', qty: 1, price: 0, vat: 10, currency: 'USD' }]);
  const [units, setUnits] = useState(['Lô', 'Bill', 'Bộ', 'Cont', 'CBM', 'Kgs', 'Chuyến']);
  const [currencies, setCurrencies] = useState(['USD', 'VND', 'EUR']);
  const [showPDF, setShowPDF] = useState(false);
  const [quoteType, setQuoteType] = useState<'import' | 'export'>('import');
  
  const [quoteData, setQuoteData] = useState<QuotationData>({
    region: 'Hồ Chí Minh',
    pickup: '',
    placeOfReceipt: '',
    aod: '',
    term: 'FOB',
    weight: '',
    volume: '',
    unit: 'CBM',
    commodity: '',
    note: '',
    salerName: '',
    salerPhone: '',
    salerEmail: ''
  });

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

  const getRowTotalRaw = (row: QuoteRow) => {
    const amount = row.qty * row.price;
    const vatAmount = amount * (row.vat / 100);
    return amount + vatAmount;
  };

  const calculateRowTotal = (row: QuoteRow) => {
    return getRowTotalRaw(row).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const aodList = quoteData.region === 'Hồ Chí Minh' ? PORTS_HCM : PORTS_HP;
  const portList = quoteData.region === 'Hồ Chí Minh' ? PORTS_HCM : PORTS_HP;

  const renderRegionToggle = (targetField: 'pickup' | 'aod') => (
    <div className="flex bg-gray-100 rounded p-0.5 ml-2">
      <button 
        onClick={() => setQuoteData({...quoteData, region: 'Hồ Chí Minh', [targetField]: ''})}
        className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${quoteData.region === 'Hồ Chí Minh' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
      >
        HCM
      </button>
      <button 
        onClick={() => setQuoteData({...quoteData, region: 'Hải Phòng', [targetField]: ''})}
        className={`px-2 py-0.5 text-[10px] rounded font-bold transition-all ${quoteData.region === 'Hải Phòng' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
      >
        HP
      </button>
    </div>
  );

  // --- DYNAMIC PAGINATION ALGORITHM ---
  const generatePages = () => {
    const PAGE_HEIGHT = 960; // Safe height in pixels for A4 (excluding margins)
    const HEADER_HEIGHT_PAGE1 = 420; // Logo + Title + Info Grid
    const HEADER_HEIGHT_SUBSEQUENT = 100; // Small header for next pages
    const TABLE_HEAD_HEIGHT = 45;
    const ROW_HEIGHT = 40;
    const TOTAL_ROW_HEIGHT = 50;
    const NOTES_HEIGHT = 160;
    const SIGNATURE_HEIGHT = 180;

    let pages: React.ReactNode[][] = [];
    let currentPageNodes: React.ReactNode[] = [];
    let currentHeight = 0;
    let pageIndex = 0;

    // Helper to push current page and start new one
    const startNewPage = () => {
      pages.push(currentPageNodes);
      currentPageNodes = [];
      currentHeight = 0;
      pageIndex++;
    };

    // --- 1. RENDER HEADER (LOGO + INFO) ---
    // This only appears fully on Page 1
    currentPageNodes.push(
      <div key="page1-header" className="mb-8">
         <div className="w-full mb-4">
            <img 
              src="https://i.ibb.co/Kx32Z01D/LH-VIETNAMESE.jpg" 
              alt="Long Hoang Logistics Letterhead" 
              className="w-full h-auto block"
            />
          </div>
          <div className="text-center mb-8">
              <h2 className="text-[32px] font-black text-gray-900 uppercase tracking-[0.05em]">BẢNG BÁO GIÁ DỊCH VỤ</h2>
              <p className="text-[12px] text-gray-400 mt-1 font-bold font-sans">Mã: LH-QT-{Math.floor(Date.now() / 100000)} | Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 text-[14px]">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">PICKUP:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.pickup || '—'}</span>
                </div>
                {quoteType === 'export' && quoteData.placeOfReceipt && (
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">LẤY HÀNG:</span>
                    <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.placeOfReceipt}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">TERM:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.term || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">AOD:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.aod || '—'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">HÀNG HÓA:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.commodity || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">TRỌNG LƯỢNG:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.weight || '—'} KGS</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">THỂ TÍCH/LOẠI:</span>
                  <span className="font-bold text-gray-900 ml-2 text-right">{quoteData.volume || '—'} {quoteData.unit}</span>
                </div>
              </div>
          </div>
      </div>
    );
    currentHeight += HEADER_HEIGHT_PAGE1;

    // --- 2. RENDER TABLE ROWS ---
    const renderTableHead = () => (
      <thead key="thead">
         <tr className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider">
            <th className="p-3 text-center w-[5%] border border-primary">STT</th>
            <th className="p-3 text-left w-[35%] border border-primary">CHI TIẾT DỊCH VỤ</th>
            <th className="p-3 text-center w-[10%] border border-primary">ĐVT</th>
            <th className="p-3 text-center w-[10%] border border-primary">SL</th>
            <th className="p-3 text-right w-[15%] border border-primary">ĐƠN GIÁ</th>
            <th className="p-3 text-center w-[10%] border border-primary">VAT</th>
            <th className="p-3 text-right w-[15%] border border-primary">THÀNH TIỀN</th>
          </tr>
      </thead>
    );

    let tableRowsBuffer: React.ReactNode[] = [];
    tableRowsBuffer.push(renderTableHead()); // Init with head
    currentHeight += TABLE_HEAD_HEIGHT;

    rows.forEach((row, idx) => {
        // Check if adding this row exceeds page height
        if (currentHeight + ROW_HEIGHT > PAGE_HEIGHT) {
            // Push current table to page
            currentPageNodes.push(
               <table key={`table-${pageIndex}`} className="w-full border-collapse mb-4 table-fixed">
                  {tableRowsBuffer}
               </table>
            );
            
            startNewPage();

            // Add small header for next page
            currentPageNodes.push(
               <div key={`header-${pageIndex}`} className="mb-6 flex justify-between items-center border-b border-gray-200 pb-2">
                   <div className="flex items-center space-x-2">
                      <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" className="h-6 w-auto grayscale opacity-50" alt="logo" />
                      <span className="text-xs font-bold text-gray-400">BẢNG BÁO GIÁ (Tiếp theo)</span>
                   </div>
                   <span className="text-xs text-gray-400 italic">Mã: LH-QT-{Math.floor(Date.now() / 100000)}</span>
               </div>
            );
            currentHeight += HEADER_HEIGHT_SUBSEQUENT;

            // Reset table buffer with header
            tableRowsBuffer = [renderTableHead()];
            currentHeight += TABLE_HEAD_HEIGHT;
        }

        tableRowsBuffer.push(
           <tbody key={`row-${row.id}`}>
              <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 text-center border border-gray-100 text-gray-500 text-[12px]">{idx + 1}</td>
                <td className="p-3 font-bold border border-gray-100 text-[13px]">{row.cost || 'Hạng mục chi phí'}</td>
                <td className="p-3 text-center border border-gray-100 text-[13px] uppercase">{row.unit}</td>
                <td className="p-3 text-center border border-gray-100 text-[13px]">{row.qty}</td>
                <td className="p-3 text-right border border-gray-100 text-[13px]">{row.price.toLocaleString()}</td>
                <td className="p-3 text-center border border-gray-100 text-[12px]">{row.vat}%</td>
                <td className="p-3 text-right font-black border border-gray-100 text-[13px]">
                  {calculateRowTotal(row)} <span className="text-[10px] ml-1 text-gray-400 font-normal">{row.currency}</span>
                </td>
              </tr>
           </tbody>
        );
        currentHeight += ROW_HEIGHT;
    });

    // --- 3. RENDER TOTAL ROW ---
    // Check if total row fits
    if (currentHeight + TOTAL_ROW_HEIGHT > PAGE_HEIGHT) {
         currentPageNodes.push(<table key={`table-end-${pageIndex}`} className="w-full border-collapse mb-4 table-fixed">{tableRowsBuffer}</table>);
         startNewPage();
         currentPageNodes.push(
             <div key={`header-${pageIndex}`} className="mb-6 flex justify-between items-center border-b border-gray-200 pb-2">
                 <div className="flex items-center space-x-2">
                    <img src="https://i.ibb.co/yc7Zwg89/LOGO-HD.png" className="h-6 w-auto grayscale opacity-50" alt="logo" />
                    <span className="text-xs font-bold text-gray-400">BẢNG BÁO GIÁ (Tiếp theo)</span>
                 </div>
                 <span className="text-xs text-gray-400 italic">Mã: LH-QT-{Math.floor(Date.now() / 100000)}</span>
             </div>
         );
         currentHeight += HEADER_HEIGHT_SUBSEQUENT;
         tableRowsBuffer = [renderTableHead()]; // Start new table with header
         currentHeight += TABLE_HEAD_HEIGHT;
    }

    // Append Total to table buffer
    tableRowsBuffer.push(
       <tfoot key="total">
         <tr>
            <td colSpan={6} className="p-4 text-right font-bold uppercase text-gray-400 text-[11px] tracking-[0.15em] border-t-2 border-primary">TỔNG CỘNG DỰ KIẾN:</td>
            <td className="p-4 text-right font-black text-[18px] text-primary border-t-2 border-primary border-l border-gray-100 bg-orange-50">
              {rows.reduce((acc, row) => acc + getRowTotalRaw(row), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-[12px] ml-2 text-primary/70 font-normal">{rows[0]?.currency}</span>
            </td>
          </tr>
       </tfoot>
    );
    // Flush table buffer to page
    currentPageNodes.push(<table key={`table-final-${pageIndex}`} className="w-full border-collapse mb-4 table-fixed">{tableRowsBuffer}</table>);
    currentHeight += TOTAL_ROW_HEIGHT;

    // --- 4. RENDER NOTES ---
    if (currentHeight + NOTES_HEIGHT > PAGE_HEIGHT) startNewPage();
    currentPageNodes.push(
        <div key="notes" className="mb-8">
            <div className="mb-4">
            <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-900 mb-2 border-l-4 border-primary pl-4">GHI CHÚ:</h4>
            <div className="bg-gray-50/50 p-3 rounded text-[12px] leading-relaxed text-gray-600 italic border border-gray-100">
                {quoteData.note || 'Không có ghi chú thêm.'}
            </div>
            </div>
            
            <div>
            <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-900 mb-2 border-l-4 border-primary pl-4">ĐIỀU KHOẢN:</h4>
            <div className="bg-gray-50/50 p-3 rounded text-[12px] leading-relaxed text-gray-600 border border-gray-100">
                Báo giá có hiệu lực trong vòng 15 ngày kể từ ngày phát hành. Chưa bao gồm thuế VAT (nếu không được chỉ định).
            </div>
            </div>
        </div>
    );
    currentHeight += NOTES_HEIGHT;

    // --- 5. RENDER SIGNATURE ---
    if (currentHeight + SIGNATURE_HEIGHT > PAGE_HEIGHT) startNewPage();
    currentPageNodes.push(
        <div key="signature" className="flex justify-end pt-8">
            <div className="w-1/2 text-right space-y-2">
            <p className="font-black uppercase text-[11px] tracking-[0.2em] mb-4 text-gray-900">NGƯỜI LẬP BÁO GIÁ</p>
            <div className="h-16"></div> {/* Space for sign */}
            <div className="space-y-1 text-gray-700 font-bold">
                <p className="text-[16px] text-gray-900">{quoteData.salerName || 'Administrator'}</p>
                {quoteData.salerPhone && <p className="text-[13px] flex items-center justify-end font-sans text-gray-500"><Phone size={12} className="mr-2" /> {quoteData.salerPhone}</p>}
                {quoteData.salerEmail && <p className="text-[13px] flex items-center justify-end font-sans lowercase text-gray-500"><Mail size={12} className="mr-2" /> {quoteData.salerEmail}</p>}
            </div>
            <div className="pt-2 opacity-40 italic text-[10px] text-gray-400">(Long Hoang Logistics Team)</div>
            </div>
        </div>
    );

    if (currentPageNodes.length > 0) pages.push(currentPageNodes);

    return pages;
  };

  const quotePages = useMemo(() => {
     if (!showPDF) return [];
     return generatePages();
  }, [showPDF, rows, quoteData, quoteType]);

  const PDFPreview = () => (
    <div 
      className="fixed inset-0 z-[100] bg-gray-800/95 backdrop-blur-sm flex flex-col items-center pt-4"
      onClick={() => setShowPDF(false)}
    >
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white;
            }
            .print-hidden {
              display: none !important;
            }
            .quote-page {
              margin: 0 !important;
              box-shadow: none !important;
              page-break-after: always;
              break-after: page;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
              padding: 0 !important;
            }
            .scroll-container {
              overflow: visible !important;
              height: auto !important;
            }
          }
        `}
      </style>

      {/* Toolbar */}
      <div className="flex gap-2 mb-6 print-hidden w-full max-w-[210mm] px-4" onClick={(e) => e.stopPropagation()}>
         <div className="flex-1 text-white font-bold text-lg flex items-center">
            <Printer className="mr-2" /> Xem trước Báo giá
         </div>
         <button 
              onClick={() => window.print()} 
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center text-xs font-bold shadow-lg"
          >
              <Printer size={16} className="mr-2" /> In ngay
          </button>
          <button 
              onClick={() => setShowPDF(false)} 
              className="bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition flex items-center text-xs font-bold shadow-lg"
          >
              <X size={16} className="mr-2" /> Đóng
          </button>
      </div>

      {/* Pages Container */}
      <div className="flex-1 w-full overflow-y-auto scroll-container pb-20" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center space-y-8 print:space-y-0">
           {quotePages.map((pageNodes, index) => (
              <div 
                 key={index}
                 className="quote-page bg-white w-[210mm] h-[297mm] shadow-2xl relative p-12 text-gray-800 flex flex-col"
                 style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                  <div className="flex-1">
                      {pageNodes}
                  </div>
                  
                  {/* Page Footer Number */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                      <span>Long Hoang Logistics Service Quotation</span>
                      <span>Trang {index + 1} / {quotePages.length}</span>
                  </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {showPDF && <PDFPreview />}
      
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
        <button 
          onClick={() => setShowPDF(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-green-700 transition"
        >
          <Download size={16} className="mr-2" /> Xuất File PDF
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Field 1: Pickup */}
          <div className="space-y-1">
            <div className="flex justify-between items-center h-6">
                <label className="text-xs font-bold text-gray-400 uppercase">Pickup ({quoteType === 'export' ? 'Cảng đi' : 'Nơi nhận'})</label>
                {quoteType === 'export' && renderRegionToggle('pickup')}
            </div>
            {quoteType === 'export' ? (
              <select 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                value={quoteData.pickup}
                onChange={(e) => setQuoteData({...quoteData, pickup: e.target.value})}
              >
                <option value="">Chọn cảng đi...</option>
                {portList.map(port => <option key={port} value={port}>{port}</option>)}
              </select>
            ) : (
              <input 
                type="text" 
                className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                placeholder="Địa điểm đóng hàng nước ngoài" 
                value={quoteData.pickup}
                onChange={(e) => setQuoteData({...quoteData, pickup: e.target.value})}
              />
            )}
          </div>

          {/* Field 2 & 3 & 4 */}
          {quoteType === 'export' ? (
            <>
              {/* Export Slot 2: Place of Receipt */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">Địa điểm lấy hàng</label>
                </div>
                <input 
                  type="text" 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                  placeholder="Kho/Nhà máy..." 
                  value={quoteData.placeOfReceipt || ''}
                  onChange={(e) => setQuoteData({...quoteData, placeOfReceipt: e.target.value})}
                />
              </div>

              {/* Export Slot 3: AOD (Foreign) - Input with Datalist */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">AOD (Cảng đích)</label>
                </div>
                <input 
                  list="foreign-ports-list"
                  type="text" 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                  placeholder="Nhập hoặc chọn cảng đích nước ngoài" 
                  value={quoteData.aod}
                  onChange={(e) => setQuoteData({...quoteData, aod: e.target.value})}
                />
                <datalist id="foreign-ports-list">
                  {FOREIGN_PORTS.map(port => <option key={port} value={port} />)}
                </datalist>
              </div>

              {/* Export Slot 4: Term */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">Term</label>
                </div>
                <select 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                  value={quoteData.term}
                  onChange={(e) => setQuoteData({...quoteData, term: e.target.value})}
                >
                  <option>EXW</option><option>FCA</option><option>FOB</option><option>CIF</option><option>DDU</option><option>DDP</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Import Slot 2: AOD (VN Port with Toggle & Datalist) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">AOD (Cảng đích)</label>
                  {renderRegionToggle('aod')}
                </div>
                <input 
                  list="vn-ports-list"
                  type="text" 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                  placeholder="Chọn hoặc nhập cảng đích..."
                  value={quoteData.aod}
                  onChange={(e) => setQuoteData({...quoteData, aod: e.target.value})}
                />
                <datalist id="vn-ports-list">
                  {portList.map(port => <option key={port} value={port} />)}
                </datalist>
              </div>

              {/* Import Slot 3: Term */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">Term</label>
                </div>
                <select 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
                  value={quoteData.term}
                  onChange={(e) => setQuoteData({...quoteData, term: e.target.value})}
                >
                  <option>EXW</option><option>FCA</option><option>FOB</option><option>CIF</option><option>DDU</option><option>DDP</option>
                </select>
              </div>

              {/* Import Slot 4: Weight */}
              <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">Gross Weight (KGS)</label>
                </div>
                <input 
                  type="number" 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                  placeholder="0.00" 
                  value={quoteData.weight}
                  onChange={(e) => setQuoteData({...quoteData, weight: e.target.value})}
                />
              </div>
            </>
          )}

          {/* Next Row Fields */}
          {quoteType === 'export' && (
             <div className="space-y-1">
                <div className="flex justify-between items-center h-6">
                  <label className="text-xs font-bold text-gray-400 uppercase">Gross Weight (KGS)</label>
                </div>
                <input 
                  type="number" 
                  className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
                  placeholder="0.00" 
                  value={quoteData.weight}
                  onChange={(e) => setQuoteData({...quoteData, weight: e.target.value})}
                />
             </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center h-6">
              <label className="text-xs font-bold text-gray-400 uppercase">Volume</label>
            </div>
            <input 
              type="number" 
              className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
              placeholder="0.00" 
              value={quoteData.volume}
              onChange={(e) => setQuoteData({...quoteData, volume: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center h-6">
              <label className="text-xs font-bold text-gray-400 uppercase">Đơn vị</label>
            </div>
            <select 
              className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm"
              value={quoteData.unit}
              onChange={(e) => setQuoteData({...quoteData, unit: e.target.value})}
            >
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
          <div className="space-y-1">
            <div className="flex justify-between items-center h-6">
              <label className="text-xs font-bold text-gray-400 uppercase">Commodity</label>
            </div>
            <input 
              type="text" 
              className="w-full border-b border-gray-200 py-2 focus:border-primary outline-none transition text-sm" 
              placeholder="Tên hàng hóa" 
              value={quoteData.commodity}
              onChange={(e) => setQuoteData({...quoteData, commodity: e.target.value})}
            />
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
              <tbody className="text-sm">
                {rows.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="p-2 border text-center text-gray-400 text-sm">{idx + 1}</td>
                    <td className="p-1 border">
                      <input 
                        type="text" 
                        className="w-full p-2 outline-none text-sm" 
                        placeholder="Local charge, Freight..." 
                        value={row.cost}
                        onChange={(e) => updateRow(row.id, 'cost', e.target.value)}
                      />
                    </td>
                    <td className="p-1 border">
                      <div className="flex items-center space-x-1">
                        <select 
                          className="w-full p-2 outline-none bg-transparent text-sm"
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
                        className="w-full p-2 outline-none text-center text-sm" 
                        value={row.qty}
                        onChange={(e) => updateRow(row.id, 'qty', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-1 border">
                      <input 
                        type="number" 
                        className="w-full p-2 outline-none text-right text-sm" 
                        placeholder="0"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-1 border">
                      <div className="flex flex-col">
                        <select 
                          className="w-full p-1 text-sm outline-none bg-transparent"
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
                            className="w-full p-1 text-sm outline-none border-t border-gray-100" 
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
                          className="w-full p-2 outline-none bg-transparent text-sm"
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
                    <td className="p-2 border text-right font-bold text-gray-700 text-sm">
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
              <textarea 
                className="w-full border border-gray-200 rounded p-3 text-sm focus:border-primary outline-none h-24" 
                placeholder="Điều kiện báo giá, thời gian hiệu lực..."
                value={quoteData.note}
                onChange={(e) => setQuoteData({...quoteData, note: e.target.value})}
              ></textarea>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h5 className="font-bold text-sm text-gray-600 uppercase mb-2">Thông tin liên hệ Sale</h5>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" 
                placeholder="Tên Saler" 
                value={quoteData.salerName}
                onChange={(e) => setQuoteData({...quoteData, salerName: e.target.value})}
              />
              <input 
                type="text" 
                className="bg-white border border-gray-200 rounded p-2 text-sm outline-none" 
                placeholder="Số điện thoại" 
                value={quoteData.salerPhone}
                onChange={(e) => setQuoteData({...quoteData, salerPhone: e.target.value})}
              />
              <input 
                type="email" 
                className="bg-white border border-gray-200 rounded p-2 text-sm outline-none col-span-2" 
                placeholder="Email liên hệ" 
                value={quoteData.salerEmail}
                onChange={(e) => setQuoteData({...quoteData, salerEmail: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyQuotation;

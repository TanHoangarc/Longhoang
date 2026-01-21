
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit, Save, Printer, FileText, ArrowLeft, PenTool, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { ContractRecord, UserAccount } from '../../App';

interface CompanyContractProps {
  contracts: ContractRecord[];
  onUpdateContracts: (contracts: ContractRecord[]) => void;
  currentUser?: UserAccount | null;
}

const CompanyContract: React.FC<CompanyContractProps> = ({ contracts, onUpdateContracts, currentUser }) => {
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Zoom State for Preview
  const [scale, setScale] = useState(0.85); // Adjusted default scale

  // Default Initial State
  const defaultContract: ContractRecord = {
    id: 0,
    contractNo: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    customerName: '',
    customerAddress: '',
    customerTaxId: '',
    customerRep: '',
    customerPosition: '',
    article1: [
      'Bên A đồng ý cho bên B làm đại diện thực hiện vận chuyển hàng hóa quốc tế bằng đường biển, đường hàng không, đường bộ, khai báo hải quan và bên B có trách nhiệm vận chuyển hàng hóa đó đến tận nơi và giao hàng cho người được chỉ định bởi bên A.'
    ],
    article2: [
      'Hàng hóa thuê vận chuyển theo yêu cầu của bên A không nằm trong hạng mục các loại hàng hóa nguy hiểm và không bị cấm xuất/nhập khẩu tại Việt Nam và/hoặc cấm nhập/xuất khẩu tại các nước nhập/xuất tương ứng.',
      'Hàng hóa thuê vận chuyển theo yêu cầu của bên A phải đảm bảo việc đóng gói đúng tiêu chuẩn và được chuẩn bị đầy đủ các điều kiện để việc chuyển chở lô hàng tuân thủ đúng luật pháp của những nước có liên quan trên đường đi và quy định của IATA, FIATA trong vận chuyển bằng đường hàng không hay đường biển (bao gồm nhưng không giới hạn trong phạm vi vận chuyển hàng nguy hiểm, hàng dễ hư hỏng, động vật sống, …).',
      'Trong mọi trường hợp hàng hóa cần có những lưu ý đặc biệt hơn những điều kiện vận chuyển thông thường, thì bên A phải thông báo cho bên B biết trước khi xác nhận đặt chỗ vận chuyển. Những thông tin này nếu được cung cấp sau khi xác nhận đặt chỗ thì mọi chi phí phát sinh có liên quan sẽ thuộc trách nhiệm chi phí của bên A dưới sự hỗ trợ xử lý của bên B với hãng tàu/hãng bay/các cơ quan chức năng có thẩm quyền.'
    ],
    article3_1: [
      'Thanh toán đầy đủ và đúng hạn toàn bộ tiền cược phí và dịch vụ cho bên B.',
      'Cung cấp những chứng từ cần thiết để bên B tiến hành làm thủ tục có liên quan của dịch vụ.',
      'Chịu trách nhiệm về mặt pháp lý đối với việc xuất/nhập khẩu hàng hóa và tính chính xác của những chứng từ hàng hóa có liên quan.',
      'Người nhận hàng của bên A phải luôn sẵn sàng nhận hàng khi bên B và/hoặc đại lý của bên B gửi thông báo hàng đến để tránh phát sinh các chi phí có liên quan như phí lưu kho, lưu container, lưu bãi, …',
      'Bên A phải chịu trách nhiệm thanh toán các khoản chi phí phát sinh (bao gồm nhưng không giới hạn trong phạm vi được liệt kê sau đây) như lưu kho, lưu container, lưu bãi, chi phí khác tại cảng biển/sân bay của nơi đi/nơi đến… trong trường hợp người nhận hàng của bên A không giao/nhận hàng trong thời gian miễn phí qui định, và/hoặc từ chối nhận hàng vì bất kỳ lý do gì.'
    ],
    article3_2: [
      'Đặt chỗ trên Hãng vận chuyển và thông báo lịch trình cho Bên A.',
      'Trong quá trình chuyên chở hàng hóa nếu có xảy ra tổn thất, thiệt hại, … thì Bên B sẽ có trách nhiệm đứng ra với yêu cầu của Bên A đại diện cho Bên A khiếu nại với Hãng vận chuyển hoặc với bên thứ ba để có mức bồi thường thiệt hại thỏa đáng cho Bên A dựa trên công ước quốc tế về vận tải.',
      'Có trách nhiệm thông báo đầy đủ các thông tin về lộ hàng cho Bên A trong quá trình vận chuyển.',
      'Có trách nhiệm cung cấp chứng từ theo đúng chi tiết lô hàng do Bên A cung cấp. Chứng từ do CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG cung cấp có đầy đủ các chức năng và được luật pháp Việt Nam và quốc tế công nhận.',
      'Hỗ trợ Bên A làm các thủ tục khiếu nại với các cơ quan hữu quan khi có tổn thất xảy ra.',
      'Đảm bảo giữ bí mật thông tin liên quan đến hàng hóa và giá cả kinh doanh của Bên A trừ trường hợp cung cấp theo yêu cầu của cơ quan có thẩm quyền và theo quy định pháp luật.'
    ],
    article4_1: [
      'Đây là hợp đồng nguyên tắc. Giá dịch vụ vận chuyển và phí sẽ theo bảng chào giá của từng lô hàng và được bên A đồng ý trước khi thực hiện.'
    ],
    article4_2: [
      'Việc thanh toán giữa 2 bên được thực hiện dựa trên Bản ghi nợ, Hóa đơn GTGT và/hoặc các chứng từ có liên quan do bên B cung cấp cho bên A trong quá trình thực hiện dịch vụ.',
      'Thời hạn thanh toán: Bên A thanh toán toàn bộ phí dịch vụ của từng lô hàng cho Bên B trong vòng 45 ngày (bốn mươi lăm ngày) kể từ ngày xuất hóa đơn tính theo ngày làm việc.',
      'Mức giới hạn công nợ áp dụng cho thời hạn thanh toán nói trên là tương đương 200.000.000 đồng (hai trăm triệu đồng). Bất kỳ lúc nào nếu tổng số tiền công nợ vượt quá mức giới hạn công nợ này thì Bên A sẽ phải thanh toán ngay phần vượt quá giới hạn công nợ hoặc toàn bộ công nợ cho Bên B để đảm bảo bên A luôn ở trong tình trạng công nợ tốt.',
      'Các giao dịch chuyển khoản thanh toán trong Việt Nam thì chi phí Ngân hàng phát sinh ở bên nào thì do bên đó chịu trách nhiệm. Trường hợp giá dịch vụ được phép báo theo ngoại tệ nhưng thanh toán bằng Đồng Việt Nam sẽ áp dụng theo tỉ giá bán dành cho chuyển khoản tại ngày thanh toán của Ngân hàng Vietcombank.',
      'Thông tin ngân hàng nhận thanh toán của bên B như dưới đây:\nTên ngân hàng: NGÂN HÀNG TMCP KỸ THƯƠNG VIỆT NAM (TECHCOMBANK) - CHI NHÁNH HCM\nSố tài khoản: 19135447033015 (VND) – 19135447033023 (USD)\nNgười thụ hưởng: CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG'
    ],
    article5: [
      'Trường hợp bên B cung cấp dịch vụ vận chuyển quốc tế kèm theo việc phát hành Vận đơn đường biển và/hoặc Vận đơn hàng không của bên B hoặc những công ty thành viên của bên B thì các bên A và các bên có liên quan phải tuân thủ đúng các điều khoản và điều kiện của Vận đơn đó.',
      'Hai bên cam kết thực hiện tất cả các điều khoản trong hợp đồng. Trong trường hợp có vướng mắc phát sinh, hai bên sẽ thương lượng và lập Phụ lục hợp đồng. Bên B giữ quyền chấm dứt hợp đồng trước thời hạn và thông báo bằng văn bản cho bên A nếu bên A không tuân thủ điều khoản và điều kiện của Hợp đồng này và/hoặc Vận đơn đường biển. Trong trường hợp không giải quyết được tranh chấp bằng thương lượng thì sẽ chuyển cho Toà Án Kinh Tế Thành Phố Hồ Chí Minh để đưa ra quyết định cuối cùng. Nếu một bên vẫn chưa đồng ý với phán quyết của Tòa thì vấn đề sẽ chuyển cho Trung tâm trọng tài Quốc tế Việt Nam bên phòng Thương mại và Công nghiệp Việt Nam có văn phòng tại TP.HCM để đưa ra quyết định cuối cùng.',
      'Hợp đồng có giá trị từ ngày ký đến hết ngày [EXPIRY_DATE] và tự động gia hạn từng năm dương lịch một kể từ ngày hết hạn của thời hạn trước đó nếu hai bên không có yêu cầu điều chỉnh, bổ sung bằng Phụ Lục hoặc thay thế bằng một Hợp đồng khác.',
      'Điều khoản “văn bản” trong Hợp đồng này sẽ được hiểu là bao gồm thư điện tử (“email”), gửi fax và các hình thức chứng từ khác được gửi bằng hình thức thư tay, thư đảm bảo bưu điện hoặc chuyển phát nhanh.',
      'Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.'
    ]
  };

  const [formData, setFormData] = useState<ContractRecord>(defaultContract);

  // --- ACTIONS ---

  const handleCreateNew = () => {
    setEditingId(null);
    
    // Calculate next contract number based on max number found
    let maxNum = 0;
    contracts.forEach(c => {
        const match = c.contractNo.match(/HDLH(\d+)/);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    
    const nextNum = maxNum + 1;
    const contractNo = `HDLH${nextNum.toString().padStart(5, '0')}`;
    
    setFormData({
      ...defaultContract,
      id: Date.now(),
      contractNo: contractNo,
      creatorName: currentUser?.name
    });
    setViewMode('editor');
  };

  const handleEdit = (contract: ContractRecord) => {
    setEditingId(contract.id);
    setFormData(contract);
    setViewMode('editor');
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      onUpdateContracts(contracts.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.customerName) return alert('Vui lòng nhập tên khách hàng!');
    
    const contractToSave = {
        ...formData,
        // Ensure creator is set if new
        creatorName: editingId ? formData.creatorName : (currentUser?.name || formData.creatorName)
    };

    if (editingId) {
      onUpdateContracts(contracts.map(c => c.id === editingId ? contractToSave : c));
    } else {
      onUpdateContracts([contractToSave, ...contracts]);
    }
    setViewMode('list');
  };

  const handleLineChange = (section: keyof ContractRecord, index: number, value: string) => {
    const list = formData[section] as string[];
    const newList = [...list];
    newList[index] = value;
    setFormData({ ...formData, [section]: newList });
  };

  const addLine = (section: keyof ContractRecord) => {
    const list = formData[section] as string[];
    setFormData({ ...formData, [section]: [...list, ''] });
  };

  const removeLine = (section: keyof ContractRecord, index: number) => {
    const list = formData[section] as string[];
    const newList = list.filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: newList });
  };

  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '...';
    const d = new Date(isoDate);
    return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  };

  // --- PAGINATION LOGIC ---
  const pages = useMemo(() => {
    const PAGE_HEIGHT_UNITS = 1100; // Increased due to larger font
    // Estimation units (Scaled for 12pt/16px font)
    const HEADER_UNITS = 200;
    const SECTION_TITLE_UNITS = 50;
    const SUBSECTION_TITLE_UNITS = 40;
    const LINE_UNITS = 30; // Approx height per line
    const SIGNATURE_UNITS = 300;

    let generatedPages: React.ReactNode[][] = [];
    let currentPageNodes: React.ReactNode[] = [];
    let currentHeight = 0;

    const startNewPage = () => {
        generatedPages.push(currentPageNodes);
        currentPageNodes = [];
        currentHeight = 0;
    };

    // 1. Header (Only page 1)
    currentPageNodes.push(
        <div key="header" className="text-center mb-8">
            <h3 className="font-bold uppercase text-[16px]">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h3>
            <p className="font-bold underline underline-offset-4 mb-2 text-[16px]">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-[14px]">-----oOo-----</p>
            {/* Title size 18pt approx 24px */}
            <h1 className="text-center font-bold text-[24px] uppercase mt-6 mb-2">HỢP ĐỒNG DỊCH VỤ VẬN CHUYỂN QUỐC TẾ</h1>
            <p className="text-center italic mb-6 text-[16px]">Số: {formData.contractNo}</p>
            <div className="italic text-justify mb-6 text-[16px] space-y-1">
              <p>- Căn cứ Bộ Luật dân sự số 91/2015/QH13 ngày 24/11/2015 và các văn bản hướng dẫn thi hành;</p>
              <p>- Căn cứ Luật thương mại số 36/2005/QH11 ngày 14/06/2005 và các văn bản hướng dẫn thi hành;</p>
              <p>- Căn cứ Bộ luật Hàng hải Việt Nam số 95/2015/QH13 ngày 25/11/2015 và các văn bản hướng dẫn thi hành;</p>
              <p>- Căn cứ khả năng thực tế và nhu cầu của các bên liên quan.</p>
            </div>
            <p className="mb-4 text-justify text-[16px]">Hôm nay, {formatDateDisplay(formData.date)}, tại 132 - 134 Nguyễn Gia Trí, Phường Thanh Mỹ Tây, TP Hồ Chí Minh, Việt Nam. <span className="underline">Chúng tôi gồm có:</span></p>
        </div>
    );
    currentHeight += HEADER_UNITS + 180;

    // 2. Party Info
    const renderPartyInfo = () => (
        <div key="parties" className="text-[16px]">
             {/* PARTY A */}
             <div className="mb-4">
              <div className="flex font-bold">
                <span className="w-28 shrink-0">Bên A</span>
                <span>: {formData.customerName.toUpperCase() || '................................'}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Địa chỉ</span>
                <span>: {formData.customerAddress || '................................'}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Mã số thuế</span>
                <span>: {formData.customerTaxId || '................................'}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Đại diện</span>
                <span>: Ông/Bà {formData.customerRep.toUpperCase() || '................................'}</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Chức vụ</span>
                <span>: {formData.customerPosition || '................................'}</span>
              </div>
              <p className="italic">(Là bên Sử dụng dịch vụ)</p>
            </div>

            {/* PARTY B */}
            <div className="mb-6">
              <div className="flex font-bold">
                <span className="w-28 shrink-0">Bên B</span>
                <span>: CÔNG TY TNHH TIẾP VẬN VÀ VẬN TẢI QUỐC TẾ LONG HOÀNG</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Địa chỉ</span>
                <span>: 132 - 134 Nguyễn Gia Trí, Phường Thanh Mỹ Tây, TP Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Điện thoại</span>
                <span>: 028 7303 2677</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Mã số thuế</span>
                <span>: 0316113070</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Đại diện</span>
                <span>: Bà NGUYỄN THỊ KIỀU DIỄM</span>
              </div>
              <div className="flex">
                <span className="w-28 shrink-0 font-bold">Chức vụ</span>
                <span>: Giám đốc</span>
              </div>
              <p className="italic">(Là bên Cung ứng dịch vụ)</p>
            </div>
            <p className="mb-4 text-justify indent-8">
              Bên B đại diện cho chính bên B và các chi nhánh của bên B đang hoạt động hợp pháp tại thị trường Việt Nam cùng cung cấp dịch vụ cho bên A trong phạm vi của Hợp đồng này.
            </p>
            <p className="mb-6 text-justify indent-8">
              Hai bên cùng thoả thuận ký kết và thực hiện hợp đồng vận chuyển quốc tế gồm các điều khoản và điều kiện như sau:
            </p>
        </div>
    );
    
    // Check if parties fit on page 1 (usually yes)
    if (currentHeight + 400 > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(renderPartyInfo());
    currentHeight += 400;

    // Helper to add lines
    const addLines = (lines: string[]) => {
        lines.forEach((line, i) => {
            // Rough estimation: chars per line ~ 80 for 12pt font on A4
            const estimatedLineHeight = Math.ceil(line.length / 80) * LINE_UNITS; 
            
            if (currentHeight + estimatedLineHeight > PAGE_HEIGHT_UNITS) {
                startNewPage();
            }
            currentPageNodes.push(<li key={`${line}-${i}`} className="text-justify mb-2 text-[16px] leading-relaxed">{line}</li>);
            currentHeight += estimatedLineHeight;
        });
    };

    // Article 1
    if (currentHeight + SECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h4 key="art1" className="font-bold uppercase underline mb-3 mt-6 text-[16px]">ĐIỀU 1: MỤC ĐÍCH CỦA HỢP ĐỒNG</h4>);
    currentHeight += SECTION_TITLE_UNITS;
    currentPageNodes.push(<ul key="ul1" className="list-disc pl-5 space-y-1"></ul>);
    addLines(formData.article1);

    // Article 2
    if (currentHeight + SECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h4 key="art2" className="font-bold uppercase underline mb-3 mt-6 text-[16px]">ĐIỀU 2: THÔNG TIN VỀ HÀNG HÓA</h4>);
    currentHeight += SECTION_TITLE_UNITS;
    addLines(formData.article2);

    // Article 3
    if (currentHeight + SECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h4 key="art3" className="font-bold uppercase underline mb-3 mt-6 text-[16px]">ĐIỀU 3: TRÁCH NHIỆM CỦA MỖI BÊN</h4>);
    currentHeight += SECTION_TITLE_UNITS;
    
    if (currentHeight + SUBSECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h5 key="art3.1" className="font-bold mb-2 pl-2 text-[16px]">3.1 Trách nhiệm bên A:</h5>);
    currentHeight += SUBSECTION_TITLE_UNITS;
    addLines(formData.article3_1);

    if (currentHeight + SUBSECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h5 key="art3.2" className="font-bold mb-2 pl-2 mt-4 text-[16px]">3.2 Trách nhiệm bên B:</h5>);
    currentHeight += SUBSECTION_TITLE_UNITS;
    addLines(formData.article3_2);

    // Article 4
    if (currentHeight + SECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h4 key="art4" className="font-bold uppercase underline mb-3 mt-6 text-[16px]">ĐIỀU 4: GIÁ TRỊ HỢP ĐỒNG VÀ ĐIỀU KHOẢN THANH TOÁN</h4>);
    currentHeight += SECTION_TITLE_UNITS;

    if (currentHeight + SUBSECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h5 key="art4.1" className="font-bold mb-2 pl-2 text-[16px]">4.1 Giá trị hợp đồng:</h5>);
    currentHeight += SUBSECTION_TITLE_UNITS;
    addLines(formData.article4_1);

    if (currentHeight + SUBSECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h5 key="art4.2" className="font-bold mb-2 pl-2 mt-4 text-[16px]">4.2 Điều khoản thanh toán:</h5>);
    currentHeight += SUBSECTION_TITLE_UNITS;
    addLines(formData.article4_2);

    // Article 5
    if (currentHeight + SECTION_TITLE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(<h4 key="art5" className="font-bold uppercase underline mb-3 mt-6 text-[16px]">ĐIỀU 5: ĐIỀU KHOẢN CHUNG</h4>);
    currentHeight += SECTION_TITLE_UNITS;
    
    // Process replacement for Art 5
    const art5Lines = formData.article5.map(line => line.replace('[EXPIRY_DATE]', new Date(formData.expiryDate).toLocaleDateString('vi-VN')));
    addLines(art5Lines);

    // Signatures
    if (currentHeight + SIGNATURE_UNITS > PAGE_HEIGHT_UNITS) startNewPage();
    currentPageNodes.push(
        <div key="signatures" className="flex justify-between mt-12 mb-16 pt-8 text-[16px]">
            <div className="text-center w-1/2">
            <p className="font-bold uppercase mb-24">ĐẠI DIỆN BÊN A</p>
            <p className="font-bold uppercase">{formData.customerRep || '....................'}</p>
            </div>
            <div className="text-center w-1/2">
            <p className="font-bold uppercase mb-24">ĐẠI DIỆN BÊN B</p>
            <p className="font-bold uppercase">NGUYỄN THỊ KIỀU DIỄM</p>
            </div>
        </div>
    );

    if (currentPageNodes.length > 0) generatedPages.push(currentPageNodes);
    return generatedPages;
  }, [formData]);

  // --- RENDERERS ---

  const renderSectionEditor = (title: string, sectionKey: keyof ContractRecord) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">{title}</label>
        <button onClick={() => addLine(sectionKey)} className="text-primary hover:bg-orange-50 p-1 rounded transition"><Plus size={14} /></button>
      </div>
      {(formData[sectionKey] as string[]).map((line, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <textarea
            className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-medium text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all resize-y min-h-[80px]"
            value={line}
            onChange={(e) => handleLineChange(sectionKey, idx, e.target.value)}
          />
          <button onClick={() => removeLine(sectionKey, idx)} className="text-gray-300 hover:text-red-500 self-start mt-2"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg flex items-center">
            <FileText className="mr-2 text-teal-600" /> Danh sách Hợp đồng
          </h3>
          <button 
            onClick={handleCreateNew}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg transition"
          >
            <Plus size={16} className="mr-2" /> Lập hợp đồng mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs font-bold text-gray-400 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Số Hợp đồng</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Ngày hết hạn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map(c => {
                const isExpired = new Date(c.expiryDate) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{c.contractNo}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{c.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.expiryDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isExpired ? 'Hết hạn' : 'Hiệu lực'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Chưa có hợp đồng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- EDITOR VIEW (RE-DESIGNED TO MATCH FINANCEADJUST) ---
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] pt-4 animate-in slide-in-from-bottom-4">
        
        {/* LEFT: INPUTS - Styled like FinanceAdjust */}
        <div className="w-full lg:w-[450px] flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-2 rounded-t-xl sticky top-0 z-10 flex justify-between items-center mb-2">
                <h3 className="font-black text-slate-800 text-lg uppercase flex items-center">
                    <PenTool className="mr-2 text-slate-500" size={20} /> Soạn thảo Hợp đồng
                </h3>
                <button onClick={() => setViewMode('list')} className="text-xs text-slate-400 hover:text-primary underline font-bold">
                    Quay lại
                </button>
            </div>
            
            <div className="space-y-6 pb-20">
                {/* Contract Info */}
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Thông tin chung</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Số hợp đồng</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all font-mono" value={formData.contractNo} onChange={e => setFormData({...formData, contractNo: e.target.value})} disabled />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngày ký</label>
                                <input type="date" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Ngày hết hạn</label>
                           <input type="date" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                {/* Customer Info */}
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Bên A (Khách hàng)</label>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tên Công ty</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="Tên Công ty..." value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Địa chỉ</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="Địa chỉ..." value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mã số thuế</label>
                            <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="MST..." value={formData.customerTaxId} onChange={e => setFormData({...formData, customerTaxId: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Đại diện</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="Ông/Bà..." value={formData.customerRep} onChange={e => setFormData({...formData, customerRep: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Chức vụ</label>
                                <input type="text" className="w-full px-5 py-3 bg-[#dce5eb] rounded-[1.5rem] outline-none font-bold text-slate-700 text-sm focus:ring-2 focus:ring-slate-300 transition-all" placeholder="Giám đốc..." value={formData.customerPosition} onChange={e => setFormData({...formData, customerPosition: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200"></div>

                {/* Articles */}
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase block mb-3">Nội dung Điều khoản</label>
                    {renderSectionEditor('Điều 1: Mục đích', 'article1')}
                    {renderSectionEditor('Điều 2: Hàng hóa', 'article2')}
                    {renderSectionEditor('Điều 3.1: Trách nhiệm A', 'article3_1')}
                    {renderSectionEditor('Điều 3.2: Trách nhiệm B', 'article3_2')}
                    {renderSectionEditor('Điều 4.1: Giá trị', 'article4_1')}
                    {renderSectionEditor('Điều 4.2: Thanh toán', 'article4_2')}
                    {renderSectionEditor('Điều 5: Chung', 'article5')}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <button onClick={handleSave} className="w-full bg-[#1e2a3b] hover:bg-black text-white py-4 rounded-[1.5rem] font-bold shadow-lg transition-all uppercase tracking-wider flex items-center justify-center">
                        <Save size={18} className="mr-2" /> Lưu Hợp đồng
                    </button>
                    <button onClick={() => window.print()} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-[1.5rem] font-bold shadow-md transition-all uppercase tracking-wider flex items-center justify-center">
                        <Printer size={18} className="mr-2" /> In
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT: PREVIEW - Styled like FinanceAdjust Result Card */}
        <div className="flex-1 bg-slate-100 rounded-[2rem] p-8 overflow-y-auto border border-slate-200 shadow-inner relative flex flex-col items-center print:w-full print:p-0 print:border-none print:bg-white">
            <style>{`
            @media print {
              @page { size: A4; margin: 0; }
              body { background: white; }
              .print-container { box-shadow: none !important; margin: 0 !important; page-break-after: always; height: 297mm !important; overflow: hidden !important; transform: none !important; }
              .print-hidden { display: none !important; }
            }
            `}</style>

            {/* Zoom Controls Overlay */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/80 backdrop-blur rounded-full p-1 shadow-sm border border-slate-200 print:hidden">
                <button onClick={() => setScale(Math.max(0.3, scale - 0.1))} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Zoom Out"><ZoomOut size={16} /></button>
                <span className="text-xs font-mono font-bold w-12 text-center py-2">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(Math.min(1.5, scale + 0.1))} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Zoom In"><ZoomIn size={16} /></button>
                <button onClick={() => setScale(0.85)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600" title="Reset"><Maximize size={16} /></button>
            </div>

            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} className="transition-transform duration-200 ease-out flex flex-col items-center w-full">
                {pages.map((pageContent, idx) => (
                    <div 
                        key={idx} 
                        className="print-container bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] mb-8 last:mb-0 text-black leading-relaxed relative flex flex-col"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        {/* Render Page Content */}
                        {pageContent}
                        
                        <div className="mt-auto text-center text-[10px] text-gray-400">
                            - Trang {idx + 1} / {pages.length} -
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default CompanyContract;

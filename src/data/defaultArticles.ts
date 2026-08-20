export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface NewsItem {
  id: string | number;
  title: string;
  pubDate: string;
  link?: string;
  sourceName?: string;
  sourceUrl?: string;
  thumbnail?: string;
  description: string;
  category?: 'news' | 'knowledge';
  isManual?: boolean;
  isPinned?: boolean;
  views?: number;
  mediaType?: 'image' | 'iframe';
  iframeCode?: string;
  content?: string;
  table?: TableData;
  tags?: string[];
  relatedKeywords?: string[];
}

export const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
];

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  // --- KIẾN THỨC CHUYÊN NGÀNH: QUY TRÌNH HẢI QUAN (THEO ĐÚNG HÌNH ẢNH MẪU CỦA NGƯỜI DÙNG) ---
  {
    id: 'knowledge-item-customs-process',
    title: "QUY TRÌNH THỦ TỤC HẢI QUAN HÀNG NHẬP KHẨU",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    link: "https://tongcuc.customs.gov.vn",
    sourceName: "Tổng cục Hải quan Việt Nam & Long Hoàng Logistics",
    sourceUrl: "https://tongcuc.customs.gov.vn",
    thumbnail: STOCK_IMAGES[3],
    description: "Hướng dẫn trọn vẹn và chi tiết quy trình 8 bước làm thủ tục hải quan cho hàng hóa nhập khẩu từ chuẩn bị hồ sơ, kiểm tra chuyên ngành, truyền tờ khai điện tử đến thông quan.",
    category: "knowledge",
    isPinned: true,
    views: 4850,
    tags: ["Thủ tục hải quan", "Hàng nhập khẩu", "Khai báo hải quan", "Xuất nhập khẩu", "VNACCS", "Kiểm tra chuyên ngành"],
    relatedKeywords: ["Incoterms 2020", "Container 20ft 40ft", "Vận tải biển", "C/O điện tử"],
    content: `## 1. Thủ tục hải quan là gì?
Thủ tục hải quan là các công việc bắt buộc mà người khai hải quan và công chức hải quan phải thực hiện theo quy định của pháp luật đối với hàng hóa, phương tiện vận tải khi xuất khẩu, nhập khẩu hoặc quá cảnh qua biên giới quốc gia.

Mục đích chính của thủ tục hải quan:
- Cho phép hàng hóa và phương tiện được phép xuất hoặc nhập cảnh hợp pháp vào lãnh thổ quốc gia.
- Giúp nhà nước quản lý, giám sát và thu đúng, đủ các loại thuế (thuế nhập khẩu, VAT, tiêu thụ đặc biệt, tự vệ...).
- Đảm bảo an ninh quốc gia, ngăn chặn hàng cấm, buôn lậu và bảo vệ môi trường, sức khỏe cộng đồng.

---

## 2. Quy trình thủ tục hải quan hàng nhập khẩu
Để thông quan một lô hàng nhập khẩu nhanh chóng, tránh phát sinh phí lưu container (DEM/DET) hay lưu bãi (Storage), doanh nghiệp cần thực hiện chuẩn xác 8 bước quy trình sau:

### Bước 1: Xác định loại hàng hóa nhập khẩu
Doanh nghiệp cần xác định rõ mặt hàng nhập khẩu thuộc diện nào:
- **Hàng hóa thương mại thông thường:** Đủ điều kiện nhập khẩu không cần giấy phép đặc biệt.
- **Hàng hóa nhập khẩu có điều kiện / Giấy phép:** Cần xin giấy phép từ Bộ Công Thương, Bộ Y Tế, Bộ Nông nghiệp...
- **Hàng cấm nhập khẩu:** Tuyệt đối không được phép nhập khẩu theo Nghị định 69/2018/NĐ-CP.
- **Hàng phải kiểm tra chuyên ngành:** Kiểm dịch thực vật/động vật, kiểm tra chất lượng, kiểm tra an toàn vệ sinh thực phẩm.

### Bước 2: Chuẩn bị bộ chứng từ nhập khẩu
Một bộ hồ sơ hải quan tiêu chuẩn bao gồm:
1. **Hợp đồng ngoại thương (Sale Contract)**
2. **Hóa đơn thương mại (Commercial Invoice)**
3. **Phiếu đóng gói hàng hóa chi tiết (Packing List)**
4. **Vận đơn đường biển/đường hàng không (Bill of Lading / Air Waybill)**
5. **Chứng nhận xuất xứ hàng hóa (Certificate of Origin - C/O):** Giúp hưởng thuế nhập khẩu ưu đãi đặc biệt (Form E, Form D, Form EUR.1, Form AK...).
6. Giấy phép nhập khẩu và các chứng từ chất lượng khác (nếu có).

### Bước 3: Đăng ký kiểm tra chuyên ngành
Nếu hàng hóa thuộc danh mục phải kiểm tra chất lượng nhà nước hoặc kiểm dịch:
- Đăng ký hồ sơ trên **Cổng thông tin một cửa quốc gia (NSW - vnsw.gov.vn)** hoặc cơ quan chuyên ngành chỉ định.
- Lấy mẫu kiểm tra tại cảng hoặc đưa hàng về kho bảo quản để lấy mẫu theo quy định.

### Bước 4: Kiểm tra các chứng từ để đảm bảo tính thống nhất và chính xác
Trước khi truyền tờ khai, nhân viên chứng từ phải đối chiếu chéo:
- Tên hàng, mã HS Code (Harmonized System Code), mô tả chi tiết.
- Số lượng kiện, trọng lượng tổng (Gross Weight), trọng lượng tịnh (Net Weight), thể tích (CBM).
- Số container/seal, tên tàu, số chuyến trên Vận đơn (B/L) và Thông báo hàng đến (Arrival Notice).

### Bước 5: Khai và truyền tờ khai hải quan
Sử dụng phần mềm khai báo hải quan điện tử (ECUS5-VNACCS) kết nối chữ ký số doanh nghiệp:
- Điền đầy đủ thông tin vào các tiêu chí trên hệ thống VNACCS/VCIS.
- Kiểm tra tính toán thuế tự động và truyền tờ khai chính thức.
- Hệ thống tiếp nhận và tự động trả về kết quả phân luồng:
  - **Luồng Xanh (1):** Miễn kiểm tra hồ sơ giấy và miễn kiểm tra thực tế hàng hóa. Nộp thuế và thông quan trực tiếp.
  - **Luồng Vàng (2):** Hải quan kiểm tra chi tiết hồ sơ chứng từ giấy/điện tử.
  - **Luồng Đỏ (3):** Hải quan kiểm tra chi tiết hồ sơ và kiểm tra thực tế hàng hóa (soi chiếu hoặc kiểm thủ công).

### Bước 6: Xuất trình hồ sơ hải quan
- Đối với tờ khai **Luồng Vàng / Luồng Đỏ**, nhân viên hiện trường (OPS) in tờ khai và đính kèm bộ chứng từ xuất trình cho cán bộ hải quan tiếp nhận tại chi cục hải quan quản lý cảng/kho.
- Phối hợp với công chức hải quan kiểm hóa nếu hàng rơi vào Luồng Đỏ.

### Bước 7: Nộp thuế và hoàn tất thủ tục hải quan nhập khẩu
- Nộp thuế nhập khẩu, thuế GTGT hàng nhập khẩu và các loại lệ phí vào Kho bạc Nhà nước thông qua ngân hàng thương mại liên kết 24/7 (Cổng thanh toán điện tử hải quan).
- Sau khi tiền thuế nổi trên hệ thống, cán bộ hải quan duyệt thông quan tờ khai.

### Bước 8: Làm thủ tục đổi lệnh và chuyển hàng hoá về kho bảo quản
- In **Mã vạch tờ khai hải quan (Danh sách container/hàng hóa đủ điều kiện qua khu vực giám sát)**.
- Đổi lệnh giao hàng (D/O) tại hãng tàu hoặc đại lý forwarder, thanh toán các chi phí Local Charges, cược vỏ container.
- Xuất trình mã vạch tại cổng cảng để thanh lý hải quan giám sát.
- Điều động xe đầu kéo hoặc xe tải vào cảng nhận hàng và vận chuyển an toàn về kho của doanh nghiệp.`
  },

  // --- TIN TỨC CHUYÊN NGÀNH ---
  {
    id: 'news-item-1',
    title: "Thị trường Logistics Việt Nam dự báo tăng trưởng mạnh mẽ trong quý 4",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    link: "https://vla.com.vn",
    sourceName: "Hiệp hội Doanh nghiệp Dịch vụ Logistics Việt Nam (VLA)",
    sourceUrl: "https://vla.com.vn",
    thumbnail: STOCK_IMAGES[0],
    description: "Các chuyên gia nhận định ngành logistics sẽ có những bước tiến vượt bậc nhờ vào sự phát triển của thương mại điện tử và đầu tư hạ tầng cảng biển trọng điểm.",
    category: "news",
    isPinned: true,
    views: 1840,
    tags: ["Thị trường Logistics", "Hạ tầng cảng biển", "Cái Mép", "Lạch Huyện", "Xuất nhập khẩu"],
    relatedKeywords: ["Smart Port", "Cước tàu biển", "Chuỗi cung ứng"],
    content: `## 1. Xu hướng phát triển mạnh mẽ của chuỗi cung ứng
Ngành Logistics Việt Nam đang bước vào giai đoạn tăng tốc với hàng loạt dự án cao tốc, cụm cảng nước sâu Cái Mép - Thị Vải và cảng Lạch Huyện được nâng cấp công suất tiếp nhận tàu mẹ quốc tế.

- **Tăng trưởng kim ngạch:** Xuất khẩu sang thị trường Bắc Mỹ và EU duy trì đà phục hồi tích cực.
- **Hiện đại hóa cảng biển:** Áp dụng hệ thống Smart Port và làm thủ tục hải quan điện tử 24/7.
- **Tối ưu cước tàu:** Doanh nghiệp chủ động ký hợp đồng dịch vụ dài hạn nhằm ổn định chi phí.

## 2. Các chỉ số tăng trưởng ấn tượng
Theo báo cáo mới nhất từ Hiệp hội Doanh nghiệp Dịch vụ Logistics Việt Nam (VLA), chỉ số LPI của Việt Nam tiếp tục duy trì trong top đầu khu vực ASEAN.

## 3. Khuyến nghị cho doanh nghiệp xuất nhập khẩu
Doanh nghiệp cần nhanh chóng số hóa quy trình quản lý đơn hàng và lựa chọn các đơn vị giao nhận uy tín để đảm bảo tiến độ giao hàng đúng cam kết.`
  },
  {
    id: 'news-item-2',
    title: "Xu hướng số hóa và tự động hóa trong quản lý kho bãi hiện đại (Smart Warehousing)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    link: "https://logistics.gov.vn",
    sourceName: "Cổng Thông tin Logistics Việt Nam (Bộ Công Thương)",
    sourceUrl: "https://logistics.gov.vn",
    thumbnail: STOCK_IMAGES[2],
    description: "Công nghệ WMS và robot AGV đang thay đổi hoàn toàn phương thức vận hành kho hàng, giúp giảm thiểu sai sót và tăng tốc độ xử lý đơn hàng lên 40%.",
    category: "news",
    isPinned: false,
    views: 1250,
    tags: ["Kho bãi thông minh", "Smart Warehousing", "WMS", "Robot AGV", "Tự động hóa"],
    relatedKeywords: ["RFID", "FIFO", "Quản lý tồn kho"],
    content: `## 1. Ứng dụng công nghệ vào quản trị kho hàng
Kho bãi thông minh là chìa khóa giúp doanh nghiệp nâng cao năng lực cạnh tranh và giảm chi phí lưu kho.

1. **Hệ thống WMS (Warehouse Management System):** Giám sát vị trí pallet theo thời gian thực và quản lý hạn sử dụng FIFO/LIFO.
2. **Robot AGV (Automated Guided Vehicles):** Tự động lấy hàng và vận chuyển pallet trong nhà kho an toàn.
3. **Mã vạch QR & Công nghệ RFID:** Quét hàng tốc độ cao, loại bỏ hoàn toàn lỗi ghi chép thủ công.

## 2. Lợi ích kinh tế trực tiếp
- Tiết kiệm 30% diện tích sàn nhờ hệ thống kệ cao tầng tự động AS/RS.
- Tăng tốc độ xuất nhập hàng hóa lên gấp 3 lần so với phương pháp thủ công.`
  },
  {
    id: 'news-item-3',
    title: "Cập nhật biến động giá cước vận tải biển tuyến Châu Á - Bắc Mỹ & Châu Âu",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    link: "https://www.freightos.com",
    sourceName: "Chỉ số Cước Vận tải Quốc tế Freightos (FBX)",
    sourceUrl: "https://www.freightos.com",
    thumbnail: STOCK_IMAGES[4],
    description: "Phân tích cung cầu tải trọng tàu container trên các tuyến hàng hải huyết mạch, khuyến nghị doanh nghiệp xuất nhập khẩu lên kế hoạch booking sớm.",
    category: "news",
    isPinned: false,
    views: 2130,
    tags: ["Cước vận tải biển", "Ocean Freight", "Tuyến Á - Mỹ", "Tuyến Á - Âu", "Booking tàu"],
    relatedKeywords: ["Shipping Instruction", "Container", "Hãng tàu"],
    content: `## 1. Tình hình cung cầu tải trọng tàu biển
Trong bối cảnh hải trình vòng qua Mũi Hảo Vọng tiếp tục kéo dài thời gian xoay vòng vỏ container, giá cước spot có xu hướng dao động nhẹ theo tuần.

- Doanh nghiệp nên gửi **Shipping Instruction (SI)** và chốt chỗ trước 2-3 tuần.
- Ưu tiên chọn các hãng tàu có lịch trình ổn định và độ tin cậy đúng giờ cao.

## 2. Dự báo xu hướng cước tàu các tháng cuối năm
Nhu cầu vận chuyển phục vụ mùa mua sắm cuối năm tại thị trường Mỹ và Châu Âu dự kiến sẽ giữ giá cước ở mức ổn định cao.`
  },
  {
    id: 'news-item-4',
    title: "Quy định mới về chứng từ hải quan điện tử và kiểm dịch hàng hóa xuất nhập khẩu",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    link: "https://tongcuc.customs.gov.vn",
    sourceName: "Tổng cục Hải quan Việt Nam",
    sourceUrl: "https://tongcuc.customs.gov.vn",
    thumbnail: STOCK_IMAGES[3],
    description: "Tổng cục Hải quan hướng dẫn triển khai kiểm tra chuyên ngành tập trung qua Cổng thông tin một cửa quốc gia NSW, giảm thời gian thông quan.",
    category: "news",
    isPinned: false,
    views: 980,
    tags: ["Chứng từ điện tử", "Kiểm dịch", "Hải quan một cửa", "C/O điện tử"],
    relatedKeywords: ["VNACCS", "Thủ tục hải quan", "FTA"],
    content: `## 1. Hướng dẫn thủ tục thông quan mới
Tối ưu hóa thủ tục xuất nhập khẩu qua hệ thống dịch vụ công trực tuyến.

- Doanh nghiệp cập nhật chữ ký số và tài khoản trên Cổng một cửa quốc gia [Cổng Thông tin Một cửa Quốc gia](https://vnsw.gov.vn).
- Chuẩn bị đầy đủ C/O điện tử để hưởng thuế suất ưu đãi theo các hiệp định FTA.

## 2. Rút ngắn thời gian thông quan hàng hóa
Việc số hóa toàn diện hồ sơ chứng từ hải quan giúp cắt giảm đến 50% thời gian xử lý tại cảng biển và cửa khẩu sân bay.`
  },

  // --- KIẾN THỨC CHUYÊN NGÀNH ---
  {
    id: 'knowledge-item-1',
    title: "Quy cách & Kích thước chuẩn các loại Container (20ft, 40ft, 40HC)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    link: "https://www.iso.org",
    sourceName: "Tiêu chuẩn Quốc tế ISO 668:2020 (Freight Containers)",
    sourceUrl: "https://www.iso.org",
    thumbnail: STOCK_IMAGES[1],
    description: "Bảng tra cứu kích thước lọt lòng, thể tích chứa hàng và tải trọng chuẩn quốc tế của các loại Container phổ biến nhất trong vận tải đường biển.",
    category: "knowledge",
    isPinned: true,
    views: 3450,
    tags: ["Container", "Cont 20ft", "Cont 40ft", "Kích thước container", "Vận tải biển"],
    relatedKeywords: ["Max Gross Weight", "Payload", "CBM", "Stuffing"],
    mediaType: "iframe",
    iframeCode: '<iframe title="Shipping Container 3D" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/2f53ec9741ea4db382a939f4fe6d4b29/embed"></iframe>',
    content: `## 1. Khái niệm về Container tiêu chuẩn quốc tế
Container tiêu chuẩn ISO là công cụ vận chuyển hàng hóa cốt lõi trong chuỗi cung ứng toàn cầu. Việc nắm rõ chính xác **kích thước lọt lòng**, **chiều rộng cửa mở** và **tải trọng tối đa** giúp các chủ hàng lên kế hoạch đóng gói, xếp dỡ (stuffing/destuffing) an toàn và tối ưu chi phí cước biển.

![Cấu trúc các loại Container tiêu chuẩn đường biển](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

## 2. Các điểm cần lưu ý khi chọn Container
- **Cont 20ft DC:** Thích hợp cho hàng nặng, thể tích nhỏ như gạo, phân bón, xi măng, khoáng sản.
- **Cont 40ft DC:** Thích hợp cho hàng hóa thể tích lớn nhưng trọng lượng vừa phải như dệt may, nội thất, hạt nhựa.
- **Cont 40ft HC (High Cube):** Chiều cao vượt trội (2.698m), tối ưu chứa được nhiều kiện hàng cồng kềnh.

## 3. Bảng thông số kỹ thuật chi tiết
Dưới đây là bảng thông số chuẩn xác cho từng loại container thông dụng trong logistics:

[BANG_THONG_SO]

## 4. Lời khuyên đóng hàng an toàn
- Kiểm tra seal và tình trạng kín nước của vỏ container trước khi bốc hàng.
- Phân bổ đều trọng lượng hàng hóa trên mặt sàn cont để đảm bảo an toàn khi cẩu và vận chuyển biển.`,
    table: {
      headers: ["Chỉ tiêu kỹ thuật", "Cont 20' Thường (20'DC)", "Cont 40' Thường (40'DC)", "Cont 40' Cao (40'HC)"],
      rows: [
        ["Kích thước lọt lòng (D x R x C)", "5.898 x 2.352 x 2.393 m", "12.032 x 2.352 x 2.393 m", "12.032 x 2.352 x 2.698 m"],
        ["Kích thước cửa (Rộng x Cao)", "2.340 x 2.280 m", "2.340 x 2.280 m", "2.340 x 2.585 m"],
        ["Thể tích chứa hàng (CBM)", "33.2 m³", "67.7 m³", "76.3 m³"],
        ["Trọng lượng vỏ cont (Tare)", "2,230 kg", "3,700 kg", "3,970 kg"],
        ["Tải trọng hàng tối đa (Payload)", "28,250 kg", "26,780 kg", "26,510 kg"],
        ["Trọng lượng toàn bộ (Max Gross)", "30,480 kg", "30,480 kg", "30,480 kg"]
      ]
    }
  },
  {
    id: 'knowledge-item-2',
    title: "Bảng so sánh chi tiết các điều kiện Incoterms 2020 (EXW, FOB, CIF, DDP)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    link: "https://iccwbo.org",
    sourceName: "Phòng Thương mại Quốc tế (ICC - International Chamber of Commerce)",
    sourceUrl: "https://iccwbo.org/resources-for-business/incoterms-rules/incoterms-2020/",
    thumbnail: STOCK_IMAGES[3],
    description: "Phân định rõ ràng trách nhiệm chi phí, rủi ro chuyển giao và nghĩa vụ bảo hiểm giữa người bán và người mua theo bộ quy tắc Incoterms 2020 của ICC.",
    category: "knowledge",
    isPinned: false,
    views: 2890,
    tags: ["Incoterms 2020", "EXW", "FOB", "CIF", "DDP", "Thương mại quốc tế"],
    relatedKeywords: ["Chuyển giao rủi ro", "Bảo hiểm hàng hóa", "Thủ tục hải quan"],
    content: `## 1. Phân định trách nhiệm và rủi ro trong Incoterms 2020
Incoterms (International Commercial Terms) xác định chính xác thời điểm chuyển giao rủi ro mất mát hàng hóa từ người bán sang người mua.

[BANG_THONG_SO]

## 2. Những lưu ý quan trọng khi áp dụng
- Incoterms chỉ quy định về nghĩa vụ giao nhận hàng, rủi ro và chi phí; không điều chỉnh quyền sở hữu hàng hóa.
- Hãy luôn ghi rõ địa điểm kèm theo điều kiện, ví dụ: **FOB Cat Lai Port, Incoterms 2020**.`,
    table: {
      headers: ["Điều kiện", "Điểm chuyển giao rủi ro", "Cước vận tải chính (Ocean Freight)", "Bảo hiểm hàng hóa", "Thủ tục hải quan nhập khẩu"],
      rows: [
        ["EXW", "Tại xưởng người bán", "Người mua trả", "Người mua tùy chọn", "Người mua làm & đóng thuế"],
        ["FOB", "Khi hàng lên tàu tại cảng đi", "Người mua trả", "Người mua tùy chọn", "Người mua làm & đóng thuế"],
        ["CIF", "Khi hàng lên tàu tại cảng đi", "Người bán trả", "Người bán mua (Loại C)", "Người mua làm & đóng thuế"],
        ["DDP", "Tại kho người mua", "Người bán trả", "Người bán mua", "Người bán làm & đóng thuế"]
      ]
    }
  }
];

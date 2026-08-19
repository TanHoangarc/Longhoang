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
}

export const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494412574643-35d324688b08?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
];

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
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
    content: `## Xu hướng phát triển mạnh mẽ của chuỗi cung ứng
Ngành Logistics Việt Nam đang bước vào giai đoạn tăng tốc với hàng loạt dự án cao tốc, cụm cảng nước sâu Cái Mép - Thị Vải và cảng Lạch Huyện được nâng cấp công suất tiếp nhận tàu mẹ quốc tế.

- **Tăng trưởng kim ngạch:** Xuất khẩu sang thị trường Bắc Mỹ và EU duy trì đà phục hồi tích cực.
- **Hiện đại hóa cảng biển:** Áp dụng hệ thống Smart Port và làm thủ tục hải quan điện tử 24/7.
- **Tối ưu cước tàu:** Doanh nghiệp chủ động ký hợp đồng dịch vụ dài hạn nhằm ổn định chi phí.

Tham khảo thêm thông tin quy hoạch tại [Cục Hàng hải Việt Nam](https://vinamarine.gov.vn) để nắm bắt tiến độ nâng cấp hạ tầng các luồng hàng hải quốc gia.`
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
    content: `## Ứng dụng công nghệ vào quản trị kho hàng
Kho bãi thông minh là chìa khóa giúp doanh nghiệp nâng cao năng lực cạnh tranh và giảm chi phí lưu kho.

1. **Hệ thống WMS:** Giám sát vị trí pallet theo thời gian thực và quản lý hạn sử dụng FIFO/LIFO.
2. **Robot AGV:** Tự động lấy hàng và vận chuyển pallet trong nhà kho.
3. **Mã vạch QR/RFID:** Quét hàng tốc độ cao, loại bỏ lỗi ghi chép thủ công.`
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
    content: `## Tình hình cung cầu tải trọng tàu biển
Trong bối cảnh hải trình vòng qua Mũi Hảo Vọng tiếp tục kéo dài thời gian xoay vòng vỏ container, giá cước spot có xu hướng dao động nhẹ theo tuần.

- Doanh nghiệp nên gửi **Shipping Instruction (SI)** và chốt chỗ trước 2-3 tuần.
- Ưu tiên chọn các hãng tàu có lịch trình ổn định và độ tin cậy đúng giờ cao.`
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
    content: `## Hướng dẫn thủ tục thông quan mới
Tối ưu hóa thủ tục xuất nhập khẩu qua hệ thống dịch vụ công trực tuyến.

- Doanh nghiệp cập nhật chữ ký số và tài khoản trên Cổng một cửa quốc gia [Cổng Thông tin Một cửa Quốc gia](https://vnsw.gov.vn).
- Chuẩn bị đầy đủ C/O điện tử để hưởng thuế suất ưu đãi theo các hiệp định FTA.`
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
    content: `## Phân định trách nhiệm và rủi ro trong Incoterms 2020
Incoterms (International Commercial Terms) xác định chính xác thời điểm chuyển giao rủi ro mất mát hàng hóa từ người bán sang người mua.

[BANG_THONG_SO]

### Những lưu ý quan trọng:
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
  },
  {
    id: 'knowledge-item-3',
    title: "Quy trình 6 bước thông quan hàng nhập khẩu nguyên container (FCL)",
    pubDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    link: "https://customs.gov.vn",
    sourceName: "Cục Hải quan TP. Hồ Chí Minh & Hải Phòng",
    sourceUrl: "https://haiquan.hochiminhcity.gov.vn",
    thumbnail: STOCK_IMAGES[0],
    description: "Hướng dẫn thực chiến từ nhận Thông báo hàng đến (Arrival Notice), lấy D/O, truyền tờ khai VNACCS đến thanh lý hải quan và kéo cont về kho.",
    category: "knowledge",
    isPinned: false,
    views: 1620,
    content: `## Quy trình thông quan FCL từng bước
1. **Bước 1: Nhận Arrival Notice:** Kiểm tra ngày tàu cập và hãng tàu chỉ định.
2. **Bước 2: Lấy lệnh giao hàng (D/O):** Nộp cước local charges và tiền cược vỏ container.
3. **Bước 3: Lên tờ khai hải quan:** Nhập dữ liệu phần mềm ECUS5-VNACCS.
4. **Bước 4: Phân luồng tờ khai (Xanh / Vàng / Đỏ):** Nộp thuế và kiểm tra chứng từ/kiểm hóa.
5. **Bước 5: In mã vạch & thanh lý giám sát:** Trình hải quan cổng cảng.
6. **Bước 6: Kéo vỏ cont về kho dỡ hàng và trả vỏ:** Kiểm tra tình trạng vỏ cont tránh phát sinh phí sửa chữa.`
  }
];

import { SlideData, ServiceItem, CoreValue, Office, Partner, NewsArticle, JobOpening } from '../types';

export const HERO_SLIDES: SlideData[] = [
  {
    id: 1,
    titleTop: 'VẬN TẢI',
    titleMain: 'ĐA PHƯƠNG THỨC',
    description: 'Kết hợp linh hoạt các hình thức vận chuyển để rút ngắn thời gian, tiết kiệm chi phí',
    image: 'https://plus.unsplash.com/premium_photo-1661932036915-4fd90bec6e8a?w=1920&auto=format&fit=crop&q=80', // Vận tải đa phương thức
  },
  {
    id: 2,
    titleTop: 'VẬN TẢI',
    titleMain: 'HÀNG KHÔNG',
    description: 'Tần suất bay cao, tải trọng lớn, bay đến hầu hết mọi nơi trên thế giới',
    image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1920&auto=format&fit=crop&q=80', // Vận tải hàng không
  },
  {
    id: 3,
    titleTop: 'VẬN TẢI',
    titleMain: 'HÀNG HẢI',
    description: 'Hệ thống đại lý nước ngoài lành mạnh, lịch tàu ổn định hằng tuần',
    image: 'https://images.unsplash.com/photo-1670121180583-39ab653a071c?w=1920&auto=format&fit=crop&q=80', // Vận tải hàng hải
  },
  {
    id: 4,
    titleTop: 'VẬN TẢI',
    titleMain: 'NỘI ĐỊA',
    description: 'Mạng lưới vận chuyển phủ khắp 63 tỉnh thành, kết nối nhanh chóng và an toàn tuyệt đối',
    image: 'https://plus.unsplash.com/premium_photo-1733342421852-3bce709563e4?w=1920&auto=format&fit=crop&q=80', // Vận tải nội địa
  },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'multimodal',
    category: 'Vận tải quốc tế',
    title: 'VẬN TẢI ĐA PHƯƠNG THỨC',
    description: 'Kết hợp linh hoạt các hình thức vận chuyển để rút ngắn thời gian, tiết kiệm chi phí.',
    iconName: 'signpost',
    bannerImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Mô hình Sea-Air: Kết hợp đường biển và hàng không để cân bằng chi phí và thời gian giao hàng',
      'Mô hình Sea-Land: Vận tải biển kết hợp vận tải đường bộ xuyên biên giới',
      'Một hợp đồng vận tải đơn lẻ (Through Bill of Lading) chịu trách nhiệm toàn diện',
      'Giám sát hành trình liên tục với hệ thống tracking hiện đại',
      'Tối ưu hóa chi phí bốc dỡ và chuyển cảng trung chuyển',
      'Thủ tục chuyển khẩu, quá cảnh hàng hóa nhanh chóng'
    ],
    details: {
      overview: 'Long Hoàng Logistics cung cấp giải pháp vận tải kết hợp đường biển, đường hàng không, đường bộ và đường sắt, đem lại chuỗi logistics liền mạch door-to-door theo đúng tiêu chuẩn FIATA.',
      advantages: [
        'Tối ưu hóa thời gian vận chuyển và giảm thiểu chi phí trung gian',
        'Một đầu mối liên hệ duy nhất chịu trách nhiệm xuyên suốt hành trình',
        'Bảo hiểm hàng hóa toàn diện và giám sát lộ trình 24/7',
        'Xử lý nhanh chóng các thủ tục hải quan chuyển cảng'
      ],
      routes: ['Việt Nam - Bắc Mỹ', 'Việt Nam - Châu Âu (Sea-Air qua Dubai/Singapore)', 'Việt Nam - Trung Quốc - Trung Á (Đường sắt)', 'Nội Á đa phương thức']
    }
  },
  {
    id: 'cross-border',
    category: 'Vận tải quốc tế',
    title: 'VẬN TẢI CROSS-BORDER',
    description: 'Vận tải đường bộ qua các nước Lào, Campuchia, Thái Lan, Myanmar, Trung Quốc.',
    iconName: 'clock',
    bannerImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Vận chuyển đường bộ liên vận quốc tế Việt Nam - Lào - Campuchia - Thái Lan - Trung Quốc',
      'Thủ tục thông quan tại các cửa khẩu quốc tế: Hữu Nghị, Mộc Bài, Lao Bảo, Bờ Y, Cha Lo...',
      'Đội xe tải sàn, xe đầu kéo container và xe rơ-moóc chuyên dụng',
      'Dịch vụ chuyển tiếp hàng hóa và lưu kho ngoại quan khu vực biên giới',
      'Bảo hiểm vận chuyển xuyên biên giới và hỗ trợ giấy phép liên vận'
    ],
    details: {
      overview: 'Long Hoàng Logistics cung cấp dịch vụ vận chuyển hàng hóa đường bộ xuyên biên giới với đội xe chuyên dụng qua các cửa khẩu quốc tế trọng điểm, thủ tục nhanh chóng.',
      advantages: [
        'Thông quan nhanh gọn tại tất cả các cửa khẩu quốc tế',
        'Đội xe container, xe mooc sàn, xe tải lạnh hiện đại',
        'Giấy phép vận tải liên vận quốc tế đầy đủ',
        'Bảo quản hàng hóa chuyên nghiệp và theo dõi GPS trực tiếp'
      ],
      routes: ['Cửa khẩu Hữu Nghị - Bằng Tường', 'Cửa khẩu Mộc Bài - Bavet', 'Cửa khẩu Lao Bảo - Savannakhet', 'Cửa khẩu Bờ Y - Attapeu']
    }
  },
  {
    id: 'air-freight',
    category: 'Vận tải quốc tế',
    title: 'VẬN TẢI HÀNG KHÔNG',
    description: 'Tần suất bay cao, tải trọng lớn, bay đến hầu hết mọi nơi trên thế giới.',
    iconName: 'check',
    bannerImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Dịch vụ bay thẳng (Direct Flight) và bay chuyển tải (Transit) linh hoạt',
      'Xử lý chuyên nghiệp hàng chuyển phát nhanh, hàng mẫu, hàng linh kiện điện tử',
      'Dịch vụ hàng nguy hiểm (DG), hàng tươi sống (PER), dược phẩm y tế (COL)',
      'Hợp đồng đại lý cấp 1 với các hãng hàng không hàng đầu (Vietnam Airlines, Singapore Airlines, Qatar Airways, Emirates, Cathay Pacific...)',
      'Dịch vụ giao nhận Door-to-Door trọn gói từ kho người gửi đến kho người nhận',
      'Khai báo hải quan sân bay Nội Bài, Tân Sơn Nhất, Đà Nẵng siêu tốc'
    ],
    details: {
      overview: 'Long Hoàng Logistics mang đến giải pháp vận tải hàng không tối ưu thời gian với mạng lưới chuyến bay dày đặc, đảm bảo hàng hóa được giao đúng hẹn với độ an toàn cao nhất.',
      advantages: [
        'Thời gian vận chuyển nhanh nhất, an toàn tối đa cho hàng giá trị cao',
        'Xử lý hàng nguy hiểm (DG), hàng tươi sống (PER), dược phẩm (COL)',
        'Dịch vụ bay thẳng (Direct) và chuyển tải linh hoạt',
        'Dịch vụ giao nhận tận nơi Door-to-Door toàn cầu'
      ],
      routes: ['Sân bay TSN/Nội Bài - Mỹ (LAX, JFK, ORD)', 'Việt Nam - Châu Âu (FRA, CDG, LHR)', 'Việt Nam - Đông Á (NRT, ICN, PVG)', 'Việt Nam - Đông Nam Á (SIN, BKK, KUL)']
    }
  },
  {
    id: 'sea-freight',
    category: 'Vận tải quốc tế',
    title: 'VẬN TẢI ĐƯỜNG BIỂN',
    description: 'Hệ thống quản lý nước ngoài lành mạnh, lịch tàu ổn định hằng tuần.',
    iconName: 'ship',
    bannerImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Vận chuyển hàng nguyên container FCL (20GP, 40GP, 40HQ, 45HQ, Flat Rack, Open Top)',
      'Dịch vụ gom hàng lẻ LCL hàng tuần trực tiếp đến các cảng chính',
      'Hợp đồng cước biển cạnh tranh với các hãng tàu lớn (Maersk, MSC, CMA CGM, COSCO, ONE, Evergreen, Yang Ming)',
      'Vận chuyển hàng rời (Break Bulk) và hàng siêu trường, siêu trọng (OOG)',
      'Bảo hiểm hàng hải toàn diện và theo dõi hành trình tàu container 24/7',
      'Hỗ trợ thủ tục giải phóng hàng (D/O) và thông quan cảng đến'
    ],
    details: {
      overview: 'Long Hoàng Logistics cung cấp dịch vụ vận tải đường biển quốc tế toàn diện, liên kết trực tiếp với các hãng tàu lớn nhất thế giới để đảm bảo giá cước cạnh tranh và không gian chỗ (space) ổn định kể cả vào mùa cao điểm.',
      advantages: [
        'Hợp đồng cước biển cạnh tranh trực tiếp với các hãng tàu lớn',
        'Lịch trình tàu cố định hàng tuần, đảm bảo chỗ kể cả mùa cao điểm',
        'Hệ thống đại lý rộng khắp hơn 120 quốc gia trên thế giới',
        'Dịch vụ gom hàng lẻ LCL trực tiếp đến các cảng chính'
      ],
      routes: ['Cảng Hải Phòng/Cát Lái/Cái Mép - Bờ Tây & Bờ Đông Mỹ', 'Việt Nam - Châu Âu (Rotterdam, Hamburg, Antwerp)', 'Việt Nam - Nhật Bản, Hàn Quốc, Trung Quốc', 'Việt Nam - Trung Đông & Ấn Độ']
    }
  },
  {
    id: 'inland-trucking',
    category: 'Vận tải nội địa',
    title: 'VẬN TẢI NỘI ĐỊA',
    description: 'Hệ thống đối tác sở hữu số lượng lớn các loại xe, phục vụ mọi yêu cầu đa dạng của khách hàng.',
    iconName: 'grid',
    bannerImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Vận chuyển hàng nguyên chuyến (FTL) và hàng ghép lẻ (LTL) toàn quốc',
      'Đội ngũ xe container (20ft, 40ft), xe tải thùng kín, bạt từ 1.5 đến 30 tấn',
      'Tuyến vận chuyển Bắc - Trung - Nam chạy liên tục mỗi ngày',
      'Vận chuyển hàng dự án, hàng máy móc công trình siêu trường siêu trọng',
      'Định vị GPS 100% phương tiện, kiểm soát lộ trình và thời gian thực',
      'Giao nhận tận nơi theo yêu cầu của từng nhà máy, kho bãi và công trình'
    ],
    details: {
      overview: 'Mạng lưới xe tải, xe container của Long Hoàng Logistics phủ khắp 3 miền Bắc - Trung - Nam, kết nối các khu công nghiệp, cảng biển và trung tâm logistics trọng điểm.',
      advantages: [
        'Hơn 150 xe đầu kéo và xe tải đa tải trọng từ 1.5 tấn đến 30 tấn',
        'Hệ thống định vị GPS quản lý theo thời gian thực',
        'Đội ngũ tài xế giàu kinh nghiệm, chuyên nghiệp, đúng hẹn',
        'Cung ứng xe nhanh chóng trong vòng 2 giờ tại các trung tâm lớn'
      ],
      routes: ['Hải Phòng - Hà Nội - Các KCN Bắc Bộ', 'Đà Nẵng - Miền Trung & Tây Nguyên', 'TP.HCM - Bình Dương - Đồng Nai - BRVT', 'Tuyến trục Bắc - Nam']
    }
  },
  {
    id: 'value-added',
    category: 'Logistics bổ trợ',
    title: 'DỊCH VỤ LOGISTIC BỔ TRỢ',
    description: 'Kho bãi, đóng gói, dán nhãn, phân phối, khai thuê hải quan,..',
    iconName: 'send',
    bannerImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Khai thuê Hải quan và thông quan hàng hóa điện tử (VNACCS/VCIS)',
      'Tư vấn và thực hiện thủ tục xuất nhập khẩu, tra cứu biểu thuế và mã HS code',
      'Gom hàng lẻ xuất khẩu và chia hàng lẻ nhập khẩu qua kho CFS',
      'Đóng gói, dán nhãn bao bì, đóng kiện các loại hàng hóa tiêu chuẩn quốc tế',
      'Cho thuê kho bãi tiêu chuẩn, kho ngoại quan, kho lạnh hiện đại',
      'Chứng nhận xuất xứ cho hàng hóa (C/O các form A, B, D, E, AK, AJ, EUR.1, CPTPP...)',
      'Mua bảo hiểm, hun trùng, kiểm dịch thực vật, kiểm tra chất lượng nhà nước'
    ],
    details: {
      overview: 'Long Hoàng Logistics cung cấp đầy đủ các dịch vụ logistics bổ trợ theo nhu cầu của từng khách hàng và đặc thù của từng lô hàng với mức giá cả hợp lý.',
      advantages: [
        'Đại lý hải quan điện tử uy tín, tỷ lệ luồng xanh/vàng cao',
        'Hệ thống kho bãi tiêu chuẩn, kho CFS, kho ngoại quan hiện đại',
        'Đóng pallet, dán tem nhãn phụ, kiểm đếm hàng hóa chuyên nghiệp',
        'Tư vấn mã HS code, giấy chứng nhận xuất xứ (C/O form A, B, D, E, AK, AJ, EUR.1...)'
      ],
      routes: ['Khai báo hải quan tại tất cả các chi cục cảng & sân bay', 'Hệ thống kho tại Hải Phòng, Đà Nẵng, TP.HCM, Bình Dương']
    }
  },
  {
    id: 'customs-broker',
    category: 'Logistics bổ trợ',
    title: 'Dịch vụ khai báo hải quan của Long Hoàng Logistics',
    description: 'Dịch vụ đại lý khai thuê hải quan trọn gói, thủ tục nhanh gọn, tối ưu chi phí và hạn chế rủi ro.',
    iconName: 'send',
    bannerImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Khai báo hải quan điện tử cho hàng kinh doanh, gia công, sản xuất xuất khẩu, tạm nhập tái xuất',
      'Áp mã HS code chính xác giúp doanh nghiệp hưởng mức thuế suất ưu đãi tốt nhất',
      'Kiểm hóa, làm thủ tục hải quan tại tất cả các chi cục',
      'Dịch vụ xin giấy phép chuyên ngành (kiểm tra an toàn thực phẩm, kiểm dịch động/thực vật, kiểm tra hiệu suất năng lượng)',
      'Hỗ trợ doanh nghiệp tham vấn giá, kiểm tra sau thông quan'
    ],
    details: {
      overview: 'Đội ngũ chuyên viên chứng chỉ hải quan của Long Hoàng Logistics xử lý thủ tục thông quan hàng hóa nhanh chóng, chính xác và tuân thủ tuyệt đối quy định pháp luật.',
      advantages: [
        'Thông quan nhanh trong ngày với các tờ khai luồng vàng, luồng xanh',
        'Tư vấn chính sách mặt hàng và kiểm tra chuyên ngành miễn phí',
        'Chi phí dịch vụ minh bạch, không phát sinh phụ phí',
        'Bảo mật thông tin thương mại khách hàng tuyệt đối'
      ],
      routes: ['Cảng Cát Lái, VICT, SP-ITC, Cái Mép', 'Cảng Hải Phòng (Tân Vũ, Đình Vũ, Lạch Huyện)', 'Sân bay Tân Sơn Nhất, Nội Bài, Đà Nẵng', 'Các chi cục Hải quan ICD và KCN toàn quốc']
    }
  },
  {
    id: 'bonded-warehouse',
    category: 'Logistics bổ trợ',
    title: 'Dịch vụ cho thuê Kho ngoại quan Cửa khẩu quốc tế Bờ Y',
    description: 'Hệ thống kho ngoại quan đạt chuẩn quốc tế tại vị trí chiến lược ngã ba Đông Dương.',
    iconName: 'send',
    bannerImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Vị trí chiến lược tại Cửa khẩu quốc tế Bờ Y kết nối tam giác phát triển Việt Nam - Lào - Campuchia',
      'Lưu trữ hàng hóa chờ làm thủ tục xuất khẩu hoặc nhập khẩu vào Việt Nam',
      'Dịch vụ sang tải, phân loại, đóng gói lại và dán nhãn hàng hóa trong kho',
      'Hệ thống camera an ninh giám sát 24/7, phòng cháy chữa cháy tự động đạt chuẩn',
      'Thủ tục đưa hàng vào và đưa hàng ra kho ngoại quan nhanh gọn, đúng pháp luật'
    ],
    details: {
      overview: 'Kho ngoại quan tại Cửa khẩu quốc tế Bờ Y của Long Hoàng Logistics là điểm trung chuyển lý tưởng cho các doanh nghiệp xuất nhập khẩu sang thị trường Nam Lào và Đông Bắc Campuchia.',
      advantages: [
        'Tiết kiệm chi phí lưu bãi và tạm hoãn nộp thuế nhập khẩu',
        'Vị trí giao thương đắc địa ngã ba biên giới',
        'Quy trình quản lý hàng hóa bằng phần mềm WMS hiện đại',
        'Đội ngũ bốc xếp chuyên nghiệp, xe nâng tải trọng cao'
      ],
      routes: ['Tuyến Bờ Y - Kon Tum - Đà Nẵng/Quy Nhơn', 'Tuyến Bờ Y - Attapeu - Champasak (Lào)', 'Tuyến Bờ Y - Ratanakiri (Campuchia)']
    }
  },
  {
    id: 'lcl-consolidation',
    category: 'Vận tải quốc tế',
    title: 'Dịch vụ gom hàng lẻ LCL vận chuyển đường biển',
    description: 'Giải pháp tối ưu cho các lô hàng có khối lượng nhỏ, tiết kiệm chi phí tối đa.',
    iconName: 'ship',
    bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Gom hàng lẻ (LCL) đi trực tiếp (Direct) đến hơn 80 cảng biển lớn trên toàn cầu',
      'Tách hàng và đóng container chuyên nghiệp tại các kho CFS chính',
      'Lịch đóng hàng và khởi hành cố định hàng tuần',
      'Báo giá trọn gói minh bạch, không phụ phí phát sinh tại cảng đích',
      'Theo dõi trạng thái từng kiện hàng (Carton/Pallet) qua hệ thống mã vạch'
    ],
    details: {
      overview: 'Dịch vụ gom hàng lẻ LCL của Long Hoàng Logistics giúp các doanh nghiệp vừa và nhỏ dễ dàng xuất khẩu hàng hóa đi khắp năm châu với mức chi phí tối ưu nhất.',
      advantages: [
        'Lịch gom hàng đều đặn hàng tuần, không để khách hàng chờ đợi',
        'Hợp tác chặt chẽ với các kho CFS lớn nhất tại Việt Nam',
        'Dịch vụ giao hàng tận nơi Door to Door cho hàng lẻ',
        'Bảo hiểm và cam kết hạn chế tối đa đổ vỡ, hư hỏng'
      ],
      routes: ['Hải Phòng/HCM - Singapore, Hong Kong, Busan, Tokyo', 'Hải Phòng/HCM - Los Angeles, New York, Long Beach', 'Hải Phòng/HCM - Rotterdam, Hamburg, Southampton']
    }
  },
  {
    id: 'co-certification',
    category: 'Logistics bổ trợ',
    title: 'Dịch vụ xin cấp C/O – Làm giấy chứng nhận xuất xứ hàng hóa',
    description: 'Tư vấn tiêu chí xuất xứ và hoàn thiện hồ sơ xin cấp C/O nhanh chóng, hợp lệ.',
    iconName: 'send',
    bannerImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Tư vấn xác định tiêu chí xuất xứ hàng hóa (CTC, RVC, De Minimis...)',
      'Kê khai hồ sơ điện tử trên hệ thống eCoSys (Bộ Công Thương) và VCCI',
      'Làm chứng nhận xuất xứ các form: Form A, B, D (ASEAN), E (Trung Quốc), AK/VK (Hàn Quốc), AJ/VJ (Nhật Bản), EUR.1 (EU), CPTPP, RCEP...',
      'Xử lý hồ sơ khó, hồ sơ cần cấp trong ngày cho các lô hàng gấp',
      'Tư vấn phòng ngừa các rủi ro bị bác C/O tại nước nhập khẩu'
    ],
    details: {
      overview: 'Hỗ trợ doanh nghiệp tận dụng tối đa các hiệp định thương mại tự do (FTA) để hưởng thuế suất ưu đãi 0%, nâng cao sức cạnh tranh của hàng Việt Nam trên thị trường quốc tế.',
      advantages: [
        'Tỷ lệ hồ sơ được duyệt thành công đạt 99.8%',
        'Thời gian xử lý nhanh từ 1 - 2 ngày làm việc',
        'Đội ngũ chuyên gia trên 15 năm kinh nghiệm về quy tắc xuất xứ',
        'Hỗ trợ giải trình và xác minh sau thông quan'
      ],
      routes: ['Cấp bởi VCCI trên toàn quốc', 'Cấp bởi các Phòng Quản lý Xuất nhập khẩu khu vực (Bộ Công Thương)']
    }
  },
  {
    id: 'door-to-door',
    category: 'Vận tải quốc tế',
    title: 'Vận chuyển Door to Door trong xuất nhập khẩu',
    description: 'Dịch vụ trọn gói từ địa chỉ người gửi đến địa chỉ người nhận, không lo thủ tục trung gian.',
    iconName: 'signpost',
    bannerImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Nhận hàng trực tiếp tại nhà máy, kho xưởng của người bán ở nước ngoài',
      'Làm toàn bộ thủ tục xuất khẩu, vận chuyển quốc tế và mua bảo hiểm hàng hóa',
      'Thông quan nhập khẩu tại cảng/sân bay Việt Nam và đóng các loại thuế liên quan',
      'Vận chuyển chặng cuối giao tận kho của người mua đúng hẹn',
      'Báo giá trọn gói 1 lần All-in, kiểm soát chi phí tuyệt đối cho khách hàng'
    ],
    details: {
      overview: 'Khách hàng chỉ cần cung cấp thông tin hàng hóa, Long Hoàng Logistics sẽ đảm nhận toàn bộ quy trình vận chuyển đa phương thức và thủ tục pháp lý từ A đến Z.',
      advantages: [
        'Tiết kiệm tối đa thời gian và nhân lực cho doanh nghiệp',
        'Kiểm soát rủi ro và trách nhiệm tập trung vào một nhà cung cấp duy nhất',
        'Mạng lưới đại lý toàn cầu hỗ trợ giao nhận tận nơi tại 120+ quốc gia',
        'Cập nhật tiến độ hàng ngày cho khách hàng'
      ],
      routes: ['Trung Quốc, Hàn Quốc, Nhật Bản, Đài Loan - Việt Nam', 'Mỹ, Canada - Việt Nam', 'Các nước Châu Âu (EU) - Việt Nam', 'Đông Nam Á (ASEAN) - Việt Nam']
    }
  },
  {
    id: 'coconut-fiber-export',
    category: 'Logistics bổ trợ',
    title: 'Thủ tục xuất khẩu chỉ xơ dừa – Long Hoàng Logistics',
    description: 'Chuyên môn sâu về quy trình kiểm dịch, hun trùng và đóng container xuất khẩu chỉ xơ dừa.',
    iconName: 'send',
    bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Tư vấn quy chuẩn đóng kiện chỉ xơ dừa, mùn dừa xuất khẩu',
      'Làm thủ tục kiểm dịch thực vật (Phytosanitary Certificate)',
      'Thực hiện hun trùng hàng hóa (Fumigation Certificate) đạt chuẩn thị trường nhập khẩu',
      'Book container và bố trí tàu chuyên tuyến xuất khẩu sang Trung Quốc, Hàn Quốc, Nhật Bản',
      'Khai hải quan xuất khẩu nhanh gọn, giải phóng hàng kịp chuyến tàu'
    ],
    details: {
      overview: 'Với kinh nghiệm thực tiễn nhiều năm phục vụ các doanh nghiệp xuất khẩu nông sản và sản phẩm từ dừa tại Bến Tre, Tiền Giang, Bình Định, Long Hoàng Logistics cam kết thủ tục xuất khẩu chỉ xơ dừa trơn tru nhất.',
      advantages: [
        'Am hiểu chi tiết yêu cầu kỹ thuật của thị trường Trung Quốc, Hàn Quốc',
        'Giá cước vận tải biển ưu đãi cho mặt hàng nông nghiệp',
        'Hỗ trợ xin chứng nhận kiểm dịch và hun trùng nhanh chóng',
        'Xử lý chứng từ xuất khẩu đầy đủ, chuẩn xác'
      ],
      routes: ['Cảng Cát Lái/Quy Nhơn - Thanh Đảo, Ninh Ba, Thượng Hải', 'Cảng Cát Lái - Busan, Incheon', 'Cảng Cát Lái - Tokyo, Osaka']
    }
  },
  {
    id: 'danang-distribution',
    category: 'Vận tải nội địa',
    title: 'Dịch vụ vận chuyển hàng hóa Đà Nẵng đi các khắp tỉnh thành phố',
    description: 'Trung tâm vận tải kết nối miền Trung đến mọi miền đất nước an toàn và nhanh chóng.',
    iconName: 'grid',
    bannerImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop',
    bullets: [
      'Vận chuyển hàng hóa từ Đà Nẵng đi Hà Nội và các tỉnh phía Bắc',
      'Vận chuyển hàng hóa từ Đà Nẵng đi TP.HCM và các tỉnh phía Nam',
      'Kết nối Đà Nẵng với các tỉnh Tây Nguyên (Gia Lai, Đắk Lắk, Kon Tum, Lâm Đồng)',
      'Giao hàng phân phối nội thành Đà Nẵng và các KCN lân cận (Hòa Khánh, Điện Nam - Điện Ngọc)',
      'Đa dạng xe tải thùng, xe bạt, xe cẩu tự hành phục vụ giao nhận tận nơi'
    ],
    details: {
      overview: 'Với trụ sở chính và đội xe hùng hậu tại Đà Nẵng, Long Hoàng Logistics là đối tác vận tải tin cậy số 1 cho các doanh nghiệp sản xuất và thương mại tại miền Trung.',
      advantages: [
        'Tần suất chuyến chạy hàng ngày, không dồn ứ hàng hóa',
        'Kho bãi trung chuyển rộng rãi ngay tại trung tâm Đà Nẵng',
        'Giá cước cạnh tranh nhất khu vực miền Trung',
        'Giao nhận an toàn, cam kết bồi thường 100% nếu xảy ra hư hỏng'
      ],
      routes: ['Đà Nẵng - Hà Nội & Miền Bắc (24 - 36h)', 'Đà Nẵng - TP.HCM & Miền Nam (24 - 36h)', 'Đà Nẵng - Tây Nguyên (12 - 24h)']
    }
  }
];

export const CORE_VALUES: CoreValue[] = [
  {
    id: 'val-1',
    title: 'CHUYÊN NGHIỆP',
    shortDesc: 'Đội ngũ chuyên môn cao với gần 20 năm kinh nghiệm thực chiến.',
    fullDesc: 'Long Hoàng quy tụ đội ngũ chuyên gia am hiểu sâu sắc luật ngoại thương, biểu thuế, quy trình hải quan và đặc thù của từng tuyến vận tải quốc tế. Mọi nghiệp vụ đều được chuẩn hóa theo tiêu chuẩn quốc tế ISO 9001:2015.',
    icon: 'thumbs-up'
  },
  {
    id: 'val-2',
    title: 'CHÍNH TRỰC',
    shortDesc: 'Minh bạch trong mọi cam kết, báo giá và tiến độ giao hàng.',
    fullDesc: 'Chúng tôi xây dựng niềm tin bền vững bằng sự minh bạch tuyệt đối về chi phí, không phụ phí ẩn, cam kết lịch trình chính xác và luôn chịu trách nhiệm đến cùng đối với sự an toàn của lô hàng.',
    icon: 'star'
  },
  {
    id: 'val-3',
    title: 'CHIA SẺ',
    shortDesc: 'Đồng hành cùng khách hàng tối ưu hóa chi phí chuỗi cung ứng.',
    fullDesc: 'Long Hoàng xem khách hàng là đối tác chiến lược. Chúng tôi luôn chủ động phân tích, tư vấn giải pháp logistics tối ưu nhất, giúp doanh nghiệp tiết kiệm từ 15% - 25% chi phí vận hành và nâng cao năng lực cạnh tranh.',
    icon: 'refresh'
  },
  {
    id: 'val-4',
    title: 'TẬN TÂM',
    shortDesc: 'Phục vụ 24/7/365 với tinh thần trách nhiệm cao nhất.',
    fullDesc: 'Đúng như khẩu hiệu "Blue sea never sleeps", đội ngũ hỗ trợ của Long Hoàng luôn túc trực ngày đêm, sẵn sàng giải quyết phát sinh kịp thời, theo dõi đơn hàng từng phút và cập nhật liên tục cho khách hàng.',
    icon: 'heart'
  }
];

export const COMPANY_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/longhoanglogistics/',
  youtube: 'https://www.youtube.com/@longhoanglogistics8023',
  zalo: 'https://zalo.me/0867141877',
  zaloPhone: '0867141877',
  hotlineHcm: '028 7303 2677',
  hotlineHph: '028 7302 7689',
};

export const OFFICES_LIST: Office[] = [
  {
    id: 'off-hcm',
    name: 'Chi nhánh HCM (Headoffice)',
    address: '132-134 Nguyễn Gia Trí, P. Thạnh Mỹ Tây, Tp.HCM',
    phone: '028 7303 2677',
    email: 'hcm@longhoang.vn',
    region: 'Nam'
  },
  {
    id: 'off-haiphong',
    name: 'Chi nhánh HPH',
    address: 'Floor 3A, Plot No. 17, Area B1 - Lot 7B Le Hong Phong Street, Dong Khe Ward, Gia Vien District, Viet Nam',
    phone: '028 7302 7689',
    email: 'hph@longhoang.vn',
    region: 'Bắc'
  }
];

export const PARTNERS_LIST: Partner[] = [
  { id: 'p-1', name: 'VLA', subtitle: 'Hiệp hội Logistics VN', logoType: 'vla' },
  { id: 'p-2', name: 'VCCI', subtitle: 'Liên đoàn Thương mại & CN VN', logoType: 'vcci' },
  { id: 'p-3', name: 'JC TRANS', subtitle: 'Global Logistics Network', logoType: 'jctrans' },
  { id: 'p-4', name: 'PROJECT CARGO NETWORK', subtitle: 'Project Freight Specialist', logoType: 'pcn' },
  { id: 'p-5', name: 'WIFFA / MIFFA', subtitle: 'International Freight Alliance', logoType: 'wiffa' },
  { id: 'p-6', name: 'FIATA', subtitle: 'Freight Forwarders Federation', logoType: 'fiata' },
  { id: 'p-7', name: 'IATA', subtitle: 'International Air Transport', logoType: 'iata' },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'lh-race-2026',
    title: 'LONG HOÀNG RACE 2026 - KEEP RUNNING: THỬ THÁCH BỨC PHÁ NĂNG LƯỢNG VƯƠN XA',
    category: 'Tin tức công ty',
    type: 'company-news',
    date: '06/04/2026',
    day: '06',
    month: 'Apr',
    summary: 'LONG HOÀNG RACE 2026 đánh dấu mùa giải thể thao thường niên nhằm xây dựng môi trường làm việc năng động, tích cực và gắn kết toàn thể cán bộ nhân viên cùng đối tác.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'LONG HOÀNG RACE 2026 đánh dấu mùa giải thứ 3 do Long Hoàng Logistics tổ chức – một hoạt động thể dục thể thao thường niên nhằm xây dựng môi trường làm việc năng động, tích cực và gắn kết.',
      paragraphs: [
        'Diễn ra trong 14 ngày, thử thách dành cho toàn thể thành viên Long Hoàng Logistics cùng quý khách hàng và đối tác. Không chỉ là một giải chạy, đây còn là hành trình tạo động lực, hình thành thói quen rèn luyện thể chất và nâng cao sức khỏe mỗi ngày.',
        'Đặc biệt, mỗi kilomet được chinh phục không chỉ là thành tích cá nhân, mà còn mang ý nghĩa cộng đồng sâu sắc. Với mỗi 1 km hoàn thành, Long Hoàng Logistics sẽ đóng góp 1.000đ vào chương trình thiện nguyện “Tiếp bước đến trường – Mùa thu cho em” vào tháng 09/2026.'
      ],
      detailsCardTitle: 'Chi tiết giải chạy',
      detailsList: [
        {
          title: '1. Đối tượng tham gia',
          points: [
            'Tất cả cán bộ công nhân viên Long Hoàng Logistics trên toàn quốc',
            'Khách hàng, đại lý và đối tác thân thiết của công ty'
          ]
        },
        {
          title: '2. Thời gian & Lộ trình',
          points: [
            'Thời gian đăng ký: 06/04 - 09/04/2026',
            'Thời gian ghi nhận thành tích: 00h ngày 12/04/2026 – 8h00 ngày 25/04/2026',
            'Tổng kết – Trao giải: 25/04/2026 tại Headoffice HCM & Chi nhánh HPH'
          ]
        },
        {
          title: '3. Hình thức thi đấu & Cơ cấu giải thưởng',
          points: [
            'Chạy cá nhân & Chạy tiếp sức theo nhóm (Đội 5 người)',
            'Ghi nhận cự ly tự động qua ứng dụng Strava liên kết hệ thống',
            'Giải Nhất, Nhì, Ba tập thể và cá nhân nam/nữ xuất sắc nhất'
          ]
        }
      ],
      note: 'Mọi thắc mắc về quy chế thi đấu và đăng ký vui lòng liên hệ Ban Tổ Chức qua email: Teddy.diem@longhoanglogistics.com hoặc Vincent@longhoanglogistics.com hoặc Hotline Zalo: 0867 141 877.'
    }
  },
  {
    id: 'canh-bao-tuyen-dung',
    title: 'CẢNH BÁO HÀNH VI TUYỂN DỤNG GIẢ MẠO THƯƠNG HIỆU LONG HOÀNG LOGISTICS',
    category: 'Tin tức công ty',
    type: 'company-news',
    date: '14/10/2025',
    day: '14',
    month: 'Oct',
    summary: 'Thời gian gần đây xuất hiện một số đối tượng mạo danh Long Hoàng Logistics để lừa đảo thu phí tuyển dụng qua mạng xã hội. Khách hàng và ứng viên cần lưu ý.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'Gần đây, Công ty TNHH Tiếp Vận Long Hoàng (Long Hoàng Logistics) nhận được phản ánh về việc có một số đối tượng giả mạo thương hiệu để đăng tin tuyển dụng trái phép.',
      paragraphs: [
        'Các đối tượng thường lập fanpage/group giả mạo, liên hệ ứng viên qua Telegram hoặc Zalo lạ, yêu cầu nạp tiền ký quỹ, đặt cọc giữ chỗ hoặc làm nhiệm vụ nhận tiền thưởng.',
        'Long Hoàng Logistics khẳng định: Chúng tôi TUYỆT ĐỐI KHÔNG thu bất kỳ khoản phí tuyển dụng nào của ứng viên dưới mọi hình thức.'
      ],
      detailsCardTitle: 'Khuyến cáo quan trọng đối với ứng viên',
      detailsList: [
        {
          title: '1. Kênh tiếp nhận thông tin chính thức',
          points: [
            'Website duy nhất: www.longhoang.vn',
            'Fanpage chính thức: fb.com/longhoanglogistics (có tick xác thực)',
            'Email tuyển dụng có đuôi @longhoang.vn'
          ]
        },
        {
          title: '2. Các dấu hiệu lừa đảo phổ biến',
          points: [
            'Yêu cầu chuyển tiền đặt cọc hoặc mở tài khoản ngân hàng liên kết',
            'Sử dụng địa chỉ email miễn phí như @gmail.com, @yahoo.com để gửi thư mời phỏng vấn',
            'Hứa hẹn mức lương bất thường kèm công việc online nhẹ nhàng'
          ]
        }
      ],
      note: 'Nếu phát hiện dấu hiệu mạo danh, vui lòng thông báo ngay cho chúng tôi qua hotline: 028 7303 2677 để được hỗ trợ xử lý.'
    }
  },
  {
    id: 'global-freight-conference',
    title: 'LONG HOÀNG LOGISTICS THAM GIA HỘI NGHỊ GLOBAL FREIGHT FORWARDERS 2026',
    category: 'Tin tức chuyên ngành',
    type: 'industry-news',
    date: '04/10/2025',
    day: '04',
    month: 'Oct',
    summary: 'Đoàn đại biểu Long Hoàng Logistics đã có các phiên làm việc song phương với hơn 60 đối tác vận tải quốc tế đến từ Bắc Mỹ, Châu Âu và Đông Bắc Á.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'Long Hoàng Logistics tự hào tham gia chuỗi sự kiện thường niên Global Freight Forwarders Conference quy tụ hơn 1.200 doanh nghiệp logistics hàng đầu thế giới.',
      paragraphs: [
        'Tại hội nghị, đại diện Long Hoàng Logistics đã giới thiệu năng lực kết nối vận tải đa phương thức tại Việt Nam, hệ thống cảng biển nước sâu Cái Mép - Thị Vải, Lạch Huyện và hạ tầng trung chuyển hàng không.',
        'Nhiều thỏa thuận hợp tác đại lý chiến lược (Exclusive Agency Agreements) đã được ký kết nhằm tối ưu hóa giá cước và thời gian trung chuyển hai chiều cho khách hàng xuất nhập khẩu.'
      ],
      detailsCardTitle: 'Trọng tâm hợp tác quốc tế',
      detailsList: [
        {
          title: '1. Mở rộng tuyến vận tải đường biển FCL/LCL',
          points: [
            'Tăng cường hợp tác với các hãng tàu Maersk, MSC, CMA CGM, COSCO, ONE',
            'Giữ chỗ (space) cố định ngay trong mùa cao điểm xuất hàng đi bờ Tây & bờ Đông nước Mỹ'
          ]
        },
        {
          title: '2. Phát triển dịch vụ E-commerce Logistics xuyên biên giới',
          points: [
            'Xây dựng tuyến đường bay chuyên dụng (Air Charter) kết nối Hà Nội/TP.HCM với Frankfurt và Incheon',
            'Dịch vụ DDP/DAP tận tay người nhận với giải pháp công nghệ theo dõi trực tuyến 24/7'
          ]
        }
      ]
    }
  },
  {
    id: 'xu-huong-cuoc-bien-2026',
    title: 'CẬP NHẬT BIẾN ĐỘNG CƯỚC TÀU BIỂN QUỐC TẾ VÀ DỰ BÁO THỊ TRƯỜNG Q3 & Q4/2026',
    category: 'Tin tức chuyên ngành',
    type: 'industry-news',
    date: '18/08/2026',
    day: '18',
    month: 'Aug',
    summary: 'Phân tích biến động giá cước các tuyến Á - Mỹ, Á - Âu và những giải pháp tối ưu hóa kế hoạch book tàu cho doanh nghiệp xuất nhập khẩu.',
    image: 'https://images.unsplash.com/photo-1542314831-c6a4d27f8e80?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'Thị trường vận tải biển quốc tế đang bước vào giai đoạn tái cơ cấu luồng tuyến với sự phân hóa mạnh mẽ giữa các liên minh hãng tàu lớn.',
      paragraphs: [
        'Chi phí nhiên liệu sinh học (Bio-fuel) và các quy định phát thải carbon mới (ETS) của Liên minh Châu Âu đang tác động trực tiếp đến phụ phí vận tải biển.',
        'Doanh nghiệp xuất nhập khẩu cần chủ động ký hợp đồng dài hạn (Service Contract) hoặc linh hoạt kết hợp hình thức gom hàng LCL để duy trì biên lợi nhuận ổn định.'
      ],
      detailsCardTitle: 'Chiến lược tối ưu hóa chi phí cho chủ hàng',
      detailsList: [
        {
          title: '1. Kế hoạch đóng hàng và book tàu sớm',
          points: [
            'Book chỗ trước ngày tàu chạy tối thiểu 10-14 ngày đối với tuyến xa (Mỹ, Châu Âu)',
            'Kiểm tra kỹ hạn lưu bãi (Demurrage & Detention) tại cảng đích để tránh phát sinh chi phí'
          ]
        },
        {
          title: '2. Tận dụng mạng lưới đại lý gom hàng',
          points: [
            'Sử dụng dịch vụ gom hàng Consol trực tiếp từ cảng Cát Lái/Hải Phòng thay vì chuyển tải qua cảng trung gian',
            'Được hỗ trợ kiểm dịch, hun trùng và đóng gói kiện hàng đạt chuẩn quốc tế'
          ]
        }
      ]
    }
  },
  {
    id: 'incoterms-2020-guide',
    title: 'HƯỚNG DẪN CHI TIẾT 11 ĐIỀU KIỆN INCOTERMS 2020 TRONG NGOẠI THƯƠNG QUỐC TẾ',
    category: 'Kiến thức chuyên ngành',
    type: 'industry-knowledge',
    date: '10/08/2026',
    day: '10',
    month: 'Aug',
    summary: 'Phân định rõ ranh giới trách nhiệm, chi phí và chuyển giao rủi ro giữa người mua và người bán theo ấn bản Incoterms mới nhất của ICC.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'Incoterms (International Commercial Terms) là bộ quy tắc thương mại quốc tế do Phòng Thương mại Quốc tế (ICC) ban hành, là nền tảng cốt lõi trong hợp đồng mua bán ngoại thương.',
      paragraphs: [
        'Việc hiểu và áp dụng chính xác các điều khoản Incoterms giúp doanh nghiệp phòng ngừa tranh chấp thương mại, kiểm soát rủi ro vận tải và tối ưu hóa dòng tiền khi thanh toán quốc tế.',
        'Long Hoàng Logistics tổng hợp và phân tích 4 nhóm điều kiện chính (E, F, C, D) áp dụng cho cả vận tải đa phương thức và vận tải đường thủy.'
      ],
      detailsCardTitle: 'Các nhóm điều kiện Incoterms trọng tâm',
      detailsList: [
        {
          title: '1. Nhóm F (FCA, FAS, FOB) - Người mua chịu trách nhiệm vận tải chính',
          points: [
            '*#FOB (Free on Board) | Người bán giao hàng qua lan can tàu tại cảng bốc, rủi ro chuyển giao ngay khi hàng nằm trên boong tàu | https://images.unsplash.com/photo-1605810730811-40b541bb8eb7?auto=format&fit=crop&w=800&q=80#*',
            '*#FCA (Free Carrier) | Áp dụng rất linh hoạt cho mọi phương thức vận tải đường bộ, đường biển, hàng không. Rủi ro chuyển giao khi hàng được giao cho người vận chuyển. | https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80#*'
          ]
        },
        {
          title: '2. Nhóm C (CFR, CIF, CPT, CIP) - Người bán chịu chi phí cước vận tải',
          points: [
            '*#CIF (Cost, Insurance and Freight) | Người bán mua bảo hiểm hàng hóa tối thiểu cho người mua | https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&w=800&q=80#*',
            '*#CIP (Carriage and Insurance Paid to) | Quy định mức bảo hiểm loại A cao nhất theo Incoterms 2020#*'
          ]
        },
        {
          title: '3. Nhóm D (DAP, DPU, DDP) - Người bán chịu trách nhiệm đến đích',
          points: [
            '*#DDP (Delivered Duty Paid) | Người bán chịu mọi chi phí và thuế nhập khẩu tại nước người mua#*'
          ]
        }
      ]
    }
  },
  {
    id: 'quy-trinh-khai-hai-quan-2026',
    title: 'QUY TRÌNH THỦ TỤC THÔNG QUAN HẢI QUAN HÀNG HÓA XUẤT NHẬP KHẨU TỪ A - Z',
    category: 'Kiến thức chuyên ngành',
    type: 'industry-knowledge',
    date: '28/07/2026',
    day: '28',
    month: 'Jul',
    summary: 'Cẩm nang hướng dẫn các bước chuẩn bị bộ chứng từ, truyền tờ khai VNACCS/VCIS, kiểm tra thực tế hàng hóa và nộp thuế điện tử nhanh gọn.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200&auto=format&fit=crop',
    content: {
      lead: 'Thủ tục hải quan là khâu mang tính quyết định đến tiến độ lưu thông của chuỗi cung ứng hàng hóa xuất nhập khẩu.',
      paragraphs: [
        'Một sai sót nhỏ trong mã số hàng hóa (HS Code), tên hàng hoặc chứng nhận xuất xứ (C/O) có thể dẫn đến việc kiểm tra sau thông quan, phạt hành chính hoặc chậm tiến độ giao hàng.',
        'Đội ngũ chuyên gia đại lý hải quan Long Hoàng Logistics chia sẻ quy trình chuẩn 5 bước giúp thông quan hàng hóa mượt mà nhất.'
      ],
      detailsCardTitle: '5 bước thông quan chuẩn hóa',
      detailsList: [
        {
          title: 'Bước 1: Chuẩn bị và kiểm tra bộ chứng từ',
          points: [
            'Hợp đồng thương mại (Sales Contract), Hóa đơn (Commercial Invoice)',
            'Phiếu đóng gói (Packing List), Vận đơn (Bill of Lading / Airway Bill)',
            'Chứng nhận xuất xứ (C/O), Giấy phép chuyên ngành (nếu có)'
          ]
        },
        {
          title: 'Bước 2: Lên tờ khai và truyền số liệu VNACCS',
          points: [
            'Phân luồng tự động: Luồng Xanh (Thông quan ngay), Luồng Vàng (Kiểm tra hồ sơ giấy), Luồng Đỏ (Kiểm tra thực tế hàng)'
          ]
        },
        {
          title: 'Bước 3: Nộp thuế và thanh lý tờ khai tại cảng/ICD',
          points: [
            'Nộp thuế điện tử 24/7 qua cổng thanh toán liên ngân hàng của Tổng cục Hải quan',
            'In mã vạch tờ khai và thanh lý hải quan giám sát cảng'
          ]
        }
      ]
    }
  }
];

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: 'tuyen-dung-co-hoi-nghe-nghiep',
    title: 'LONG HOÀNG LOGISTICS TUYỂN DỤNG – CƠ HỘI NGHỀ NGHIỆP NGÀNH LOGISTICS',
    location: 'Đà Nẵng, TP. Hồ Chí Minh, Hải Phòng, Quy Nhơn, Bình Dương',
    type: 'Toàn thời gian',
    date: '19/08/2026',
    day: '19',
    month: 'Aug',
    views: 158,
    deadline: '30/10/2026',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    summary: 'Long Hoàng Logistics đang mở rộng quy mô và tìm kiếm đồng đội để cùng tiếp tục phát triển và chinh phục những hành trình mới. Tại Long Hoàng, bạn sẽ có cơ hội phát huy năng lực, học hỏi từ thực tế và mở rộng lộ trình nghề nghiệp trong ngành Logistics.',
    content: {
      lead: 'Long Hoàng Logistics đang mở rộng quy mô hoạt động trên toàn quốc và tìm kiếm những nhân tố tài năng, đam mê lĩnh vực giao nhận vận tải quốc tế & nội địa.',
      subLead: 'Tại Long Hoàng Logistics, bạn sẽ được làm việc trong môi trường chuyên nghiệp, năng động, chế độ đãi ngộ cạnh tranh cùng lộ trình thăng tiến rõ ràng.',
      positions: [
        {
          title: '1. Trưởng nhóm Điều phối vận tải (Đà Nẵng / TP.HCM / Hải Phòng)',
          location: 'Đà Nẵng & Chi nhánh TP.HCM',
          salary: '18.000.000đ – 25.000.000đ + Thưởng KPI',
          description: [
            'Quản lý, phân công và giám sát đội xe đầu kéo, xe tải chạy các tuyến Bắc - Trung - Nam',
            'Tối ưu hóa lịch trình vận chuyển, kiểm soát chi phí nhiên liệu và hao mòn phương tiện',
            'Xử lý các phát sinh trên đường vận chuyển, phối hợp với kho bãi và tài xế đảm bảo giao hàng đúng hẹn'
          ],
          requirements: [
            'Tốt nghiệp Cao đẳng/Đại học chuyên ngành Logistics, Quản trị Vận tải, Kinh tế',
            'Tối thiểu 2 năm kinh nghiệm quản lý đội xe hoặc điều phối vận tải đường bộ',
            'Kỹ năng giải quyết vấn đề nhanh nhạy, chịu được áp lực cao'
          ],
          benefits: [
            'Lương thưởng cạnh tranh, đánh giá tăng lương định kỳ 2 lần/năm',
            'Bảo hiểm xã hội, bảo hiểm sức khỏe Bảo Việt 24/7',
            'Du lịch hàng năm, phụ cấp điện thoại và công tác phí đầy đủ'
          ]
        },
        {
          title: '2. Trưởng nhóm Kinh doanh Logistics (FCL/LCL Freight Sales Manager)',
          location: 'Đà Nẵng – TP. Hồ Chí Minh – Hải Phòng',
          salary: '20.000.000đ – 35.000.000đ + Hoa hồng doanh số hấp dẫn',
          description: [
            'Lập kế hoạch và triển khai chiến lược kinh doanh cước vận tải đường biển (FCL/LCL), cước hàng không (Air Freight)',
            'Tìm kiếm, đàm phán và ký kết hợp đồng dịch vụ logistics với các doanh nghiệp xuất nhập khẩu (FDI, nhà máy sản xuất, thương mại)',
            'Đào tạo và dẫn dắt đội ngũ nhân viên kinh doanh đạt chỉ tiêu doanh số đề ra'
          ],
          requirements: [
            'Tối thiểu 3 năm kinh nghiệm trong ngành Logistics/Freight Forwarding',
            'Có mạng lưới quan hệ rộng với các hãng tàu, đại lý nước ngoài và chủ hàng',
            'Tiếng Anh hoặc tiếng Trung giao tiếp tốt trong công việc'
          ],
          benefits: [
            'Mức hoa hồng (Commission) không giới hạn theo lợi nhuận gộp',
            'Thưởng nóng theo từng dự án lớn, cơ hội trở thành Cổ đông/Đối tác chiến lược'
          ]
        },
        {
          title: '3. Nhân viên Khai báo Hải quan & Thủ tục Xuất Nhập Khẩu',
          location: 'Cát Lái (TP.HCM), Cảng Đình Vũ (Hải Phòng), Cảng Tiên Sa (Đà Nẵng)',
          salary: '10.000.000đ – 16.000.000đ',
          description: [
            'Tiếp nhận chứng từ và lên tờ khai hải quan trên hệ thống VNACCS/VCIS cho các loại hình (Kinh doanh, Gia công, SXXK, Phi mậu dịch)',
            'Thực hiện thủ tục kiểm tra thực tế hàng hóa (kiểm hóa), tham vấn giá, kiểm tra chuyên ngành tại chi cục hải quan',
            'Hỗ trợ khách hàng hoàn thiện hồ sơ xin cấp C/O các form A, B, D, E, EUR.1...'
          ],
          requirements: [
            'Am hiểu luật hải quan, biểu thuế xuất nhập khẩu và phân loại mã HS Code',
            'Ưu tiên ứng viên có chứng chỉ Đại lý Hải quan của Tổng cục Hải quan',
            'Trung thực, cẩn thận, có xe máy di chuyển linh hoạt'
          ],
          benefits: [
            'Phụ cấp xăng xe, điện thoại, cơm trưa và đồng phục công ty',
            'Được tham gia các khóa đào tạo nâng cao nghiệp vụ định kỳ'
          ]
        }
      ],
      howToApply: {
        email: 'Teddy.diem@longhoanglogistics.com hoặc Vincent@longhoanglogistics.com',
        hotline: '028 7303 2677',
        zalo: '0867 141 877',
        address: 'Tòa nhà Long Hoàng, Số 168 Đường số 2, Vạn Phúc City, P. Hiệp Bình Phước, TP. Thủ Đức, TP. Hồ Chí Minh'
      }
    }
  },
  {
    id: 'tuyen-dung-lai-xe-tai',
    title: 'Tuyển dụng Nhân viên lái xe tải & xe đầu kéo Container',
    location: 'Đà Nẵng – Các tỉnh Miền Trung & Miền Nam',
    type: 'Toàn thời gian',
    date: '09/06/2026',
    day: '09',
    month: 'Jun',
    views: 94,
    deadline: '15/10/2026',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
    summary: 'Nội dung bài viết: Mô tả công việc, Yêu cầu, Quyền lợi. Mô tả công việc: Điều khiển xe tải, xe container vận chuyển hàng hóa theo các tuyến: Đà Nẵng – các tỉnh Miền Trung, TP.HCM, Bình Dương và các khu công nghiệp.',
    content: {
      lead: 'Đội xe Long Hoàng Logistics liên tục tuyển dụng tài xế lái xe tải (từ 2.5 tấn đến 15 tấn) và tài xế xe đầu kéo container phục vụ vận tải nội địa và đường dài.',
      positions: [
        {
          title: 'Nhân viên Lái xe tải đường dài & chạy tuyến cảng',
          location: 'Bãi xe Đà Nẵng / Cát Lái (TP.HCM) / Đình Vũ (Hải Phòng)',
          salary: '15.000.000đ – 22.000.000đ / tháng (Lương cơ bản + chuyến)',
          description: [
            'Vận chuyển hàng hóa xuất nhập khẩu từ các cảng biển, kho CFS về nhà máy của khách hàng',
            'Bảo quản phương tiện, kiểm tra dầu nhớt, lốp xe định kỳ trước và sau mỗi hành trình',
            'Phối hợp với phụ xe và điều phối giao nhận chứng từ, phiếu giao hàng đầy đủ'
          ],
          requirements: [
            'Có bằng lái xe hạng C hoặc FC còn hạn sử dụng',
            'Tối thiểu 1 năm kinh nghiệm chạy xe tải hoặc xe container',
            'Sức khỏe tốt, không sử dụng chất kích thích, cẩn thận và có tinh thần trách nhiệm'
          ],
          benefits: [
            'Thu nhập ổn định, thanh toán đúng hạn ngày 05 hàng tháng',
            'Được đóng BHXH, BHYT, BHTN và bảo hiểm tai nạn 24/24',
            'Có chỗ nghỉ ngơi tiện nghi tại bãi xe công ty'
          ]
        }
      ],
      howToApply: {
        email: 'Teddy.diem@longhoanglogistics.com hoặc Vincent@longhoanglogistics.com',
        hotline: '028 7303 2677',
        zalo: '0867 141 877',
        address: 'Bãi xe Long Hoàng Logistics, KCN Hòa Cầm, Cẩm Lệ, TP. Đà Nẵng'
      }
    }
  },
  {
    id: 'tuyen-dung-nhan-vien-hien-truong',
    title: 'Tuyển dụng Nhân viên hiện trường (Ops Field Executive)',
    location: 'Hải Phòng, Đà Nẵng, TP. Hồ Chí Minh',
    type: 'Toàn thời gian',
    date: '12/05/2026',
    day: '12',
    month: 'May',
    views: 82,
    deadline: '20/10/2026',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    summary: 'Nội dung bài viết: Mô tả công việc, Yêu cầu ứng viên, Quyền lợi. Địa điểm làm việc tại các chi cục Hải quan Cát Lái, Tân Sơn Nhất, Tiên Sa, Đình Vũ và các kho ngoại quan.',
    content: {
      lead: 'Bộ phận Hiện trường (Operations Field) Long Hoàng Logistics tuyển dụng chuyên viên làm thủ tục giao nhận hàng hóa tại các cảng biển, sân bay và kho ngoại quan.',
      positions: [
        {
          title: 'Nhân viên Giao nhận Hiện trường Cảng & Sân bay',
          location: 'Cảng Cát Lái (HCM), Sân bay Tân Sơn Nhất, Cảng Tiên Sa (Đà Nẵng)',
          salary: '10.000.000đ – 14.000.000đ',
          description: [
            'Lấy lệnh giao hàng (D/O), làm thủ tục cược mượn vỏ container, thanh lý hải quan tại cảng',
            'Giám sát quá trình đóng/rút ruột hàng tại bãi và kho CFS, kiểm tra tình trạng niêm phong kẹp chì (Seal)',
            'Bàn giao hàng hóa và chứng từ cho khách hàng hoặc tài xế vận chuyển'
          ],
          requirements: [
            'Nhanh nhẹn, trung thực, giao tiếp tốt với các bộ phận hải quan và kho bãi',
            'Tốt nghiệp Trung cấp trở lên, chấp nhận sinh viên mới tốt nghiệp ngành Logistics/Kinh tế',
            'Có phương tiện đi lại cá nhân'
          ],
          benefits: [
            'Phụ cấp xăng xe, điện thoại, ăn trưa',
            'Môi trường làm việc thực tế cọ xát nghiệp vụ cao, nhiều cơ hội học hỏi'
          ]
        }
      ],
      howToApply: {
        email: 'Teddy.diem@longhoanglogistics.com hoặc Vincent@longhoanglogistics.com',
        hotline: '028 7303 2677',
        zalo: '0867 141 877',
        address: 'Văn phòng Long Hoàng Logistics tại Hải Phòng / Đà Nẵng / TP.HCM'
      }
    }
  }
];

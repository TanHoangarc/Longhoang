
import { Truck, Ship, Plane, Package, Shield, Clock, Headphones, Globe, MapPin, Anchor, FileText, Smartphone } from 'lucide-react';

export const NAV_LINKS = [
  { name: 'Trang chủ', href: '#' },
  { name: 'Giới thiệu', href: '#about' },
  { name: 'Dịch vụ', href: '#services' },
  { name: 'Tin tức', href: '#news' },
  { name: 'Liên hệ', href: '#contact' },
  { name: 'Finance', href: 'finance' },
  { name: 'Company', href: 'company' },
  { name: 'Account', href: 'account' },
  { name: 'Cài đặt', href: 'settings' },
];

export const FEATURES = [
  {
    title: 'Giải pháp chuỗi cung ứng',
    description: 'Nhận giá cước ưu đãi từ các tổ chức tài chính hàng đầu. Tối ưu hóa dòng chảy hàng hóa của bạn.',
    icon: Globe
  },
  {
    title: 'Vận chuyển trọn gói',
    description: 'Với dịch vụ tư vấn của chúng tôi, bạn sẽ không bị báo giá lại, không có sự can thiệp của đại lý trung gian.',
    icon: Truck
  },
  {
    title: 'Hợp đồng Logistics',
    description: 'Giao dịch ngoại hối và CFDs với các nền tảng giao dịch tốt nhất thế giới trên máy tính hoặc di động.',
    icon: FileText
  }
];

export const SERVICES = [
  {
    id: '01',
    title: 'Vận chuyển hàng lẻ (LCL)',
    description: 'Giải pháp gom hàng lẻ (Consolidation) tối ưu chi phí. Lịch trình định kỳ hàng tuần tới các cảng chính trên thế giới, giúp bạn tiết kiệm mà không cần chờ đủ container.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '02',
    title: 'Vận chuyển hàng không',
    description: 'Tốc độ là ưu tiên số một. Dịch vụ Air Freight kết nối với các hãng hàng không lớn, đảm bảo hàng hóa gấp của bạn đến đích an toàn trong thời gian ngắn nhất.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '03',
    title: 'Vận chuyển đường biển',
    description: 'Dịch vụ FCL & LCL toàn cầu. Chúng tôi cung cấp giải pháp vận tải biển linh hoạt, xử lý khối lượng hàng lớn với chi phí cạnh tranh nhất thị trường.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '04',
    title: 'Dịch vụ thủ tục hải quan',
    description: 'Xóa bỏ nỗi lo về giấy tờ. Đội ngũ chuyên gia am hiểu luật định sẽ tư vấn mã HS, thuế và thực hiện thông quan nhanh chóng, chính xác tuyệt đối.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '05',
    title: 'Vận tải nội địa',
    description: 'Đội xe hùng hậu đa dạng tải trọng, phủ sóng 63 tỉnh thành. Chúng tôi cam kết vận chuyển hàng hóa door-to-door đúng giờ, an toàn trên mọi cung đường.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '06',
    title: 'Overseas (Quốc tế)',
    description: 'Mạng lưới đại lý toàn cầu cho phép chúng tôi xử lý hàng hóa (Cross-border) tại bất kỳ quốc gia nào. Dịch vụ trọn gói từ kho người bán đến kho người mua.',
    image: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '07',
    title: 'Chuyển phát nhanh',
    description: 'Gửi chứng từ, hàng mẫu hay bưu phẩm đi quốc tế chưa bao giờ dễ dàng hơn. Dịch vụ Express cam kết thời gian phát hàng và theo dõi lộ trình 24/7.',
    image: 'https://images.unsplash.com/photo-1566576912906-253200c681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '08',
    title: 'Hàng công trình – Dự án',
    description: 'Chuyên chở hàng siêu trường, siêu trọng và thiết bị công nghiệp. Chúng tôi cung cấp giải pháp kỹ thuật, phương án chằng buộc và thi công vận tải tối ưu.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '09',
    title: 'Bảo hiểm hàng hóa',
    description: 'Bảo vệ tài chính tối đa cho lô hàng của bạn. Dịch vụ bảo hiểm hàng hóa toàn diện, thủ tục bồi thường nhanh gọn, giúp bạn an tâm tuyệt đối.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const SAFETY_FEATURES = [
  { icon: Shield, title: 'Bảo mật thông tin', desc: 'Cam kết bảo mật dữ liệu khách hàng tuyệt đối.' },
  { icon: Globe, title: 'Tầm nhìn dài hạn', desc: 'Định hướng phát triển bền vững cùng đối tác.' },
  { icon: Anchor, title: 'Đội ngũ chuyên nghiệp', desc: 'Nhân sự giàu kinh nghiệm, xử lý tình huống linh hoạt.' },
  { icon: Shield, title: 'An toàn & Riêng tư', desc: 'Hàng hóa được giám sát chặt chẽ 24/7.' },
  { icon: Package, title: 'Dịch vụ chất lượng', desc: 'Tiêu chuẩn quốc tế trong mọi khâu vận hành.' },
  { icon: Shield, title: 'Liên tục 24/7', desc: 'Hoạt động không ngừng nghỉ để đảm bảo tiến độ.' },
  { icon: Smartphone, title: 'Giải pháp đổi mới', desc: 'Ứng dụng công nghệ mới nhất vào quản lý.' },
  { icon: Truck, title: 'Vận hành xuất sắc', desc: 'Tối ưu hóa chi phí và thời gian cho khách hàng.' },
];

export const TESTIMONIALS = [
  {
    text: "Long Hoang Logistics đã giúp chúng tôi tối ưu hóa quy trình nhập khẩu từ Trung Quốc về Việt Nam. Thời gian giao hàng nhanh chóng và chi phí rất hợp lý. Một đối tác thực sự tin cậy.",
    author: "Nguyễn Văn An",
    role: "Giám đốc, Công ty XNK Á Châu"
  }
];

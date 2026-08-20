export type Language = 'vi' | 'en' | 'zh';

export interface SlideData {
  id: number;
  titleTop: string;
  titleMain: string;
  description: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category?: string;
  description: string;
  iconName: 'signpost' | 'clock' | 'check' | 'ship' | 'grid' | 'send' | 'file-text' | 'truck' | 'box';
  bullets?: string[];
  bannerImage?: string;
  details: {
    overview: string;
    advantages: string[];
    routes: string[];
  };
}

export interface CoreValue {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: 'thumbs-up' | 'star' | 'refresh' | 'heart';
}

export interface Office {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  region: 'Bắc' | 'Trung' | 'Nam';
}

export interface Partner {
  id: string;
  name: string;
  subtitle: string;
  logoType: 'vla' | 'vcci' | 'jctrans' | 'pcn' | 'wiffa' | 'fiata' | 'iata';
}

export interface NewsSectionItem {
  heading: string;
  items: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Tin tức chuyên ngành' | 'Kiến thức chuyên ngành' | 'Tin tức công ty' | string;
  type: 'industry-news' | 'industry-knowledge' | 'company-news';
  date: string;
  day: string;
  month: string;
  summary: string;
  image: string;
  content?: {
    lead: string;
    paragraphs: string[];
    detailsCardTitle?: string;
    detailsList?: {
      title: string;
      points: string[];
    }[];
    note?: string;
  };
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string;
  date: string;
  day: string;
  month: string;
  views?: number;
  deadline: string;
  image: string;
  summary: string;
  content?: {
    lead: string;
    subLead?: string;
    positions: {
      title: string;
      location: string;
      salary?: string;
      description: string[];
      requirements: string[];
      benefits: string[];
    }[];
    howToApply?: {
      email: string;
      hotline: string;
      zalo: string;
      address: string;
    };
  };
}

export interface QuoteFormData {
  fullName: string;
  email: string;
  phone: string;
  commodity: string;
  volume: string;
  origin: string;
  destination: string;
  service: string;
  otherRequirements: string;
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  ExternalLink, 
  Share2, 
  Check, 
  Tag, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  ListTree, 
  Sparkles,
  Bookmark,
  MessageSquare,
  Facebook,
  Linkedin
} from 'lucide-react';
import { NewsItem, TableData, STOCK_IMAGES } from '../src/data/defaultArticles';

interface ArticleDetailPageProps {
  article: NewsItem;
  allArticles: NewsItem[];
  onBack: () => void;
  onSelectArticle: (article: NewsItem) => void;
  onOpenCategoryPage: (category: 'news' | 'knowledge') => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  allArticles,
  onBack,
  onSelectArticle,
  onOpenCategoryPage
}) => {
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Scroll to top whenever article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Estimate read time
  const readingTime = useMemo(() => {
    const words = (article.content || article.description || '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  }, [article.content, article.description]);

  // Extract Table of Contents (TOC) from content
  const tocList: TocItem[] = useMemo(() => {
    if (!article.content) return [];
    
    const lines = article.content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Match markdown ## H2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '-').substring(0, 40)}`;
        items.push({ id, text, level: 1 });
      } 
      // Match markdown ### H3 (or Bước 1: ...)
      else if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '').trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '-').substring(0, 40)}`;
        items.push({ id, text, level: 2 });
      } 
      // Match numbered points: 1. Bước 1: ... or Bước 1: ...
      else if (/^(bước\s+\d+|[0-9]+\.\s+)/i.test(trimmed) && trimmed.length < 90 && !trimmed.endsWith('.')) {
        const text = trimmed.replace(/^[\*\-_#\s]+/, '').trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1EA0-\u1EF9]/gi, '-').substring(0, 40)}`;
        items.push({ id, text, level: 2 });
      }
    });

    return items;
  }, [article.content]);

  // Handle smooth scroll to heading
  const scrollToHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Briefly highlight element
      element.classList.add('bg-amber-100', 'transition-colors', 'duration-500');
      setTimeout(() => {
        element.classList.remove('bg-amber-100');
      }, 1500);
    }
  };

  // Find related articles based on category or shared tags
  const relatedArticles = useMemo(() => {
    return allArticles
      .filter(item => item.id !== article.id)
      .filter(item => {
        if (item.category === article.category) return true;
        if (article.tags && item.tags) {
          return article.tags.some(tag => item.tags?.includes(tag));
        }
        return false;
      })
      .slice(0, 4);
  }, [allArticles, article]);

  // Copy article link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Render formatted content with headings having IDs
  const renderFormattedContent = () => {
    if (!article.content) {
      return (
        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
          {article.description}
        </p>
      );
    }

    const lines = article.content.split('\n');
    let tocIndexCounter = 0;

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 2 (##)
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '').trim();
        const currentToc = tocList.find(t => t.text === text && t.level === 1);
        const headingId = currentToc ? currentToc.id : `h2-${idx}`;

        return (
          <h2 
            key={idx} 
            id={headingId}
            className="text-2xl sm:text-3xl font-extrabold text-[#0f2c59] mt-10 mb-4 pt-4 border-b border-gray-100 pb-2 scroll-mt-28 flex items-center gap-2 group"
          >
            <span className="text-primary font-black">#</span>
            <span>{text}</span>
          </h2>
        );
      }

      // Heading 3 (###)
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '').trim();
        const currentToc = tocList.find(t => t.text === text && t.level === 2);
        const headingId = currentToc ? currentToc.id : `h3-${idx}`;

        return (
          <h3 
            key={idx} 
            id={headingId}
            className="text-xl sm:text-2xl font-bold text-blue-900 mt-8 mb-3 scroll-mt-28 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            <span>{text}</span>
          </h3>
        );
      }

      // Numbered Step or Bold Step (e.g., Bước 1: ...)
      if (/^(bước\s+\d+|[0-9]+\.\s+)/i.test(trimmed) && trimmed.length < 90 && !trimmed.endsWith('.')) {
        const text = trimmed.replace(/^[\*\-_#\s]+/, '').trim();
        const currentToc = tocList.find(t => t.text === text);
        const headingId = currentToc ? currentToc.id : `step-${idx}`;

        return (
          <h4 
            key={idx} 
            id={headingId}
            className="text-lg sm:text-xl font-bold text-blue-900 mt-6 mb-2 scroll-mt-28 flex items-center gap-2"
          >
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md font-bold">Mục</span>
            <span>{text}</span>
          </h4>
        );
      }

      // Special table placeholder [BANG_THONG_SO]
      if (trimmed === '[BANG_THONG_SO]' && article.table) {
        return renderTable(article.table, idx);
      }

      // Image markdown: ![caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const altText = imgMatch[1];
        const imgSrc = imgMatch[2];
        return (
          <figure key={idx} className="my-8 text-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <img 
              src={imgSrc} 
              alt={altText} 
              className="w-full max-h-[480px] object-contain rounded-xl mx-auto shadow-sm"
              loading="lazy"
            />
            {altText && (
              <figcaption className="text-sm text-gray-500 italic mt-3 font-medium">
                📷 {altText}
              </figcaption>
            )}
          </figure>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletContent = trimmed.substring(2);
        return (
          <li key={idx} className="ml-6 list-disc text-gray-700 text-base sm:text-lg mb-2 leading-relaxed pl-1 marker:text-primary">
            {renderInlineMarkdown(bulletContent)}
          </li>
        );
      }

      // Numbered list
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-3 my-2.5 ml-2 text-gray-700 text-base sm:text-lg leading-relaxed">
            <span className="bg-orange-100 text-primary font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1">
              {renderInlineMarkdown(numMatch[2])}
            </div>
          </div>
        );
      }

      // Inline Xem thêm callout: [XEM_THEM:...] or 👉 Xem thêm:
      if (trimmed.toLowerCase().includes('xem thêm:') || trimmed.toLowerCase().startsWith('👉 xem thêm')) {
        return (
          <div key={idx} className="my-6 p-4 rounded-xl bg-orange-50/80 border-l-4 border-primary flex items-center justify-between gap-4">
            <div className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles size={18} className="text-primary flex-shrink-0" />
              <span>{renderInlineMarkdown(trimmed)}</span>
            </div>
          </div>
        );
      }

      // Empty line / paragraph break
      if (!trimmed) {
        return <div key={idx} className="h-3"></div>;
      }

      // Standard text paragraph
      return (
        <p key={idx} className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  // Inline markdown formatter for bold, links, etc.
  const renderInlineMarkdown = (text: string) => {
    // Replace **bold**
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a 
            key={index} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1 mx-1"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink size={12} className="inline" />
          </a>
        );
      }

      return part;
    });
  };

  // Render Table Component
  const renderTable = (table: TableData, keyIndex: number) => {
    return (
      <div key={`table-${keyIndex}`} className="my-8 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#0f2c59] text-white">
              {table.headers.map((header, hIdx) => (
                <th key={hIdx} className="px-5 py-3.5 font-bold border-r border-blue-900/40 last:border-none text-xs sm:text-sm uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/60 hover:bg-gray-100'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-5 py-3.5 text-gray-700 border-r border-gray-100 last:border-none font-medium">
                    {cIdx === 0 ? <strong className="text-gray-900">{cell}</strong> : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 animate-in fade-in duration-300">
      {/* Top Header Breadcrumbs & Quick Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button 
              onClick={onBack}
              className="hover:text-primary font-medium transition flex items-center gap-1 text-gray-600"
            >
              <ArrowLeft size={16} />
              <span>Trang chủ</span>
            </button>
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            <button 
              onClick={() => onOpenCategoryPage(article.category || 'news')}
              className="hover:text-primary font-medium transition"
            >
              {article.category === 'knowledge' ? 'Kiến thức chuyên ngành' : 'Tin tức chuyên ngành'}
            </button>
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-800 font-semibold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {article.title}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
              title="Sao chép liên kết bài viết"
            >
              {copiedLink ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600 hidden sm:inline">Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 max-w-5xl">
        {/* HERO TITLE BANNER (Matching User Image 2 with fixed dimensions and large prominent title) */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg mb-8 bg-[#0f2c59] text-white">
          {/* Background Illustration / Photo with Fixed Aspect Dimensions */}
          <div className="w-full h-56 sm:h-72 md:h-80 relative overflow-hidden">
            <img 
              src={article.thumbnail || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"} 
              alt={article.title}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-30 mix-blend-luminosity filter contrast-125"
            />
            {/* Subtle Gradient & Texture Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2c59] via-[#0f2c59]/80 to-transparent"></div>
            
            {/* Centered Large Title Frame (Matching user's image 2: centered prominent uppercase title) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-sm ${
                article.category === 'knowledge' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-primary text-white'
              }`}>
                <BookOpen size={12} className="mr-1.5" />
                {article.category === 'knowledge' ? 'KIẾN THỨC CHUYÊN NGÀNH' : 'TIN TỨC CHUYÊN NGÀNH'}
              </span>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight max-w-4xl uppercase tracking-wide drop-shadow-md">
                {article.title}
              </h1>
            </div>
          </div>

          {/* Article Meta Bar beneath Hero */}
          <div className="bg-[#0a1e3f] px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-300 border-t border-blue-900/50">
            <div className="flex items-center flex-wrap gap-4">
              <span className="flex items-center text-gray-300">
                <Calendar size={14} className="mr-1.5 text-primary" />
                {formatDate(article.pubDate)}
              </span>
              <span className="flex items-center text-gray-300">
                <Clock size={14} className="mr-1.5 text-blue-400" />
                {readingTime} phút đọc
              </span>
              <span className="flex items-center text-gray-300">
                <Eye size={14} className="mr-1.5 text-green-400" />
                {(article.views || 1200).toLocaleString()} lượt xem
              </span>
            </div>

            {article.sourceName && (
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <span>Nguồn:</span>
                {article.sourceUrl ? (
                  <a 
                    href={article.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    {article.sourceName}
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="font-semibold text-gray-300">{article.sourceName}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Body (8 cols on desktop) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200/80">
            
            {/* Article Intro / Lead Paragraph */}
            {article.description && (
              <div className="text-gray-700 text-lg sm:text-xl font-medium leading-relaxed mb-8 pb-6 border-b border-gray-100 italic bg-amber-50/50 p-5 rounded-2xl border-l-4 border-primary">
                {article.description}
              </div>
            )}

            {/* 3D Model / Iframe embed if present */}
            {article.mediaType === 'iframe' && article.iframeCode && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-md border border-gray-200">
                <div className="bg-gray-900 text-white text-xs px-4 py-2 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    Mô hình trực quan 3D tương tác
                  </span>
                  <span className="text-gray-400">Dùng chuột xoay 360°</span>
                </div>
                <div 
                  className="w-full aspect-video bg-black"
                  dangerouslySetInnerHTML={{ __html: article.iframeCode }} 
                />
              </div>
            )}

            {/* TABLE OF CONTENTS (Mục lục / Bảng nội dung bài viết) - Matching User Image 1 */}
            {tocList.length > 0 && (
              <div className="my-8 rounded-2xl border border-blue-200 bg-blue-50/60 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-200/60">
                  <div className="flex items-center space-x-2 text-[#0f2c59] font-bold text-lg">
                    <ListTree size={20} className="text-blue-600" />
                    <span>Nội dung bài viết</span>
                  </div>
                  <button 
                    onClick={() => setIsTocOpen(!isTocOpen)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg transition"
                  >
                    [{isTocOpen ? 'hide' : 'show'}]
                  </button>
                </div>

                {isTocOpen && (
                  <nav className="space-y-2 text-sm sm:text-base animate-in fade-in duration-200">
                    {tocList.map((item, i) => (
                      <div 
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`cursor-pointer transition-all duration-150 rounded-lg py-1 px-2 hover:bg-blue-100/80 ${
                          item.level === 1 
                            ? 'font-bold text-[#0f2c59] hover:text-blue-800' 
                            : 'pl-6 text-blue-600 hover:text-blue-800 hover:underline font-medium'
                        } ${activeHeadingId === item.id ? 'bg-blue-100 text-blue-900 font-bold' : ''}`}
                      >
                        {item.text}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Main Article Formatted Body */}
            <article className="prose prose-lg max-w-none text-gray-800">
              {renderFormattedContent()}
            </article>

            {/* KEYWORD TAGS SECTION */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Tag size={14} className="text-primary" />
                  Từ khóa liên quan:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="bg-gray-100 hover:bg-primary hover:text-white text-gray-700 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Article Footer & Author / Disclaimer */}
            <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Long Hoàng Logistics Knowledge Base</div>
                <p className="text-xs text-gray-500">Thông tin được biên soạn và kiểm duyệt bởi đội ngũ chuyên gia Logistics.</p>
              </div>
              <button 
                onClick={onBack}
                className="bg-white border border-gray-200 hover:border-primary text-gray-800 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Quay lại danh sách
              </button>
            </div>
          </div>

          {/* Sidebar / Related Articles (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions / Share Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Share2 size={16} className="text-primary" />
                Chia sẻ bài viết này
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:border-primary text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition hover:bg-orange-50"
                >
                  {copiedLink ? <Check size={14} className="text-green-600" /> : <Bookmark size={14} />}
                  <span>{copiedLink ? 'Đã chép link' : 'Chép link'}</span>
                </button>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Facebook size={14} />
                  <span>Facebook</span>
                </a>
              </div>
            </div>

            {/* RELATED ARTICLES / XEM THÊM (Matching Requirement: có thể chèn xem thêm và link bài viết liên quan) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200/80">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  Bài viết liên quan
                </h3>
                <span className="text-xs text-primary font-bold">{relatedArticles.length} bài</span>
              </div>

              <div className="space-y-4">
                {relatedArticles.map((relItem) => (
                  <div 
                    key={relItem.id}
                    onClick={() => onSelectArticle(relItem)}
                    className="group cursor-pointer flex gap-3 p-2 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                  >
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img 
                        src={relItem.thumbnail || STOCK_IMAGES[0]} 
                        alt={relItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary transition line-clamp-2 leading-snug">
                        {relItem.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                        <span>{formatDate(relItem.pubDate)}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">
                          {relItem.category === 'knowledge' ? 'Kiến thức' : 'Tin tức'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Topics / Keywords Box */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-3xl p-6 border border-orange-100 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                <Tag size={15} className="text-primary" />
                Chủ đề đề xuất
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {["Thủ tục hải quan", "Kích thước Container", "Incoterms 2020", "Cước tàu biển", "Kho bãi thông minh", "Xuất nhập khẩu", "Chứng từ C/O"].map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const matched = allArticles.find(a => 
                        a.title.toLowerCase().includes(topic.toLowerCase()) || 
                        a.tags?.some(t => t.toLowerCase().includes(topic.toLowerCase()))
                      );
                      if (matched) {
                        onSelectArticle(matched);
                      } else {
                        onOpenCategoryPage('knowledge');
                      }
                    }}
                    className="bg-white hover:bg-primary hover:text-white text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium border border-orange-100/80 transition"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact / Consultation Box */}
            <div className="bg-[#0f2c59] text-white rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-base mb-2">Cần tư vấn dịch vụ Logistics?</h4>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Đội ngũ chuyên gia Long Hoàng Logistics sẵn sàng hỗ trợ giải đáp thủ tục hải quan và báo giá cước vận chuyển 24/7.
              </p>
              <a 
                href="#contact"
                onClick={onBack}
                className="inline-block w-full text-center bg-primary hover:bg-primaryDark text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-primary/30"
              >
                Gửi yêu cầu tư vấn
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

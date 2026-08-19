import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ExternalLink, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Table as TableIcon, 
  PlusCircle, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Info,
  Image as ImageIcon,
  Upload,
  Link2,
  Bold,
  Heading2,
  List,
  Search,
  Pin,
  Eye,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { TableData, NewsItem, STOCK_IMAGES, DEFAULT_NEWS_ITEMS } from '../src/data/defaultArticles';

interface NewsCategoryPageProps {
  category: 'news' | 'knowledge';
  onBack: () => void;
  onChangeCategory: (cat: 'news' | 'knowledge') => void;
  userRole?: string | null;
  manualNews?: NewsItem[];
  onUpdateNews?: (news: NewsItem[]) => void;
  onOpenPage?: (page: string | null) => void;
}

export const NewsCategoryPage: React.FC<NewsCategoryPageProps> = ({
  category,
  onBack,
  onChangeCategory,
  userRole,
  manualNews = [],
  onUpdateNews,
  onOpenPage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Custom in-app delete confirmation modal state (bypasses iframe window.confirm blocking)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);

  // Admin state
  const isAdmin = userRole === 'admin';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Partial<NewsItem>>({});

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchTerm]);

  // Toolbar & Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');
  const [showRefLinkPrompt, setShowRefLinkPrompt] = useState(false);
  const [refLinkText, setRefLinkText] = useState('');
  const [refLinkUrl, setRefLinkUrl] = useState('');

  // Lock body scroll when modal open
  useEffect(() => {
    const isAnyModalOpen = Boolean(readingArticle || isAdding || isEditing !== null || deleteTarget !== null);
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (readingArticle) setReadingArticle(null);
          if (isAdding || isEditing !== null) cancelEdit();
          if (deleteTarget) setDeleteTarget(null);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [readingArticle, isAdding, isEditing, deleteTarget]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Master list of all articles in the system
  const currentSourceList: NewsItem[] = manualNews && manualNews.length > 0 ? manualNews : DEFAULT_NEWS_ITEMS;

  // Filter for this specific category
  const categoryItems = currentSourceList.filter(n => (n.category || 'news') === category);

  // Search filter
  const filteredItems = categoryItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      (item.content && item.content.toLowerCase().includes(searchLower))
    );
  });

  // Sort: pinned first, then latest pubDate
  const sortedMainItems = [...filteredItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  const totalPages = Math.max(1, Math.ceil(sortedMainItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedItems = sortedMainItems.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const element = document.getElementById('articles-list-top');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  // Top 5 most viewed articles in this category for the sidebar
  const topViewedItems = [...categoryItems]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // Increment view counter and open article
  const handleOpenArticle = (item: NewsItem, e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    const currentViews = item.views || 0;
    const updatedItem = { ...item, views: currentViews + 1 };

    if (onUpdateNews) {
      const targetIdStr = String(item.id);
      const updated = currentSourceList.map(n => 
        String(n.id) === targetIdStr ? updatedItem : n
      );
      onUpdateNews(updated);
    }

    if (item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' || item.link.trim() === '') {
      setReadingArticle(updatedItem);
    } else if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  // Toggle Pin for Admin
  const handleTogglePin = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !onUpdateNews) return;

    const targetIdStr = String(item.id);
    const updated = currentSourceList.map(n => 
      String(n.id) === targetIdStr ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateNews(updated);
  };

  // Admin Actions
  const handleAddNew = () => {
    setIsAdding(true);
    setEditData({
      id: Date.now(),
      title: '',
      pubDate: new Date().toISOString(),
      link: '',
      thumbnail: STOCK_IMAGES[0],
      description: '',
      content: '',
      category: category,
      isPinned: false,
      views: 0,
      mediaType: 'image',
      iframeCode: '',
      sourceName: '',
      sourceUrl: ''
    });
  };

  const startEdit = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(item.id);
    setEditData({ ...item });
  };

  const promptDeleteNews = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(item);
  };

  const confirmDeleteNews = () => {
    if (!deleteTarget || !onUpdateNews) return;
    const targetIdStr = String(deleteTarget.id);
    const updated = currentSourceList.filter(n => String(n.id) !== targetIdStr);
    onUpdateNews(updated);
    setDeleteTarget(null);
  };

  const saveNews = () => {
    if (!onUpdateNews) return;
    let updatedFull = [...currentSourceList];
    const itemToSave = { ...editData } as NewsItem;

    if (isAdding) {
      updatedFull = [itemToSave, ...updatedFull];
    } else {
      updatedFull = updatedFull.map(n => String(n.id) === String(isEditing) ? itemToSave : n);
    }

    onUpdateNews(updatedFull);
    setIsAdding(false);
    setIsEditing(null);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
    setShowLinkPrompt(false);
    setShowRefLinkPrompt(false);
  };

  const openRefLinkPrompt = () => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = (editData.content || '').substring(start, end);
      if (selected.trim()) {
        setRefLinkText(selected);
      } else if (!refLinkText) {
        setRefLinkText('');
      }
    }
    setShowRefLinkPrompt(prev => !prev);
    setShowLinkPrompt(false);
  };

  const handleInsertRefLink = () => {
    if (!refLinkUrl.trim()) return;
    const displayText = refLinkText.trim() || refLinkUrl.trim();
    const linkMarkdown = `[${displayText}](${refLinkUrl.trim()})`;
    insertFormatAtCursor(linkMarkdown, '', '');
    setRefLinkText('');
    setRefLinkUrl('');
    setShowRefLinkPrompt(false);
  };

  // Content helper: insert formatting at cursor
  const insertFormatAtCursor = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = contentTextareaRef.current;
    const currentVal = editData.content || '';

    if (!textarea) {
      setEditData(prev => ({
        ...prev,
        content: currentVal + prefix + defaultPlaceholder + suffix
      }));
      return;
    }

    const savedTextareaScrollTop = textarea.scrollTop;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentVal.substring(start, end);
    const textToInsert = selectedText ? selectedText : defaultPlaceholder;

    const newContent = 
      currentVal.substring(0, start) + 
      prefix + 
      textToInsert + 
      suffix + 
      currentVal.substring(end);

    setEditData(prev => ({
      ...prev,
      content: newContent
    }));

    setTimeout(() => {
      textarea.focus();
      const newCursorStart = start + prefix.length;
      const newCursorEnd = newCursorStart + textToInsert.length;
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
      textarea.scrollTop = savedTextareaScrollTop;
    }, 0);
  };

  // Upload image handler
  const handleUploadContentImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/api/upload?category=GALLERY`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = `${API_BASE_URL}/files/GALLERY/${data.record.fileName}`;
        const defaultCaption = file.name.replace(/\.[^/.]+$/, "");
        const imageMarkdown = `\n\n![${defaultCaption}](${uploadedUrl})\n\n`;
        insertFormatAtCursor(imageMarkdown, '', '');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          const defaultCaption = file.name.replace(/\.[^/.]+$/, "");
          const imageMarkdown = `\n\n![${defaultCaption}](${base64Url})\n\n`;
          insertFormatAtCursor(imageMarkdown, '', '');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const defaultCaption = file.name.replace(/\.[^/.]+$/, "");
        const imageMarkdown = `\n\n![${defaultCaption}](${base64Url})\n\n`;
        insertFormatAtCursor(imageMarkdown, '', '');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Insert image via URL
  const handleInsertLinkImage = () => {
    if (!imgUrlInput.trim()) return;
    const caption = imgCaptionInput.trim() || 'Hình ảnh minh họa';
    const imageMarkdown = `\n\n![${caption}](${imgUrlInput.trim()})\n\n`;
    insertFormatAtCursor(imageMarkdown, '', '');
    setImgUrlInput('');
    setImgCaptionInput('');
    setShowLinkPrompt(false);
  };

  // Table Helpers
  const handleToggleTable = () => {
    if (editData.table) {
      setEditData({ ...editData, table: undefined });
    } else {
      setEditData({
        ...editData,
        table: {
          headers: ["Chỉ tiêu", "Loại 1", "Loại 2"],
          rows: [
            ["Thông số A", "100", "200"],
            ["Thông số B", "300", "400"]
          ]
        }
      });
    }
  };

  const addColumn = () => {
    if (!editData.table) return;
    const newHeaders = [...editData.table.headers, `Cột ${editData.table.headers.length + 1}`];
    const newRows = editData.table.rows.map(row => [...row, '-']);
    setEditData({
      ...editData,
      table: { headers: newHeaders, rows: newRows }
    });
  };

  const removeColumn = (colIdx: number) => {
    if (!editData.table || editData.table.headers.length <= 1) return;
    const newHeaders = editData.table.headers.filter((_, i) => i !== colIdx);
    const newRows = editData.table.rows.map(row => row.filter((_, i) => i !== colIdx));
    setEditData({
      ...editData,
      table: { headers: newHeaders, rows: newRows }
    });
  };

  const addRow = () => {
    if (!editData.table) return;
    const newRow = new Array(editData.table.headers.length).fill('-');
    setEditData({
      ...editData,
      table: { ...editData.table, rows: [...editData.table.rows, newRow] }
    });
  };

  const removeRow = (rowIdx: number) => {
    if (!editData.table || editData.table.rows.length <= 1) return;
    const newRows = editData.table.rows.filter((_, i) => i !== rowIdx);
    setEditData({
      ...editData,
      table: { ...editData.table, rows: newRows }
    });
  };

  const updateHeader = (colIdx: number, val: string) => {
    if (!editData.table) return;
    const newHeaders = [...editData.table.headers];
    newHeaders[colIdx] = val;
    setEditData({
      ...editData,
      table: { ...editData.table, headers: newHeaders }
    });
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    if (!editData.table) return;
    const newRows = editData.table.rows.map((row, ri) => {
      if (ri === rowIdx) {
        const newRow = [...row];
        newRow[colIdx] = val;
        return newRow;
      }
      return row;
    });
    setEditData({
      ...editData,
      table: { ...editData.table, rows: newRows }
    });
  };

  // Render inline formatting (**bold**, *italic*, [link](url))
  const renderInlineFormattedText = (line: string) => {
    // Match Markdown link [text](url), bold **text**, or italic *text*
    const tokenRegex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*)/g;
    const parts = line.split(tokenRegex);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Link: [Text](URL)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        return (
          <a
            key={pIdx}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primaryDark hover:underline font-semibold inline-flex items-center gap-0.5 mx-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{linkText}</span>
            <ExternalLink size={12} className="inline opacity-80" />
          </a>
        );
      }

      // Bold: **Text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={pIdx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }

      // Italic: *Text*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={pIdx} className="italic text-gray-800">{part.slice(1, -1)}</em>;
      }

      return part;
    });
  };

  // Render Technical Specifications Table
  const renderSpecsTable = (tableData: TableData, keyPrefix: string = 'specs-table') => {
    return (
      <div key={keyPrefix} className="my-8">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
          <TableIcon size={20} className="mr-2 text-primary" />
          Bảng thông số kỹ thuật chi tiết
        </h4>
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                {tableData.headers.map((h, i) => (
                  <th key={i} className="p-3.5 border-b border-primaryDark font-bold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rIdx) => (
                <tr key={rIdx} className="even:bg-gray-50 hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`p-3.5 ${cIdx === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'} whitespace-nowrap sm:whitespace-normal`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper to parse rich markdown blocks
  const renderTextBlock = (text: string, blockKey: string | number, tableData?: TableData) => {
    const lines = text.split('\n');
    return (
      <div key={blockKey} className="space-y-3.5 my-4">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1.5" />;
          }

          // Inline Specifications Table Command
          const TABLE_SHORTCODE_REGEX = /^\s*(\[(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE|BANG_THONG_SO_CHI_TIET)\]|\{\{(BANG_THONG_SO|BANG|TABLE|SPECS_TABLE)\}\})\s*$/i;
          if (TABLE_SHORTCODE_REGEX.test(trimmed)) {
            if (tableData && tableData.headers && tableData.headers.length > 0) {
              return renderSpecsTable(tableData, `table-inline-${blockKey}-${lIdx}`);
            }
            return null;
          }

          // Heading 1
          if (trimmed.startsWith('# ')) {
            return (
              <h3 key={lIdx} className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-6 mb-3 pt-3 border-b border-gray-200 pb-2.5">
                {renderInlineFormattedText(trimmed.replace(/^#\s+/, ''))}
              </h3>
            );
          }

          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={lIdx} className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-3 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-2.5 inline-block flex-shrink-0"></span>
                <span>{renderInlineFormattedText(trimmed.replace(/^##\s+/, ''))}</span>
              </h4>
            );
          }

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={lIdx} className="text-lg sm:text-xl font-bold text-primary mt-5 mb-2 flex items-center">
                {renderInlineFormattedText(trimmed.replace(/^###\s+/, ''))}
              </h5>
            );
          }

          // Bullet List
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={lIdx} className="flex items-start ml-2 sm:ml-4 text-gray-700">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="leading-relaxed text-base">{renderInlineFormattedText(trimmed.replace(/^[-*]\s+/, ''))}</span>
              </div>
            );
          }

          // Numbered List
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start ml-2 sm:ml-4 text-gray-700">
                <span className="font-bold text-primary mr-2 flex-shrink-0">{numMatch[1]}.</span>
                <span className="leading-relaxed text-base">{renderInlineFormattedText(numMatch[2])}</span>
              </div>
            );
          }

          // Standard Paragraph
          return (
            <p key={lIdx} className="text-gray-700 leading-relaxed text-base">
              {renderInlineFormattedText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Robust Markdown and Image Content Parser for Reader Modal
  const renderArticleContent = (content?: string, tableData?: TableData) => {
    if (!content) return null;

    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    let partIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textSegment = content.substring(lastIndex, match.index);
        if (textSegment.trim()) {
          elements.push(renderTextBlock(textSegment, `block-${partIndex++}`, tableData));
        }
      }

      const altText = match[1] || 'Hình ảnh minh họa';
      const imageUrl = match[2];

      elements.push(
        <figure key={`img-${partIndex++}`} className="my-6 text-center">
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50 inline-block w-full max-h-[500px]">
            <img 
              src={imageUrl} 
              alt={altText}
              className="w-full h-auto max-h-[500px] object-contain mx-auto transition-transform hover:scale-[1.01] duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = STOCK_IMAGES[0];
              }}
            />
          </div>
          {altText && (
            <figcaption className="text-xs sm:text-sm text-gray-500 mt-2.5 italic font-medium">
              📷 {altText}
            </figcaption>
          )}
        </figure>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText.trim()) {
        elements.push(renderTextBlock(remainingText, `block-${partIndex++}`, tableData));
      }
    }

    return <div>{elements}</div>;
  };

  const pageTitle = category === 'news' ? 'Tin tức chuyên ngành' : 'Kiến thức chuyên ngành';
  const pageSubtitle = category === 'news' 
    ? 'Cập nhật tình hình thị trường Logistics, xuất nhập khẩu, giá cước và biến động chuỗi cung ứng.' 
    : 'Cẩm nang nghiệp vụ xuất nhập khẩu, quy cách container, tra cứu Incoterms và quy trình hải quan chuẩn.';

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-primaryDark to-blue-950 text-white py-12 px-4 shadow-inner">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-200 mb-4">
            <button 
              onClick={onBack}
              className="hover:text-white transition flex items-center"
            >
              <ArrowLeft size={14} className="mr-1" /> Trang chủ
            </button>
            <ChevronRight size={14} />
            <span className="text-white font-semibold">{pageTitle}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
                {pageTitle}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base max-w-3xl leading-relaxed">
                {pageSubtitle}
              </p>
            </div>

            {/* Switch Category Pill Buttons */}
            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex border border-white/20 self-start md:self-auto">
              <button
                onClick={() => onChangeCategory('news')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  category === 'news'
                    ? 'bg-white text-primaryDark shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Tin tức chuyên ngành
              </button>
              <button
                onClick={() => onChangeCategory('knowledge')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  category === 'knowledge'
                    ? 'bg-white text-primaryDark shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Kiến thức chuyên ngành
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 mt-8">
        {/* Search Bar & Action Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Tìm kiếm trong ${pageTitle.toLowerCase()} (ví dụ: container, FOB, cước tàu, cảng...)...`}
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results count & Admin Add */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
              Hiển thị <span className="font-bold text-gray-900">{filteredItems.length}</span> bài viết
            </div>

            {isAdmin && (
              <button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primaryDark text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-primary/20 transition whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Đăng bài mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="articles-list-top">
          {/* LEFT: Main Articles List (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {sortedMainItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy bài viết phù hợp</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Không có bài viết nào khớp với từ khóa "{searchTerm}". Vui lòng thử tìm kiếm bằng từ khóa khác.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary/20 transition"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              <>
                {paginatedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={(e) => handleOpenArticle(item, e)}
                    className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl group cursor-pointer relative flex flex-col sm:flex-row ${
                      item.isPinned ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20 shadow-md' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Pinned Marker */}
                    {item.isPinned && (
                      <div className="absolute top-3 left-3 z-20 bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow flex items-center space-x-1">
                        <Pin size={12} className="fill-white" />
                        <span>ĐÃ GHIM</span>
                      </div>
                    )}

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-md border border-gray-200">
                        <button
                          onClick={(e) => handleTogglePin(item, e)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center ${
                            item.isPinned ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                          title={item.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết lên đầu"}
                        >
                          <Pin size={13} className={item.isPinned ? "fill-amber-700" : ""} />
                        </button>
                        <button
                          onClick={(e) => startEdit(item, e)}
                          className="p-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={(e) => promptDeleteNews(item, e)}
                          className="p-1.5 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition"
                          title="Xóa bài viết"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}

                    {/* Card Thumbnail */}
                    <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-900">
                      {item.mediaType === 'iframe' && item.iframeCode ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
                          <img 
                            src={item.thumbnail || STOCK_IMAGES[1]} 
                            alt={item.title} 
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" 
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-sm">
                              <Sparkles size={13} className="mr-1.5 text-amber-300" /> Mô hình 3D xoay 360°
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.thumbnail || STOCK_IMAGES[idx % STOCK_IMAGES.length]}
                          alt={item.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = STOCK_IMAGES[0];
                          }}
                        />
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
                      <div>
                        {/* Meta stats */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2.5">
                          <span className="flex items-center text-gray-500">
                            <Calendar size={13} className="mr-1 text-primary" />
                            {formatDate(item.pubDate)}
                          </span>
                          <span className="flex items-center font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            <Eye size={12} className="mr-1 text-blue-500" />
                            {(item.views || 0).toLocaleString()} lượt xem
                          </span>
                          {item.table && (
                            <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-[11px] flex items-center">
                              <TableIcon size={11} className="mr-1 text-blue-600" /> Có bảng thông số
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer link */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-primary flex items-center group-hover:underline">
                          <span>Đọc toàn bộ bài viết</span>
                          <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition" />
                        </span>

                        <span className="text-[11px] text-gray-400 font-medium">
                          {category === 'news' ? 'Tin chuyên ngành' : 'Cẩm nang nghiệp vụ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">
                      Đang hiển thị <span className="font-bold text-gray-900">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(safeCurrentPage * ITEMS_PER_PAGE, sortedMainItems.length)}</span> trong số <span className="font-bold text-gray-900">{sortedMainItems.length}</span> bài viết
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap justify-center">
                      {/* First Page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={safeCurrentPage === 1}
                        className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                          safeCurrentPage === 1 
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white shadow-xs'
                        }`}
                        title="Trang đầu"
                      >
                        <ChevronsLeft size={16} />
                      </button>

                      {/* Prev Page */}
                      <button
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1 ${
                          safeCurrentPage === 1 
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white shadow-xs'
                        }`}
                      >
                        <ChevronLeft size={16} />
                        <span className="hidden sm:inline">Trước</span>
                      </button>

                      {/* Numbered Buttons */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1;
                        })
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-1 text-gray-400 text-xs font-bold select-none">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`w-9 h-9 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center ${
                                  safeCurrentPage === page
                                    ? 'bg-primary text-white shadow-md shadow-primary/30 border border-primary'
                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white shadow-xs'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1 ${
                          safeCurrentPage === totalPages 
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white shadow-xs'
                        }`}
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight size={16} />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={safeCurrentPage === totalPages}
                        className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                          safeCurrentPage === totalPages 
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 bg-white shadow-xs'
                        }`}
                        title="Trang cuối"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Top Viewed Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Box 1: Most Viewed Articles */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Flame size={18} className="fill-orange-500 text-orange-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">Xem nhiều nhất</h3>
                    <p className="text-[11px] text-gray-500">Ưu tiên từ cao đến thấp</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full">
                  Top quan tâm
                </span>
              </div>

              <div className="space-y-3.5">
                {topViewedItems.map((item, index) => {
                  const rankNumber = index + 1;
                  let rankBadgeClass = "bg-gray-100 text-gray-600";
                  if (rankNumber === 1) rankBadgeClass = "bg-amber-400 text-amber-950 font-extrabold shadow-sm";
                  else if (rankNumber === 2) rankBadgeClass = "bg-slate-300 text-slate-900 font-extrabold";
                  else if (rankNumber === 3) rankBadgeClass = "bg-amber-700 text-white font-extrabold";

                  return (
                    <div
                      key={`top-${item.id}`}
                      onClick={(e) => handleOpenArticle(item, e)}
                      className="p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all cursor-pointer group flex items-start space-x-3"
                    >
                      {/* Rank number badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${rankBadgeClass}`}>
                        {rankNumber}
                      </div>

                      {/* Small thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        <img
                          src={item.thumbnail || STOCK_IMAGES[index % STOCK_IMAGES.length]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-gray-500">
                          <span className="flex items-center text-orange-600 font-bold">
                            <Eye size={11} className="mr-1" />
                            {(item.views || 0).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span>{formatDate(item.pubDate)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Consultation CTA */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-xl p-4 text-white text-center">
                  <h4 className="font-bold text-sm mb-1">Cần tư vấn báo giá Logistics?</h4>
                  <p className="text-xs text-gray-300 mb-3">Đội ngũ chuyên viên Long Hoàng sẵn sàng hỗ trợ 24/7</p>
                  <button
                    onClick={() => {
                      onBack();
                      setTimeout(() => {
                        const contact = document.querySelector('#contact');
                        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full bg-primary hover:bg-primaryDark text-white py-2 rounded-lg font-bold text-xs transition shadow-md"
                  >
                    Gửi yêu cầu báo giá ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom In-App Delete Confirmation Modal */}
      {deleteTarget && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteTarget(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa bài viết?</h3>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3">
              Bạn có chắc chắn muốn xóa bài viết: <span className="font-semibold text-gray-900">"{deleteTarget.title}"</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition text-sm"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteNews}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-md shadow-red-600/30 text-sm flex items-center"
              >
                <Trash2 size={16} className="mr-1.5" />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reader Modal */}
      {readingArticle && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setReadingArticle(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-5xl xl:max-w-6xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-10 md:p-12 relative my-auto cursor-default border border-gray-100"
          >
            {/* Close Button */}
            <button 
              onClick={() => setReadingArticle(null)} 
              className="absolute top-5 right-5 z-20 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-700 p-2 rounded-full transition shadow-sm"
              title="Đóng (hoặc nhấn phím Esc / bấm ra ngoài)"
            >
              <X size={22} />
            </button>

            {/* Meta & Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                readingArticle.category === 'knowledge' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {readingArticle.category === 'knowledge' ? 'Kiến thức chuyên ngành' : 'Tin tức chuyên ngành'}
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <Calendar size={14} className="mr-1" />
                {formatDate(readingArticle.pubDate)}
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <Eye size={14} className="mr-1" />
                {(readingArticle.views || 0).toLocaleString()} lượt xem
              </span>
              {readingArticle.isPinned && (
                <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center">
                  <Pin size={12} className="mr-1 fill-white" /> Đã ghim
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-8">
              {readingArticle.title}
            </h2>

            {/* Content & Inline Images */}
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-normal">
              {renderArticleContent(readingArticle.content, readingArticle.table)}

              {(!readingArticle.content || !readingArticle.content.includes('[BANG_THONG_SO]')) && 
                readingArticle.table && 
                renderSpecsTable(readingArticle.table, 'reader-table-fallback')
              }
            </div>

            {/* Reference Source Box */}
            {(readingArticle.sourceName || readingArticle.sourceUrl || (readingArticle.link && readingArticle.link !== '#')) && (
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-sm">
                <div className="flex items-start sm:items-center space-x-2 text-gray-700">
                  <ExternalLink size={18} className="text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-bold text-gray-900 mr-1.5">Nguồn tham khảo:</span>
                    <span className="text-gray-800 font-medium">{readingArticle.sourceName || readingArticle.sourceUrl || readingArticle.link}</span>
                  </div>
                </div>
                {((readingArticle.sourceUrl && readingArticle.sourceUrl.startsWith('http')) || (readingArticle.link && readingArticle.link.startsWith('http'))) && (
                  <a
                    href={readingArticle.sourceUrl || readingArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-1.5 bg-white hover:bg-primary hover:text-white text-primary border border-primary/30 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto"
                  >
                    <span>Xem liên kết gốc</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="text-xs text-gray-400 font-medium">
                Long Hoang Logistics Knowledge Base
              </div>
              <button
                onClick={() => setReadingArticle(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-bold text-sm transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Add/Edit Modal */}
      {(isAdding || isEditing !== null) && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={cancelEdit}
        >
          <div 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 relative my-auto cursor-default"
          >
            <button 
              onClick={cancelEdit} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              {isAdding ? <PlusCircle className="mr-2 text-primary" size={26} /> : <Edit className="mr-2 text-primary" size={26} />}
              {isAdding ? 'Đăng bài viết mới' : 'Chỉnh sửa bài viết'}
            </h3>
            
            <div className="space-y-5 text-sm text-gray-800">
              {/* Category & Pin Option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1.5 text-gray-700">Phân loại chuyên mục</label>
                  <select 
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none"
                    value={editData.category || category} 
                    onChange={e => setEditData({...editData, category: e.target.value as 'news' | 'knowledge'})}
                  >
                    <option value="news">Tin tức chuyên ngành (News)</option>
                    <option value="knowledge">Kiến thức chuyên ngành (Knowledge & Specs)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl w-full">
                    <input
                      type="checkbox"
                      checked={Boolean(editData.isPinned)}
                      onChange={e => setEditData({ ...editData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500 mr-2.5"
                    />
                    <span className="font-bold text-amber-900 text-sm flex items-center">
                      <Pin size={15} className="mr-1.5 fill-amber-700 text-amber-700" /> Ghim bài viết này lên vị trí đầu tiên
                    </span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold block mb-1.5 text-gray-700">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                <input 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none font-medium" 
                  value={editData.title || ''} 
                  onChange={e => setEditData({...editData, title: e.target.value})} 
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="font-bold block mb-1.5 text-gray-700">Mô tả ngắn (Lead / Tóm tắt ngoài danh sách) <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none" 
                  rows={2} 
                  value={editData.description || ''} 
                  onChange={e => setEditData({...editData, description: e.target.value})} 
                  placeholder="Đoạn tóm tắt hiển thị ngoài thẻ danh sách..."
                />
              </div>

              {/* Media Type Selection */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="font-bold block mb-2 text-gray-700">Ảnh bìa / Mô hình 3D (Đầu bài viết)</label>
                <div className="flex flex-wrap gap-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="mediaType" 
                      checked={editData.mediaType !== 'iframe'} 
                      onChange={() => setEditData({...editData, mediaType: 'image'})}
                      className="mr-2 text-primary"
                    />
                    <span>Hình ảnh bìa thông thường</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="mediaType" 
                      checked={editData.mediaType === 'iframe'} 
                      onChange={() => setEditData({...editData, mediaType: 'iframe'})}
                      className="mr-2 text-primary"
                    />
                    <span className="font-semibold text-primary">Mô hình 3D tương tác xoay 360° (Sketchfab Embed)</span>
                  </label>
                </div>

                {editData.mediaType === 'iframe' ? (
                  <div>
                    <textarea 
                      className="w-full border border-gray-300 p-3 rounded-lg font-mono text-xs bg-white focus:ring-2 focus:ring-primary/40 outline-none" 
                      rows={3} 
                      value={editData.iframeCode || ''} 
                      onChange={e => setEditData({...editData, iframeCode: e.target.value})} 
                      placeholder='<iframe src="https://sketchfab.com/models/2f53ec9741ea4db382a939f4fe6d4b29/embed"></iframe>'
                    />
                  </div>
                ) : (
                  <div>
                    <input 
                      className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none" 
                      value={editData.thumbnail || ''} 
                      onChange={e => setEditData({...editData, thumbnail: e.target.value})} 
                      placeholder="https://images.unsplash.com/... hoặc link ảnh kết thúc bằng .jpg/.png"
                    />
                  </div>
                )}
              </div>

              {/* Source & Reference Fields */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center space-x-2 text-primary font-bold text-sm">
                  <ExternalLink size={16} />
                  <span>Nguồn tham khảo / Liên kết gốc</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tên nguồn tham khảo / Đơn vị ban hành</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                      value={editData.sourceName || ''} 
                      onChange={e => setEditData({...editData, sourceName: e.target.value})} 
                      placeholder="VD: Tổng cục Hải quan, Hiệp hội VLA, Tạp chí Hàng hải..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Đường dẫn nguồn gốc (URL / Link bài viết gốc)</label>
                    <input 
                      type="text" 
                      className="w-full bg-white border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                      value={editData.sourceUrl || editData.link || ''} 
                      onChange={e => setEditData({...editData, sourceUrl: e.target.value, link: e.target.value})} 
                      placeholder="https://vla.com.vn/tin-tuc... hoặc https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Full Content Toolbar */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div>
                    <label className="font-bold text-gray-800 block">Nội dung chi tiết bài viết</label>
                    <p className="text-xs text-gray-500">Soạn thảo, định dạng tiêu đề, in đậm, danh sách và link nguồn tham khảo</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('**', '**', 'Chữ in đậm')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition border border-gray-200 shadow-sm"
                      title="Tô đậm văn bản được chọn"
                    >
                      <Bold size={13} className="mr-1" /> Tô đậm
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('## ', '', 'Tiêu đề mục')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition border border-gray-200 shadow-sm"
                      title="Tạo tiêu đề mục (không chèn dòng trống thừa)"
                    >
                      <Heading2 size={13} className="mr-1 text-primary" /> Tiêu đề mục
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertFormatAtCursor('- ', '', 'Nội dung danh sách')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center transition border border-gray-200 shadow-sm"
                      title="Tạo gạch đầu dòng (không chèn dòng trống thừa)"
                    >
                      <List size={13} className="mr-1" /> Gạch đầu dòng
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={openRefLinkPrompt}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition border shadow-sm ${
                        showRefLinkPrompt ? 'bg-primary text-white border-primary' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                      }`}
                      title="Chèn link nguồn tham khảo vào nội dung"
                    >
                      <ExternalLink size={13} className="mr-1" /> Link / Nguồn
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (!editData.table) handleToggleTable();
                        insertFormatAtCursor('\n\n[BANG_THONG_SO]\n\n', '', '');
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition shadow-sm"
                    >
                      <TableIcon size={13} className="mr-1 text-amber-700" /> Chèn Bảng vào bài
                    </button>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUploadContentImage} 
                    />
                    
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center transition shadow-sm"
                    >
                      <Upload size={13} className="mr-1" /> Tải ảnh
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowLinkPrompt(!showLinkPrompt);
                        setShowRefLinkPrompt(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center transition border border-gray-200 shadow-sm"
                    >
                      <Link2 size={13} className="mr-1" /> Link ảnh
                    </button>
                  </div>
                </div>

                {/* Reference Link Prompt Box */}
                {showRefLinkPrompt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 space-y-2">
                    <div className="text-xs font-bold text-blue-900 flex items-center">
                      <ExternalLink size={13} className="mr-1 text-primary" />
                      <span>Chèn liên kết / link nguồn tham khảo vào bài viết</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Tên nguồn / văn bản hiển thị (VD: Hiệp hội VLA)"
                        value={refLinkText}
                        onChange={e => setRefLinkText(e.target.value)}
                      />
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Đường dẫn liên kết (VD: https://vla.com.vn)"
                        value={refLinkUrl}
                        onChange={e => setRefLinkUrl(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRefLinkPrompt(false)}
                        className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded font-semibold hover:bg-gray-300 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertRefLink}
                        disabled={!refLinkUrl.trim()}
                        className="bg-primary text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-primaryDark disabled:opacity-50 transition"
                      >
                        Chèn vào nội dung
                      </button>
                    </div>
                  </div>
                )}

                {showLinkPrompt && (
                  <div className="bg-gray-50 border border-primary/20 rounded-lg p-3 mb-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Link ảnh (https://...jpg/.png)"
                        value={imgUrlInput}
                        onChange={e => setImgUrlInput(e.target.value)}
                      />
                      <input 
                        className="w-full bg-white border border-gray-300 p-2 rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Chú thích ảnh"
                        value={imgCaptionInput}
                        onChange={e => setImgCaptionInput(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleInsertLinkImage}
                        className="bg-primary text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-primaryDark transition"
                      >
                        Chèn vào bài viết
                      </button>
                    </div>
                  </div>
                )}

                <textarea 
                  ref={contentTextareaRef}
                  className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none leading-relaxed" 
                  rows={10} 
                  value={editData.content || ''} 
                  onChange={e => setEditData({...editData, content: e.target.value})} 
                  placeholder="Nội dung bài viết..."
                />
              </div>

              {/* Technical Table Editor Section */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-700">Bảng dữ liệu / Thông số kỹ thuật đính kèm</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleToggleTable}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        editData.table 
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                          : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                      }`}
                    >
                      {editData.table ? 'Xóa bảng' : '+ Thêm bảng dữ liệu'}
                    </button>

                    {editData.table && (
                      <>
                        <button
                          type="button"
                          onClick={addColumn}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition"
                        >
                          <Plus size={14} className="mr-1" /> Thêm cột
                        </button>
                        <button
                          type="button"
                          onClick={addRow}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition"
                        >
                          <Plus size={14} className="mr-1" /> Thêm hàng
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editData.table && (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {editData.table.headers.map((header, colIdx) => (
                            <th key={colIdx} className="p-2 border border-gray-200 min-w-[150px]">
                              <div className="flex items-center gap-1">
                                <input 
                                  className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded font-bold text-gray-800 focus:outline-none focus:border-primary"
                                  value={header}
                                  onChange={e => updateHeader(colIdx, e.target.value)}
                                  placeholder={`Tiêu đề cột ${colIdx + 1}`}
                                />
                                {editData.table!.headers.length > 1 && (
                                  <button 
                                    type="button"
                                    onClick={() => removeColumn(colIdx)} 
                                    className="text-gray-400 hover:text-red-500 p-1"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="p-2 border border-gray-200 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editData.table.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell, colIdx) => (
                              <td key={colIdx} className="p-2 border border-gray-200">
                                <input 
                                  className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-primary focus:bg-white px-2 py-1 rounded transition text-gray-700 outline-none"
                                  value={cell}
                                  onChange={e => updateCell(rowIdx, colIdx, e.target.value)}
                                  placeholder="Nhập giá trị..."
                                />
                              </td>
                            ))}
                            <td className="p-2 border border-gray-200 text-center">
                              {editData.table!.rows.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => removeRow(rowIdx)} 
                                  className="text-gray-400 hover:text-red-500 p-1 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-gray-200">
              <button 
                onClick={saveNews} 
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3.5 rounded-xl font-bold flex-1 shadow-lg shadow-primary/20 transition flex items-center justify-center"
              >
                Lưu bài viết
              </button>
              <button 
                onClick={cancelEdit} 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NewsCategoryPage;

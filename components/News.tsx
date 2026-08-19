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
  Pin,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { TableData, NewsItem, STOCK_IMAGES, DEFAULT_NEWS_ITEMS } from '../src/data/defaultArticles';

export type { TableData, NewsItem };

interface NewsProps {
  userRole?: string | null;
  manualNews?: NewsItem[];
  onUpdateNews?: (news: NewsItem[]) => void;
  onOpenCategoryPage?: (category: 'news' | 'knowledge') => void;
}

const News: React.FC<NewsProps> = ({ userRole, manualNews = [], onUpdateNews, onOpenCategoryPage }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'knowledge'>('news');
  
  const isAdmin = userRole === 'admin';
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Partial<NewsItem>>({});
  
  // Full article reader modal
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  // Custom Delete Confirmation Modal state (prevents iframe window.confirm blocking)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);

  // Content image upload & insertion states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  // Source / Link prompt state
  const [showRefLinkPrompt, setShowRefLinkPrompt] = useState(false);
  const [refLinkText, setRefLinkText] = useState('');
  const [refLinkUrl, setRefLinkUrl] = useState('');

  // Lock background scroll and handle Escape key when any modal is open
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

  const handleAddNew = () => {
    setIsAdding(true);
    setEditData({
      id: Date.now(),
      title: '',
      pubDate: new Date().toISOString(),
      link: '',
      sourceName: '',
      sourceUrl: '',
      thumbnail: STOCK_IMAGES[0],
      description: '',
      content: '',
      category: activeTab,
      isPinned: false,
      views: 0,
      mediaType: 'image',
      iframeCode: ''
    });
  };

  const startEdit = (item: NewsItem) => {
    setIsEditing(item.id);
    setEditData({ ...item });
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

  const promptDeleteNews = (item: NewsItem) => {
    setDeleteTarget(item);
  };

  const confirmDeleteNews = () => {
    if (!deleteTarget || !onUpdateNews) return;
    const targetIdStr = String(deleteTarget.id);
    const updated = currentSourceList.filter(n => String(n.id) !== targetIdStr);
    onUpdateNews(updated);
    setDeleteTarget(null);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setIsEditing(null);
    setShowLinkPrompt(false);
    setShowRefLinkPrompt(false);
  };

  const togglePin = (item: NewsItem) => {
    if (!onUpdateNews) return;
    const targetIdStr = String(item.id);
    const updated = currentSourceList.map(n => 
      String(n.id) === targetIdStr ? { ...n, isPinned: !n.isPinned } : n
    );
    onUpdateNews(updated);
  };

  // Helper to insert formatting tags at cursor position WITHOUT jumping / scrolling
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

  // Open Reference / Link prompt with selected text if any
  const openRefLinkPrompt = () => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = (editData.content || '').substring(start, end);
      if (selected.trim()) {
        setRefLinkText(selected.trim());
      }
    }
    setShowRefLinkPrompt(prev => !prev);
    setShowLinkPrompt(false);
  };

  // Insert reference / custom markdown link
  const handleInsertRefLink = () => {
    if (!refLinkUrl.trim()) return;
    const displayText = refLinkText.trim() || refLinkUrl.trim();
    const markdownLink = `[${displayText}](${refLinkUrl.trim()})`;
    insertFormatAtCursor(markdownLink, '', '');
    setRefLinkText('');
    setRefLinkUrl('');
    setShowRefLinkPrompt(false);
  };

  // Table Data Handlers
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

  const handleHeaderChange = (index: number, val: string) => {
    if (!editData.table) return;
    const newHeaders = [...editData.table.headers];
    newHeaders[index] = val;
    setEditData({
      ...editData,
      table: { ...editData.table, headers: newHeaders }
    });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    if (!editData.table) return;
    const newRows = editData.table.rows.map((row, ri) => {
      if (ri === rIdx) {
        const newRow = [...row];
        newRow[cIdx] = val;
        return newRow;
      }
      return row;
    });
    setEditData({
      ...editData,
      table: { ...editData.table, rows: newRows }
    });
  };

  const handleAddColumn = () => {
    if (!editData.table) return;
    const newHeaders = [...editData.table.headers, `Cột ${editData.table.headers.length + 1}`];
    const newRows = editData.table.rows.map(row => [...row, '-']);
    setEditData({
      ...editData,
      table: { headers: newHeaders, rows: newRows }
    });
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (!editData.table || editData.table.headers.length <= 1) return;
    const newHeaders = editData.table.headers.filter((_, i) => i !== colIndex);
    const newRows = editData.table.rows.map(row => row.filter((_, i) => i !== colIndex));
    setEditData({
      ...editData,
      table: { headers: newHeaders, rows: newRows }
    });
  };

  const handleAddRow = () => {
    if (!editData.table) return;
    const newRow = new Array(editData.table.headers.length).fill('-');
    setEditData({
      ...editData,
      table: { ...editData.table, rows: [...editData.table.rows, newRow] }
    });
  };

  const handleRemoveRow = (rIdx: number) => {
    if (!editData.table || editData.table.rows.length <= 1) return;
    const newRows = editData.table.rows.filter((_, i) => i !== rIdx);
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

  // Filter items by category from currentSourceList
  const filteredCategoryItems = currentSourceList.filter(n => (n.category || 'news') === activeTab);

  // Sort so pinned articles come first, then latest pubDate
  const sortedTabItems = [...filteredCategoryItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  // Exactly 3 priority items on the home section
  const displayNews = sortedTabItems.slice(0, 3);

  const handleArticleClick = (item: NewsItem) => {
    if (item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' || item.link.trim() === '') {
      setReadingArticle(item);
    } else if (item.link) {
      window.open(item.link, '_blank');
    }
  };

  return (
    <section id="news" className="py-20 bg-gray-50 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tin tức & Kiến thức</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Cập nhật thông tin thị trường Logistics mới nhất cùng kho kiến thức chuyên ngành chuyên sâu.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-200/80 p-1.5 rounded-2xl flex space-x-2 border border-gray-300/50 shadow-inner">
              <button
                onClick={() => setActiveTab('news')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === 'news'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Tin tức chuyên ngành
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === 'knowledge'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                Kiến thức chuyên ngành
              </button>
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-center mt-2">
              <button 
                onClick={handleAddNew}
                className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 shadow-sm transition"
              >
                <Plus size={18} />
                <span>Thêm {activeTab === 'news' ? 'Tin tức' : 'Kiến thức'} mới</span>
              </button>
            </div>
          )}
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

        {/* Modal Thêm/Sửa tin */}
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
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-2 h-6 bg-primary rounded-full mr-3 inline-block"></span>
                  {isAdding ? `Đăng bài ${activeTab === 'news' ? 'Tin tức' : 'Kiến thức'} mới` : `Chỉnh sửa bài viết`}
                </h3>
                <button 
                  onClick={cancelEdit} 
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề bài viết (*)</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition font-medium" 
                    value={editData.title || ''} 
                    onChange={e => setEditData({...editData, title: e.target.value})} 
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chuyên mục</label>
                    <select 
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition font-medium bg-white"
                      value={editData.category || activeTab}
                      onChange={e => setEditData({...editData, category: e.target.value as any})}
                    >
                      <option value="news">Tin tức chuyên ngành</option>
                      <option value="knowledge">Kiến thức chuyên ngành</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái Ghim bài</label>
                    <div className="flex items-center space-x-3 p-2.5 border border-gray-300 rounded-xl">
                      <input 
                        type="checkbox" 
                        id="isPinnedCheck"
                        className="w-5 h-5 text-primary rounded focus:ring-primary accent-primary cursor-pointer"
                        checked={Boolean(editData.isPinned)}
                        onChange={e => setEditData({...editData, isPinned: e.target.checked})}
                      />
                      <label htmlFor="isPinnedCheck" className="text-sm font-bold text-gray-700 cursor-pointer flex items-center">
                        <Pin size={15} className="mr-1.5 text-primary" /> Ghim bài viết lên đầu trang
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn gọn (*)</label>
                  <textarea 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition font-normal" 
                    rows={2} 
                    value={editData.description || ''} 
                    onChange={e => setEditData({...editData, description: e.target.value})} 
                    placeholder="Mô tả tóm tắt nội dung để hiển thị trên thẻ bài viết..."
                  />
                </div>

                {/* Media Type Switcher */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-2">Loại hình ảnh đại diện / Trực quan</label>
                  <div className="flex space-x-4 mb-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mediaType" 
                        value="image" 
                        checked={editData.mediaType !== 'iframe'} 
                        onChange={() => setEditData({...editData, mediaType: 'image'})}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <ImageIcon size={16} className="mr-1 text-gray-500" /> Hình ảnh tĩnh
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mediaType" 
                        value="iframe" 
                        checked={editData.mediaType === 'iframe'} 
                        onChange={() => setEditData({...editData, mediaType: 'iframe'})}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Sparkles size={16} className="mr-1 text-primary" /> Mô hình 3D xoay 360° (Mã nhúng iFrame)
                      </span>
                    </label>
                  </div>

                  {editData.mediaType === 'iframe' ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Mã nhúng iFrame (Ví dụ Sketchfab 3D)</label>
                      <textarea 
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-xs font-mono focus:ring-2 focus:ring-primary/40 outline-none" 
                        rows={3} 
                        value={editData.iframeCode || ''} 
                        onChange={e => setEditData({...editData, iframeCode: e.target.value})} 
                        placeholder='<iframe title="..." src="https://sketchfab.com/models/..." ...></iframe>'
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">URL Hình ảnh thu nhỏ</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary/40 outline-none" 
                        value={editData.thumbnail || ''} 
                        onChange={e => setEditData({...editData, thumbnail: e.target.value})} 
                        placeholder="https://images.unsplash.com/... hoặc link ảnh"
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

                {/* Content Toolbar */}
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
                    className="w-full border border-gray-300 p-3.5 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none leading-relaxed font-normal" 
                    rows={8} 
                    value={editData.content || ''} 
                    onChange={e => setEditData({...editData, content: e.target.value})} 
                    placeholder="Nhập nội dung bài viết..."
                  />
                </div>

                {/* Table Editor Section */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/70">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Bảng dữ liệu / Thông số kỹ thuật</h4>
                      <p className="text-xs text-gray-500">Tạo bảng so sánh, thông số kỹ thuật trực quan</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleTable}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition ${
                        editData.table 
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                          : 'bg-primary text-white border-transparent hover:bg-primaryDark'
                      }`}
                    >
                      {editData.table ? 'Xóa Bảng' : '+ Tạo Bảng Mới'}
                    </button>
                  </div>

                  {editData.table && (
                    <div className="mt-4 space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddColumn}
                          className="bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1 rounded shadow-sm hover:bg-gray-100 flex items-center font-semibold"
                        >
                          <Plus size={12} className="mr-1" /> Thêm Cột
                        </button>
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="bg-white border border-gray-300 text-gray-700 text-xs px-2.5 py-1 rounded shadow-sm hover:bg-gray-100 flex items-center font-semibold"
                        >
                          <Plus size={12} className="mr-1" /> Thêm Hàng
                        </button>
                      </div>

                      <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-primary/10 border-b border-gray-300">
                              {editData.table.headers.map((h, i) => (
                                <th key={i} className="p-2 border-r border-gray-300 last:border-r-0 min-w-[120px]">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                                      className="w-full bg-white border border-gray-300 rounded p-1 font-bold text-gray-800"
                                    />
                                    {editData.table && editData.table.headers.length > 1 && (
                                      <button 
                                        type="button"
                                        onClick={() => handleRemoveColumn(i)}
                                        className="text-red-500 hover:text-red-700 p-0.5"
                                        title="Xóa cột"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="p-1 w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {editData.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-gray-200 last:border-0">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border-r border-gray-200 last:border-r-0">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                      className="w-full bg-transparent border-0 border-b border-dashed border-gray-300 focus:border-primary outline-none p-1"
                                    />
                                  </td>
                                ))}
                                <td className="p-1 text-center">
                                  {editData.table && editData.table.rows.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRow(rIdx)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title="Xóa dòng"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={cancelEdit} 
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button"
                  onClick={saveNews} 
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold shadow-md shadow-primary/20 transition flex items-center space-x-2"
                >
                  <PlusCircle size={18} />
                  <span>{isAdding ? 'Đăng bài viết' : 'Lưu cập nhật'}</span>
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
              <button 
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition z-20 shadow-sm"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-primary/10 text-primary font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center">
                  <Calendar size={13} className="mr-1.5" />
                  {formatDate(readingArticle.pubDate)}
                </span>
                {readingArticle.category === 'knowledge' ? (
                  <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center">
                    <BookOpen size={13} className="mr-1.5" /> Kiến thức Logistics
                  </span>
                ) : (
                  <span className="bg-blue-50 text-blue-700 font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center">
                    <Info size={13} className="mr-1.5" /> Tin tức thị trường
                  </span>
                )}
                {readingArticle.isPinned && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs px-3 py-1.5 rounded-full flex items-center">
                    <Pin size={12} className="mr-1 fill-amber-700" /> Bài viết nổi bật
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-8">
                {readingArticle.title}
              </h2>

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

        {displayNews.length === 0 ? (
          <div className="text-center text-gray-500 h-48 flex items-center justify-center">
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <style>{`
              .media-iframe-container iframe {
                width: 100% !important;
                height: 100% !important;
                border: none;
                pointer-events: auto;
              }
            `}</style>
            {displayNews.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 relative"
              >
                {/* Admin controls per item */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-30 flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(item); }}
                      className={`p-2 rounded-lg shadow transition ${
                        item.isPinned 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-white/95 text-gray-600 hover:bg-blue-600 hover:text-white'
                      }`}
                      title={item.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết lên đầu"}
                    >
                      <Pin size={14} className={item.isPinned ? "fill-current" : ""} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(item); }} 
                      className="bg-white/95 text-blue-600 p-2 rounded-lg shadow hover:bg-blue-600 hover:text-white transition"
                      title="Chỉnh sửa bài"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); promptDeleteNews(item); }} 
                      className="bg-white/95 text-red-500 p-2 rounded-lg shadow hover:bg-red-500 hover:text-white transition"
                      title="Xóa bài"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                
                {/* Card Media Header */}
                {item.mediaType === 'iframe' && item.iframeCode ? (
                  <div className="block overflow-hidden h-64 relative bg-gray-950 media-iframe-container">
                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.iframeCode }} />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center shadow-sm">
                         <Calendar size={12} className="mr-1" />
                         {formatDate(item.pubDate)}
                      </div>
                      {item.isPinned && (
                        <div className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center shadow-sm">
                          <Pin size={11} className="mr-1 fill-current" /> Đã ghim
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => handleArticleClick(item)} 
                    className="block overflow-hidden h-48 relative cursor-pointer"
                  >
                     <img 
                       src={item.thumbnail || STOCK_IMAGES[index % STOCK_IMAGES.length]} 
                       alt={item.title} 
                       className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                       onError={(e) => {
                        (e.target as HTMLImageElement).src = STOCK_IMAGES[index % STOCK_IMAGES.length];
                      }}
                     />
                     <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center shadow-sm">
                           <Calendar size={12} className="mr-1" />
                           {formatDate(item.pubDate)}
                        </div>
                        {item.isPinned && (
                          <div className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center shadow-sm">
                            <Pin size={11} className="mr-1 fill-current" /> Đã ghim
                          </div>
                        )}
                     </div>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <div 
                    onClick={() => handleArticleClick(item)} 
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors line-clamp-2" title={item.title}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleArticleClick(item)}
                      className="inline-flex items-center text-primary font-bold hover:underline text-sm uppercase tracking-wide cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      {item.content || item.table || item.category === 'knowledge' || !item.link || item.link === '#' ? (
                        <BookOpen size={14} className="ml-1.5" />
                      ) : (
                        <ExternalLink size={14} className="ml-1.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 flex items-center" title="Lượt xem bài viết">
                        <Eye size={13} className="mr-1 text-gray-400" />
                        {item.views || (item.isPinned ? 1520 : 340)}
                      </span>
                      {item.table && (
                        <span className="text-[11px] font-semibold text-gray-400 flex items-center bg-gray-100 px-2 py-0.5 rounded">
                          <TableIcon size={12} className="mr-1 text-primary" /> Bảng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All CTA Button */}
        {onOpenCategoryPage && (
          <div className="mt-12 text-center">
            <button
              onClick={() => onOpenCategoryPage(activeTab)}
              className="inline-flex items-center gap-2 bg-white hover:bg-primary hover:text-white text-gray-800 font-bold px-8 py-3.5 rounded-full border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 text-sm group"
            >
              <span>
                {activeTab === 'news' 
                  ? 'Xem tất cả Tin tức chuyên ngành' 
                  : 'Xem tất cả Kiến thức chuyên ngành'}
              </span>
              <ArrowRight size={16} className="text-primary group-hover:text-white transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default News;

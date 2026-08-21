import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Mail, Phone, Calendar, Package, MapPin, Search, Trash2, CheckCircle2 } from 'lucide-react';

interface QuoteRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  commodity?: string;
  volume?: string;
  origin?: string;
  destination?: string;
  service: string;
  otherRequirements?: string;
  status: 'new' | 'contacted' | 'resolved' | 'archived';
  createdAt: any;
}

export const ConsoleQuotesTab: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuoteRequest[];
      setQuotes(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching quotes:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'quotes', id), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác.')) return;
    try {
      await deleteDoc(doc(db, 'quotes', id));
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Không thể xóa yêu cầu.');
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.phone?.includes(searchQuery) || 
                          q.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[11px] font-bold uppercase tracking-wider">Mới</span>;
      case 'contacted': return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[11px] font-bold uppercase tracking-wider">Đã liên hệ</span>;
      case 'resolved': return <span className="px-2 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded text-[11px] font-bold uppercase tracking-wider">Hoàn tất</span>;
      default: return <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[11px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'N/A';
    const d = timestamp.toDate();
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm Tên, SĐT, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 text-sm text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới (Chưa xử lý)</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="resolved">Hoàn tất</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/40">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Không có dữ liệu liên hệ nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuotes.map(quote => (
            <div key={quote.id} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors flex flex-col md:flex-row gap-6 relative">
              {/* Left Column: Customer Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {quote.fullName}
                    {getStatusBadge(quote.status)}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 md:hidden">
                    <Calendar className="w-3 h-3" />
                    {formatDate(quote.createdAt)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a href={`tel:${quote.phone}`} className="hover:text-blue-400 transition-colors">{quote.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a href={`mailto:${quote.email}`} className="hover:text-blue-400 transition-colors">{quote.email}</a>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/50 mt-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-slate-200">
                      <span className="text-slate-400">Dịch vụ quan tâm: </span>
                      <strong className="text-amber-400">{quote.service}</strong>
                    </div>
                  </div>
                  
                  {(quote.commodity || quote.volume) && (
                    <div className="flex items-start gap-2 text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="space-y-1">
                        {quote.commodity && <div><span className="text-slate-500">Hàng hóa: </span>{quote.commodity}</div>}
                        {quote.volume && <div><span className="text-slate-500">Khối lượng: </span>{quote.volume}</div>}
                        {(quote.origin || quote.destination) && (
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{quote.origin || '?'}</span>
                            <span className="text-slate-600">&rarr;</span>
                            <span>{quote.destination || '?'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {quote.otherRequirements && (
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm">
                      <span className="text-slate-500 block mb-1">Ghi chú thêm:</span>
                      <p className="text-slate-300 italic">"{quote.otherRequirements}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex md:flex-col items-center justify-between md:items-end gap-4 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
                <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(quote.createdAt)}
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={quote.status}
                    onChange={(e) => handleUpdateStatus(quote.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded py-1.5 px-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="new">Đánh dấu: Mới</option>
                    <option value="contacted">Đã liên hệ</option>
                    <option value="resolved">Hoàn tất</option>
                  </select>

                  <button 
                    onClick={() => handleDelete(quote.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Xóa yêu cầu này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

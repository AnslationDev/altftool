import { useState, useEffect, useMemo } from 'react';
// Removed react-router-dom
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Link2, ChevronRight, RefreshCw, Inbox, AlertTriangle, Search, Trash2, Trash, Loader2 } from 'lucide-react';
import { getHistory, isConfigured, deleteHistoryItem, clearAllHistory, subscribeToHistory } from '../services/firebase';
import { cn } from '../lib/utils';

function formatTime(timestamp) {
  if (!timestamp) return '—';
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-[var(--card)] border rounded-xl p-5 animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--muted)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--muted)] rounded w-2/3" />
            <div className="h-3 bg-[var(--muted)] rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function History({ navigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Real-time listener for the first page
  useEffect(() => {
    if (!isConfigured) {
      const finishLoading = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(finishLoading);
    }

    const startLoading = setTimeout(() => setLoading(true), 0);
    const unsubscribe = subscribeToHistory(({ items, lastVisible }) => {
      setHistory(items);
      setLastVisible(lastVisible);
      setHasMore(items.length === 10);
      setLoading(false);
    }, 10);

    return () => {
      clearTimeout(startLoading);
      unsubscribe();
    };
  }, []);

  const fetchMoreHistory = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const result = await getHistory(20, lastVisible);
    
    setHistory(prev => [...prev, ...result.items]);
    setLastVisible(result.lastVisible);
    setHasMore(result.items.length === 20);
    setIsLoadingMore(false);
  };

  // SEO: Update page title
  useEffect(() => {
    document.title = 'Trace History | WhereGoes - Redirect Analyzer';
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Subscription handles updates, but we can re-trigger if needed or just show a pulse
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleView = (item) => {
    navigate('/result', { state: { result: item.result, url: item.url } });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trace?')) return;
    
    const success = await deleteHistoryItem(id);
    if (success) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL history? This action cannot be undone.')) return;
    setIsDeletingAll(true);
    const success = await clearAllHistory();
    if (success) {
      setHistory([]);
      setHasMore(false);
      setLastVisible(null);
    }
    setIsDeletingAll(false);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    return history.filter(item => 
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.result?.finalUrl && item.result.finalUrl.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [history, searchTerm]);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-6 text-[13px] font-medium text-muted-foreground">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              New Trace
            </button>
            <span className="text-border">/</span>
            <span className="text-foreground">History</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">Trace History</h1>
              <p className="text-muted-foreground text-[14px] mt-1.5">View and manage your recent URL redirect analysis logs.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isDeletingAll || refreshing}
                  className="btn-secondary h-11 px-4 text-xs gap-2 rounded-xl text-rose-500 hover:bg-rose-50 border-rose-100 font-bold transition-all"
                >
                  <Trash size={14} className={isDeletingAll ? 'animate-pulse' : ''} />
                  {isDeletingAll ? 'Clearing...' : 'Clear All'}
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing || !isConfigured}
                className="btn-secondary h-11 px-4 text-xs gap-2 rounded-xl font-bold transition-all"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search URLs or destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--card)] border border-border shadow-sm rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground bg-[var(--muted)] px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Firebase Configuration Notice */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-start gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-5 py-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-black text-[15px] mb-0.5 uppercase tracking-wide">Storage Disabled</p>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-[13px] leading-relaxed">
                Connect your Firebase project in <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">.env</code> to persist history across sessions and devices.
              </p>
            </div>
          </motion.div>
        )}

        {/* Results List */}
        {loading ? (
          <HistorySkeleton />
        ) : filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-6 text-center border-2 border-dashed rounded-3xl border-border bg-[var(--muted)]/5 mt-4" style={{ backgroundColor: 'color-mix(in srgb, var(--muted), transparent 95%)' }}
          >
            <div className="w-24 h-24 rounded-3xl bg-[var(--card)] border shadow-sm flex items-center justify-center">
              <Inbox size={40} className="text-muted-foreground opacity-20" />
            </div>
            <div>
              <p className="text-foreground font-black text-2xl mb-2">
                {searchTerm ? 'No results matched' : 'History is empty'}
              </p>
              <p className="text-muted-foreground text-[15px] max-w-sm mx-auto leading-relaxed">
                {searchTerm ? `We couldn't find any traces matching "${searchTerm}". Try a different search term.` : 'Run your first URL redirect trace to see it listed here.'}
              </p>
            </div>
            {!searchTerm && (
              <button onClick={() => navigate('/')} className="btn-primary h-12 px-8 mt-2 rounded-xl text-[15px] font-bold shadow-lg shadow-primary/20">
                Trace a URL now
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-3"
            >
              {filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="relative group bg-[var(--card)] border shadow-sm hover:shadow-xl hover:border-primary/40 rounded-2xl transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => handleView(item)}
                    className="w-full text-left p-5 sm:p-6 flex items-center gap-5 transition-all duration-300 pr-20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-300 border border-primary/10">
                      <Link2 size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-mono font-bold text-foreground truncate group-hover:text-primary transition-colors leading-none mb-3">
                        {item.url}
                      </p>
                      
                      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                        <span className="text-[11px] text-muted-foreground font-black flex items-center gap-1.5 bg-[var(--muted)]/80 px-3 py-1.5 rounded-lg border border-border/50 uppercase tracking-widest leading-none" style={{ backgroundColor: 'color-mix(in srgb, var(--muted), transparent 20%)' }}>
                          <Clock size={12} className="text-primary/60" />
                          {formatTime(item.timestamp)}
                        </span>
                        
                        {item.result?.chain && (
                          <span className="text-[13px] text-muted-foreground flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="font-black text-foreground/80">{item.result.chain.length}</span> hops analyzed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--muted)]/30 group-hover:bg-primary/10 flex-shrink-0 transition-all duration-300" style={{ backgroundColor: 'color-mix(in srgb, var(--muted), transparent 70%)' }}>
                      <ChevronRight size={22} className="text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                    </div>
                  </button>

                  {/* Delete Button (Visible on Hover) */}
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute right-14 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-500/0 hover:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all z-20"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination / Load More */}
            {hasMore && !searchTerm && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={fetchMoreHistory}
                  disabled={isLoadingMore}
                  className="btn-secondary h-14 px-10 rounded-2xl text-[15px] font-black gap-3 border shadow-md hover:shadow-lg transition-all min-w-[240px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-primary" />
                      Fetching More Logs...
                    </>
                  ) : (
                    'Load More Results'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

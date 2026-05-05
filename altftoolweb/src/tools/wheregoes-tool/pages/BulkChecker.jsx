import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Play, Loader2, Download, Table, X, Eye, LayoutList, Share2 } from 'lucide-react';
import axios from 'axios';
import RedirectTimeline from '../components/RedirectTimeline';
import VisualGraph from '../components/VisualGraph';
import { cn } from '../lib/utils';

const API_URL = 'https://wheregoes-t1wo.onrender.com/api';

export default function BulkChecker() {
  const [urls, setUrls] = useState([]);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const [selectedResult, setSelectedResult] = useState(null);
  const [modalView, setModalView] = useState('timeline'); // timeline or graph

  // SEO: Update page title
  useEffect(() => {
    document.title = 'Bulk URL Checker | WhereGoes - Batch Redirect Trace';
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedUrls = results.data
          .flat()
          .map(u => u?.toString().trim())
          .filter(u => u && u.includes('.'));
        
        if (parsedUrls.length === 0) {
          setError('No valid URLs found in the file.');
          return;
        }
        
        setUrls(parsedUrls.slice(0, 20)); // Limit to 20 for now
        setResults(null);
        setError('');
      },
      header: false,
      skipEmptyLines: true
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'] },
    multiple: false
  });

  const handleRunBatch = async () => {
    if (urls.length === 0) return;
    setIsProcessing(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/bulk`, { urls });
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Batch processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    const csvData = results.map(r => ({
      Source: r.url,
      Status: r.success ? 'Success' : 'Failed',
      Hops: r.chain?.length || 0,
      Final: r.finalUrl || 'N/A',
      Error: r.error || ''
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wheregoes-bulk-results.csv';
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black mb-3">Bulk URL Checker</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload a CSV or TXT file with a list of URLs to trace them all at once.
          Batch limit: 20 URLs per request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Side */}
        <div className="lg:col-span-1 space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-[var(--card)]/50"
            )}
            style={!isDragActive ? { backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)' } : {}}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Upload size={24} />
            </div>
            <p className="font-bold mb-1">Upload File</p>
            <p className="text-xs text-muted-foreground">CSV or TXT files only</p>
          </div>

          {urls.length > 0 && (
            <div className="bg-[var(--card)] border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Queued URLs ({urls.length})</span>
                <button 
                  onClick={() => setUrls([])}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                {urls.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border text-[13px] font-mono">
                    <FileText size={14} className="text-muted-foreground" />
                    <span className="truncate">{u}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleRunBatch}
                disabled={isProcessing || urls.length === 0}
                className="btn-primary w-full mt-6 h-12 gap-2"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                {isProcessing ? 'Processing...' : 'Run Batch Trace'}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Side */}
        <div className="lg:col-span-2">
          {!results && !isProcessing && (
            <div className="h-full min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <Table size={48} className="opacity-20 mb-4" />
              <p className="font-medium text-lg">Results will appear here</p>
              <p className="text-sm">Upload a file and run the trace to see results.</p>
            </div>
          )}

          {isProcessing && (
            <div className="h-full min-h-[400px] border rounded-2xl flex flex-col items-center justify-center bg-[var(--card)] shadow-sm">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
              <p className="font-bold text-xl mb-2">Tracing Redirects</p>
              <p className="text-muted-foreground">Analyzing {urls.length} URLs, please wait...</p>
            </div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Batch Results</h3>
                  <button
                    onClick={downloadResults}
                    className="btn-secondary h-9 px-4 text-xs gap-2"
                  >
                    <Download size={14} />
                    Download CSV
                  </button>
                </div>

                <div className="space-y-3">
                  {results.map((r, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                      onClick={() => r.success && setSelectedResult(r)}
                      className={cn(
                        "bg-[var(--card)] border rounded-xl p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer group",
                        !r.success && "cursor-default opacity-80"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[11px] text-muted-foreground font-mono truncate">{r.url}</p>
                            {r.success && (
                              <Eye size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          {r.success ? (
                            <p className="font-bold text-[14px] text-foreground truncate">
                              {r.finalUrl}
                            </p>
                          ) : (
                            <p className="text-rose-500 text-[14px] font-medium">{r.error}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {r.success ? (
                            <>
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-500/20">
                                {r.chain?.length} HOPS
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                {r.totalTime}ms
                              </span>
                            </>
                          ) : (
                            <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-500/20">
                              FAILED
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--card)] border shadow-xl rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                <div className="min-w-0 mr-4">
                  <h3 className="font-black text-lg truncate">Result Details</h3>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">{selectedResult.url}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="hidden sm:flex p-1 bg-muted rounded-xl border">
                    <button
                      onClick={() => setModalView('timeline')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        modalView === 'timeline' ? "bg-[var(--card)] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutList size={12} />
                      Timeline
                    </button>
                    <button
                      onClick={() => setModalView('graph')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                        modalView === 'graph' ? "bg-[var(--card)] text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Share2 size={12} />
                      Graph
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedResult(null)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted-foreground/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {modalView === 'timeline' ? (
                  <RedirectTimeline
                    chain={selectedResult.chain}
                    totalTime={selectedResult.totalTime}
                    finalUrl={selectedResult.finalUrl}
                    warnings={selectedResult.warnings}
                  />
                ) : (
                  <div className="h-[500px] border rounded-2xl overflow-hidden">
                    <VisualGraph chain={selectedResult.chain} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

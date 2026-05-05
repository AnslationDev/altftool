import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, Loader2, Code, ChevronRight, Hash, Globe, Activity } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = 'https://wheregoes-t1wo.onrender.com/api';

export default function ApiTester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('response'); // response, headers, request

  // SEO: Update page title
  useEffect(() => {
    document.title = 'API Tester | WhereGoes - Debug HTTP Requests';
  }, []);

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (i, field, val) => {
    const newHeaders = [...headers];
    newHeaders[i][field] = val;
    setHeaders(newHeaders);
  };
  const removeHeader = (i) => setHeaders(headers.filter((_, idx) => idx !== i));

  const handleRunTest = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setResponse(null);

    const headerObj = {};
    headers.forEach(h => {
      if (h.key && h.value) headerObj[h.key.toLowerCase()] = h.value;
    });

    try {
      const res = await axios.post(`${API_URL}/test`, {
        url,
        method,
        headers: headerObj,
        body: method !== 'GET' ? body : null
      });
      setResponse(res.data);
    } catch (err) {
      setResponse({
        success: false,
        error: err.response?.data?.error || err.message,
        duration: err.response?.data?.duration || 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-3">API Tester</h1>
        <p className="text-muted-foreground">
          Manually test API endpoints with custom methods, headers, and payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Panel */}
        <div className="space-y-6">
          <form onSubmit={handleRunTest} className="bg-[var(--card)] border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-[var(--muted)] border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
              <div className="flex-1 flex items-center bg-[var(--muted)] border rounded-xl px-4 py-3 group focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <Globe size={18} className="text-muted-foreground mr-3" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/resource"
                  className="bg-transparent flex-1 outline-none text-[15px] font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Headers</p>
                <button type="button" onClick={addHeader} className="text-[11px] font-bold text-primary hover:underline uppercase">
                  + Add Header
                </button>
              </div>
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                      className="flex-1 bg-muted/50 border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                      className="flex-1 bg-muted/50 border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeader(i)}
                      className="px-2 text-muted-foreground hover:text-rose-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {method !== 'GET' && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Request Body (JSON)</p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="w-full h-40 bg-muted/50 border rounded-xl p-4 text-xs font-mono outline-none focus:border-primary/50 resize-none"
                />
              </div>
            )}

            <button
              disabled={isLoading || !url}
              className="btn-primary w-full h-14 text-lg gap-2"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
              {isLoading ? 'Running...' : 'Send Request'}
            </button>
          </form>
        </div>

        {/* Response Panel */}
        <div className="space-y-6">
          {!response && !isLoading && (
            <div className="h-full min-h-[500px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <Terminal size={48} className="opacity-20 mb-4" />
              <p className="font-medium text-lg">Response will appear here</p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[500px] border rounded-2xl flex flex-col items-center justify-center bg-[var(--card)] shadow-sm">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6"
              >
                <Activity size={32} />
              </motion.div>
              <p className="font-bold text-xl">Calling API...</p>
            </div>
          )}

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--card)] border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]"
              >
                {/* Status Bar */}
                <div className="bg-[var(--muted)]/50 border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--muted), transparent 50%)' }}>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-bold",
                      response.status >= 200 && response.status < 300 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    )}>
                      {response.status || 'ERR'} {response.statusText}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{response.duration}ms</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                  {['response', 'headers', 'request'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all",
                        activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-6 font-mono text-[13px] bg-muted/10">
                  {activeTab === 'response' && (
                    <pre className="whitespace-pre-wrap">
                      {typeof response.data === 'object' 
                        ? JSON.stringify(response.data, null, 2) 
                        : response.data || response.error || 'Empty response'}
                    </pre>
                  )}
                  {activeTab === 'headers' && (
                    <div className="space-y-2">
                      {Object.entries(response.headers || {}).map(([k, v]) => (
                        <div key={k} className="flex gap-4 border-b border-border/50 pb-2">
                          <span className="text-primary font-bold min-w-[120px]">{k}:</span>
                          <span className="break-all">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'request' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-primary font-bold mb-1 uppercase text-[11px]">Endpoint</p>
                        <p className="break-all">{response.request?.method} {url}</p>
                      </div>
                      <div>
                        <p className="text-primary font-bold mb-1 uppercase text-[11px]">Sent Headers</p>
                        {Object.entries(response.request?.headers || {}).map(([k, v]) => (
                          <div key={k} className="flex gap-4">
                            <span className="text-muted-foreground min-w-[100px]">{k}:</span>
                            <span>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

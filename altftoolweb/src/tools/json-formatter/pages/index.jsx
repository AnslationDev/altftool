"use client";

import React, { useState, useMemo } from 'react';
import {
  Braces,
  Settings,
  Trash2,
  Copy,
  Check,
  Download,
  Plus,
  Globe,
  Terminal,
  AlertCircle,
  Code2,
  Link,
  Server,
  RefreshCw,
  Send
} from 'lucide-react';

const SAMPLES = {
  regular: {
    "name": "Jane Doe",
    "version": "1.0.0",
    "isActive": true,
    "role": "Developer",
    "details": {
      "skills": ["JavaScript", "React", "Node.js", "Tailwind CSS"],
      "experience_years": 5,
      "location": { "city": "San Francisco", "timezone": "PST" }
    },
    "metadata": { "last_login": "2026-05-26T11:18:50Z", "ip_address": "192.168.1.1" }
  },
  get: "https://api.altftool.com/v1/search?q=developer+tools&category=web&limit=10&page=1&sort=popularity&active=true",
  post: "grant_type=authorization_code&code=auth_code_987654&client_id=altftool_developer&client_secret=super_secure_secret_xyz&redirect_uri=https%3A%2F%2Faltftool.com%2Fcallback",
  postJson: {
    "api_version": "v2",
    "action": "create_user",
    "payload": {
      "username": "coder_pro",
      "email": "pro@altftool.com",
      "subscription": { "tier": "enterprise", "billing": "annual" }
    }
  }
};

function getIndentString(indentSize) {
  if (indentSize === 'tab') return '\t';
  return ' '.repeat(Number(indentSize));
}

export default function ToolHome() {
  const [toolMode, setToolMode] = useState('regular');
  const [rawText, setRawText] = useState(JSON.stringify(SAMPLES.regular, null, 2));
  const [urlInput, setUrlInput] = useState(SAMPLES.get);
  const [formInput, setFormInput] = useState(SAMPLES.post);
  const [indentSize, setIndentSize] = useState('2');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [apiParams, setApiParams] = useState([
    { key: 'q', value: 'developer tools' },
    { key: 'category', value: 'web' },
    { key: 'limit', value: '10' }
  ]);

  const safeJsonParse = (str) => {
    try {
      return { data: JSON.parse(str), error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const getParamsObject = (paramsList) => {
    const obj = {};
    paramsList.forEach(p => {
      if (p.key.trim()) {
        const v = p.value.trim();
        if (v === 'true') obj[p.key.trim()] = true;
        else if (v === 'false') obj[p.key.trim()] = false;
        else if (!isNaN(v) && v !== '') obj[p.key.trim()] = Number(v);
        else obj[p.key.trim()] = v;
      }
    });
    return obj;
  };

  const results = useMemo(() => {
    const indent = getIndentString(indentSize);
    if (toolMode === 'regular') {
      const { data, error } = safeJsonParse(rawText);
      return error
        ? { formatted: '', error: `Invalid JSON: ${error}`, minified: '', parsedData: null }
        : { formatted: JSON.stringify(data, null, indent), minified: JSON.stringify(data), error: null, parsedData: data };
    }
    if (toolMode === 'get') {
      try {
        const parts = urlInput.includes('?') ? urlInput.split('?') : [urlInput, ''];
        const params = new URLSearchParams(parts[1]);
        const obj = {};
        params.forEach((value, key) => { obj[key] = value; });
        return { formatted: JSON.stringify(obj, null, indent), minified: JSON.stringify(obj), error: null, parsedData: obj, baseUrl: parts[0] };
      } catch (err) {
        return { formatted: '', error: `URL Parsing Error: ${err.message}`, minified: '', parsedData: null };
      }
    }
    if (toolMode === 'post') {
      try {
        const params = new URLSearchParams(formInput);
        const obj = {};
        params.forEach((value, key) => { obj[key] = value; });
        return { formatted: JSON.stringify(obj, null, indent), minified: JSON.stringify(obj), error: null, parsedData: obj };
      } catch (err) {
        return { formatted: '', error: `Form Parsing Error: ${err.message}`, minified: '', parsedData: null };
      }
    }
    if (toolMode === 'postJson') {
      const { data, error } = safeJsonParse(rawText);
      return error
        ? { formatted: '', error: `Invalid JSON payload: ${error}`, minified: '', parsedData: null }
        : { formatted: JSON.stringify(data, null, indent), minified: JSON.stringify(data), error: null, parsedData: data };
    }
    return { formatted: '', error: 'Unknown Mode', minified: '', parsedData: null };
  }, [toolMode, rawText, urlInput, formInput, indentSize]);

  const updateParamsFromSource = (parsedObj) => {
    if (!parsedObj || typeof parsedObj !== 'object') return;
    const newParams = Object.entries(parsedObj).map(([key, val]) => ({
      key, value: typeof val === 'object' ? JSON.stringify(val) : String(val)
    }));
    setApiParams(newParams.length ? newParams : [{ key: '', value: '' }]);
  };

  const handleParamEdit = (index, key, val) => {
    const updated = [...apiParams];
    updated[index] = { key, value: val };
    setApiParams(updated);
    const obj = getParamsObject(updated);
    if (toolMode === 'get') {
      const searchParams = new URLSearchParams();
      Object.entries(obj).forEach(([k, v]) => searchParams.append(k, String(v)));
      setUrlInput(`${results.baseUrl || 'https://api.altftool.com/v1/search'}?${searchParams.toString()}`);
    } else if (toolMode === 'post') {
      const searchParams = new URLSearchParams();
      Object.entries(obj).forEach(([k, v]) => searchParams.append(k, String(v)));
      setFormInput(searchParams.toString());
    } else {
      setRawText(JSON.stringify(obj, null, getIndentString(indentSize)));
    }
  };

  const addParamRow = () => setApiParams([...apiParams, { key: '', value: '' }]);

  const removeParamRow = (index) => {
    const updated = apiParams.filter((_, i) => i !== index);
    setApiParams(updated.length ? updated : [{ key: '', value: '' }]);
    const obj = getParamsObject(updated);
    if (toolMode === 'get') {
      const searchParams = new URLSearchParams();
      Object.entries(obj).forEach(([k, v]) => searchParams.append(k, String(v)));
      setUrlInput(`${results.baseUrl || 'https://api.altftool.com/v1/search'}?${searchParams.toString()}`);
    } else if (toolMode === 'post') {
      const searchParams = new URLSearchParams();
      Object.entries(obj).forEach(([k, v]) => searchParams.append(k, String(v)));
      setFormInput(searchParams.toString());
    } else {
      setRawText(JSON.stringify(obj, null, getIndentString(indentSize)));
    }
  };

  const handleLoadSample = () => {
    if (toolMode === 'regular') setRawText(JSON.stringify(SAMPLES.regular, null, 2));
    else if (toolMode === 'get') {
      setUrlInput(SAMPLES.get);
      const params = new URLSearchParams(SAMPLES.get.split('?')[1]);
      const list = [];
      params.forEach((value, key) => list.push({ key, value }));
      setApiParams(list);
    } else if (toolMode === 'post') {
      setFormInput(SAMPLES.post);
      const params = new URLSearchParams(SAMPLES.post);
      const list = [];
      params.forEach((value, key) => list.push({ key, value }));
      setApiParams(list);
    } else {
      setRawText(JSON.stringify(SAMPLES.postJson, null, 2));
      updateParamsFromSource(SAMPLES.postJson);
    }
  };

  const copyToClipboard = (text, setCopied) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = results.formatted || rawText;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api_payload_${toolMode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setRawText('');
    setUrlInput('');
    setFormInput('');
    setApiParams([{ key: '', value: '' }]);
  };

  const mockApiSimulation = useMemo(() => {
    const bodyPayload = results.formatted || '{}';
    if (toolMode === 'get') return { method: 'GET', url: urlInput || 'https://api.altftool.com/v1/search', headers: { 'Accept': 'application/json' }, body: 'None (Query parameters appended to URL)' };
    if (toolMode === 'post') return { method: 'POST', url: 'https://api.altftool.com/v1/oauth/token', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }, body: formInput || 'No fields specified' };
    if (toolMode === 'postJson') return { method: 'POST', url: 'https://api.altftool.com/v1/users', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: bodyPayload };
    return null;
  }, [toolMode, urlInput, formInput, results]);

  const modes = [
    { id: 'regular', label: 'Regular Formatter', icon: Braces },
    { id: 'get', label: 'API GET Test', icon: Globe },
    { id: 'post', label: 'API POST Form', icon: Send },
    { id: 'postJson', label: 'API POST JSON', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Standard Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors duration-300">
              <Braces className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">JSON Formatting & API Tester</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Developer Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Interactive formatted display of raw JSON, with automatic payload translation and sync schemas designed for rapid API testing.
              </p>
            </div>
          </div>
        </section>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {modes.map(tab => {
            const Icon = tab.icon;
            const isActive = toolMode === tab.id;
            return (
              <button key={tab.id} onClick={() => {
                setToolMode(tab.id);
                if (tab.id === 'get') {
                  const params = new URLSearchParams(SAMPLES.get.split('?')[1]);
                  const list = [];
                  params.forEach((value, key) => list.push({ key, value }));
                  setApiParams(list);
                  setUrlInput(SAMPLES.get);
                } else if (tab.id === 'post') {
                  const params = new URLSearchParams(SAMPLES.post);
                  const list = [];
                  params.forEach((value, key) => list.push({ key, value }));
                  setApiParams(list);
                  setFormInput(SAMPLES.post);
                } else if (tab.id === 'postJson') {
                  setRawText(JSON.stringify(SAMPLES.postJson, null, 2));
                  updateParamsFromSource(SAMPLES.postJson);
                } else {
                  setRawText(JSON.stringify(SAMPLES.regular, null, 2));
                }
              }}
                className={`rounded-lg border p-3 text-left transition-colors ${isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-surface-soft'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-muted" />
              <span className="text-xs font-semibold text-muted">Tab Size:</span>
              <select value={indentSize} onChange={e => setIndentSize(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground outline-none">
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="8">8 Spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLoadSample}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft transition-colors flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" /> Load Sample
            </button>
            <button onClick={handleClear}
              className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors flex items-center gap-1.5">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              {toolMode === 'get' ? <Link className="h-3.5 w-3.5" /> : toolMode === 'post' ? <Send className="h-3.5 w-3.5" /> : <Braces className="h-3.5 w-3.5" />}
              {toolMode === 'get' ? 'GET Target URL' : toolMode === 'post' ? 'POST Form Payload' : 'Raw JSON Input'}
            </h2>
            {(toolMode === 'regular' || toolMode === 'postJson') && (
              <button onClick={() => copyToClipboard(rawText, setCopiedRaw)}
                className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                {copiedRaw ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {copiedRaw ? 'Copied' : 'Copy Input'}
              </button>
            )}
          </div>

          {toolMode === 'get' ? (
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-lg bg-success/10 px-3 text-xs font-bold text-success border border-success/20">GET</span>
              <input type="text" value={urlInput} onChange={e => {
                setUrlInput(e.target.value);
                const parts = e.target.value.split('?');
                if (parts[1]) {
                  const params = new URLSearchParams(parts[1]);
                  const list = [];
                  params.forEach((value, key) => list.push({ key, value }));
                  setApiParams(list);
                }
              }}
                placeholder="https://api.example.com/v1/search?q=query..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
          ) : toolMode === 'post' ? (
            <textarea value={formInput} onChange={e => {
              setFormInput(e.target.value);
              const params = new URLSearchParams(e.target.value);
              const list = [];
              params.forEach((value, key) => list.push({ key, value }));
              setApiParams(list);
            }}
              placeholder="key1=val1&key2=val2"
              className="min-h-[120px] w-full rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground outline-none focus:border-primary resize-y" />
          ) : (
            <textarea value={rawText} onChange={e => {
              setRawText(e.target.value);
              const { data, error } = safeJsonParse(e.target.value);
              if (!error && data && typeof data === 'object') updateParamsFromSource(data);
            }}
              placeholder='{"key": "value"}'
              className="min-h-[260px] w-full rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground outline-none focus:border-primary resize-y"
              spellCheck={false} />
          )}
        </div>

        {/* Parameters Editor */}
        {toolMode !== 'regular' && (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" /> Parameters Editor
                </h2>
                <p className="text-[10px] text-muted mt-1">Synchronized in real-time.</p>
              </div>
              <button onClick={addParamRow}
                className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted">
                    <th className="py-2 pr-4">Key</th>
                    <th className="py-2 px-2">Value</th>
                    <th className="py-2 pl-4 text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {apiParams.map((row, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-2 pr-4">
                        <input type="text" value={row.key} onChange={e => handleParamEdit(index, e.target.value, row.value)}
                          placeholder="key"
                          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground outline-none focus:border-primary/50" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" value={row.value} onChange={e => handleParamEdit(index, row.key, e.target.value)}
                          placeholder="value"
                          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground outline-none focus:border-primary/50" />
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <button onClick={() => removeParamRow(index)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-danger hover:bg-danger/10 transition-colors"
                          title="Remove">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5" /> Formatted Result JSON
            </h2>
            <div className="flex gap-2">
              <button onClick={() => copyToClipboard(results.formatted, setCopiedOutput)}
                className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                {copiedOutput ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {copiedOutput ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleDownload}
                className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
          </div>

          {results.error ? (
            <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/10 p-4 text-danger">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-xs font-mono">{results.error}</div>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2 text-[10px] text-muted font-mono">
                <span>output.json</span>
                <span className="text-primary font-bold">{results.formatted ? results.formatted.split('\n').length : 0} lines · {results.formatted ? results.formatted.length : 0} chars</span>
              </div>
              <textarea readOnly value={results.formatted || ''}
                placeholder="Clean JSON output will appear here..."
                className="min-h-[260px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground outline-none"
                spellCheck={false} />
            </div>
          )}
        </div>

        {/* API Sandbox */}
        {mockApiSimulation && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
              <Terminal className="h-3.5 w-3.5" /> API Testing Sandbox
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-background p-3 border border-border">
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold text-white ${mockApiSimulation.method === 'GET' ? 'bg-success' : 'bg-info'}`}>
                  {mockApiSimulation.method}
                </span>
                <span className="text-foreground break-all">{mockApiSimulation.url}</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Request Headers</div>
                {Object.entries(mockApiSimulation.headers).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-border/20 last:border-0">
                    <span className="text-primary">{k}:</span>
                    <span className="text-muted text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Request Body</div>
                <pre className="max-h-[120px] overflow-y-auto whitespace-pre-wrap rounded bg-surface-soft p-2 text-muted leading-relaxed">
                  {mockApiSimulation.body}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

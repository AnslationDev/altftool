"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Database, Lock, Zap } from 'lucide-react';
import ModeSelector from '../components/ModeSelector';
import TextInput from '../components/TextInput';
import OutputPanel from '../components/OutputPanel';
import MetricsDisplay from '../components/MetricsDisplay';
import GzipGuide from '../components/GzipGuide';
import {
  compressToGzip,
  decompressFromGzip,
  getSampleText,
  getSampleGzip,
  analyzeText,
  analyzeCompressed,
} from '../utils/gzipUtils';

export default function ToolHome() {
  const [input, setInput] = useState(getSampleText());
  const [mode, setMode] = useState('compress');

  // Derive output and error synchronously during render (React best practice!)
  let output = '';
  let error = '';

  if (input) {
    try {
      if (mode === 'compress') {
        output = compressToGzip(input);
      } else {
        output = decompressFromGzip(input);
      }
    } catch (err) {
      error = err.message;
    }
  }

  const inputMetrics = useMemo(() => analyzeText(input), [input]);
  const outputMetrics = useMemo(() => analyzeCompressed(output), [output]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const handleSample = useCallback(() => {
    setInput(mode === 'compress' ? getSampleText() : getSampleGzip());
  }, [mode]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    // Automatically swap sample text to prevent decoding crashes if user switches modes
    if (newMode === 'compress') {
      if (input === getSampleGzip() || !input) {
        setInput(getSampleText());
      }
    } else {
      if (input === getSampleText() || !input) {
        setInput(getSampleGzip());
      }
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Zap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Gzip Encryption & Decryption</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Developer Tools</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Compress and decompress text using gzip. Quickly and easily encrypt and decrypt gzip strings!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Compress", "Decompress", "Real-time Stats"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Lock className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-4">
          <ModeSelector mode={mode} onModeChange={handleModeChange} />
          <MetricsDisplay inputMetrics={inputMetrics} outputMetrics={outputMetrics} mode={mode} />

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <TextInput
              value={input}
              onChange={setInput}
              onClear={handleClear}
              onSample={handleSample}
              metrics={inputMetrics}
            />
            <OutputPanel output={output} mode={mode} metrics={outputMetrics} />
          </div>

          <GzipGuide />
        </div>
      </div>
    </div>
  );
}

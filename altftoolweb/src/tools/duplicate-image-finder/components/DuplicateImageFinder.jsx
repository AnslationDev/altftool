"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hashFromFile, compareImages } from '../../_shared/utils/perceptualHash';
import { loadImage } from '../../_shared/utils/imageProcessing';
import { downloadBlob } from '../../_shared/utils/download';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function DuplicateImageFinder() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(async (fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (newFiles.length === 0) return;
    setProcessing(true);
    try {
      const hashed = [];
      for (const file of newFiles) {
        try {
          const hash = await hashFromFile(file);
          hashed.push({ file, name: file.name, size: file.size, type: file.type, ...hash, url: URL.createObjectURL(file) });
        } catch { /* skip corrupted */ }
      }
      setFiles(prev => [...prev, ...hashed]);
    } finally {
      setProcessing(false);
    }
  }, []);

  const findDuplicates = useCallback(() => {
    if (files.length < 2) return;
    const processed = new Set();
    const groups = [];
    for (let i = 0; i < files.length; i++) {
      if (processed.has(i)) continue;
      const group = { index: i, ...files[i], duplicates: [] };
      for (let j = i + 1; j < files.length; j++) {
        const comparison = compareImages(
          { dHash: files[i].dHash, aHash: files[i].aHash },
          { dHash: files[j].dHash, aHash: files[j].aHash }
        );
        if (comparison.overallSimilarity >= 80) {
          group.duplicates.push({ index: j, ...files[j], ...comparison });
          processed.add(j);
        }
      }
      processed.add(i);
      groups.push(group);
    }
    setResults(groups.filter(g => g.duplicates.length > 0));
    setSelectedGroup(null);
  }, [files]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(null);
  }, []);

  const removeAll = useCallback(() => {
    setFiles([]);
    setResults(null);
    setSelectedGroup(null);
  }, []);

  const keepBest = useCallback((groupIdx) => {
    setFiles(prev => {
      const group = results[groupIdx];
      const toRemove = new Set(group.duplicates.map(d => d.index));
      return prev.filter((_, i) => !toRemove.has(i));
    });
    setResults(null);
  }, [results]);

  const exportCSV = () => {
    if (!results) return;
    const rows = [['Group', 'File', 'Similarity%', 'Size', 'Type']];
    results.forEach((g, gi) => {
      rows.push([`Group ${gi + 1}`, g.name, '100% (original)', formatSize(g.size), g.type]);
      g.duplicates.forEach(d => rows.push([`Group ${gi + 1}`, d.name, `${d.overallSimilarity}%`, formatSize(d.size), d.type]));
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'duplicate-report.csv');
  };

  const dropZone = (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
        dragOver ? 'border-[var(--primary)] bg-[var(--anslation-ds-primary-soft)] scale-[1.01]' : 'border-[var(--border)] hover:border-[var(--primary)]'
      }`}
    >
      <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      <div className="space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--anslation-ds-primary-soft)] flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-foreground font-medium">Drop images here or click to browse</p>
        <p className="text-sm text-muted-foreground">Upload multiple images to find exact and near-duplicates</p>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Duplicate Image Finder</h1>
        <p className="text-sm text-muted-foreground">Upload multiple images to find exact and visually similar duplicates using perceptual hashing</p>
      </div>

      {files.length === 0 ? dropZone : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} image{files.length !== 1 ? 's' : ''} loaded</span>
            <div className="flex gap-2">
              <button onClick={() => inputRef.current?.click()} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Add More</button>
              <button onClick={findDuplicates} disabled={files.length < 2} className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md disabled:opacity-50">Find Duplicates</button>
              <button onClick={removeAll} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Clear All</button>
            </div>
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {processing && (
            <div className="flex items-center justify-center gap-3 p-8">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Processing images...</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((f, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden border border-[var(--border)]">
                <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(f.size)}</p>
                </div>
                <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            ))}
          </div>

          {results && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Found {results.length} duplicate group{results.length !== 1 ? 's' : ''}</h2>
                <div className="flex gap-2">
                  <button onClick={exportCSV} className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Export CSV</button>
                </div>
              </div>

              {results.map((group, gi) => (
                <motion.div key={gi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="p-4 bg-[var(--anslation-ds-soft)] border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)]">
                        <img src={group.url} alt={group.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Group {gi + 1} — {group.name}</p>
                        <p className="text-xs text-muted-foreground">{1 + group.duplicates.length} files, original: {formatSize(group.size)}</p>
                      </div>
                    </div>
                    <button onClick={() => keepBest(gi)} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md">Keep Best</button>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    {group.duplicates.map((dup, di) => (
                      <div key={di} className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--border)] flex-shrink-0">
                          <img src={dup.url} alt={dup.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{dup.name}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span>{formatSize(dup.size)}</span>
                            <span>{dup.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <span className={`px-2 py-0.5 rounded-full ${dup.overallSimilarity >= 95 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : dup.overallSimilarity >= 85 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {dup.overallSimilarity}% match
                          </span>
                          {dup.overallSimilarity >= 95 && <span className="text-red-500">Exact</span>}
                          {dup.overallSimilarity >= 85 && dup.overallSimilarity < 95 && <span className="text-amber-500">Near</span>}
                        </div>
                        <button onClick={() => removeFile(dup.index)} className="px-2 py-1 text-xs rounded border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] text-muted-foreground">Remove</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {results && results.length === 0 && files.length >= 2 && (
            <div className="rounded-xl border border-green-200 dark:border-green-800 p-6 text-center bg-green-50 dark:bg-green-900/20">
              <span className="text-3xl">✓</span>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">No duplicates found among your {files.length} images</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

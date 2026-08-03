"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { compareImages, computeImageHash } from '../../_shared/utils/perceptualHash';
import { loadImage } from '../../_shared/utils/imageProcessing';
import { downloadBlob } from '../../_shared/utils/download';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// Some browsers (notably for HEIC/HEIF photos straight off an iPhone) report
// an empty file.type, so a MIME-type-only check silently drops real images.
// Fall back to the extension, same as _shared/utils/imageProcessing's
// validateImage().
function isImageFile(file) {
  return file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name);
}

// Escapes a CSV field so filenames containing a comma, quote or newline
// don't shift every later column out of alignment when opened in a
// spreadsheet.
function csvField(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function DuplicateImageFinder() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [skipNotice, setSkipNotice] = useState('');
  const inputRef = useRef(null);
  const processingRef = useRef(false);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Revoke every remaining object URL when the tool unmounts, so navigating
  // away doesn't leak the blobs for the rest of the tab's life.
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  const handleFiles = useCallback(async (fileList) => {
    // Guard against overlapping batches: without this, a second "Add More"
    // click fired while the first batch is still hashing would clear
    // `processing` early via its own finally block, making the spinner
    // disappear while the first batch is still silently hashing in the
    // background.
    if (processingRef.current) return;

    const allFiles = Array.from(fileList);
    const newFiles = allFiles.filter(isImageFile);
    const skippedNotImage = allFiles.length - newFiles.length;
    if (newFiles.length === 0) {
      if (skippedNotImage > 0) {
        setSkipNotice(
          `Skipped ${skippedNotImage} file${skippedNotImage === 1 ? '' : 's'} that ${skippedNotImage === 1 ? "isn't" : "aren't"} images.`,
        );
      }
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    setSkipNotice('');
    try {
      const hashed = [];
      let failed = 0;
      for (const file of newFiles) {
        try {
          const url = URL.createObjectURL(file);
          const img = await loadImage(url);
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          const hash = computeImageHash(canvas);
          hashed.push({ file, name: file.name, size: file.size, type: file.type, width, height, ...hash, url });
        } catch {
          failed += 1; /* skip corrupted */
        }
      }
      // Adding files invalidates any previous "Find Duplicates" run — without
      // this, the stale results (including a "No duplicates found" banner)
      // keep rendering as if the newly added files had already been checked.
      setFiles(prev => [...prev, ...hashed]);
      setResults(null);

      const notices = [];
      if (skippedNotImage > 0) notices.push(`${skippedNotImage} non-image file${skippedNotImage === 1 ? '' : 's'}`);
      if (failed > 0) notices.push(`${failed} file${failed === 1 ? '' : 's'} that could not be read`);
      if (notices.length > 0) setSkipNotice(`Skipped ${notices.join(' and ')}.`);
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }, []);

  const findDuplicates = useCallback(() => {
    if (files.length < 2) return;
    const processed = new Set();
    const groups = [];
    for (let i = 0; i < files.length; i++) {
      if (processed.has(i)) continue;
      const clusterIndices = [i];
      for (let j = i + 1; j < files.length; j++) {
        if (processed.has(j)) continue;
        const comparison = compareImages(
          { dHash: files[i].dHash, aHash: files[i].aHash },
          { dHash: files[j].dHash, aHash: files[j].aHash }
        );
        if (comparison.overallSimilarity >= 80) {
          clusterIndices.push(j);
          processed.add(j);
        }
      }
      processed.add(i);

      if (clusterIndices.length < 2) continue;

      // Keep the highest-resolution file (tie-broken by larger file size) as
      // the group's representative, instead of whichever one merely
      // happened to be uploaded first — otherwise "Keep Best" always
      // discards the higher-quality re-export and keeps the low-res one.
      const bestIndex = clusterIndices.reduce((best, idx) => {
        const a = files[idx];
        const b = files[best];
        const aPixels = (a.width || 0) * (a.height || 0);
        const bPixels = (b.width || 0) * (b.height || 0);
        if (aPixels !== bPixels) return aPixels > bPixels ? idx : best;
        return a.size > b.size ? idx : best;
      }, clusterIndices[0]);

      const bestFile = files[bestIndex];
      const duplicates = clusterIndices
        .filter((idx) => idx !== bestIndex)
        .map((idx) => ({
          index: idx,
          ...files[idx],
          ...compareImages(
            { dHash: bestFile.dHash, aHash: bestFile.aHash },
            { dHash: files[idx].dHash, aHash: files[idx].aHash }
          ),
        }));

      groups.push({ index: bestIndex, ...bestFile, duplicates });
    }
    setResults(groups);
    setSelectedGroup(null);
  }, [files]);

  const removeFile = useCallback((index) => {
    setFiles(prev => {
      if (prev[index]) URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setResults(null);
  }, []);

  const removeAll = useCallback(() => {
    if (!window.confirm(`Remove all ${filesRef.current.length} loaded image(s) and any results? This cannot be undone.`)) {
      return;
    }
    setFiles(prev => {
      prev.forEach((f) => URL.revokeObjectURL(f.url));
      return [];
    });
    setResults(null);
    setSelectedGroup(null);
  }, []);

  const keepBest = useCallback((groupIdx) => {
    setFiles(prev => {
      const group = results[groupIdx];
      const toRemove = new Set(group.duplicates.map(d => d.index));
      prev.forEach((f, i) => {
        if (toRemove.has(i)) URL.revokeObjectURL(f.url);
      });
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
    const csv = rows.map(r => r.map(csvField).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'duplicate-report.csv');
  };

  const dropZone = (
    <motion.div
      role="button"
      tabIndex={processing ? -1 : 0}
      aria-disabled={processing}
      aria-label="Drop images here or click to browse and upload"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
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
              <button onClick={() => inputRef.current?.click()} disabled={processing} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed">Add More</button>
              <button onClick={findDuplicates} disabled={files.length < 2} className="px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white font-medium hover:brightness-110 transition-all shadow-md disabled:opacity-50">Find Duplicates</button>
              <button onClick={removeAll} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--anslation-ds-soft)] transition-colors text-muted-foreground">Clear All</button>
            </div>
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>

          {processing && (
            <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 p-8">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
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
                <button
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                  title={`Remove ${f.name}`}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>
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

      {skipNotice && (
        <p role="status" aria-live="polite" className="text-center text-xs text-amber-600 dark:text-amber-400">
          {skipNotice}
        </p>
      )}
    </div>
  );
}

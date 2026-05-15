import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { profileData } from "../utils/profileData";
import { detectColumnTypes } from "../utils/detectColumnTypes";

const FileUpload = ({ onDataParsed, onProfileReady, analyzing, onAnalysisStart, onAnalysisEnd }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }
    setSelectedFile(file);
    setProgress(0);
  };

  const handleAnalyze = () => {
    if (!selectedFile || analyzing) return;

    onAnalysisStart?.();
    setProgress(0);

    // We'll collect all rows here, then profile
    const rows = [];

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      chunk: (results) => {
        // Accumulate rows
        rows.push(...results.data);

        if (results.meta.cursor) {
          setProgress(Math.round((results.meta.cursor / selectedFile.size) * 100));
        }
      },
      complete: () => {
        // Parsing done – show data preview
        onDataParsed?.(rows);
        setProgress(100);

        // Start profiling (non‑blocking)
        setTimeout(() => {
          try {
            const types = detectColumnTypes(rows);
            const profile = profileData(rows, types);
            onProfileReady?.(profile);
          } catch (err) {
            console.error("Profiling error:", err);
            onProfileReady?.(null);
          }
          onAnalysisEnd?.();       // stop spinner
        }, 10);                    // small delay to let UI breathe
      },
      error: (err) => {
        console.error("Parsing error:", err);
        alert("Error parsing CSV file.");
        onAnalysisEnd?.();
        onProfileReady?.(null);
      },
    });
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onDataParsed?.([]);
    onProfileReady?.(null);
    onAnalysisEnd?.();
    setProgress(0);
  };

  return (
    <div className="w-full max-w-lg glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-[var(--section-highlight)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Upload CSV File</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Select a .csv file to analyse</p>
        </div>
      </div>

      <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

      <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 mb-4 flex flex-col items-center gap-3 transition-colors hover:border-[var(--primary)]">
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-secondary px-4 py-2 text-sm font-medium flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Browse Files
        </button>

        {selectedFile ? (
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)] bg-[var(--muted)] px-3 py-1 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="font-medium">{selectedFile.name}</span>
            <button onClick={handleClear} className="ml-2 text-xs text-[var(--muted-foreground)] hover:text-red-500">✕</button>
          </div>
        ) : (
          <p className="text-xs text-[var(--muted-foreground)]">No file selected</p>
        )}
      </div>

      {analyzing && (
        <div className="w-full bg-[var(--muted)] rounded-full h-2 mb-4">
          <div
            className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || analyzing}
        className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {analyzing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Analysing… {progress > 0 && `${progress}%`}
          </>
        ) : (
          "Analyse CSV"
        )}
      </button>
    </div>
  );
};

export default FileUpload;
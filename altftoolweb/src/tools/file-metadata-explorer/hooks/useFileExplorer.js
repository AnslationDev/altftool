"use client";

import { useState, useCallback, useRef } from "react";
import { extractMetadata } from "../utils/metadataExtractor";
import { generateId } from "../utils/helpers";

const RECENT_KEY = "altft-filemeta-recent";
const FAVES_KEY = "altft-filemeta-favorites";

export function useFileExplorer() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("cards");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareFiles, setCompareFiles] = useState([]);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAVES_KEY) || "[]"); } catch { return []; }
  });
  const dropRef = useRef(null);

  const processFiles = useCallback(async (fileList) => {
    setLoading(true);
    const results = [];
    const batch = Array.from(fileList);

    for (const file of batch) {
      try {
        const meta = await extractMetadata(file);
        results.push({ id: generateId(), file, meta, timestamp: Date.now() });
      } catch {
        results.push({
          id: generateId(), file, meta: { fileName: file.name, error: "Failed to extract metadata" }, timestamp: Date.now(),
        });
      }
    }

    setFiles((prev) => {
      const next = [...results, ...prev].slice(0, 50);
      setRecent((r) => {
        const updated = [...results.map((f) => ({ id: f.id, name: f.meta.fileName, type: f.meta.type || "Unknown", timestamp: f.timestamp })), ...r].slice(0, 20);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        return updated;
      });
      return next;
    });
    setLoading(false);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  }, [selectedFile]);

  const clearAll = useCallback(() => {
    setFiles([]);
    setSelectedFile(null);
    setCompareFiles([]);
  }, []);

  const toggleFavorite = useCallback((fileData) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === fileData.id);
      const next = exists ? prev.filter((f) => f.id !== fileData.id) : [fileData, ...prev];
      localStorage.setItem(FAVES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredFiles = files.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      f.meta.fileName?.toLowerCase().includes(q) ||
      f.meta.type?.toLowerCase().includes(q) ||
      f.meta.extension?.toLowerCase().includes(q) ||
      f.meta.mimeType?.toLowerCase().includes(q)
    );
  });

  const summaryStats = {
    total: files.length,
    images: files.filter((f) => f.meta.type === "Image").length,
    text: files.filter((f) => f.meta.type === "Text").length,
    audio: files.filter((f) => f.meta.type === "Audio").length,
    video: files.filter((f) => f.meta.type === "Video").length,
    pdf: files.filter((f) => f.meta.type === "PDF").length,
    docs: files.filter((f) => f.meta.type === "Document").length,
    totalSize: files.reduce((s, f) => s + (f.file?.size || 0), 0),
  };

  return {
    files,
    selectedFile,
    loading,
    search,
    view,
    comparisonMode,
    compareFiles,
    recent,
    favorites,
    filteredFiles,
    summaryStats,
    dropRef,
    setSelectedFile,
    setSearch,
    setView,
    setComparisonMode,
    setCompareFiles,
    processFiles,
    removeFile,
    clearAll,
    toggleFavorite,
  };
}

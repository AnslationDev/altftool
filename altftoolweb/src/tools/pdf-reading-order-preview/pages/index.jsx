"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileUp,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Download,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  Layers,
  BarChart3,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  ListTree,
  SlidersHorizontal,
} from "lucide-react";

import { extractPdfReadingOrder } from "../lib/extractPdfReadingOrder";
import { generateSamplePdfFile } from "../lib/samplePdfGenerator";
import PdfCanvasOverlay from "../components/PdfCanvasOverlay";
import ScreenReaderStream from "../components/ScreenReaderStream";
import InspectorPanel from "../components/InspectorPanel";
import ExportModal from "../components/ExportModal";
import HeroLanding from "../components/HeroLanding";
import DashboardHeader from "../components/DashboardHeader";

export default function PdfReadingOrderPreview() {
  const fileInputRef = useRef(null);
  const operationRef = useRef(0);

  const [pdfFile, setPdfFile] = useState(null);
  const [result, setResult] = useState(null);
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const [fileState, setFileState] = useState({
    busy: false,
    error: "",
  });

  // UI Tabs & Modes
  const [leftTab, setLeftTab] = useState("pages"); // "pages", "outline", "issues", "stats", "settings"
  const [overlayMode, setOverlayMode] = useState("all"); // "all", "numbers", "boxes", "arrows", "heatmap", "tags"
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

  // Animation Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(-1);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  // Load Recent Files from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdfr_recent_files");
      if (stored) {
        setRecentFiles(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Listen for Clipboard Paste event for PDF files
  useEffect(() => {
    const handlePaste = (e) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;
      for (const item of clipboardItems) {
        if (item.type === "application/pdf") {
          const file = item.getAsFile();
          if (file) {
            inspectFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const activePageData = useMemo(
    () => result?.pages.find((p) => p.pageNumber === activePageNumber),
    [result, activePageNumber],
  );

  const activePageItems = useMemo(
    () => activePageData?.estimate?.estimatedItems || [],
    [activePageData],
  );
  const activePageIssues = useMemo(
    () => activePageData?.estimate?.accessibilityIssues || [],
    [activePageData],
  );

  // Inspect uploaded PDF or Demo PDF file
  const inspectFile = async (file) => {
    if (!file) return;
    const operation = operationRef.current + 1;
    operationRef.current = operation;

    setPdfFile(file);
    setResult(null);
    setActivePageNumber(1);
    setSelectedBlock(null);
    setAnimationIndex(-1);
    setIsPlaying(false);
    setFileState({ busy: true, error: "" });

    // Update Recent Files list
    try {
      const entry = { name: file.name, size: file.size, timestamp: Date.now() };
      setRecentFiles((prev) => {
        const filtered = prev.filter((f) => f.name !== file.name);
        const updated = [entry, ...filtered].slice(0, 5);
        localStorage.setItem("pdfr_recent_files", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage errors
    }

    try {
      const nextResult = await extractPdfReadingOrder(file, {
        shouldContinue: () => operationRef.current === operation,
      });

      if (operationRef.current !== operation) return;
      setResult(nextResult);
      setActivePageNumber(1);
      setFileState({ busy: false, error: "" });
    } catch (error) {
      if (operationRef.current !== operation) return;
      setFileState({
        busy: false,
        error:
          error instanceof Error
            ? error.message
            : "The PDF could not be inspected locally.",
      });
    }
  };

  // Load Demo Sample PDF
  const loadDemoPdf = () => {
    const sampleFile = generateSamplePdfFile();
    inspectFile(sampleFile);
  };

  const reset = () => {
    operationRef.current += 1;
    setPdfFile(null);
    setResult(null);
    setActivePageNumber(1);
    setSelectedBlock(null);
    setIsPlaying(false);
    setAnimationIndex(-1);
    setFileState({ busy: false, error: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reading Flow Animation Loop
  useEffect(() => {
    if (!isPlaying || activePageItems.length === 0) return;

    const intervalTime = Math.max(300, 1200 / animationSpeed);
    const timer = setInterval(() => {
      setAnimationIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= activePageItems.length) {
          setIsPlaying(false);
          return -1;
        }
        setSelectedBlock(activePageItems[nextIndex]);
        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, activePageItems, animationSpeed]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (animationIndex >= activePageItems.length - 1) {
        setAnimationIndex(0);
        setSelectedBlock(activePageItems[0]);
      }
      setIsPlaying(true);
    }
  };

  const scoreData = result?.summary?.scoreData || { score: 100, rating: "Excellent", badgeColor: "bg-indigo-600 text-white" };
  const allIssues = result?.summary?.allIssues || [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* TOP HEADER */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-40 shadow-sm backdrop-blur-md">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-black">
              <ListOrdered className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  PDF Reading-Order Preview
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-bold">
                  Client-Side Privacy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Visual accessibility analysis: preview screen reader sequence, bounding overlays, and WCAG order rules.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={loadDemoPdf}
              disabled={fileState.busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              Try Demo PDF
            </button>

            <label className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs cursor-pointer border border-slate-200 dark:border-slate-700 transition shadow-xs">
              {fileState.busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              ) : (
                <FileUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              {fileState.busy ? "Analyzing..." : "Open PDF"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                disabled={fileState.busy}
                onChange={(e) => void inspectFile(e.target.files?.[0])}
              />
            </label>

            {result && (
              <>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Export Report
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  title="Reset inspection"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Help & Guides"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ERROR ALERT */}
      {fileState.error && (
        <div className="bg-rose-50 dark:bg-rose-950/80 border-b border-rose-200 dark:border-rose-800 px-6 py-3 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            {fileState.error}
          </span>
          <button
            type="button"
            onClick={() => setFileState({ busy: false, error: "" })}
            className="text-rose-600 dark:text-rose-400 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* WORKSPACE CONTENT AREA */}
      {result ? (
        <div className="flex-1 max-w-[1700px] w-full mx-auto p-4 space-y-6">
          {/* DASHBOARD HEADER WITH KPI METRICS CARDS */}
          <DashboardHeader pdfResult={result} />

          {/* MAIN WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT SIDEBAR (Cols 3) */}
            <aside className="lg:col-span-3 flex flex-col gap-4">
              {/* Tabs Selector */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex items-center justify-between text-[11px] font-bold shadow-sm">
                {[
                  { id: "pages", label: `Pages (${result.pageCount})` },
                  { id: "outline", label: "Outline" },
                  { id: "issues", label: "Issues", badge: allIssues.length },
                  { id: "stats", label: "Score" },
                  { id: "settings", label: "Settings" },
                ].map((tab) => {
                  const isActive = leftTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLeftTab(tab.id)}
                      className={`flex-1 py-1.5 px-1 rounded-xl transition relative text-center ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md font-extrabold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {tab.badge > 0 && !isActive && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB PANELS */}
              <div className="flex-1 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar shadow-lg backdrop-blur-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={leftTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {leftTab === "pages" && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                          Document Pages Overview
                        </h3>
                        {result.pages.map((p) => {
                          const pageIssues = p.estimate.accessibilityIssues || [];
                          const isCurrent = p.pageNumber === activePageNumber;

                          return (
                            <button
                              key={p.pageNumber}
                              type="button"
                              onClick={() => {
                                setActivePageNumber(p.pageNumber);
                                setSelectedBlock(null);
                              }}
                              className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                                isCurrent
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white shadow-md"
                                  : "bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                                    isCurrent
                                      ? "bg-indigo-600 text-white"
                                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {p.pageNumber}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                                    Page {p.pageNumber}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    {p.itemCount} blocks · {p.characterCount} chars
                                  </div>
                                </div>
                              </div>

                              {pageIssues.length > 0 ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-[10px] font-bold">
                                  {pageIssues.length} Defects
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Pass
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {leftTab === "outline" && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Tag Tree & Document Outline
                        </h3>

                        {activePageItems.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No tag items extracted for active page.</p>
                        ) : (
                          activePageItems.map((item, idx) => (
                            <div
                              key={`outline-${item.id}`}
                              onClick={() => setSelectedBlock(item)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                                selectedBlock?.id === item.id
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white shadow-sm"
                                  : "bg-slate-50/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold shrink-0">
                                  #{idx + 1}
                                </span>
                                <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-200 dark:border-indigo-500/20">
                                  {item.tagType}
                                </span>
                                <span className="truncate text-slate-800 dark:text-slate-300 font-medium">{item.text}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {leftTab === "issues" && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Detected Accessibility Defects ({allIssues.length})
                        </h3>

                        {allIssues.length === 0 ? (
                          <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                            No accessibility defects detected in logical reading sequence!
                          </div>
                        ) : (
                          allIssues.map((iss) => (
                            <div
                              key={iss.id}
                              onClick={() => {
                                const page = result.pages.find((p) =>
                                  (p.estimate.accessibilityIssues || []).some(
                                    (i) => i.id === iss.id,
                                  ),
                                );
                                if (page) {
                                  setActivePageNumber(page.pageNumber);
                                  const block = page.estimate.estimatedItems.find(
                                    (b) => b.id === iss.blockId,
                                  );
                                  if (block) setSelectedBlock(block);
                                }
                              }}
                              className="p-3 rounded-2xl bg-rose-50/60 dark:bg-slate-950/70 border border-rose-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-slate-700 cursor-pointer space-y-1.5 transition"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                  {iss.title}
                                </span>
                                <span className="uppercase text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                                  {iss.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                {iss.message}
                              </p>
                              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-900">
                                <ChevronRight className="h-3 w-3" /> Click to highlight block
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {leftTab === "stats" && (
                      <div className="space-y-4">
                        {/* Accessibility Score Card */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            WCAG & PDF/UA ACCESSIBILITY SCORE
                          </span>
                          <div className="text-4xl font-black text-slate-900 dark:text-white">
                            {scoreData.score} <span className="text-lg text-slate-500 font-semibold">/ 100</span>
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${scoreData.badgeColor}`}>
                            {scoreData.rating}
                          </div>
                        </div>

                        {/* Subscore Category Gauges */}
                        <div className="space-y-2.5 text-xs">
                          <h4 className="font-bold text-slate-800 dark:text-slate-300 mb-2">Category Score Breakdown</h4>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                              <span>Reading Order Sequence</span>
                              <span className="font-bold text-slate-900 dark:text-white">{scoreData.breakdown?.readingOrder ?? 100}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${scoreData.breakdown?.readingOrder ?? 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                              <span>Document Structure</span>
                              <span className="font-bold text-slate-900 dark:text-white">{scoreData.breakdown?.structure ?? 100}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-teal-500 transition-all duration-500"
                                style={{ width: `${scoreData.breakdown?.structure ?? 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                              <span>Heading Hierarchy</span>
                              <span className="font-bold text-slate-900 dark:text-white">{scoreData.breakdown?.headings ?? 100}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${scoreData.breakdown?.headings ?? 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                              <span>Tables & Figure Captions</span>
                              <span className="font-bold text-slate-900 dark:text-white">{scoreData.breakdown?.tablesImages ?? scoreData.breakdown?.images ?? 100}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${scoreData.breakdown?.tablesImages ?? scoreData.breakdown?.images ?? 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400 font-medium">
                              <span>Logical Content Flow</span>
                              <span className="font-bold text-slate-900 dark:text-white">{scoreData.breakdown?.logicalFlow ?? 100}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${scoreData.breakdown?.logicalFlow ?? 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {leftTab === "settings" && (
                      <div className="space-y-4 text-xs">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Viewer & Player Settings
                        </h3>

                        <div className="space-y-2">
                          <label className="text-slate-800 dark:text-slate-300 font-semibold block">Reading Flow Playback Speed</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => setAnimationSpeed(spd)}
                                className={`py-1.5 rounded-xl border font-bold transition ${
                                  animationSpeed === spd
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* OVERLAY MODE CONTROLS */}
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs shadow-lg backdrop-blur-md">
                <label className="text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px] block">
                  Visual Overlay View Mode
                </label>
                <select
                  value={overlayMode}
                  onChange={(e) => setOverlayMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="all">All Overlays (Numbers, Boxes & Arrows)</option>
                  <option value="numbers">Reading Numbers Only (① ② ③)</option>
                  <option value="boxes">Bounding Boxes Only</option>
                  <option value="arrows">Direction Flow Arrows Only</option>
                  <option value="heatmap">Accessibility Heatmap</option>
                  <option value="tags">Color-coded by Tag Type</option>
                </select>
              </div>
            </aside>

            {/* CENTER WORKSPACE: PDF CANVAS & OVERLAY (Cols 6) */}
            <div className="lg:col-span-6 flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
              <PdfCanvasOverlay
                pdfFile={pdfFile}
                activePageNumber={activePageNumber}
                pageCount={result.pageCount}
                onPageChange={setActivePageNumber}
                activePageData={activePageData}
                selectedBlockId={selectedBlock?.id}
                onSelectBlock={setSelectedBlock}
                overlayMode={overlayMode}
                zoomLevel={zoomLevel}
                onZoomChange={setZoomLevel}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                animationIndex={animationIndex}
                animationSpeed={animationSpeed}
              />
            </div>

            {/* RIGHT SIDEBAR: INSPECTOR & STREAM (Cols 3) */}
            <aside className="lg:col-span-3 flex flex-col gap-4 h-[calc(100vh-280px)] min-h-[500px]">
              {/* Top Inspector */}
              <div className="h-1/2">
                <InspectorPanel selectedBlock={selectedBlock} issues={activePageIssues} />
              </div>

              {/* Bottom Screen Reader Stream */}
              <div className="h-1/2">
                <ScreenReaderStream
                  items={activePageItems}
                  issues={activePageIssues}
                  selectedBlockId={selectedBlock?.id}
                  onSelectBlock={setSelectedBlock}
                  animationIndex={animationIndex}
                />
              </div>
            </aside>
          </div>
        </div>
      ) : (
        /* HERO LANDING PLACEHOLDER WHEN NO FILE LOADED */
        <HeroLanding
          onInspectFile={inspectFile}
          onLoadDemoPdf={loadDemoPdf}
          isBusy={fileState.busy}
        />
      )}

      {/* BOTTOM STATUS BAR */}
      <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-auto backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-300 font-bold">
            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            PDF Reading-Order Preview v1.0
          </span>
          {result && (
            <span className="hidden sm:inline text-slate-500">
              File: {result.fileName} ({result.pageCount} Pages)
            </span>
          )}
        </div>

        {result && (
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Score: <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{scoreData.score}/100</strong>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Defects: <strong className="text-rose-500 font-extrabold">{allIssues.length}</strong>
            </span>
          </div>
        )}
      </footer>

      {/* EXPORT MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        pdfResult={result}
      />

      {/* HELP & GUIDES MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <Check className="h-4 w-4 text-emerald-500" />
            </button>

            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                PDF Reading Order & Accessibility Guide
              </h2>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <h3 className="font-extrabold text-indigo-600 dark:text-indigo-400">What is Reading Order?</h3>
                <p>
                  Screen readers (NVDA, JAWS, VoiceOver) process PDFs based on the underlying tag structure rather than visual placement. PDF Reading-Order Preview calculates logical flow sequence and highlights potential accessibility barriers before publication.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h3 className="font-extrabold text-indigo-600 dark:text-indigo-400">Key Features & Shortcuts</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li><strong className="text-slate-900 dark:text-slate-200">Clipboard Paste:</strong> Press Ctrl+V / Cmd+V to inspect copied PDF files.</li>
                  <li><strong className="text-slate-900 dark:text-slate-200">Visual Overlay Modes:</strong> Toggle between Numbers, Bounding Boxes, Arrows, Heatmap, and Tag colors.</li>
                  <li><strong className="text-slate-900 dark:text-slate-200">Sequence Player:</strong> Play automated reading sequence highlights section-by-section.</li>
                  <li><strong className="text-slate-900 dark:text-slate-200">Text-to-Speech:</strong> Click the speaker icon in the Screen Reader Stream to hear block text.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <h3 className="font-extrabold text-indigo-600 dark:text-indigo-400">WCAG 1.3.2 Compliance</h3>
                <p>
                  Ensuring a meaningful reading sequence prevents confusing screen reader users when documents contain multi-column layouts, sidebars, header/footer margins, or image captions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileUp,
  Download,
  CheckCircle,
  AlertCircle,
  Trash2,
  GripVertical,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";

const MainComponent = () => {
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [pagePreviews, setPagePreviews] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null);

  // NEW STATES FOR PREVIEW MODAL
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [highQualityPreviews, setHighQualityPreviews] = useState({});
  const [isGeneratingHighQuality, setIsGeneratingHighQuality] = useState({});

  const fileInputRef = useRef(null);

  // Load PDF.js dynamically with proper worker setup
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");

        // Set up worker - use the bundled worker from node_modules
        if (typeof window !== "undefined") {
          const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs");
          pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
            new Blob([
              `importScripts("${pdfjsWorker.default || pdfjsWorker}");`,
            ]),
          );
        }

        setPdfjsLib(pdfjs);
      } catch (err) {
        console.error("Failed to load PDF.js:", err);

        // Fallback: try using CDN
        try {
          const pdfjs = await import("pdfjs-dist");
          if (typeof window !== "undefined") {
            pdfjs.GlobalWorkerOptions.workerSrc =
              "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
          }
          setPdfjsLib(pdfjs);
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
          setError("Failed to initialize PDF preview library.");
        }
      }
    };

    loadPdfJs();
  }, []);

  const generatePagePreviews = async (pdfFile, scale = 0.5) => {
    if (!pdfjsLib) {
      setError("PDF preview library is still loading. Please try again.");
      return;
    }

    setIsLoadingPreviews(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const previews = {};

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        previews[i] = canvas.toDataURL("image/jpeg", 0.9);
      }

      // Store low-quality previews in pagePreviews
      if (scale === 0.5) {
        setPagePreviews(previews);
      }
      // Store high-quality previews separately
      if (scale === 1.5) {
        setHighQualityPreviews((prev) => ({ ...prev, ...previews }));
      }

      return previews;
    } catch (err) {
      console.error("Failed to generate previews:", err);
      setError(
        "Failed to generate page previews. The PDF may be corrupted or protected.",
      );
      return null;
    } finally {
      if (scale === 0.5) {
        setIsLoadingPreviews(false);
      }
    }
  };

  // NEW FUNCTION: Generate high-quality preview for a specific page
  const generateHighQualityPreview = async (pageNum) => {
    if (!pdfjsLib || !file || isGeneratingHighQuality[pageNum]) return;

    setIsGeneratingHighQuality((prev) => ({ ...prev, [pageNum]: true }));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const highQualityData = canvas.toDataURL("image/jpeg", 0.95);
      setHighQualityPreviews((prev) => ({
        ...prev,
        [pageNum]: highQualityData,
      }));
    } catch (err) {
      console.error("Failed to generate high-quality preview:", err);
    } finally {
      setIsGeneratingHighQuality((prev) => ({ ...prev, [pageNum]: false }));
    }
  };

  // NEW FUNCTION: Open preview modal
  const openPreview = (pageNum, index) => {
    setSelectedPage(pageNum);
    setSelectedPageIndex(index);
    setIsPreviewOpen(true);

    // Generate high-quality preview if not already available
    if (!highQualityPreviews[pageNum]) {
      generateHighQualityPreview(pageNum);
    }
  };

  // NEW FUNCTION: Navigate between pages in preview
  const navigatePreview = (direction) => {
    const currentIndex = selectedPageIndex;
    let newIndex;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : pdfPages.length - 1;
    } else {
      newIndex = currentIndex < pdfPages.length - 1 ? currentIndex + 1 : 0;
    }

    const newPageNum = pdfPages[newIndex];
    setSelectedPage(newPageNum);
    setSelectedPageIndex(newIndex);

    // Generate high-quality preview if not already available
    if (!highQualityPreviews[newPageNum]) {
      generateHighQualityPreview(newPageNum);
    }
  };

  const handleFileChange = async (e) => {
    setError(null);
    setSuccess(null);
    setIsPreviewOpen(false);
    setSelectedPage(null);
    setHighQualityPreviews({});

    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    setFile(uploadedFile);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
      setPdfPages(pagesArray);

      // Generate previews
      await generatePagePreviews(uploadedFile, 0.5);
    } catch (err) {
      setError("Failed to load PDF. Please try another file.");
      console.error(err);
    }
  };

  const deletePage = (pageNumber) => {
    setPdfPages((prev) => prev.filter((p) => p !== pageNumber));
    setSuccess(`Page ${pageNumber} removed successfully!`);
    setTimeout(() => setSuccess(null), 3000);

    // If deleted page is currently in preview, close preview
    if (selectedPage === pageNumber) {
      setIsPreviewOpen(false);
      setSelectedPage(null);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pdfPages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    setPdfPages(newPages);
    setDraggedIndex(index);

    // Update selected page index if preview is open
    if (isPreviewOpen && selectedPage === draggedPage) {
      setSelectedPageIndex(newPages.indexOf(draggedPage));
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const downloadPDF = async () => {
    if (!file || pdfPages.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Copy pages in the new order
      for (const pageNum of pdfPages) {
        const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Cleaned-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("PDF downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to process PDF. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPdfPages([]);
    setPagePreviews({});
    setHighQualityPreviews({});
    setError(null);
    setSuccess(null);
    setIsPreviewOpen(false);
    setSelectedPage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // NEW: Handle keyboard navigation in preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPreviewOpen) return;

      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      } else if (e.key === "ArrowLeft") {
        navigatePreview("prev");
      } else if (e.key === "ArrowRight") {
        navigatePreview("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen, selectedPageIndex, pdfPages]);

  return (
    <div className="space-y-8 p-5">
      {/* Header */}
      <div className="p-6">
        <h1 className="heading text-center">PDF Purifier</h1>
        <p className="description text-center mt-3">
          Remove, reorder & adjust PDF pages with live preview.
        </p>
      </div>

      {/* Upload Section */}
      <div className="p-6 rounded-2xl bg-(--card) border border-(--border)">
        <h2 className="subheading mb-4">Upload PDF</h2>

        <div className="flex flex-col items-center bg-(--background) justify-center border-2 border-dashed border-(--border) rounded-xl p-10 hover:border-(--primary) transition">
          <FileUp className="h-12 w-12 text-(--muted-foreground) mb-4" />

          <p className="font-medium text-(--foreground)">
            {file ? file.name : "Choose a PDF file"}
          </p>

          <p className="text-sm text-(--muted-foreground) mb-4">
            {file ? "Ready to process" : "Drag & drop or click to browse"}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!pdfjsLib}
            className="px-6 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) cursor-pointer font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {!pdfjsLib ? "Loading..." : file ? "Change File" : "Select PDF"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg border border-red-500 bg-red-50 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg border border-green-500 bg-green-50 text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Page Preview & Management */}
      {pdfPages.length > 0 && (
        <div className="p-6 rounded-2xl bg-(--card) border border-(--border)">
          <div className="flex justify-between items-center mb-6">
            <h2 className="subheading">Pages ({pdfPages.length})</h2>

            <div className="flex gap-3">
              <button
                onClick={resetTool}
                className="px-4 cursor-pointer bg-(--background) py-2 border border-(--border) rounded-lg hover:bg-(--muted) transition text-sm font-medium"
              >
                <RotateCw className="h-4 w-4 inline mr-2" />
                Reset
              </button>

              <button
                onClick={downloadPDF}
                disabled={isProcessing || pdfPages.length === 0}
                className="px-4 cursor-pointer py-2 rounded-lg bg-(--primary) text-(--primary-foreground) font-medium hover:opacity-90 transition disabled:opacity-60 text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Download PDF"}
              </button>
            </div>
          </div>

          {isLoadingPreviews ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-(--primary) border-r-transparent"></div>
              <p className="mt-4 text-(--muted-foreground)">
                Generating page previews...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 bg-(--muted) rounded-lg">
                <p className="text-sm text-(--muted-foreground) flex items-center gap-2">
                  <GripVertical className="h-4 w-4" />
                  Drag pages to reorder • Click trash icon to delete • Click
                  preview to enlarge
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pdfPages.map((pageNum, index) => (
                  <div
                    key={`${pageNum}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-xl border-2 bg-(--background) transition-all cursor-move ${
                      draggedIndex === index
                        ? "border-(--primary) opacity-50 scale-95"
                        : "border-(--border) hover:border-(--primary) hover:shadow-lg"
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 z-10 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deletePage(pageNum)}
                      className="cursor-pointer absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                      title="Delete page"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Preview Button */}
                    <button
                      onClick={() => openPreview(pageNum, index)}
                      className="absolute cursor-pointer top-12 right-2 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                      title="Preview page"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>

                    {/* Page Preview */}
                    <div
                      className="aspect-[8.5/11] w-full overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer"
                      onClick={() => openPreview(pageNum, index)}
                    >
                      {pagePreviews[pageNum] ? (
                        <img
                          src={pagePreviews[pageNum]}
                          alt={`Page ${pageNum}`}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--primary) border-r-transparent mx-auto"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page Number */}
                    <div className="p-3 text-center border-t border-(--border)">
                      <p className="text-sm font-medium text-(--foreground)">
                        Page {pageNum}
                      </p>
                      <p className="text-xs text-(--muted-foreground) mt-1">
                        Position: {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative bg-(--background) rounded-2xl max-w-5xl max-h-[90vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border)">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-(--foreground)">
                  Page {selectedPage} Preview
                </h3>
                <span className="text-sm text-(--muted-foreground)">
                  (Position: {selectedPageIndex + 1} of {pdfPages.length})
                </span>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-(--muted) rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex items-center justify-center h-[70vh] relative">
              {/* Navigation Buttons */}
              <button
                onClick={() => navigatePreview("prev")}
                className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Preview Image */}
              <div className="h-full w-full flex items-center justify-center">
                {highQualityPreviews[selectedPage] ? (
                  <img
                    src={highQualityPreviews[selectedPage]}
                    alt={`Page ${selectedPage}`}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  />
                ) : isGeneratingHighQuality[selectedPage] ? (
                  <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-(--primary) border-r-transparent mx-auto"></div>
                    <p className="mt-4 text-(--muted-foreground)">
                      Loading high-quality preview...
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={pagePreviews[selectedPage]}
                      alt={`Page ${selectedPage}`}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                    />
                    <p className="mt-4 text-sm text-(--muted-foreground)">
                      Loading high-quality preview...
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigatePreview("next")}
                className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-(--border) flex justify-between items-center">
              <div className="text-sm text-(--muted-foreground)">
                Use ← → arrow keys or click buttons to navigate • Press ESC to
                close
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deletePage(selectedPage)}
                  className="px-4 cursor-pointer py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete This Page
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 cursor-pointer py-2 border border-(--border) hover:bg-(--muted) rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      {pdfPages.length === 0 && file && (
        <div className="p-6 rounded-2xl bg-(--muted) border border-(--border)">
          <p className="text-center text-(--muted-foreground)">
            No pages to display. Upload a PDF to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default MainComponent;

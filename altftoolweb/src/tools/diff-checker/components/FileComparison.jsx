"use client";

import React, { useState, useEffect, useRef } from "react";
import { computeDiffLogic } from "../utils/diffUtils";
// import * as pdfjsLib from "pdfjs-dist";

// pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const FileDiffViewer = () => {
  const [file1Content, setFile1Content] = useState("");
  const [file2Content, setFile2Content] = useState("");
  const [diff, setDiff] = useState([]);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const pdfjsRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadPdfLibraries = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");

        if (mounted) {
          // ✅ Use LOCAL worker (important)
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

          // ✅ Store in ref (this was missing)
          pdfjsRef.current = pdfjs;

          // optional: keep your window cache
          if (typeof window !== "undefined") {
            window.__pdfjsLib = pdfjs;
          }

          setLibrariesLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load PDF libraries:", error);
      }
    };

    loadPdfLibraries();

    return () => {
      mounted = false;
    };
  }, []);

  const readPDF = async (file, setter) => {
    if (!pdfjsRef.current) {
      console.warn("PDF library not loaded yet");
      return;
    }
    if (!file) return;

    const pdfjs = pdfjsRef.current;

    const arrayBuffer = await file.arrayBuffer();
    try {
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => item.str)
        .join(" ");
        // .replace(/\s+/g, " "); // cleaner text

      text += pageText.trim() + "\n";
    }

    setter(text);
    } catch (err) {
      console.error("PDF read error:", err);
    }
  };

const saveVersion = (file1, file2) => {
  const existing = JSON.parse(localStorage.getItem("versions") || "[]");

  const newVersion = {
    id: Date.now(),
    file1,
    file2,
    createdAt: new Date().toLocaleString(),
  };

  const updated = [newVersion, ...existing].slice(0, 10); // keep last 10
  localStorage.setItem("versions", JSON.stringify(updated));
};

  const handleCompare = () => {
    const result = computeDiffLogic(
      file1Content,
      file2Content,
      false,
      false,
      "word" // simple line diff only
    );
    setDiff(result);

    saveVersion(file1Content, file2Content);
  };

  return (
  <div className="max-w-4xl mx-auto mt-10 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
    
    {/* Header */}
    <h2 className="text-lg font-semibold mb-4">PDF Diff Checker</h2>

    {/* Upload Section */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-gray-600">File 1</span>
        <input
          disabled={!librariesLoaded}
          type="file"
          accept="application/pdf"
          onChange={(e) => readPDF(e.target.files[0], setFile1Content)}
          className="p-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-gray-50"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-gray-600">File 2</span>
        <input
          disabled={!librariesLoaded}
          type="file"
          accept="application/pdf"
          onChange={(e) => readPDF(e.target.files[0], setFile2Content)}
          className="p-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-gray-50"
        />
      </label>
    </div>

    {/* Compare Button */}
    <button
      onClick={handleCompare}
      disabled={!file1Content || !file2Content}
      className={`mb-6 px-5 py-2 rounded-lg text-sm font-medium transition 
        ${file1Content && file2Content 
          ? "bg-[var(--primary)] text-white hover:opacity-90" 
          : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
    >
      Compare Files
    </button>

    {/* Diff Output */}
    <div className="rounded-xl overflow-hidden">
      {diff.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          Upload two PDFs and click compare
        </div>
      ) : (
        <div className="divide-y">
          {diff.map((item, idx) => {
            const base = "px-4 py-2 text-sm font-mono";

            if (item.type === "equal") {
              return (
                <div key={idx} className={`${base} bg-white text-gray-600`}>
                  {item.value}
                </div>
              );
            }

            if (item.type === "added") {
              return (
                <div
                  key={idx}
                  className={`${base} bg-green-50 text-green-700 border-l-4 border-green-500`}
                >
                  + {item.value}
                </div>
              );
            }

            if (item.type === "deleted") {
              return (
                <div
                  key={idx}
                  className={`${base} bg-red-50 text-red-700 border-l-4 border-red-500`}
                >
                  - {item.value}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  </div>
);
};

export default FileDiffViewer;
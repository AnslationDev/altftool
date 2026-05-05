"use client";

import React, { useState } from "react";
import { FileText, Upload, Trash2, GripVertical, Files } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import Features from "./Features";

/* Save File */
const saveFile = async (blob, filename) => {
  const { saveAs } = await import("file-saver");
  saveAs(blob, filename);
};

/*  Merge PDFs */
const mergePdfs = async (files) => {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw new Error("Failed to merge PDFs.");
  }
};

/*  Draggable Item  */
const DraggableFileItem = ({
  file,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center justify-between p-3 bg-(--background) rounded-lg border border-(--border) hover:bg-(--background)/60 transition"
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-(--muted-foreground)" />
        <FileText className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-(--foreground)">
            {file.file.name}
          </p>
          <p className="text-xs text-(--muted-foreground)">
            {(file.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      <button
        onClick={() => onRemove(file.id)}
        className="p-2 rounded hover:bg-(--card) cursor-pointer hover:text-red-500"
      >
        <Trash2 className="h-4 w-4  " />
      </button>
    </div>
  );
};

/*  Dropzone  */
const PDFDropzone = ({ onFilesAdded }) => {
  const onDrop = (acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );
    onFilesAdded(pdfFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer bg-(--background) transition
        ${
          isDragActive
            ? "border-(--primary) bg-(--primary)/10"
            : "border-(--border) hover:border-(--primary)"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <Upload className="h-8 w-8 text-(--muted-foreground)" />
        <p className="font-medium text-(--foreground)">
          {isDragActive ? "Drop PDFs here" : "Drag & drop PDF files here"}
        </p>
        <p className="text-sm text-(--muted-foreground)">or click to browse</p>
      </div>
    </div>
  );
};

/*  Main Component */
export default function MainComponent() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFilesAdded = (newFiles) => {
    const filesWithId = newFiles.map((file) => ({
      id: uuidv4(),
      file,
    }));
    setFiles((prev) => [...prev, ...filesWithId]);
    setError("");
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...files];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    setFiles(updated);
    setDraggedIndex(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files.");
      return;
    }

    setIsMerging(true);
    setError("");

    try {
      const mergedBlob = await mergePdfs(files.map((f) => f.file));
      await saveFile(mergedBlob, `merged-${Date.now()}.pdf`);
    } catch {
      setError("Failed to merge PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className=" px-6 rounded-2xl flex justify-center items-center flex-col ">
        <h2 className="heading text-center">PDF Merger</h2>
        <p className="description text-center mt-3">
          Merge multiple PDF files quickly into a single document.
        </p>
      </div>

      {/* Dropzone */}
      <div className="bg-(--card) p-6 rounded-2xl border border-(--border)">
        <PDFDropzone onFilesAdded={handleFilesAdded} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-(--card) p-6 rounded-2xl border border-(--border)">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-(--foreground)">
              Files ({files.length})
            </h3>
            <button
              onClick={handleClearAll}
              className="text-sm text-(--muted-foreground) hover:text-red-500 cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 ">
            {files.map((file, index) => (
              <div className=""
                key={file.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <DraggableFileItem
                  file={file}
                  index={index}
                  onRemove={handleRemoveFile}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Button */}
      <div className="bg-(--card) p-6 rounded-2xl border border-(--border) flex justify-center sm:justify-end">
        <button
          onClick={handleMerge}
          disabled={files.length === 0 || isMerging}
          className="bg-(--primary) text-(--primary-foreground) px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Files className="h-4 w-4" />
          {isMerging ? "Merging..." : "Merge Files"}
        </button>
      </div>
      <Features/>
    </div>
  );
}
